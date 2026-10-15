import Link from "next/link";

export default function ProjectNotFound() {
  return <main className="project-missing"><span className="document-comment">$ cat projects/unknown/README.md</span><h1>File not found<span className="green">_</span></h1><p>That project is not in this directory. The other files are still here.</p><Link href="/#projects">← back to projects</Link></main>;
}
