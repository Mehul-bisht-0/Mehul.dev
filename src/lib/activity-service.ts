import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { portfolio } from "../config/portfolio";
import { mergeActivity, validateCounts, type Counts, type SourceName, type SourceResult } from "./activity";
import { parseGithubCalendar, parseLeetcodeCalendar } from "./activity-parsers";

export const CACHE_TTL = 6 * 60 * 60 * 1000;
export interface CachedSource { counts: Counts; updatedAt: string }
export interface CacheStore {
  read(key: string): Promise<CachedSource | null>;
  write(key: string, value: CachedSource): Promise<void>;
}

const directory = path.join(process.cwd(), ".cache", "activity");
const diskCache: CacheStore = {
  async read(key) {
    try { return JSON.parse(await readFile(path.join(directory, `${key}.json`), "utf8")); }
    catch { return null; }
  },
  async write(key, value) {
    await mkdir(directory, { recursive: true });
    const target = path.join(directory, `${key}.json`);
    const temporary = `${target}.${crypto.randomUUID()}.tmp`;
    await writeFile(temporary, JSON.stringify(value), "utf8");
    await rename(temporary, target);
  },
};
const memoryCache = new Map<string, CachedSource>();
const inflight = new Map<string, Promise<SourceResult>>();

export async function resolveSource(
  source: SourceName,
  year: number,
  fetchCounts: () => Promise<Counts>,
  store: CacheStore = diskCache,
  now = Date.now(),
  identity = source === "github" ? portfolio.github : portfolio.leetcode,
): Promise<SourceResult> {
  const key = `${source}-${identity}-${year}`;
  const stored = await store.read(key).catch(() => null);
  const candidate = stored && validateCounts(stored.counts, year) && Number.isFinite(Date.parse(stored.updatedAt)) ? stored : null;
  const memory = store === diskCache ? memoryCache.get(key) ?? null : null;
  const cached = candidate && memory ? (Date.parse(candidate.updatedAt) >= Date.parse(memory.updatedAt) ? candidate : memory) : candidate ?? memory;
  if (cached && now - Date.parse(cached.updatedAt) < CACHE_TTL) {
    return { ...cached, status: "live", message: null };
  }
  try {
    const counts = await fetchCounts();
    if (!validateCounts(counts, year)) throw new Error("Incomplete activity response.");
    const fresh = { counts, updatedAt: new Date(now).toISOString() };
    if (store === diskCache) memoryCache.set(key, fresh);
    // A read-only host still benefits from the in-process cache.
    await store.write(key, fresh).catch(() => undefined);
    return { ...fresh, status: "live", message: null };
  } catch {
    if (cached) return { ...cached, status: "stale", message: "Refresh failed; showing the last successful calendar." };
    return { counts: null, updatedAt: null, status: "unavailable", message: "Could not load this public calendar. Try again shortly." };
  }
}

async function fetchGithub(year: number): Promise<Counts> {
  const url = `https://github.com/users/${portfolio.github}/contributions?from=${year}-01-01&to=${year}-12-31`;
  const response = await fetch(url, { headers: { "User-Agent": "Mehul-Portfolio", "Accept-Language": "en-US,en;q=0.9" }, signal: AbortSignal.timeout(8000), cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
  return parseGithubCalendar(await response.text(), year);
}

async function fetchLeetcode(year: number): Promise<Counts> {
  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "Mehul-Portfolio", Referer: `https://leetcode.com/u/${portfolio.leetcode}/` },
    body: JSON.stringify({ query: "query userProfileCalendar($username: String!, $year: Int) { matchedUser(username: $username) { userCalendar(year: $year) { submissionCalendar } } }", variables: { username: portfolio.leetcode, year } }),
    signal: AbortSignal.timeout(8000), cache: "no-store",
  });
  if (!response.ok) throw new Error(`LeetCode returned ${response.status}`);
  return parseLeetcodeCalendar(await response.json(), year);
}

function getSource(source: SourceName, year: number) {
  const key = `${source}-${year}`;
  let pending = inflight.get(key);
  if (!pending) {
    pending = resolveSource(source, year, () => source === "github" ? fetchGithub(year) : fetchLeetcode(year));
    inflight.set(key, pending);
    void pending.finally(() => inflight.delete(key));
  }
  return pending;
}

export async function getActivity(year: number) {
  const [github, leetcode] = await Promise.all([getSource("github", year), getSource("leetcode", year)]);
  return mergeActivity(year, github, leetcode);
}
