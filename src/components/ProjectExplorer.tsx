"use client";

import { Children, useId, useMemo, useState, type ReactNode } from "react";
import type { Project } from "@/config/portfolio";

type ProjectView = "list" | "grid" | "table";
const views: { id: ProjectView; label: string; icon: ReactNode }[] = [
  { id: "list", label: "List", icon: <><path d="M3 4h14M3 10h14M3 16h14" /></> },
  { id: "grid", label: "Grid", icon: <><path d="M3 3h5v5H3ZM12 3h5v5h-5ZM3 12h5v5H3ZM12 12h5v5h-5Z" /></> },
  { id: "table", label: "Table", icon: <><path d="M2 3h16v14H2ZM2 8h16M2 12h16M7 3v14" /></> },
];

export default function ProjectExplorer({ projects, children }: { projects: Project[]; children: ReactNode }) {
  const [view, setView] = useState<ProjectView>("list");
  const [query, setQuery] = useState("");
  const searchId = useId();
  const childRows = Children.toArray(children);
  const visible = useMemo(() => {
    const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return projects.map((project) => {
      const text = [project.name, project.category, project.description, ...project.technologies].join(" ").toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [projects, query]);
  const matches = visible.filter(Boolean).length;

  return (
    <div className="project-explorer">
      <div className="project-explorer-toolbar">
        <div className="project-location"><span className="green" aria-hidden="true">⌑</span><span>~/projects</span><span className="project-result-count" role="status">{matches} / {projects.length}</span></div>
        <div className="project-view-controls" role="group" aria-label="Project view">
          {views.map((option) => <button type="button" key={option.id} aria-label={`${option.label} view`} aria-pressed={view === option.id} onClick={() => setView(option.id)}><svg width="15" height="15" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">{option.icon}</svg><span>{option.label}</span></button>)}
        </div>
        <label className="project-search" htmlFor={searchId}><svg aria-hidden="true" viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="8" cy="8" r="5" /><path d="m12 12 5 5" /></svg><span className="sr-only">Search projects</span><input id={searchId} type="search" placeholder="find a project or stack…" value={query} onChange={(event) => setQuery(event.target.value)} autoComplete="off" /></label>
      </div>

      <div className={`project-list project-mode-${view}`} hidden={view === "table"}>
        {projects.map((project, index) => <div className="project-row-wrapper" key={project.slug} hidden={!visible[index]}>{childRows[index]}</div>)}
      </div>

      <div className="project-table-scroll" hidden={view !== "table"} tabIndex={view === "table" ? 0 : -1} aria-label="Scrollable project table">
        <table className="project-table">
          <caption className="sr-only">Selected projects with their technical focus and technologies</caption>
          <thead><tr><th scope="col">#</th><th scope="col">project</th><th scope="col">focus</th><th scope="col">stack</th><th scope="col">source</th></tr></thead>
          <tbody>{projects.map((project, index) => <tr key={project.slug} hidden={!visible[index]}><td className="table-index">{String(index + 1).padStart(2, "0")}</td><th scope="row"><a href={project.repository} target="_blank" rel="noreferrer">{project.name}<span aria-hidden="true"> ↗</span></a></th><td className="table-category">{project.category.toLowerCase()}</td><td className="table-stack">{project.technologies.join(" / ")}</td><td><a href={project.repository} target="_blank" rel="noreferrer" aria-label={`${project.name} repository in table view`}>git ↗</a></td></tr>)}</tbody>
        </table>
      </div>
      {matches === 0 && <div className="project-no-results" role="status"><span className="amber">0 matches.</span> Even grep needs the right keywords.<button type="button" onClick={() => setQuery("")}>[ clear search ]</button></div>}
      <div className="project-explorer-footer"><span>{view === "table" ? "repository index" : view === "grid" ? "a closer look at the work" : "selected repositories"}</span><span>read the docs, inspect the details <span className="green" aria-hidden="true">↗</span></span></div>
    </div>
  );
}
