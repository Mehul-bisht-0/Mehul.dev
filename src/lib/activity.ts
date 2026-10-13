

export type SourceName = "github" | "leetcode";
export type SourceStatus = "live" | "stale" | "unavailable";
export type Counts = Record<string, number>;
export interface SourceResult {
  counts: Counts | null;
  status: SourceStatus;
  updatedAt: string | null;
  message: string | null;
}
export interface ActivityDay {
  date: string;
  github: number | null;
  leetcode: number | null;
  combined: number | null;
  future: boolean;
}
export interface ActivityResponse {
  year: number;
  days: ActivityDay[];
  sources: Record<SourceName, Omit<SourceResult, "counts">>;
}

export function datesInYear(year: number): string[] {
  const days: string[] = [];
  const cursor = new Date(Date.UTC(year, 0, 1));
  while (cursor.getUTCFullYear() === year) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function validateCounts(value: unknown, year: number): value is Counts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const dates = datesInYear(year);
  return Object.keys(record).length === dates.length && dates.every((date) => isCount(record[date]));
}

export function mergeActivity(year: number, github: SourceResult, leetcode: SourceResult, today = new Date().toISOString().slice(0, 10)): ActivityResponse {
  const days = datesInYear(year).map((date): ActivityDay => {
    const future = date > today;
    const gh = future ? null : github.counts?.[date] ?? null;
    const lc = future ? null : leetcode.counts?.[date] ?? null;
    return { date, github: gh, leetcode: lc, combined: gh === null && lc === null ? null : (gh ?? 0) + (lc ?? 0), future };
  });
  const sourceInfo = ({ status, updatedAt, message }: SourceResult) => ({ status, updatedAt, message });
  return { year, days, sources: { github: sourceInfo(github), leetcode: sourceInfo(leetcode) } };
}

export function intensity(count: number | null): number {
  if (count === null || count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}
