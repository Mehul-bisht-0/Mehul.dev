import { portfolio } from "../config/portfolio";

export const COMMANDS = ["help", "whoami", "projects", "experience", "activity", "about", "clear", "coffee"] as const;
export type Command = typeof COMMANDS[number];
export interface CommandResult { text: string; section?: string; clear?: boolean; error?: boolean }

export function completeCommand(input: string): string[] {
  const prefix = input.trim().toLowerCase();
  return COMMANDS.filter((command) => command.startsWith(prefix));
}

export function runCommand(input: string, expanded: boolean): CommandResult {
  const command = input.trim().toLowerCase();
  switch (command) {
    case "help": return { text: "help        list commands\nwhoami      meet Mehul\nactivity    GitHub + LeetCode calendar\nprojects    inspect selected work\nexperience  read the experience log\nabout       the human README\nclear       clean the terminal\ncoffee      a small caffeine simulation\n\n↑/↓ history · Tab completion · Esc collapse" };
    case "whoami": return { text: `${portfolio.name}\n${portfolio.headline}${expanded ? `\n\n${portfolio.intro}\nGitHub: ${portfolio.github}\nLeetCode: ${portfolio.leetcode}` : ""}`, section: "home" };
    case "projects": return { text: expanded ? portfolio.projects.map((project, index) => `${String(index + 1).padStart(2, "0")}  ${project.name}\n    ${project.description}\n    [${project.technologies.join(" / ")}]\n    ${project.repository}`).join("\n\n") : `${portfolio.projects.length} projects found. Opening projects/ …`, section: "projects" };
    case "experience": return { text: portfolio.experience.draft ? `[EDITABLE DRAFT]\n${portfolio.experience.title}${expanded ? `\n${portfolio.experience.description}` : ""}` : portfolio.experience.entries.map((entry) => `${entry.role} · ${entry.organization}\n${entry.dates}\n${entry.description}`).join("\n\n"), section: "experience" };
    case "about": return { text: `${portfolio.about.draft ? "[EDITABLE DRAFT]\n" : ""}${portfolio.about.title}${expanded ? `\n\n${portfolio.about.paragraphs.join("\n\n")}` : ""}`, section: "about" };
    case "activity": return { text: `GitHub (${portfolio.github}) + LeetCode (${portfolio.leetcode}).${expanded ? "\nOne calendar. Three views.\nCombined = contributions + submissions, not unique problems solved.\nUse the activity section below for live counts and year controls." : "\nOpening activity/ …"}`, section: "activity" };
    case "clear": return { text: "", clear: true };
    case "coffee": return { text: "   ( (\n    ) )\n  .------.\n  |      |]  coffee.exe\n  '------'\n\nProcess complete. Actual caffeine sold separately." };
    default: return { text: `command not found: ${input.trim()}\nTry 'help'. This shell has a very small PATH and good intentions.`, error: true };
  }
}
