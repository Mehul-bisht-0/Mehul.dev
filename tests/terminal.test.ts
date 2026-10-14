import test from "node:test";
import assert from "node:assert/strict";
import { COMMANDS, DEFAULT_SIGNAL, completeCommand, runCommand, signalPath, type Waveform } from "../src/lib/terminal";

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
  assert.deepEqual(completeCommand("c"), ["clear", "coffee", "cd", "cat"]);
  assert.deepEqual(completeCommand("curl something"), []);
  assert.equal(runCommand("<script>bad()</script>", false).error, true);
  assert.match(runCommand("coffee", false).text, /Actual caffeine sold separately/);
});

test("virtual filesystem changes directory without touching real files", () => {
  assert.equal(runCommand("cd projects", false).cwd, "/projects");
  assert.match(runCommand("pwd", false, { cwd: "/projects" }).text, /~\/portfolio\/projects/);
  assert.match(runCommand("ls", false, { cwd: "/projects" }).text, /aco-its/);
  assert.match(runCommand("ls /", false, { cwd: "/projects" }).text, /about.txt/);
  assert.equal(runCommand("cd ..", false, { cwd: "/projects" }).cwd, "/");
  assert.equal(runCommand("cd /etc", false).error, true);
  assert.equal(runCommand("cat secrets.env", false).error, true);
  assert.equal(runCommand("cat about.txt", false, { cwd: "/projects" }).error, true);
  assert.match(runCommand("cat ../about.txt", false, { cwd: "/projects" }).text, /EDITABLE DRAFT/);
  assert.equal(runCommand("cat about.txt", false).section, undefined);
  assert.equal(runCommand("open aco-its", false).projectSlug, "aco-its");
  assert.equal(runCommand("open https://example.com", false).error, true);
});
test("argument completion and history reflect actual portfolio data", () => {
  assert.deepEqual(completeCommand("cat ab"), ["cat about.txt"]);
  assert.deepEqual(completeCommand("signal sq"), ["signal square"]);
  assert.deepEqual(completeCommand("open filing"), ["open filinglens"]);
  assert.match(runCommand("history", true, { history: ["ls", "cd projects"] }).text, /2  cd projects/);
});
test("instrument commands validate settings and synchronize with the scope", () => {
  assert.deepEqual(runCommand("signal square", false).signal, { wave: "square" });
  assert.deepEqual(runCommand("tune 8", false).signal, { frequency: 8 });
  assert.deepEqual(runCommand("gain 5", false).signal, { gain: 5 });
  assert.deepEqual(runCommand("hold", false).signal, { held: true });
  assert.deepEqual(runCommand("resume", false).signal, { held: false });
  for (const command of ["tune 0", "tune 9", "tune 1.5", "gain 6", "gain NaN", "signal random"]) assert.equal(runCommand(command, false).error, true);
  assert.match(runCommand("scope", false, { signal: { ...DEFAULT_SIGNAL, frequency: 7, held: true } }).text, /frequency  7 Hz/);
});
test("all signal shapes stay finite and within the oscilloscope screen", () => {
  for (const wave of ["sine", "square", "triangle"] as Waveform[]) {
    const path = signalPath({ ...DEFAULT_SIGNAL, wave, gain: 5, frequency: 8 }, .37);
    const samples = [...path.matchAll(/V(\d+)/g)].map((sample) => Number(sample[1]));
    assert.equal(samples.length, 80);
    assert.ok(samples.every((y) => y >= 10 && y <= 70 && y % 2 === 0));
    assert.match(path, /^M0 \d+ H3 V\d+ H6 V/);
    assert.doesNotMatch(path, /[LCQ]|\./);
    assert.notEqual(path, signalPath({ ...DEFAULT_SIGNAL, wave, frequency: 1 }));
  }
});
