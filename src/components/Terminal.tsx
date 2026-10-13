"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { COMMANDS, completeCommand, runCommand } from "@/lib/terminal";
import { portfolio } from "@/config/portfolio";

interface Entry { command: string; output: string; error?: boolean }

export default function Terminal() {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestion, setSuggestion] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const pendingInput = useRef("");

  useEffect(() => {
    const element = transcriptRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [entries, expanded]);

  function execute(value: string) {
    const command = value.trim().slice(0, 200);
    if (!command) return;
    const result = runCommand(command, expanded);
    setHistory((previous) => [...previous.slice(-99), command]);
    setHistoryIndex(-1);
    setInput("");
    setSuggestion("");
    if (result.clear) setEntries([]);
    else setEntries((previous) => [...previous.slice(-49), { command, output: result.text, error: result.error }]);
    if (!expanded && result.section) {
      const section = document.getElementById(result.section);
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      section?.scrollIntoView({ behavior: motion ? "instant" : "smooth", block: "start" });
      section?.focus({ preventScroll: true });
    } else inputRef.current?.focus({ preventScroll: true });
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowUp" && history.length) {
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
    <div className={`terminal ${expanded ? "terminal-expanded" : ""}`}>
      <div className="terminal-chrome">
        <span><span className="terminal-icon" aria-hidden="true">›_</span> {portfolio.handle}@portfolio: ~</span>
        <button className="text-button" type="button" aria-expanded={expanded} aria-controls="terminal-transcript" onClick={() => setExpanded(!expanded)}>
          {expanded ? "[ − collapse ]" : "[ + expand shell ]"}
        </button>
      </div>
      <div className="terminal-body">
        <div className="terminal-welcome"><span className="green">session ready.</span> Try a command. Curiosity is a valid input.</div>
        <div id="terminal-transcript" className="terminal-transcript" ref={transcriptRef} role="log" aria-live="polite" aria-label="Terminal output" tabIndex={entries.length ? 0 : -1}>
          {entries.map((entry, index) => (
            <div className="terminal-entry" key={index}>
              <div><span className="green">{portfolio.handle}@portfolio</span><span className="muted">:~$ </span>{entry.command}</div>
              <pre className={entry.error ? "terminal-error" : ""}>{entry.output}</pre>
            </div>
          ))}
        </div>
        <form className="terminal-input-row" onSubmit={(event) => { event.preventDefault(); execute(input); }}>
          <label htmlFor="terminal-input" className="terminal-prompt"><span className="green">visitor</span><span className="muted">:~$</span><span className="sr-only"> Terminal command</span></label>
          <input ref={inputRef} id="terminal-input" value={input} maxLength={200} onChange={(event) => { setInput(event.target.value); setHistoryIndex(-1); setSuggestion(""); }} onKeyDown={keyDown} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="type help, or take a shortcut below" />
          <button className="run-command" type="submit" aria-label="Run command">↵</button>
        </form>
        {suggestion && <div className="completion-hint" role="status">{suggestion}</div>}
      </div>
      <div className="command-shortcuts" aria-label="Command shortcuts">
        {COMMANDS.filter((command) => command !== "clear").map((command) => <button key={command} onClick={() => execute(command)} type="button">{command}<span aria-hidden="true"> ↗</span></button>)}
        <span className="shell-hint">↑↓ history · tab complete</span>
      </div>
    </div>
  );
}
