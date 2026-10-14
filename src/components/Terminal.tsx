"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SHORTCUTS, DEFAULT_SIGNAL, completeCommand, runCommand, type ShellDirectory, type SignalSettings } from "@/lib/terminal";
import { portfolio } from "@/config/portfolio";
import SignalScope from "./SignalScope";

interface Entry { command: string; output: string; error?: boolean; cwd: ShellDirectory }

export default function Terminal() {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const [focusRequest, setFocusRequest] = useState(0);
  const [cwd, setCwd] = useState<ShellDirectory>("/");
  const [signal, setSignal] = useState<SignalSettings>(DEFAULT_SIGNAL);
  const suggestions = input.trim() ? completeCommand(input).filter((command) => command !== input).slice(0, 4) : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pendingInput = useRef("");

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("portfolio:signal-change", { detail: signal }));
  }, [signal]);

  useEffect(() => {
    const open = () => {
      setExpanded(true);
      setFocusRequest((previous) => previous + 1);
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("terminal-window")?.scrollIntoView({ behavior: motion ? "instant" : "smooth", block: "center" });
    };
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.code === "Backquote") {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("portfolio:open-terminal", open);
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("portfolio:open-terminal", open);
      window.removeEventListener("keydown", shortcut);
    };
  }, []);

  useEffect(() => {
    if (focusRequest) inputRef.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  useEffect(() => {
    const element = transcriptRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [entries, expanded]);

  function execute(value: string) {
    const command = value.trim().slice(0, 200);
    if (!command) return;
    const result = runCommand(command, expanded, { cwd, history, signal });
    setHistory((previous) => [...previous.slice(-99), command]);
    setHistoryIndex(-1);
    setInput("");
    setSuggestion("");
    if (result.clear) setEntries([]);
    else setEntries((previous) => [...previous.slice(-49), { command, output: result.text, error: result.error, cwd }]);
    if (result.cwd) setCwd(result.cwd);
    if (result.signal) setSignal((previous) => ({ ...previous, ...result.signal }));
    if (!expanded && result.projectSlug) {
      window.dispatchEvent(new CustomEvent("portfolio:inspect-project", { detail: result.projectSlug }));
    } else if (!expanded && result.section) {
      const section = document.getElementById(result.section);
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section?.scrollIntoView({ behavior: motion ? "instant" : "smooth", block: "start" });
      section?.focus({ preventScroll: true });
    } else inputRef.current?.focus({ preventScroll: true });
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      if (event.currentTarget.selectionStart !== event.currentTarget.selectionEnd) return;
      event.preventDefault();
      setInput("");
      setSuggestion("");
      setHistoryIndex(-1);
    } else if (event.key === "ArrowUp" && history.length) {
      event.preventDefault();
      if (historyIndex === -1) pendingInput.current = input;
      const index = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
    } else if (event.key === "ArrowDown" && historyIndex !== -1) {
      event.preventDefault();
      const index = historyIndex + 1;
      setHistoryIndex(index >= history.length ? -1 : index);
      setInput(index >= history.length ? pendingInput.current : history[index]);
    } else if (event.key === "Tab" && !event.shiftKey && input.trim()) {
      const matches = completeCommand(input);
      if (matches.length) {
        event.preventDefault();
        if (matches.length === 1) { setInput(matches[0]); setSuggestion(""); }
        else setSuggestion(matches.join("  "));
      }
    } else if (event.key === "Escape") {
      setExpanded(false);
      setSuggestion("");
    }
  }

  return (
    <div id="terminal-window" className={`terminal instrument-terminal ${expanded ? "terminal-expanded" : ""}`}>
      <div className="terminal-chrome">
        <span><span className="terminal-icon" aria-hidden="true">●</span> {portfolio.handle}@portfolio: ~{cwd === "/projects" ? "/projects" : ""}</span>
        <span className="terminal-model">MB–01 / INTERACTIVE CONSOLE</span>
        <button className="text-button" type="button" aria-expanded={expanded} aria-controls="terminal-transcript" onClick={() => setExpanded(!expanded)}>
          {expanded ? "[ − collapse ]" : "[ + expand shell ]"}
        </button>
      </div>
      <SignalScope settings={signal} onChange={(patch) => setSignal((previous) => ({ ...previous, ...patch }))} />
      <div className="terminal-body">
        <div className="terminal-welcome"><span className="green">session ready.</span> Explore the files. Tune the signal. Follow your curiosity.</div>
        <div id="terminal-transcript" className="terminal-transcript" ref={transcriptRef} role="log" aria-live="polite" aria-label="Terminal output" tabIndex={entries.length ? 0 : -1}>
          {entries.map((entry, index) => (
            <div className="terminal-entry" key={index}>
              <div><span className="green">visitor</span><span className="muted">:~{entry.cwd === "/projects" ? "/projects" : ""}$ </span>{entry.command}</div>
              <pre className={entry.error ? "terminal-error" : ""}>{entry.output}</pre>
            </div>
          ))}
        </div>
        <form className="terminal-input-row" onSubmit={(event) => { event.preventDefault(); execute(input); }}>
          <label htmlFor="terminal-input" className="terminal-prompt"><span className="green">visitor</span><span className="muted">:~{cwd === "/projects" ? "/projects" : ""}$</span><span className="sr-only"> Terminal command</span></label>
          <input ref={inputRef} id="terminal-input" value={input} maxLength={200} onChange={(event) => { setInput(event.target.value); setHistoryIndex(-1); setSuggestion(""); }} onKeyDown={keyDown} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="type help, or take a shortcut below" />
          <button className="run-command" type="submit" aria-label="Run command">↵</button>
        </form>
        {suggestion && <div className="completion-hint" role="status">{suggestion}</div>}
        {suggestions.length > 0 && <div className="terminal-suggestions" aria-label="Command suggestions">{suggestions.map((command) => <button type="button" key={command} onClick={() => { setInput(command); setSuggestion(""); inputRef.current?.focus({ preventScroll: true }); }}>{command}<span aria-hidden="true"> ↵</span></button>)}</div>}
      </div>
      <div className="command-shortcuts" aria-label="Command shortcuts">
        {SHORTCUTS.map((command) => <button key={command} onClick={() => execute(command)} type="button">{command}<span aria-hidden="true"> ↗</span></button>)}
        <span className="shell-hint">↑↓ history · tab complete</span>
      </div>
    </div>
  );
}
