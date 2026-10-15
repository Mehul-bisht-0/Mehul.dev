"use client";

import { useEffect, useState } from "react";
import type { SignalSettings } from "./terminal";

export function useOscillator(settings: SignalSettings) {
  const [phase, setPhase] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches || document.documentElement.dataset.motion === "paused");
    update();
    media.addEventListener("change", update);
    window.addEventListener("portfolio:appearance-change", update);
    return () => { media.removeEventListener("change", update); window.removeEventListener("portfolio:appearance-change", update); };
  }, []);
  useEffect(() => {
    if (settings.held || reducedMotion) return;
    let frame = 0;
    let last = 0;
    const animate = (time: number) => {
      if (!last) last = time;
      if (time - last >= 66) {
        const elapsed = Math.min((time - last) / 1000, .1);
        setPhase((value) => (value + elapsed * settings.frequency * .2) % 1);
        last = time;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [settings.held, settings.frequency, reducedMotion]);
  return { phase, reducedMotion };
}
