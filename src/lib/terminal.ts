import { portfolio } from "../config/portfolio";

export const COMMANDS = ["help", "whoami", "projects", "experience", "activity", "about", "clear", "coffee", "ls", "cd", "pwd", "cat", "open", "history", "scope", "signal", "tune", "gain", "hold", "resume"] as const;
export const SHORTCUTS = ["help", "ls", "projects", "experience", "activity", "about", "scope", "coffee"];
export type Command = typeof COMMANDS[number];
export type ShellDirectory = "/" | "/projects";
export type Waveform = "sine" | "square" | "triangle";
export interface SignalSettings { wave: Waveform; frequency: number; gain: number; held: boolean }
export const DEFAULT_SIGNAL: SignalSettings = { wave: "sine", frequency: 3, gain: 2, held: false };
export interface ShellContext { cwd?: ShellDirectory; history?: string[]; signal?: SignalSettings }
export interface CommandResult { text: string; section?: string; clear?: boolean; error?: boolean; cwd?: ShellDirectory; projectSlug?: string; signal?: Partial<SignalSettings> }

const fail = (text: string): CommandResult => ({ text, error: true });

export function completeCommand(input: string): string[] {
  const normalized = input.toLowerCase().trimStart();
  if (!normalized.includes(" ")) return COMMANDS.filter((command) => command.startsWith(normalized));
  const [command, ...rest] = normalized.split(/\s+/);
  const prefix = rest.join(" ");
  const options = command === "cat" ? ["about.txt", "experience.log", "activity.map"] : command === "cd" ? ["projects", "..", "/"] : command === "open" ? portfolio.projects.map((project) => project.slug) : command === "signal" ? ["sine", "square", "triangle"] : [];
  return options.filter((option) => option.startsWith(prefix)).map((option) => `${command} ${option}`);
}

export function runCommand(input: string, expanded: boolean, context: ShellContext = {}): CommandResult {
  const [command, ...args] = input.trim().toLowerCase().split(/\s+/);
  const argument = args.join(" ");
  const cwd = context.cwd ?? "/";
  const settings = context.signal ?? DEFAULT_SIGNAL;
  switch (command) {
    case "help": return { text: "NAVIGATE\nwhoami / projects / experience / activity / about\nls [projects/]    browse the virtual filesystem\ncd projects      change directory (cd .. to return)\npwd              print the current directory\ncat about.txt    read a portfolio file\nopen <slug>      inspect a project\n\nINSTRUMENTS\nscope            show current signal settings\nsignal <wave>    sine / square / triangle\ntune <1–8>       set oscillator frequency (Hz)\ngain <1–5>       set signal amplitude\nhold / resume    freeze or release the trace\n\nSESSION\nhistory / clear / coffee\n\n↑/↓ history · Tab completion · Ctrl+C cancel · Esc collapse\nThis portfolio shell executes no system commands." };
    case "whoami": return { text: `${portfolio.name}\n${portfolio.headline}${expanded ? `\n\n${portfolio.intro}\nGitHub: ${portfolio.github}\nLeetCode: ${portfolio.leetcode}` : ""}`, section: "home" };
    case "projects": return { text: expanded ? portfolio.projects.map((project, index) => `${String(index + 1).padStart(2, "0")}  ${project.name}\n    ${project.description}\n    [${project.technologies.join(" / ")}]\n    ${project.repository}`).join("\n\n") : `${portfolio.projects.length} projects found. Opening projects/ …`, section: "projects" };
    case "experience": return { text: portfolio.experience.draft ? `[EDITABLE DRAFT]\n${portfolio.experience.title}${expanded ? `\n${portfolio.experience.description}` : ""}` : portfolio.experience.entries.map((entry) => `${entry.role} · ${entry.organization}\n${entry.dates}\n${entry.description}`).join("\n\n"), section: "experience" };
    case "about": return { text: `${portfolio.about.draft ? "[EDITABLE DRAFT]\n" : ""}${portfolio.about.title}${expanded ? `\n\n${portfolio.about.paragraphs.join("\n\n")}` : ""}`, section: "about" };
    case "activity": return { text: `GitHub (${portfolio.github}) + LeetCode (${portfolio.leetcode}).${expanded ? "\nOne calendar. Three views.\nCombined = contributions + submissions, not unique problems solved.\nUse the activity section below for live counts and year controls." : "\nOpening activity/ …"}`, section: "activity" };
    case "ls": {
      const directory = argument.replace(/\/$/, "");
      const showProjects = directory === "projects" || directory === "/projects" || ["", ".", "./"].includes(argument) && cwd === "/projects";
      if (showProjects) return { text: portfolio.projects.map((project) => `${project.slug.padEnd(20)} ${project.technologies.slice(0, 2).join(" / ")}`).join("\n") + "\n\nInspect one: open " + portfolio.projects[0].slug };
      if (!["", ".", "./", "/", ".."].includes(argument)) return fail(`ls: ${argument}: no such directory`);
      return { text: "projects/        selected repositories\nactivity.map     GitHub + LeetCode\nexperience.log   experience draft\nabout.txt        the human README\n\nTry: cd projects · cat about.txt" };
    }
    case "pwd": return { text: `~/portfolio${cwd === "/projects" ? "/projects" : ""}` };
    case "cd": {
      if (["", "/", "~", "..", "../"].includes(argument)) return { text: "~/portfolio", cwd: "/" };
      if (["projects", "projects/", "/projects", "/projects/", "~/projects"].includes(argument) && (cwd === "/" || argument.startsWith("/") || argument.startsWith("~/"))) return { text: "~/portfolio/projects\nUse ls to browse, or open <slug> to inspect a repository.", cwd: "/projects" };
      if (argument === ".") return { text: `~/portfolio${cwd === "/projects" ? "/projects" : ""}` };
      return fail(`cd: ${argument}: no such directory\nAvailable: / · /projects`);
    }
    case "cat": {
      if (cwd === "/projects" && !/^(\.\.\/|~\/|\/)/.test(argument)) return fail(`cat: ${argument}: no such file in projects/\nUse open <slug>, or cat ../about.txt.`);
      const name = argument.replace(/^(\.\.\/|~\/|\/)/, "");
      const target = name === "about.txt" ? "about" : name === "experience.log" ? "experience" : name === "activity.map" ? "activity" : null;
      if (target) return { text: runCommand(target, true).text };
      return fail(`cat: ${argument || "(missing file)"}: no such file\nTry: cat about.txt · cat experience.log · cat activity.map`);
    }
    case "open": {
      const slug = argument.replace(/^(projects\/|\/projects\/)/, "").replace(/\/$/, "");
      const project = portfolio.projects.find((entry) => entry.slug === slug);
      if (!project) return fail(`open: ${argument || "(missing slug)"}: project not found\nTry: ${portfolio.projects.map((entry) => entry.slug).join(" · ")}`);
      return { text: `${project.name}\n${project.technologies.join(" / ")}\n\n${project.description}\n\n${project.details.map((detail) => `→ ${detail}`).join("\n")}\n\n${project.repository}`, section: "projects", projectSlug: project.slug };
    }
    case "history": return { text: context.history?.length ? context.history.map((entry, index) => `${String(index + 1).padStart(3)}  ${entry}`).join("\n") : "No commands yet. Every session starts somewhere." };
    case "scope": return { text: `CH 01 / VIRTUAL SIGNAL GENERATOR\nwaveform   ${settings.wave}\nfrequency  ${settings.frequency} Hz\ngain       ${settings.gain}×\ntrace      ${settings.held ? "held" : "running (static with reduced motion)"}\n\nTry: signal square · tune 5 · gain 3 · hold\nThe instrument panel controls the same illustrative signal.` };
    case "signal": return ["sine", "square", "triangle"].includes(argument) ? { text: `CH 01 waveform → ${argument}`, signal: { wave: argument as Waveform } } : fail("Usage: signal sine | square | triangle");
    case "tune":
    case "gain": {
      const value = Number(argument);
      const maximum = command === "tune" ? 8 : 5;
      if (!/^[1-8]$/.test(argument) || value > maximum) return fail(`Usage: ${command} <1–${maximum}> (whole numbers)`);
      return command === "tune" ? { text: `Oscillator → ${value} Hz`, signal: { frequency: value } } : { text: `Vertical gain → ${value}×`, signal: { gain: value } };
    }
    case "hold": return { text: "Trace held. Your next thought can take its time.", signal: { held: true } };
    case "resume": return { text: "Trace released. Reduced-motion preferences are respected.", signal: { held: false } };
    case "clear": return { text: "", clear: true };
    case "coffee": return { text: "   ( (\n    ) )\n  .------.\n  |      |]  coffee.exe\n  '------'\n\nProcess complete. Actual caffeine sold separately." };
    default: {
      const suggested = completeCommand(command)[0];
      return fail(`command not found: ${input.trim()}\n${suggested ? `Try '${suggested}', or 'help'.` : "Try 'help'. This shell has a very small PATH and good intentions."}`);
    }
  }
}

export function signalPath(settings: SignalSettings, phase = 0): string {
  return Array.from({ length: 81 }, (_, index) => {
    const x = index * 3;
    const cycle = (x / 240 * settings.frequency + phase) % 1;
    const value = settings.wave === "square" ? (cycle < .5 ? 1 : -1) : settings.wave === "triangle" ? 1 - 4 * Math.abs(cycle - .5) : Math.sin(cycle * Math.PI * 2);
    const y = Math.round((40 - value * settings.gain * 6) / 2) * 2;
    return index === 0 ? `M0 ${y}` : `H${x} V${y}`;
  }).join(" ");
}
