import test from "node:test";
import assert from "node:assert/strict";
import { datesInYear, intensity, mergeActivity, type SourceResult } from "../src/lib/activity";
import { parseGithubCalendar, parseLeetcodeCalendar } from "../src/lib/activity-parsers";
import { CACHE_TTL, resolveSource, type CacheStore, type CachedSource } from "../src/lib/activity-service";

const year = 2024;
const blankCounts = () => Object.fromEntries(datesInYear(year).map((date) => [date, 0]));
const live = (counts = blankCounts()): SourceResult => ({ counts, updatedAt: "2024-12-31T10:00:00Z", status: "live", message: null });
const missing: SourceResult = { counts: null, updatedAt: null, status: "unavailable", message: "Unavailable" };
function githubFixture() {
  const dates = datesInYear(year);
  const cells = dates.map((date, index) => `<td data-date="${date}" id="day-${index}" data-level="1"></td>`).join("");
  const tooltips = dates.map((_, index) => `<tool-tip for="day-${index}">${index === 0 ? "1,234 contributions" : index === 1 ? "1 contribution" : "No contributions"} on today.</tool-tip>`).join("");
  return `<table><tbody><tr>${cells}</tr></tbody></table>${tooltips}`;
}
const leetcodeFixture = (calendar: unknown) => ({ data: { matchedUser: { userCalendar: { submissionCalendar: JSON.stringify(calendar) } } } });

test("calendar includes leap day and exact year boundaries", () => {
  assert.equal(datesInYear(2024).length, 366);
  assert.equal(datesInYear(2025).length, 365);
  assert.ok(datesInYear(2024).includes("2024-02-29"));
  assert.equal(datesInYear(2024)[0], "2024-01-01");
  assert.equal(datesInYear(2024).at(-1), "2024-12-31");
});
test("GitHub uses tooltip counts, including zero, singular and comma counts", () => {
  const counts = parseGithubCalendar(githubFixture(), year);
  assert.equal(counts["2024-01-01"], 1234);
  assert.equal(counts["2024-01-02"], 1);
  assert.equal(counts["2024-01-03"], 0);
});
test("GitHub rejects incomplete calendars and format changes rather than inventing zeroes", () => {
  assert.throws(() => parseGithubCalendar("<html>Rate limit</html>", year));
  assert.throws(() => parseGithubCalendar(githubFixture().replace("1,234 contributions", "unknown activity"), year));
});
test("LeetCode converts seconds to UTC keys, sums entries and ignores adjacent years", () => {
  const counts = parseLeetcodeCalendar(leetcodeFixture({
    [Date.parse("2023-12-31T23:59:59Z") / 1000]: 9,
    [Date.parse("2024-01-01T00:00:00Z") / 1000]: 2,
    [Date.parse("2024-01-01T23:59:59Z") / 1000]: 3,
    [Date.parse("2024-02-29T00:00:00Z") / 1000]: 4,
    [Date.parse("2025-01-01T00:00:00Z") / 1000]: 8,
  }), year);
  assert.equal(counts["2024-01-01"], 5);
  assert.equal(counts["2024-02-29"], 4);
  assert.equal(counts["2024-12-31"], 0);
  assert.equal(Object.keys(counts).length, 366);
});
test("LeetCode accepts a real empty calendar and rejects errors, missing users and malformed entries", () => {
  assert.equal(parseLeetcodeCalendar(leetcodeFixture({}), year)["2024-01-01"], 0);
  for (const payload of [null, {}, { errors: ["blocked"] }, { data: { matchedUser: null } }, leetcodeFixture([]), leetcodeFixture({ abc: 2 }), leetcodeFixture({ "1704067200": -1 }), leetcodeFixture({ "1704067200": "2" })]) {
    assert.throws(() => parseLeetcodeCalendar(payload, year));
  }
  assert.throws(() => parseLeetcodeCalendar({ data: { matchedUser: { userCalendar: { submissionCalendar: "not json" } } } }, year));
});
test("merge preserves unknown sources and suppresses future activity", () => {
  const github = live({ ...blankCounts(), "2024-01-01": 3, "2024-01-03": 10 });
  const leetcode = live({ ...blankCounts(), "2024-01-01": 5 });
  const complete = mergeActivity(year, github, leetcode, "2024-01-02");
  assert.equal(complete.days[0].combined, 8);
  assert.equal(complete.days[1].combined, 0);
  assert.deepEqual(complete.days[2], { date: "2024-01-03", github: null, leetcode: null, combined: null, future: true });
  const partial = mergeActivity(year, github, missing, "2024-12-31");
  assert.equal(partial.days[0].combined, 3);
  assert.equal(partial.days[0].leetcode, null);
  assert.equal(partial.sources.leetcode.status, "unavailable");
  assert.equal(mergeActivity(year, missing, missing, "2024-12-31").days[0].combined, null);
});
test("five intensity levels use documented fixed thresholds", () => {
  assert.deepEqual([null, 0, 1, 2, 3, 5, 6, 9, 10, 100].map(intensity), [0, 0, 1, 1, 2, 2, 3, 3, 4, 4]);
});
function cache(initial: CachedSource | null) {
  let value = initial;
  return { store: { read: async () => value, write: async (_key: string, next: CachedSource) => { value = next; } } satisfies CacheStore, value: () => value };
}
test("six-hour cache avoids requests until expiry and refreshes successfully", async () => {
  const now = Date.parse("2024-12-31T12:00:00Z");
  const previous = { counts: blankCounts(), updatedAt: new Date(now - CACHE_TTL + 1).toISOString() };
  const cached = cache(previous);
  let calls = 0;
  const fetchCounts = async () => { calls++; return { ...blankCounts(), "2024-01-01": 8 }; };
  const first = await resolveSource("github", year, fetchCounts, cached.store, now);
  assert.equal(calls, 0);
  assert.equal(first.status, "live");
  const refreshed = await resolveSource("github", year, fetchCounts, cached.store, now + 2);
  assert.equal(calls, 1);
  assert.equal(refreshed.counts?.["2024-01-01"], 8);
  assert.equal(cached.value()?.updatedAt, new Date(now + 2).toISOString());
});
test("refresh failure retains the last good calendar and timestamp", async () => {
  const now = Date.parse("2024-12-31T12:00:00Z");
  const previous = { counts: blankCounts(), updatedAt: new Date(now - CACHE_TTL - 1).toISOString() };
  const cached = cache(previous);
  const result = await resolveSource("github", year, async () => { throw new Error("timeout"); }, cached.store, now);
  assert.equal(result.status, "stale");
  assert.equal(result.updatedAt, previous.updatedAt);
  assert.deepEqual(result.counts, previous.counts);
  assert.equal(cached.value(), previous);
});
test("source failures remain independent and corrupt cache is never used", async () => {
  const [github, leetcode] = await Promise.all([
    resolveSource("github", year, async () => { throw new Error("blocked"); }, cache(null).store),
    resolveSource("leetcode", year, async () => blankCounts(), cache(null).store),
  ]);
  assert.equal(github.status, "unavailable");
  assert.equal(leetcode.status, "live");
  const result = mergeActivity(year, github, leetcode, "2024-12-31");
  assert.equal(result.days[0].github, null);
  assert.equal(result.days[0].leetcode, 0);
  const corrupt = cache({ counts: {}, updatedAt: "nonsense" });
  assert.equal((await resolveSource("github", year, async () => { throw new Error("down"); }, corrupt.store)).status, "unavailable");
});
