"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { APPEARANCE_KEY, DEFAULT_APPEARANCE, THEMES, applyAppearance, parseAppearance, type Appearance } from "@/lib/appearance";

export default function AppearanceControls() {
  const [settings, setSettings] = useState<Appearance>(DEFAULT_APPEARANCE);
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let initial = DEFAULT_APPEARANCE;
    try { initial = parseAppearance(localStorage.getItem(APPEARANCE_KEY)); } catch { /* Browser storage is optional. */ }
    setSettings(initial);
    applyAppearance(initial);
    const synchronize = (event: StorageEvent) => {
      if (event.key !== APPEARANCE_KEY && event.key !== null) return;
      const next = parseAppearance(event.newValue);
      setSettings(next);
      applyAppearance(next);
    };
    const reveal = () => setOpen(true);
    window.addEventListener("storage", synchronize);
    window.addEventListener("portfolio:open-display", reveal);
    return () => { window.removeEventListener("storage", synchronize); window.removeEventListener("portfolio:open-display", reveal); };
  }, []);

  useEffect(() => {
    if (!open) return;
    dockRef.current?.querySelector<HTMLButtonElement>('.theme-options button[aria-pressed="true"]')?.focus({ preventScroll: true });
    const closeOutside = (event: PointerEvent) => { if (event.target instanceof Node && !dockRef.current?.contains(event.target)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.stopPropagation(); setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [open]);

  const update = (patch: Partial<Appearance>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    applyAppearance(next);
    try { localStorage.setItem(APPEARANCE_KEY, JSON.stringify(next)); } catch { /* Keep applying settings for this visit. */ }
  };

  return (
    <div ref={dockRef} className="appearance-dock">
      {open && <section id="display-settings" className="appearance-panel" aria-label="Display settings">
        <div className="appearance-panel-heading"><span>DISPLAY CONFIG</span><button type="button" aria-label="Close display settings" onClick={() => { setOpen(false); buttonRef.current?.focus(); }}>×</button></div>
        <fieldset><legend>01 / colour palette</legend><div className="theme-options">{THEMES.map((theme) => <button type="button" key={theme.id} aria-pressed={settings.theme === theme.id} onClick={() => update({ theme: theme.id })}><i style={{ "--swatch": theme.swatch } as CSSProperties} aria-hidden="true" /><span>{theme.label}</span><span className="theme-selected" aria-hidden="true">{settings.theme === theme.id ? "■" : "□"}</span></button>)}</div></fieldset>
        <fieldset><legend>02 / night drive</legend><div className="scene-options"><button type="button" aria-pressed={settings.scene === "city"} onClick={() => update({ scene: "city" })}>neon city</button><button type="button" aria-pressed={settings.scene === "desert"} onClick={() => update({ scene: "desert" })}>desert highway</button></div></fieldset>
        <fieldset className="display-switches"><legend>03 / signal treatment</legend><label><span>Motion <small>follows reduced-motion preference</small></span><input type="checkbox" checked={settings.motion === "auto"} onChange={(event) => update({ motion: event.target.checked ? "auto" : "paused" })} /></label><label><span>CRT texture</span><input type="checkbox" checked={settings.crt} onChange={(event) => update({ crt: event.target.checked })} /></label><label><span>City rain</span><input type="checkbox" checked={settings.rain} onChange={(event) => update({ rain: event.target.checked })} /></label></fieldset>
        <div className="appearance-panel-footer"><span>saved on this device</span><button type="button" onClick={() => update(DEFAULT_APPEARANCE)}>reset display</button></div>
      </section>}
      <button ref={buttonRef} type="button" className="appearance-trigger" aria-label="Display settings" aria-expanded={open} aria-controls="display-settings" onClick={() => setOpen(!open)}><span aria-hidden="true">▦</span> display <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    </div>
  );
}
