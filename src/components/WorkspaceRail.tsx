"use client";

import { useEffect, useState } from "react";
import { portfolio } from "@/config/portfolio";

const sections = [
  { id: "home", label: "home", file: "~/", icon: "home" },
  { id: "activity", label: "activity", file: "activity.map", icon: "activity" },
  { id: "projects", label: "projects", file: "projects/", icon: "folder" },
  { id: "experience", label: "experience", file: "experience.log", icon: "log" },
  { id: "about", label: "about", file: "about.txt", icon: "user" },
];

function RailIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="m3 9 7-6 7 6v8H5V9" /><path d="M8 17v-5h4v5" /></>,
    activity: <><path d="M2 10h4l2-6 4 12 2-6h4" /></>,
    folder: <path d="M3 5h5l2 2h7v9H3Z" />,
    log: <><path d="M5 3h7l3 3v11H5Z" /><path d="M8 9h4M8 12h4" /></>,
    user: <><circle cx="10" cy="6" r="3" /><path d="M4 17v-2a6 6 0 0 1 12 0v2Z" /></>,
    terminal: <><path d="m4 5 5 5-5 5M11 15h5" /></>,
    link: <><path d="M8 5H4v11h11v-4M11 3h6v6M8 12l9-9" /></>,
    moon: <path d="M15 14A7 7 0 0 1 6 4a7 7 0 1 0 9 10Z" />,
  };
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{paths[kind] ?? paths.log}</svg>;
}

function sessionDuration(seconds: number) {
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function WorkspaceRail() {
  const [current, setCurrent] = useState("home");
  const [progress, setProgress] = useState(0);
  const [clock, setClock] = useState("--:--:--");
  const [uptime, setUptime] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const startedAt = Date.now();
    const tick = () => {
      setClock(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false }));
      setUptime(Math.floor((Date.now() - startedAt) / 1000));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    let frame = 0;
    const update = () => {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maximum > 0 ? Math.round(Math.min(100, Math.max(0, window.scrollY / maximum * 100))) : 0);
      let active = "home";
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.32) active = section.id;
      }
      if (maximum > 0 && window.scrollY >= maximum - 8) active = "about";
      setCurrent(active);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <aside className={`workspace-rail ${mobileOpen ? "rail-mobile-open" : ""}`} aria-label="Portfolio workspace">
      <button type="button" className="rail-mobile-toggle" aria-expanded={mobileOpen} aria-controls="workspace-rail-body" onClick={() => setMobileOpen(!mobileOpen)}><span><span className="green">⌘</span> workspace/index</span><span>{mobileOpen ? "[ − ]" : "[ + ]"}</span></button>
      <div className="rail-body" id="workspace-rail-body">
        <div className="rail-profile">
          <div className="rail-avatar" aria-hidden="true"><span>{portfolio.handle.slice(0, 2).toUpperCase()}</span><i>_</i></div>
          <p className="rail-profile-name">{portfolio.name}</p>
          <span className="rail-profile-description">{portfolio.headline}</span>
          <div className="rail-profile-session"><span className="status-dot status-live" aria-hidden="true" /> portfolio session</div>
        </div>

        <div className="rail-group-label"><span>EXPLORER</span><span>5 files</span></div>
        <nav className="rail-navigation" aria-label="Workspace sections">
          {sections.map((section) => <a key={section.id} href={`#${section.id}`} aria-current={current === section.id ? "location" : undefined} onClick={() => { setCurrent(section.id); setMobileOpen(false); }}><RailIcon kind={section.icon} /><span>{section.file}</span><span className="rail-active-marker" aria-hidden="true">←</span></a>)}
        </nav>

        <div className="rail-group-label">REMOTES</div>
        <div className="rail-remotes">{portfolio.social.map((social) => <a href={social.href} key={social.label} target="_blank" rel="noreferrer"><RailIcon kind="link" /><span>{social.label.toLowerCase()}</span><span aria-hidden="true">↗</span></a>)}</div>

        <div className="rail-system">
          <div className="rail-group-label">SYSTEM</div>
          <button type="button" className="rail-terminal-action" onClick={() => { window.dispatchEvent(new Event("portfolio:open-terminal")); setMobileOpen(false); }}><RailIcon kind="terminal" /><span>open terminal</span><kbd>⌃`</kbd></button>
          <div className="rail-theme"><RailIcon kind="moon" /><span>night mode</span><span className="green">on</span></div>
          <div className="rail-session-details"><span>clock <time suppressHydrationWarning>{clock} UTC</time></span><span>session <b>{sessionDuration(uptime)}</b></span></div>
          <div className="rail-reading"><span>reading position</span><span>{progress}%</span><progress aria-label="Reading progress" value={progress} max={100} /></div>
          <span className="rail-signoff">// explore at your own pace</span>
        </div>
      </div>
    </aside>
  );
}
