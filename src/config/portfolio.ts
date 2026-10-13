export interface Project {
  name: string;
  slug: string;
  category: string;
  description: string;
  technologies: string[];
  details: string[];
  repository: string;
}

export const portfolio = {
  name: "Mehul Bisht",
  handle: "mehul",
  headline: "Student / developer / work in progress.",
  intro: "Building systems. Breaking assumptions. Occasionally fixing both.",
  github: "Mehul-bisht-0",
  leetcode: "Mehul_Bisht",
  firstActivityYear: 2024,
  experience: {
    draft: true,
    title: "Experience log awaiting entries",
    description: "Add roles, organizations, dates, and the work that mattered. This draft is intentionally waiting for the real details.",
    entries: [] as { role: string; organization: string; dates: string; description: string }[],
  },
  about: {
    draft: true,
    title: "The human behind the keyboard.",
    paragraphs: [
      "Personal README pending. Add a little about what you enjoy building, what keeps you curious, and what happens when the laptop closes.",
      "TODO: replace this draft with actual human lore. No imaginary hobbies were harmed in the making of this portfolio.",
    ],
    comment: ["Still learning.", "Still building.", "Still checking", "the error logs."],
  },
  social: [
    { label: "GitHub", href: "https://github.com/Mehul-bisht-0" },
    { label: "LeetCode", href: "https://leetcode.com/u/Mehul_Bisht/" },
  ],
  projects: [
    {
      name: "ACO-ITS v2",
      slug: "aco-its",
      category: "OPTIMIZATION / SIMULATION",
      description: "Live traffic routing with ant colony optimization. Python talks to SUMO, finds legal routes, and applies qualifying changes through TraCI.",
      technologies: ["Python", "SUMO", "TraCI", "ACO"],
      details: ["A live controller validates and applies route recommendations as the simulation runs.", "Includes historical replay, a driver dashboard, advisory PSO, and offline benchmarks.", "Optional simulated V2X models message delay, loss, and expiry; this is a simulated system."],
      repository: "https://github.com/Mehul-bisht-0/ACO-ITS-v2",
    },
    {
      name: "Driftbench",
      slug: "driftbench",
      category: "AI / DEVELOPER TOOLS",
      description: "Regression and flakiness testing for LLM agents. Replay tasks, check behavior, and compare prompt variants with statistics.",
      technologies: ["Python", "SQLite", "JSONL"],
      details: ["Deterministic plans run against a mock world of files, tickets, orders, and HTTP endpoints.", "Behavior assertions and statistical comparisons surface regressions between prompt variants.", "CLI tools support suite runs, trajectory inspection, comparison, and flakiness analysis."],
      repository: "https://github.com/Mehul-bisht-0/Driftbench--AI-regression-testing-harness",
    },
    {
      name: "FilingLens",
      slug: "filinglens",
      category: "AI / RETRIEVAL",
      description: "A retrieval system for SEC financial filings, combining agent workflows with numeric verification against structured financial data.",
      technologies: ["FastAPI", "LangGraph", "Qdrant", "PostgreSQL"],
      details: ["Ingests SEC EDGAR filings and structured XBRL company facts.", "Routes retrieval and analysis through a LangGraph workflow, with numeric verification statuses.", "Includes RAGAS evaluation and Langfuse tracing. Page-image embeddings are documented as a placeholder."],
      repository: "https://github.com/Mehul-bisht-0/FilingLens",
    },
    {
      name: "Dead-letter Recovery Job Queue",
      slug: "reliable-queue",
      category: "BACKEND / DISTRIBUTED SYSTEMS",
      description: "A reliable job queue with atomic claims, durable job state, retries, and a path back from the dead-letter queue. Failed jobs deserve a second chance.",
      technologies: ["TypeScript", "Fastify", "Redis", "PostgreSQL"],
      details: ["Redis Lua claims jobs atomically; PostgreSQL stores durable state, audit data, and dead-letter records.", "Supports enqueue deduplication, exponential backoff with jitter, and API/dashboard replay.", "Worker heartbeats and a reaper leadership lock help recover stale in-flight jobs."],
      repository: "https://github.com/Mehul-bisht-0/Dead-letter-recovery-Job-queue",
    },
    {
      name: "Video-to-ASCII",
      slug: "video-to-ascii",
      category: "TERMINAL / EXPERIMENTS",
      description: "Convert video into colored ASCII frames and play them in a terminal. Pixels are nice. Characters have character.",
      technologies: ["Python", "ANSI 24-bit", "CLI"],
      details: ["Renders video using ANSI 24-bit foreground colors in compatible terminals.", "Adjustable width and character aspect ratio, with ANSI frame export.", "Can export the first frame as plain ASCII; narrower output can improve playback speed."],
      repository: "https://github.com/Mehul-bisht-0/Video-to-ASCII",
    },
  ] satisfies Project[],
};
