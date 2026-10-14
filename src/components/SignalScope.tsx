"use client";

import { useId } from "react";
import { signalPath, type SignalSettings, type Waveform } from "@/lib/terminal";
import { useOscillator } from "@/lib/useOscillator";

export default function SignalScope({ settings, onChange }: { settings: SignalSettings; onChange: (settings: Partial<SignalSettings>) => void }) {
  const { phase, reducedMotion } = useOscillator(settings);
  const frequencyId = useId();
  const gainId = useId();

  return (
    <div className="signal-instrument" aria-label="Interactive virtual oscilloscope">
      <div className="scope-display">
        <div className="scope-screen-label"><span>CH 01 <b>{settings.wave.toUpperCase()}</b></span><span>{settings.held ? "HOLD" : reducedMotion ? "STATIC" : "RUN"}</span></div>
        <svg viewBox="0 0 240 80" preserveAspectRatio="none" shapeRendering="crispEdges" className="scope-screen" aria-label={`${settings.wave} waveform at ${settings.frequency} hertz, gain ${settings.gain}`} role="img"><path className="scope-grid" d="M0 20H240M0 40H240M0 60H240M30 0V80M60 0V80M90 0V80M120 0V80M150 0V80M180 0V80M210 0V80" /><path className="scope-crosshair" d="M0 40H240M120 0V80" /><path className="scope-trace-persistence" aria-hidden="true" d={signalPath(settings, (phase + .035) % 1)} /><path className="scope-trace" data-testid="scope-trace" d={signalPath(settings, phase)} /></svg>
        <div className="scope-readout"><span>{settings.frequency.toFixed(1)} Hz</span><span>GAIN {settings.gain.toFixed(1)}×</span><span>VIRTUAL SIGNAL</span></div>
      </div>
      <div className="scope-control-bank">
        <div className="scope-bank-label">SIGNAL GENERATOR <span>MB–01</span></div>
        <div className="waveform-switch" role="group" aria-label="Signal waveform">{(["sine", "square", "triangle"] as Waveform[]).map((wave) => <button type="button" key={wave} onClick={() => onChange({ wave })} aria-pressed={settings.wave === wave} aria-label={`${wave} waveform`}>{wave === "sine" ? "∿" : wave === "square" ? "⊓" : "⋀"}<span>{wave}</span></button>)}</div>
        <div className="scope-dials">
          <label htmlFor={frequencyId}><span className="scope-knob" style={{ transform: `rotate(${-120 + (settings.frequency - 1) / 7 * 240}deg)` }} aria-hidden="true"><i /></span><span>FREQUENCY <b>{settings.frequency} Hz</b></span><input id={frequencyId} type="range" min="1" max="8" step="1" value={settings.frequency} aria-label="Oscillator frequency" onChange={(event) => onChange({ frequency: Number(event.target.value) })} /></label>
          <label htmlFor={gainId}><span className="scope-knob" style={{ transform: `rotate(${-120 + (settings.gain - 1) / 4 * 240}deg)` }} aria-hidden="true"><i /></span><span>GAIN <b>{settings.gain}×</b></span><input id={gainId} type="range" min="1" max="5" step="1" value={settings.gain} aria-label="Oscillator gain" onChange={(event) => onChange({ gain: Number(event.target.value) })} /></label>
        </div>
      </div>
      <button type="button" className="scope-hold" aria-pressed={settings.held} onClick={() => onChange({ held: !settings.held })}><span className={`scope-hold-led ${settings.held ? "is-held" : ""}`} aria-hidden="true" />{settings.held ? "RELEASE" : "HOLD"}<span>trace</span></button>
    </div>
  );
}
