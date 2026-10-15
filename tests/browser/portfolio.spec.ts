import { test, expect } from "@playwright/test";
import { datesInYear, mergeActivity, type SourceResult } from "../../src/lib/activity";
import { portfolio } from "../../src/config/portfolio";

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
  await expect(page.getByRole("log")).toContainText("InternFly");
  await page.getByRole("button", { name: "collapse" }).click();
  await expect(page.getByRole("log")).toContainText("InternFly");
  await input.fill("<script>alert(1)</script>");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("command not found:");
  await input.fill("clear");
  await input.press("Enter");
  await expect(page.locator(".terminal-entry")).toHaveCount(0);
  await page.getByRole("button", { name: "experience", exact: true }).click();
  await expect(page.locator("#experience")).toBeFocused();
  await expect(page.locator("#experience .draft-experience")).toHaveCount(0);
  await expect(page.getByRole("article", { name: "Intern at Phemesoft", exact: true })).toContainText("Jun 2026 – Aug 2026");
  await expect(page.getByRole("article", { name: "Independent Third Party Strategic Planner at Clash Royale", exact: true })).toContainText("Gaming");
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

test("workspace navigation tracks sections and launches the same terminal", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const disclosure = page.getByRole("button", { name: /workspace\/index/ });
  const navigation = page.getByRole("navigation", { name: "Workspace sections" });
  if (testInfo.project.name === "mobile") {
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await expect(navigation).toBeHidden();
    await disclosure.click();
    await expect(navigation).toBeVisible();
  }
  await navigation.getByRole("link", { name: "projects/", exact: true }).click();
  await expect(page.locator('.rail-navigation a[href="#projects"]')).toHaveAttribute("aria-current", "location");
  await expect.poll(() => page.locator(".rail-reading progress").getAttribute("value")).not.toBe("0");
  if (testInfo.project.name === "mobile") {
    await expect(disclosure).toHaveAttribute("aria-expanded", "false");
    await disclosure.click();
  }
  await page.getByRole("button", { name: /open terminal/ }).click();
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await expect(input).toBeFocused();
  await expect(page.locator(".terminal")).toHaveClass(/terminal-expanded/);
  await input.fill("coffee");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("coffee.exe");
  await input.press("Escape");
  await expect(page.locator(".terminal")).not.toHaveClass(/terminal-expanded/);
  await page.keyboard.press("Control+Backquote");
  await expect(page.locator(".terminal")).toHaveClass(/terminal-expanded/);
  await expect(input).toBeFocused();
  await expect(page.getByRole("log")).toContainText("coffee.exe");
  await expect(page.locator(".rail-session-details time")).toHaveText(/\d{2}:\d{2}:\d{2} UTC/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("project view changes preserve details, terminal history and activity selection", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "coffee", exact: true }).click();
  await page.getByLabel("Activity year").selectOption("2024");
  await page.getByRole("tab", { name: "LeetCode", exact: true }).click();
  await page.locator(".project-details summary").first().click();
  const details = page.locator(".project-details").first();
  await expect(page.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Grid view" }).click();
  await expect(page.locator(".project-list")).toHaveClass(/project-mode-grid/);
  await expect(details).toHaveAttribute("open", "");
  await page.getByRole("button", { name: "Table view" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(details).toHaveAttribute("open", "");
  await expect(page.getByRole("row")).toHaveCount(6);
  if (testInfo.project.name === "mobile") expect(await page.locator(".project-table-scroll").evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  await page.getByRole("searchbox", { name: "Search projects" }).fill("redis");
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("table")).toContainText("Dead-letter Recovery Job Queue");
  await page.getByRole("searchbox", { name: "Search projects" }).fill("no-such-stack");
  await expect(page.locator(".project-no-results")).toContainText("0 matches");
  await page.getByRole("button", { name: "clear search" }).click();
  await expect(page.getByRole("row")).toHaveCount(6);
  await page.getByRole("button", { name: "List view" }).click();
  await expect(details).toBeVisible();
  await expect(details).toHaveAttribute("open", "");
  await expect(page.getByRole("log")).toContainText("coffee.exe");
  await expect(page.getByLabel("Activity year")).toHaveValue("2024");
  await expect(page.getByRole("tab", { name: "LeetCode", exact: true })).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("interactive instruments and virtual shell work together", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "expand shell" }).click();
  const input = page.getByRole("textbox", { name: "Terminal command" });
  const execute = async (command: string) => { await input.fill(command); await input.press("Enter"); };
  await execute("cd projects");
  await expect(page.locator(".terminal-prompt")).toContainText("~/projects");
  await execute("ls");
  await expect(page.getByRole("log")).toContainText("aco-its");
  await input.fill("open filing");
  await input.press("Tab");
  await expect(input).toHaveValue("open filinglens");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("FilingLens");
  await execute("signal square");
  await expect(page.getByRole("button", { name: "square waveform" })).toHaveAttribute("aria-pressed", "true");
  await execute("tune 6");
  await expect(page.getByRole("slider", { name: "Oscillator frequency" })).toHaveValue("6");
  await page.getByRole("slider", { name: "Oscillator gain" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("slider", { name: "Oscillator gain" })).toHaveValue("3");
  await execute("scope");
  await expect(page.getByRole("log")).toContainText("gain       3×");
  await execute("hold");
  await expect(page.getByRole("button", { name: "RELEASE trace" })).toHaveAttribute("aria-pressed", "true");
  const held = await page.getByTestId("scope-trace").getAttribute("d");
  await execute("history");
  await expect(page.getByTestId("scope-trace")).toHaveAttribute("d", held!);
  await expect(page.getByRole("log")).toContainText("cd projects");
  await page.getByRole("button", { name: "RELEASE trace" }).click();
  await expect(page.locator(".scope-screen-label")).toContainText("STATIC");
  await input.fill("an unfinished command");
  await input.press("Control+c");
  await expect(input).toHaveValue("");
  expect(await page.locator(".analog-backdrop").evaluate((element) => getComputedStyle(element).backgroundImage)).toContain("oscilloscope-grid.svg");
  await expect(page.locator(".crt-backdrop")).toHaveAttribute("data-waveform", "square");
  await expect(page.getByTestId("background-trace")).toHaveAttribute("d", /H\d+ V\d+/);
  expect(await page.getByTestId("scope-trace").getAttribute("d")).not.toMatch(/[LCQ]/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("compact open command reveals a project even after filtering", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByRole("button", { name: "Table view" }).click();
  await page.getByRole("searchbox", { name: "Search projects" }).fill("no-matches");
  const input = page.getByRole("textbox", { name: "Terminal command" });
  await input.fill("open aco-its");
  await input.press("Enter");
  await expect(page.getByRole("button", { name: "List view" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#project-aco-its details")).toHaveAttribute("open", "");
  await expect(page.locator("#project-aco-its summary")).toBeFocused();
});

test("every project has an on-site explanation and directory navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#experience").getByRole("link", { name: "view LinkedIn profile" })).toHaveAttribute("href", portfolio.linkedin);
  await page.getByRole("button", { name: "Table view" }).click();
  const firstProject = portfolio.projects[0];
  const firstLink = page.getByRole("table").getByRole("link", { name: firstProject.name, exact: true });
  await expect(firstLink).not.toHaveAttribute("target", "_blank");
  await firstLink.click();
  for (const project of portfolio.projects) {
    await page.getByRole("navigation", { name: "Project directory" }).getByRole("link", { name: project.name, exact: true }).click();
    await expect(page).toHaveURL(`/projects/${project.slug}`);
    await expect(page).toHaveTitle(`${project.name} | Mehul Bisht`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${project.name}_`);
    await expect(page.getByRole("heading", { name: "What does it do?" })).toBeVisible();
    await expect(page.locator(".project-example")).toContainText(project.story.example.output);
    await expect(page.locator(".project-flow li")).toHaveCount(4);
    await expect(page.locator(".project-boundaries")).toContainText(project.story.limitations[0]);
    await expect(page.getByRole("link", { name: "source code" })).toHaveAttribute("href", project.repository);
    await expect(page.getByRole("navigation", { name: "Project directory" }).getByRole("link", { name: project.name, exact: true })).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("navigation", { name: "Continue exploring" }).getByRole("link", { name: /all projects/ }).click();
  await expect(page).toHaveURL("/#projects");
  await expect(page.getByRole("heading", { name: "ls projects/" })).toBeVisible();
  await page.goto("/projects/reliable-queue");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Dead-letter Recovery");
  await expect(page.locator("#boundaries")).toContainText("at least once");
});

test("removed project routes return a useful 404", async ({ page }) => {
  const response = await page.goto("/projects/video-to-ascii");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "File not found_" })).toBeVisible();
  await page.getByRole("link", { name: "back to projects" }).click();
  await expect(page).toHaveURL("/#projects");
});

test("background music waits for interaction when autoplay is blocked", async ({ page }) => {
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!navigator.userActivation.isActive) return Promise.reject(new DOMException("Autoplay requires interaction", "NotAllowedError"));
      return originalPlay.call(this);
    };
  });
  await page.goto("/");
  const audio = page.locator(".background-audio audio");
  await expect(page.getByRole("button", { name: "Play background music" })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "coffee", exact: true }).click();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await expect(page.getByRole("button", { name: "Pause background music" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Pause background music" }).click();
  await page.getByRole("button", { name: "help", exact: true }).click();
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});

test("background music loops, continues between pages and remembers controls", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("audio-test-ready")) {
      localStorage.setItem("portfolio:audio-enabled", "off");
      sessionStorage.setItem("audio-test-ready", "1");
    }
  });
  await page.goto("/");
  const audio = page.locator(".background-audio audio");
  await page.getByRole("button", { name: "Play background music" }).click();
  await expect(page.getByRole("button", { name: "Pause background music" })).toBeVisible();
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.duration)).toBeGreaterThan(1);
  const volume = page.getByRole("slider", { name: "Background music volume" });
  await volume.focus();
  await volume.press("Home");
  await volume.press("ArrowRight");
  await volume.press("ArrowRight");
  await expect(volume).toHaveValue("10");
  expect(await audio.evaluate((element: HTMLAudioElement) => element.volume)).toBe(.1);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.loop)).toBe(true);
  await audio.evaluate((element: HTMLAudioElement) => { element.currentTime = element.duration - .3; });
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.currentTime), { timeout: 10000 }).toBeLessThan(2);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  const originalAudio = await audio.elementHandle();
  await page.locator("#project-internfly h3 a").click();
  await expect(page).toHaveURL("/projects/internfly", { timeout: 15000 });
  expect(await originalAudio!.evaluate((element) => element.isConnected)).toBe(true);
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
  await page.getByRole("button", { name: "Pause background music" }).click();
  await page.reload();
  await expect(volume).toHaveValue("10");
  await expect(page.getByRole("button", { name: "Play background music" })).toHaveAttribute("aria-pressed", "false");
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
