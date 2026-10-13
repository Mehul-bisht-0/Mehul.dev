import { test, expect } from "@playwright/test";
import { datesInYear, mergeActivity, type SourceResult } from "../../src/lib/activity";

const year = new Date().getUTCFullYear();
function fixture(selectedYear = year, ghStatus: SourceResult["status"] = "live", lcStatus: SourceResult["status"] = "live") {
  const counts = Object.fromEntries(datesInYear(selectedYear).map((date, index) => [date, index % 9 === 0 ? 4 : index % 3 === 0 ? 1 : 0]));
  const github: SourceResult = { counts: ghStatus === "unavailable" ? null : counts, status: ghStatus, updatedAt: ghStatus === "unavailable" ? null : new Date().toISOString(), message: null };
  const leetcode: SourceResult = { counts: lcStatus === "unavailable" ? null : { ...counts, [`${selectedYear}-01-01`]: 2 }, status: lcStatus, updatedAt: lcStatus === "unavailable" ? null : new Date().toISOString(), message: null };
  return mergeActivity(selectedYear, github, leetcode);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/activity?*", (route) => {
    const selectedYear = Number(new URL(route.request().url()).searchParams.get("year"));
    return route.fulfill({ json: fixture(selectedYear) });
  });
});

test("portfolio content, heatmap controls, touch inspection and layout", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mehul Bisht." })).toBeVisible();
  await expect(page.locator(".project-row")).toHaveCount(5);
  await expect(page.getByRole("tab", { name: "Combined" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".activity-status")).toContainText("synced");
  await page.getByRole("tab", { name: "LeetCode" }).click();
  await expect(page.locator(".activity-panel")).toHaveClass(/view-leetcode/);
  const day = page.locator(`[data-date="${year}-01-01"]`);
  await day.click();
  await expect(page.locator("#day-tooltip")).toContainText(`Jan 1, ${year}`);
  await expect(page.locator("#day-tooltip")).toContainText("GH 4 · LC 2");
  await page.getByLabel("Activity year").selectOption("2024");
  await expect(page.locator(".heatmap-grid button")).toHaveCount(366);
  await page.locator(".project-details summary").first().click();
  await expect(page.locator(".project-details").first()).toHaveAttribute("open", "");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  if (testInfo.project.name === "mobile") expect(await page.locator(".calendar-scroll").evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.getByLabel("Activity year").selectOption(String(year));
  await page.getByRole("tab", { name: "Combined" }).click();
  await page.locator(".project-details summary").first().click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/${testInfo.project.name}-portfolio.png`, fullPage: true });
});

test("terminal completion, history, navigation, expansion, clear and safe unknown commands", async ({ page }) => {
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await input.fill("who");
  await input.press("Tab");
  await expect(input).toHaveValue("whoami");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("Mehul Bisht");
  await input.focus();
  await input.press("ArrowUp");
  await expect(input).toHaveValue("whoami");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("");
  await input.fill("c");
  await input.press("Tab");
  await expect(page.locator(".completion-hint")).toContainText("clear  coffee");
  await input.press("Shift+Tab");
  await expect(input).not.toBeFocused();
  await page.getByRole("button", { name: "expand shell" }).click();
  await input.fill("projects");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("Video-to-ASCII");
  await page.getByRole("button", { name: "collapse" }).click();
  await expect(page.getByRole("log")).toContainText("Video-to-ASCII");
  await input.fill("<script>alert(1)</script>");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("command not found:");
  await input.fill("clear");
  await input.press("Enter");
  await expect(page.locator(".terminal-entry")).toHaveCount(0);
  await page.getByRole("button", { name: "experience", exact: true }).click();
  await expect(page.locator("#experience")).toBeFocused();
});

test("calendar keyboard controls and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".activity-status")).toContainText("synced");
  const first = page.locator(`[data-date="${year}-01-01"]`);
  await first.focus();
  await first.press("ArrowRight");
  await expect(page.locator(`[data-date="${year}-01-08"]`)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.getByRole("tab", { name: "Combined" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "GitHub" })).toBeFocused();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
});

test("partial, stale and unavailable calendars communicate missing data", async ({ page }) => {
  await page.unroute("**/api/activity?*");
  let response = fixture(year, "live", "unavailable");
  await page.route("**/api/activity?*", (route) => route.fulfill({ json: response }));
  await page.goto("/");
  await expect(page.locator(".activity-status")).toContainText("partial · LeetCode unavailable");
  const first = page.locator(`[data-date="${year}-01-01"]`);
  await first.click();
  await expect(page.locator("#day-tooltip")).toContainText("LC unknown");
  await page.getByRole("tab", { name: "LeetCode" }).click();
  await expect(page.locator(".activity-status")).toContainText("calendar unavailable");
  await expect(first).toBeDisabled();
  response = fixture(year, "stale", "live");
  await page.getByRole("button", { name: "retry calendars" }).click();
  await page.getByRole("tab", { name: "Combined" }).click();
  await expect(page.locator(".activity-status")).toContainText("cached · refresh failed");
  response = fixture(year, "unavailable", "unavailable");
  await page.getByRole("button", { name: "retry calendars" }).click();
  await expect(page.locator(".activity-status")).toContainText("calendar unavailable");
});
