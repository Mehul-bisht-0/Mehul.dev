export const THEMES = [
  { id: "ion", label: "Ion cyan", swatch: "#72e8ef" },
  { id: "phosphor", label: "Phosphor", swatch: "#b2eb82" },
  { id: "amber", label: "Amber", swatch: "#f6c875" },
  { id: "ember", label: "Ember", swatch: "#ff9470" },
] as const;
export interface Appearance {
  theme: typeof THEMES[number]["id"];
  scene: "city" | "desert";
  motion: "auto" | "paused";
  crt: boolean;
  rain: boolean;
}
export const APPEARANCE_KEY = "portfolio:appearance";
export const DEFAULT_APPEARANCE: Appearance = { theme: "ion", scene: "city", motion: "auto", crt: true, rain: true };

export function parseAppearance(raw: string | null): Appearance {
  try {
    const saved = JSON.parse(raw ?? "null");
    return {
      theme: THEMES.some((theme) => theme.id === saved?.theme) ? saved.theme : DEFAULT_APPEARANCE.theme,
      scene: saved?.scene === "desert" ? "desert" : "city",
      motion: saved?.motion === "paused" ? "paused" : "auto",
      crt: typeof saved?.crt === "boolean" ? saved.crt : true,
      rain: typeof saved?.rain === "boolean" ? saved.rain : true,
    };
  } catch { return { ...DEFAULT_APPEARANCE }; }
}

export function applyAppearance(settings: Appearance) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.scene = settings.scene;
  root.dataset.motion = settings.motion;
  root.dataset.crt = settings.crt ? "on" : "off";
  root.dataset.rain = settings.rain ? "on" : "off";
  window.dispatchEvent(new Event("portfolio:appearance-change"));
}

// Run before hydration so a saved palette is also the first palette painted.
export const APPEARANCE_BOOTSTRAP = `(()=>{try{const s=JSON.parse(localStorage.getItem(${JSON.stringify(APPEARANCE_KEY)})||"null"),r=document.documentElement;r.dataset.theme=${JSON.stringify(THEMES.map((theme) => theme.id))}.includes(s?.theme)?s.theme:"ion";r.dataset.scene=s?.scene==="desert"?"desert":"city";r.dataset.motion=s?.motion==="paused"?"paused":"auto";r.dataset.crt=s?.crt===false?"off":"on";r.dataset.rain=s?.rain===false?"off":"on"}catch{}})();`;
