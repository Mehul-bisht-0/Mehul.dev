import { load } from "cheerio";
import { datesInYear, isCount, validateCounts, type Counts } from "./activity";

export function parseGithubCalendar(html: string, year: number): Counts {
  const $ = load(html);
  const tooltips = new Map<string, string>();
  $("tool-tip[for]").each((_, element) => {
    tooltips.set($(element).attr("for")!, $(element).text().trim());
  });
  const counts: Counts = {};
  $("[data-date]").each((_, element) => {
    const date = $(element).attr("data-date")!;
    if (!date.startsWith(`${year}-`)) return;
    const tooltip = tooltips.get($(element).attr("id") ?? "") ?? "";
    const match = tooltip.match(/^([\d,]+) contributions?\b/i);
    if (/^No contributions\b/i.test(tooltip)) counts[date] = 0;
    else if (match) counts[date] = Number(match[1].replaceAll(",", ""));
    else throw new Error("GitHub calendar count format changed.");
  });
  if (!validateCounts(counts, year)) throw new Error("GitHub calendar is incomplete or malformed.");
  return counts;
}

export function parseLeetcodeCalendar(payload: unknown, year: number): Counts {
  const data = payload as { errors?: unknown; data?: { matchedUser?: { userCalendar?: { submissionCalendar?: unknown } } } };
  if (!data || data.errors || typeof data.data?.matchedUser?.userCalendar?.submissionCalendar !== "string") {
    throw new Error("LeetCode calendar is unavailable or malformed.");
  }
  const raw: unknown = JSON.parse(data.data.matchedUser.userCalendar.submissionCalendar);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid LeetCode submission calendar.");
  const counts: Counts = Object.fromEntries(datesInYear(year).map((date) => [date, 0]));
  for (const [timestamp, count] of Object.entries(raw)) {
    if (!/^\d+$/.test(timestamp) || !isCount(count)) throw new Error("Invalid LeetCode activity entry.");
    const seconds = Number(timestamp);
    if (!Number.isSafeInteger(seconds)) throw new Error("Invalid LeetCode timestamp.");
    const instant = new Date(seconds * 1000);
    if (Number.isNaN(instant.getTime())) throw new Error("Invalid LeetCode date.");
    const date = instant.toISOString().slice(0, 10);
    if (date in counts) counts[date] += count;
  }
  return counts;
}

