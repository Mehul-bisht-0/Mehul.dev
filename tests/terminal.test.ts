import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, completeCommand, runCommand } from "../src/lib/terminal";

test("all commands produce output or clear; section navigation is explicit", () => {
  for (const command of COMMANDS) assert.ok(runCommand(command, false).text || runCommand(command, false).clear);
  assert.equal(runCommand(" PROJECTS ", false).section, "projects");
  assert.equal(runCommand("whoami", false).section, "home");
  assert.equal(runCommand("clear", true).clear, true);
});
test("expanded output contains full project information and visibly marked drafts", () => {
  assert.match(runCommand("projects", true).text, /https:\/\/github.com/);
  assert.match(runCommand("projects", true).text, /Video-to-ASCII/);
  assert.match(runCommand("experience", true).text, /EDITABLE DRAFT/);
  assert.match(runCommand("about", true).text, /EDITABLE DRAFT/);
});
test("completion returns matching commands without executing input", () => {
  assert.deepEqual(completeCommand("pro"), ["projects"]);
  assert.deepEqual(completeCommand("c"), ["clear", "coffee"]);
  assert.deepEqual(completeCommand("curl something"), []);
  assert.equal(runCommand("<script>bad()</script>", false).error, true);
  assert.match(runCommand("coffee", false).text, /Actual caffeine sold separately/);
});
