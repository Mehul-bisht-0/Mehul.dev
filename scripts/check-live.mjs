import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const base = process.env.PORTFOLIO_URL || "http://127.0.0.1:3000";
const currentYear = new Date().getUTCFullYear();
const browser = await chromium.launch({ channel: "msedge" });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.locator(".activity-status").filter({ hasText: "synced from public profiles" }).waitFor({ timeout: 20000 });
  const summaries = [];
  for (let year = 2024; year <= currentYear; year++) {
    const response = await context.request.get(`${base}/api/activity?year=${year}`);
    assert.equal(response.status(), 200);
    const calendar = await response.json();
    assert.equal(calendar.sources.github.status, "live");
    assert.equal(calendar.sources.leetcode.status, "live");
    assert.equal(calendar.days.length, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365);
    summaries.push({ year, github: calendar.days.reduce((sum, day) => sum + (day.github ?? 0), 0), leetcode: calendar.days.reduce((sum, day) => sum + (day.leetcode ?? 0), 0) });
  }
  for (const year of ["2023", String(currentYear + 1), "abc", "2024.0", ""]) {
    assert.equal((await context.request.get(`${base}/api/activity?year=${year}`)).status(), 400);
  }
  await mkdir(".cache/preview", { recursive: true });
  await page.screenshot({ path: ".cache/preview/desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: ".cache/preview/mobile.png" });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.setViewportSize({ width: 320, height: 800 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ liveCalendars: summaries, invalidYearChecks: "passed", viewportWidths: [1440, 390, 320], browserErrors: errors }, null, 2));
  await context.close();
} finally {
  await browser.close();
}
