import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { portfolio } from "@/config/portfolio";

type Props = { params: Promise<{ slug: string }> };

function findProject(slug: string) {
  const project = portfolio.projects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  return project;
}

export function generateStaticParams() {
  return portfolio.projects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = findProject((await params).slug);
  return { title: `${project.name} | ${portfolio.name}`, description: project.description };
}

export default async function ProjectPage({ params }: Props) {
  const project = findProject((await params).slug);
  const index = portfolio.projects.findIndex((entry) => entry.slug === project.slug);
  const next = portfolio.projects[(index + 1) % portfolio.projects.length];
  const { story } = project;

  return (
    <>
      <a className="skip-link" href="#project-main">Skip to project</a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" href="/" aria-label={`${portfolio.name} home`}><span className="brand-mark" aria-hidden="true">›_</span><span>{portfolio.handle}<span className="muted">.dev</span></span></Link>
          <nav aria-label="Main navigation"><Link href="/#activity">activity</Link><Link href="/#projects">projects</Link><Link href="/#experience">experience</Link><Link href="/#about">about</Link></nav>
          <span className="header-mode"><span aria-hidden="true">☾</span> project notes</span>
        </div>
      </header>

      <div className="project-reader">
        <aside className="project-directory">
          <Link className="directory-back" href="/#projects"><span aria-hidden="true">←</span> cd ~/portfolio</Link>
          <nav aria-label="Project directory">
            <p className="directory-label">projects/</p>
            {portfolio.projects.map((entry, entryIndex) => <Link href={`/projects/${entry.slug}`} key={entry.slug} aria-current={entry.slug === project.slug ? "page" : undefined}><span className="directory-number" aria-hidden="true">{String(entryIndex + 1).padStart(2, "0")}</span><span>{entry.name}</span><span className="directory-cursor" aria-hidden="true">{entry.slug === project.slug ? "_" : ""}</span></Link>)}
          </nav>
          <p className="directory-note">// notes from the build<br />// written for humans</p>
        </aside>

        <main id="project-main" tabIndex={-1} className="project-document">
          <div className="document-path"><Link href="/#projects">~/projects</Link><span aria-hidden="true">/</span><span>{project.slug}</span><span className="document-file">README.md</span></div>
          <header className="project-document-header">
            <p className="project-category">{project.category}</p>
            <h1>{project.name}<span className="green">_</span></h1>
            <p className="project-document-summary">{project.description}</p>
            <div className="project-document-meta"><div className="project-technologies" aria-label="Technologies">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div><a href={project.repository} target="_blank" rel="noreferrer">[ source code ↗ ]</a></div>
          </header>

          <nav className="document-outline" aria-label="On this page"><a href="#overview">01 overview</a><a href="#system-flow">02 system flow</a><a href="#engineering-notes">03 engineering notes</a><a href="#boundaries">04 boundaries</a></nav>

          <section id="overview" className="document-section" aria-labelledby="overview-title">
            <div className="document-section-heading"><span aria-hidden="true">01</span><h2 id="overview-title">What does it do?</h2></div>
            <p>{story.purpose}</p>
            <dl className="project-example"><div><dt><span aria-hidden="true">›</span> the input</dt><dd>{story.example.input}</dd></div><div><dt><span aria-hidden="true">↳</span> the result</dt><dd>{story.example.output}</dd></div></dl>
          </section>

          <section id="system-flow" className="document-section" aria-labelledby="flow-title">
            <div className="document-section-heading"><span aria-hidden="true">02</span><h2 id="flow-title">Follow the signal</h2></div>
            <p className="document-comment">// from input to something useful</p>
            <ol className="project-flow">{story.flow.map((step, stepIndex) => <li key={step.label}><span className="flow-number" aria-hidden="true">{String(stepIndex + 1).padStart(2, "0")}</span><h3>{step.label}</h3><p>{step.detail}</p></li>)}</ol>
          </section>

          <section id="engineering-notes" className="document-section" aria-labelledby="notes-title">
            <div className="document-section-heading"><span aria-hidden="true">03</span><h2 id="notes-title">Under the hood</h2></div>
            <dl className="engineering-notes">{story.decisions.map((decision) => <div key={decision.title}><dt>{decision.title}</dt><dd>{decision.description}</dd></div>)}</dl>
          </section>

          <section id="boundaries" className="document-section" aria-labelledby="boundaries-title">
            <div className="document-section-heading"><span aria-hidden="true">04</span><h2 id="boundaries-title">Boundaries & tradeoffs</h2></div>
            <ul className="project-boundaries">{story.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
          </section>

          <footer className="project-document-footer"><p><span className="green">//</span> {story.footnote}</p><a href={`${project.repository}#readme`} target="_blank" rel="noreferrer">Based on the repository documentation ↗</a></footer>
          <nav className="project-pagination" aria-label="Continue exploring"><Link href="/#projects"><span className="muted">cd ../</span><span>all projects <span aria-hidden="true">←</span></span></Link><Link href={`/projects/${next.slug}`}><span className="muted">next file →</span><span>{next.name} <span className="green" aria-hidden="true">→</span></span></Link></nav>
          <div className="project-reader-signoff"><span>{portfolio.handle}@portfolio<span className="muted">:~/projects$</span></span><span>readme complete <span className="green">[OK]</span></span></div>
        </main>
      </div>
    </>
  );
}
