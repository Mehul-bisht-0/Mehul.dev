import ActivityMap from "@/components/ActivityMap";
import Terminal from "@/components/Terminal";
import { portfolio } from "@/config/portfolio";

export const dynamic = "force-dynamic";

function SectionHeading({ number, command, note }: { number: string; command: string; note: string }) {
  return <div className="section-heading"><div><span className="section-number">{number}</span><h2><span className="green" aria-hidden="true">$ </span>{command}</h2></div><span className="section-note">{note}</span></div>;
}

export default function Home() {
  const year = new Date().getUTCFullYear();
  return (
    <>
      <a href="#main" className="skip-link">Skip to portfolio</a>
      <header className="site-header">
        <div className="header-inner">
          <a href="#home" className="brand" aria-label="Mehul Bisht home"><span className="brand-mark" aria-hidden="true">›_</span><span>mehul<span className="muted">.dev</span></span></a>
          <nav aria-label="Main navigation"><a href="#activity">activity</a><a href="#projects">projects</a><a href="#experience">experience</a><a href="#about">about</a></nav>
          <span className="header-mode"><span aria-hidden="true">☾</span> night session</span>
        </div>
      </header>
      <main id="main" className="page-container">
        <section id="home" tabIndex={-1} className="intro-section" aria-labelledby="intro-title">
          <div className="intro-grid">
            <div className="intro-copy">
              <div className="eyebrow"><span className="green" aria-hidden="true">●</span> ~/portfolio <span className="eyebrow-comment">// a work in progress</span></div>
              <h1 id="intro-title">{portfolio.name}<span className="green name-period">.</span></h1>
              <p className="intro-headline">{portfolio.headline}</p>
              <p className="intro-description">{portfolio.intro}</p>
              <div className="intro-links"><a href="#projects">explore projects <span aria-hidden="true">↓</span></a><a href={portfolio.social[0].href} target="_blank" rel="noreferrer">github <span aria-hidden="true">↗</span></a></div>
            </div>
            <div className="night-scene" aria-hidden="true">
              <span className="star star-one">+</span><span className="star star-two">·</span><span className="star star-three">✦</span><span className="star star-four">.</span><span className="star star-five">+</span>
              <pre className="ascii-moon">{`       _..._\n     .::::. '.\n    :::::::.  :\n    :::::::   :\n    ':::::   .'\n      '::..-'`}</pre>
              <div className="night-caption">dark theme. clear intent.<br /><span>// less noise, more signal</span></div>
              <span className="scene-coordinate">[ 0x0B / 0x0F / 0x12 ]</span>
            </div>
          </div>
          <Terminal />
          <div className="intro-bottom"><span><span className="green">↳</span> scroll to inspect the source</span><span>human-readable · keyboard-friendly</span></div>
        </section>

        <section id="activity" tabIndex={-1} className="portfolio-section" aria-labelledby="activity-title">
          <div id="activity-title"><SectionHeading number="01" command="git log --activity" note="consistency, one square at a time" /></div>
          <ActivityMap currentYear={year} />
        </section>

        <section id="projects" tabIndex={-1} className="portfolio-section" aria-labelledby="projects-title">
          <div id="projects-title"><SectionHeading number="02" command="ls projects/" note="5 selected repositories" /></div>
          <p className="section-intro">Things I built to turn a question into something that runs.</p>
          <div className="project-list">
            {portfolio.projects.map((project, index) => (
              <article className="project-row" key={project.slug}>
                <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
                <div className="project-content">
                  <span className="project-category">{project.category}</span>
                  <h3><a href={project.repository} target="_blank" rel="noreferrer">{project.name} <span className="project-arrow" aria-hidden="true">↗</span></a></h3>
                  <p>{project.description}</p>
                  <div className="project-technologies" aria-label="Technologies">{project.technologies.map((technology) => <span key={technology}>{technology}</span>)}</div>
                  <details className="project-details"><summary>inspect details <span aria-hidden="true">+</span></summary><ul>{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul><a className="detail-source" href={`${project.repository}#readme`} target="_blank" rel="noreferrer">read the source documentation ↗</a></details>
                </div>
                <a className="repo-link" href={project.repository} target="_blank" rel="noreferrer" aria-label={`${project.name} repository`}>[ source ↗ ]</a>
              </article>
            ))}
          </div>
          <a className="all-repos-link" href={`https://github.com/${portfolio.github}?tab=repositories`} target="_blank" rel="noreferrer"><span className="green">$</span> open github/repositories <span aria-hidden="true">↗</span></a>
        </section>

        <section id="experience" tabIndex={-1} className="portfolio-section" aria-labelledby="experience-title">
          <div id="experience-title"><SectionHeading number="03" command="cat experience.log" note="the work behind the commits" /></div>
          {portfolio.experience.draft ? <div className="draft-experience"><span className="log-marker" aria-hidden="true">└─</span><div><span className="draft-label">EDITABLE DRAFT</span><h3>{portfolio.experience.title}</h3><p>{portfolio.experience.description}</p><code>// TODO: roles · organizations · dates · impact</code></div></div> : <div className="experience-log">{portfolio.experience.entries.map((entry) => <article key={`${entry.role}-${entry.organization}`}><span className="experience-date">{entry.dates}</span><h3>{entry.role}</h3><p className="green">{entry.organization}</p><p>{entry.description}</p></article>)}</div>}
        </section>

        <section id="about" tabIndex={-1} className="portfolio-section about-section" aria-labelledby="about-title">
          <div id="about-title"><SectionHeading number="04" command="cat about.txt" note="beyond the stack trace" /></div>
          <div className="about-grid"><div><span className="draft-label">{portfolio.about.draft ? "EDITABLE DRAFT" : "PERSONAL README"}</span><h3>{portfolio.about.title}</h3>{portfolio.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><div className="about-comment"><span aria-hidden="true">/*</span><p>{portfolio.about.comment.map((line, index) => <span key={line}>{line}{index < portfolio.about.comment.length - 1 && <br />}</span>)}</p><span aria-hidden="true">*/</span></div></div>
        </section>
      </main>
      <footer className="site-footer"><div className="footer-inner"><div><span className="green">{portfolio.handle}@portfolio</span><span className="muted">:~$ </span><span className="footer-message">exit 0</span></div><div className="footer-social">{portfolio.social.map((link) => <a href={link.href} key={link.label} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</div><a href="#home" className="back-to-top">back to top ↑</a></div><p>© {year} {portfolio.name} <span aria-hidden="true">·</span> built with intent, served after dark.</p></footer>
    </>
  );
}
