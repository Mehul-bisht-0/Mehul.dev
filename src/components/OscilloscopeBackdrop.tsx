"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SIGNAL, signalPath, type SignalSettings } from "@/lib/terminal";
import { useOscillator } from "@/lib/useOscillator";

export default function OscilloscopeBackdrop() {
  const [settings, setSettings] = useState<SignalSettings>(DEFAULT_SIGNAL);
  const { phase } = useOscillator(settings);
  useEffect(() => {
    const receive = (event: Event) => {
      const next = (event as CustomEvent<SignalSettings>).detail;
      if (next && ["sine", "square", "triangle"].includes(next.wave) && Number.isInteger(next.frequency) && next.frequency >= 1 && next.frequency <= 8 && Number.isInteger(next.gain) && next.gain >= 1 && next.gain <= 5 && typeof next.held === "boolean") setSettings(next);
    };
    window.addEventListener("portfolio:signal-change", receive);
    return () => window.removeEventListener("portfolio:signal-change", receive);
  }, []);

  return <>
    <div className="analog-backdrop crt-backdrop" aria-hidden="true" data-waveform={settings.wave} data-held={settings.held}>
      <svg className="crt-backdrop-traces" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges">
        <path className="crt-graticule" d="M0 90H960M0 180H960M0 270H960M0 360H960M0 450H960M120 0V540M240 0V540M360 0V540M480 0V540M600 0V540M720 0V540M840 0V540" />
        <g transform="translate(0 86) scale(4)"><path className="crt-backdrop-persistence" d={signalPath(settings, (phase + .035) % 1)} /><path className="crt-backdrop-primary" data-testid="background-trace" d={signalPath(settings, phase)} /></g>
        <g transform="translate(0 254) scale(4)"><path className="crt-backdrop-secondary" d={signalPath({ ...settings, gain: Math.max(1, settings.gain - 1) }, (phase + .25) % 1)} /></g>
        <path className="crt-center-ticks" d="M470 30h20M470 60h20M470 90h20M470 120h20M470 150h20M470 180h20M470 210h20M470 240h20M470 270h20M470 300h20M470 330h20M470 360h20M470 390h20M470 420h20M470 450h20M470 480h20M470 510h20M30 260v20M60 260v20M90 260v20M120 260v20M150 260v20M180 260v20M210 260v20M240 260v20M270 260v20M300 260v20M330 260v20M360 260v20M390 260v20M420 260v20M450 260v20M480 260v20M510 260v20M540 260v20M570 260v20M600 260v20M630 260v20M660 260v20M690 260v20M720 260v20M750 260v20M780 260v20M810 260v20M840 260v20M870 260v20M900 260v20M930 260v20" />
      </svg>
      <span className="crt-channel-marker crt-channel-one">1 ▸</span><span className="crt-channel-marker crt-channel-two">2 ▸</span>
    </div>
    <div className="crt-raster" aria-hidden="true" />
    <div className="crt-screen-edge" aria-hidden="true" />
  </>;
}
