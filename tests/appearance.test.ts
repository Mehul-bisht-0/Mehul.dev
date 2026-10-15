import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_APPEARANCE, THEMES, parseAppearance } from "../src/lib/appearance";

test("saved appearance settings accept supported values and preserve false switches", () => {
  for (const theme of THEMES) {
    const settings = { theme: theme.id, scene: "desert", motion: "paused", crt: false, rain: false };
    assert.deepEqual(parseAppearance(JSON.stringify(settings)), settings);
  }
});

test("broken or unknown stored preferences fall back to usable display settings", () => {
  for (const raw of [null, "not-json", "null", "42", '"colour"', "[]", '{"theme":"untrusted","scene":"unknown","motion":"always","crt":"false","rain":0}']) {
    assert.deepEqual(parseAppearance(raw), DEFAULT_APPEARANCE);
  }
  assert.deepEqual(parseAppearance('{"theme":"amber"}'), { ...DEFAULT_APPEARANCE, theme: "amber" });
});
