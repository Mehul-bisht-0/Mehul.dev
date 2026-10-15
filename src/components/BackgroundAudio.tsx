"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ENABLED_KEY = "portfolio:audio-enabled";
const VOLUME_KEY = "portfolio:audio-volume";
const DEFAULT_VOLUME = 20;

function remember(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* Playback works without browser storage. */ }
}

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantedRef = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [unavailable, setUnavailable] = useState(false);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setUnavailable(false);
    if (audio.error) audio.load();
    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException && ["NotAllowedError", "AbortError"].includes(error.name)) return;
      setUnavailable(true);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let savedVolume = DEFAULT_VOLUME;
    try {
      wantedRef.current = localStorage.getItem(ENABLED_KEY) !== "off";
      const stored = localStorage.getItem(VOLUME_KEY);
      const parsed = stored === null ? DEFAULT_VOLUME : Number(stored);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) savedVolume = parsed;
    } catch { /* Use the default volume and first-interaction playback. */ }
    audio.volume = savedVolume / 100;
    setVolume(savedVolume);

    const startOnInteraction = (event: Event) => {
      if (!wantedRef.current || !audio.paused || (event.target instanceof Element && event.target.closest(".background-audio"))) return;
      play();
    };
    const stopListening = () => {
      document.removeEventListener("pointerdown", startOnInteraction);
      document.removeEventListener("keydown", startOnInteraction);
    };
    document.addEventListener("pointerdown", startOnInteraction);
    document.addEventListener("keydown", startOnInteraction);
    audio.addEventListener("playing", stopListening);
    if (wantedRef.current) play();
    return () => {
      stopListening();
      audio.removeEventListener("playing", stopListening);
    };
  }, [play]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      wantedRef.current = false;
      remember(ENABLED_KEY, "off");
      audio.pause();
    } else {
      wantedRef.current = true;
      remember(ENABLED_KEY, "on");
      play();
    }
  };

  return (
    <div className="background-audio" role="group" aria-label="Background music">
      <audio ref={audioRef} src="/audio/the-son-of-flynn.mp3" loop preload="none" onPlaying={() => { setPlaying(true); setUnavailable(false); }} onPause={() => setPlaying(false)} onError={() => { setPlaying(false); setUnavailable(true); }} />
      <button type="button" className="audio-toggle" aria-label={playing ? "Pause background music" : "Play background music"} aria-pressed={playing} onClick={toggle} title="The Son of Flynn · TRON: Legacy · loop">
        <svg viewBox="0 0 20 16" width="20" height="16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true"><path d={playing ? "M1 8H4V3H7V13H10V5H13V11H16V8H19" : "M1 8H19"} /></svg>
        <span>{unavailable ? "retry sound" : playing ? "sound on" : "sound off"}</span>
      </button>
      <label className="audio-volume"><span className="sr-only">Background music volume</span><input type="range" min="0" max="100" step="5" value={volume} onChange={(event) => { const next = Number(event.target.value); setVolume(next); if (audioRef.current) audioRef.current.volume = next / 100; remember(VOLUME_KEY, String(next)); }} /><span aria-hidden="true">{volume}%</span></label>
      {unavailable && <span className="sr-only" role="status">Background audio could not load. Try the sound button again.</span>}
    </div>
  );
}
