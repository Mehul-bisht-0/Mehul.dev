export interface ExperienceEntry {
  role: string;
  organization: string;
  dates: string;
  engagement: string;
  location?: string;
  description?: string;
  highlights?: string[];
  technologies?: string[];
}

export interface Project {
  name: string;
  slug: string;
  category: string;
  description: string;
  technologies: string[];
  details: string[];
  repository: string;
  story: {
    purpose: string;
    example: { input: string; output: string };
    flow: { label: string; detail: string }[];
    decisions: { title: string; description: string }[];
    limitations: string[];
    footnote: string;
  };
}

export const portfolio = {
  name: "Mehul Bisht",
  handle: "mehul",
  headline: "Student / developer / work in progress.",
  intro: "Building systems. Breaking assumptions. Occasionally fixing both.",
  github: "Mehul-bisht-0",
  leetcode: "Mehul_Bisht",
  linkedin: "https://www.linkedin.com/in/mehul-bisht-132617287/",
  firstActivityYear: 2024,
  experience: {
    draft: false,
    title: "Experience log",
    description: "Roles, projects, and the occasional elixir-budget incident.",
    entries: [
      {
        role: "Independent Third Party Strategic Planner",
        organization: "Clash Royale",
        dates: "Jan 2025 – Present",
        engagement: "Self-employed · Gaming",
        location: "Remote",
        description: "Clash Royale player, Mega Knight spammer, and independent strategist. Working within a strict 10-elixir budget.",
        highlights: [
          "Analyze opponent card cycles, elixir usage, and defensive weaknesses.",
          "Specialize in Mega Knight deployment, bridge spam, and questionable risk management.",
          "Convert failed defenses into completely unnecessary counter-pushes. HE HE HE HAW.",
        ],
      },
      {
        role: "Intern",
        organization: "Phemesoft",
        dates: "Jun 2026 – Aug 2026",
        engagement: "Internship",
        location: "Dehradun, Uttarakhand, India · Remote",
        description: "Built an LSTM-based traffic forecasting system for urban intersections using time-series and spatial features.",
        highlights: [
          "Compared baseline and spatially augmented LSTM models: MAE 56.3 → 52.5, RMSE 71.5 → 67.2, and R² 0.950 → 0.956.",
          "Developed a flow → speed → emissions pipeline to estimate CO, HC, and NOx impact from predicted traffic.",
          "Created forecast trends, congestion and emissions heatmaps, model comparison charts, and an interactive dashboard for rain, incidents, temperature, and forecast-horizon scenarios.",
        ],
        technologies: ["Python", "NumPy", "Pandas", "Matplotlib", "LSTM", "JavaScript"],
      },
      {
        role: "Machine Learning Intern",
        organization: "Pinnacle Labs",
        dates: "Mar 2026 – Apr 2026",
        engagement: "Internship",
        location: "Dehradun, Uttarakhand, India · Remote",
        description: "Designed and developed a full-stack AI-powered resume parser with a Flask backend.",
        highlights: [
          "Processed multiple PDF and DOCX resumes using NLP and regex to extract structured candidate information.",
          "Added keyword-based candidate ranking, duplicate detection, and server-side sessions for bulk resume data.",
          "Implemented in-memory exports to Excel, CSV, and JSON.",
        ],
        technologies: ["Python", "Flask", "NLP", "Regex"],
      },
      {
        role: "Scientific Researcher",
        organization: "UNIVERSIA",
        dates: "Feb 2025 – Nov 2025",
        engagement: "Internship",
        location: "Dehradun, Uttarakhand, India · On-site",
        description: "Researcher and on-site astronomer.",
      },
      {
        role: "Associate",
        organization: "Salaam Baalak Trust Delhi",
        dates: "Jun 2024 – Jul 2024",
        engagement: "Internship",
        location: "Delhi, India · On-site",
      },
      {
        role: "Investment Banking Fellow",
        organization: "Marquee Fellowship Program",
        dates: "Feb 2024 – Jul 2024",
        engagement: "Internship",
      },
    ] as ExperienceEntry[],
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
    { label: "LinkedIn", href: "https://www.linkedin.com/in/mehul-bisht-132617287/" },
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
      story: {
        purpose: "A route can look good on a static map and still get stuck in traffic. This project connects an ant colony optimization algorithm to a running traffic simulation, so route choices can respond to what is happening on the roads.",
        example: {
          input: "A vehicle is travelling through a congested simulated road network.",
          output: "The controller searches for a legal alternative, checks whether it qualifies, and applies it to that vehicle. The dashboard shows its actual remaining route.",
        },
        flow: [
          { label: "Observe", detail: "SUMO advances the simulation; TraCI exposes live traffic to Python." },
          { label: "Search", detail: "ACO searches the legal road graph using current routing costs." },
          { label: "Validate", detail: "The controller checks route connectivity and eligibility before applying a change." },
          { label: "Measure", detail: "Trip output, routing decisions, and simulation metrics are saved per run." },
        ],
        decisions: [
          { title: "A live feedback loop", description: "Live routing reads the running simulator. Historical CSV replay is a separate mode, so a recorded trajectory cannot silently stand in for current traffic." },
          { title: "One controller, two views", description: "The driver cockpit and original dashboard share the same server and simulation. Routing requests are queued so the controller retains ownership of TraCI." },
          { title: "Baseline before bragging", description: "Compare mode runs the original routes and ACO sequentially. Measured trip times and completion counts make the results inspectable without assuming that optimization always wins." },
        ],
        limitations: [
          "The optional V2X broker simulates message delay, loss, and expiry. It is an application-level model, not a radio implementation or a physical vehicle interface.",
          "A capped run can leave trips unfinished. Compare completion counts before interpreting travel-time averages; predicted routing cost is different from measured trip duration.",
        ],
        footnote: "Inspired by ants. Still required to obey the road graph.",
      },
    },
    {
      name: "Driftbench",
      slug: "driftbench",
      category: "AI / DEVELOPER TOOLS",
      description: "Regression and flakiness testing for LLM agents. Replay tasks, check behavior, and compare prompt variants with statistics.",
      technologies: ["Python", "SQLite", "JSONL"],
      details: ["Deterministic plans run against a mock world of files, tickets, orders, and HTTP endpoints.", "Behavior assertions and statistical comparisons surface regressions between prompt variants.", "CLI tools support suite runs, trajectory inspection, comparison, and flakiness analysis."],
      repository: "https://github.com/Mehul-bisht-0/Driftbench--AI-regression-testing-harness",
      story: {
        purpose: "Changing an agent's prompt can change its behavior in ways that are easy to miss in a chat demo. Driftbench turns those behaviors into repeatable tasks, records what happened, and compares runs for regressions and flakiness.",
        example: {
          input: "A baseline prompt asks for confirmation before a destructive action. A candidate prompt changes that instruction.",
          output: "Both variants run against the same task suite. Assertions check the actions taken, and a comparison report identifies behavior changes with statistical context.",
        },
        flow: [
          { label: "Configure", detail: "Choose a prompt variant, agent adapter, seed, and replicate count." },
          { label: "Replay", detail: "Run tasks in a mock world of files, tickets, orders, and HTTP endpoints." },
          { label: "Assert", detail: "Check tool use and policy behavior against task-specific assertions." },
          { label: "Compare", detail: "Inspect trajectories, regression comparisons, and flakiness reports." },
        ],
        decisions: [
          { title: "Deterministic by default", description: "The scripted agent extracts policy flags and replays plans. A fixed seed makes a failure easier to reproduce; optional jitter exercises flakiness detection." },
          { title: "Keep the evidence", description: "JSONL stores run trajectories, while SQLite provides a rebuildable index. Individual task outcomes can be inspected instead of relying on an aggregate score." },
          { title: "Compare with uncertainty", description: "The comparison pipeline uses Wilson intervals, Fisher's exact test, and a multiple-comparison correction. Compatibility checks help catch mismatched runs." },
        ],
        limitations: [
          "The default scripted adapter tests the harness and modeled policies. Passing those tasks alone does not establish how a real language model behaves in the wild.",
          "A real-model adapter is documented, but its runs require API access. Results remain specific to the tasks, model, settings, and number of replicates used.",
        ],
        footnote: "The prompt changed one line. The test suite would like a word.",
      },
    },
    {
      name: "FilingLens",
      slug: "filinglens",
      category: "AI / RETRIEVAL",
      description: "A retrieval system for SEC financial filings, combining agent workflows with numeric verification against structured financial data.",
      technologies: ["FastAPI", "LangGraph", "Qdrant", "PostgreSQL"],
      details: ["Ingests SEC EDGAR filings and structured XBRL company facts.", "Routes retrieval and analysis through a LangGraph workflow, with numeric verification statuses.", "Includes RAGAS evaluation and Langfuse tracing. Page-image embeddings are documented as a placeholder."],
      repository: "https://github.com/Mehul-bisht-0/FilingLens",
      story: {
        purpose: "Financial filings mix long narrative sections with precise numbers. FilingLens brings retrieval and agent workflows together so a question can be answered with relevant filing evidence and numeric claims can be checked against structured company facts.",
        example: {
          input: "Ask a question about a company's financial results across its SEC filings.",
          output: "The workflow retrieves evidence, builds an answer, and labels numeric verification as verified, partially verified, unverified, or contradicted.",
        },
        flow: [
          { label: "Ingest", detail: "Fetch 10-K and 10-Q filings plus structured XBRL company facts from SEC EDGAR." },
          { label: "Retrieve", detail: "Use embeddings, hybrid retrieval, and reranking to gather relevant evidence." },
          { label: "Reason", detail: "LangGraph routes work through retrieval, analysis, forecasting, and synthesis nodes." },
          { label: "Verify", detail: "Cross-check numeric claims against structured facts and attach a verification status." },
        ],
        decisions: [
          { title: "Two kinds of storage", description: "PostgreSQL stores filing metadata and structured data; Qdrant stores vectors. FastAPI serves the workflow to a React interface." },
          { title: "Separate workflow responsibilities", description: "Router, retrieval, analyst, forecaster, critic, and synthesizer nodes make the answer pipeline easier to inspect than a single opaque prompt." },
          { title: "Evaluate and trace", description: "The repository includes a golden query dataset and RAGAS evaluation. Langfuse tracing records per-node latency, token use, and request IDs." },
        ],
        limitations: [
          "Page-image embeddings are documented as a placeholder for ColQwen2. The multimodal direction should not be read as a completed image-retrieval implementation.",
          "Verification can remain partial or unverified. Those statuses are part of the answer and should remain visible when evaluating a numeric claim.",
        ],
        footnote: "A confident paragraph still has to show its numbers.",
      },
    },
    {
      name: "Dead-letter Recovery Job Queue",
      slug: "reliable-queue",
      category: "BACKEND / DISTRIBUTED SYSTEMS",
      description: "A distributed job queue with durable PostgreSQL state, Redis scheduling hints, renewable worker leases, retries, and dead-letter replay. Failed jobs deserve a second chance.",
      technologies: ["TypeScript", "Fastify", "Redis", "PostgreSQL"],
      details: ["PostgreSQL owns jobs, attempts, leases, audit history, and a dispatch outbox; Redis stores rebuildable scheduling hints.", "Supports queue-scoped enqueue deduplication, backoff with jitter, authenticated API/dashboard replay, and cooperative cancellation.", "Renewable, fenced leases and reconciliation recover stale work. Delivery is at least once; handlers must deduplicate external effects."],
      repository: "https://github.com/Mehul-bisht-0/Dead-letter-recovery-Job-queue",
      story: {
        purpose: "Background work has to survive more than the happy path. This queue accepts jobs durably, schedules them for workers, recovers expired work, and gives exhausted jobs an explicit path through dead-letter inspection and replay.",
        example: {
          input: "A producer enqueues a job, but the worker crashes before recording completion.",
          output: "Its lease expires and the job can be retried or dead-lettered. An administrator can inspect and replay a dead letter while the previous attempts remain in history.",
        },
        flow: [
          { label: "Accept", detail: "The authenticated API commits a job, audit event, and outbox record in PostgreSQL." },
          { label: "Dispatch", detail: "A dispatcher publishes scheduling hints to Redis; reconciliation can rebuild missing hints." },
          { label: "Execute", detail: "Workers claim through PostgreSQL and run handlers under renewable, fenced leases." },
          { label: "Recover", detail: "Retry policy, expired-lease recovery, and dead-letter replay move failed work forward." },
        ],
        decisions: [
          { title: "Durability has one owner", description: "PostgreSQL owns lifecycle state. An accepted job remains durable when Redis is unavailable; Redis accelerates scheduling and can be rebuilt from database state." },
          { title: "Ownership expires safely", description: "Every execution has a lease token. Renewal, completion, and failure require the current unexpired token, preventing a stale worker from mutating reclaimed work." },
          { title: "Recovery is an operation", description: "The API and dashboard share application rules. Queue-scoped producer keys, administrator access, audit history, and diagnostics make replay and investigation explicit." },
        ],
        limitations: [
          "Execution is at least once. A successful external action followed by a failed acknowledgement can run again, so handlers must deduplicate downstream effects.",
          "Strict priority can starve lower-priority jobs under sustained traffic. Handlers must also honor cooperative cancellation to stop promptly when a lease is lost.",
        ],
        footnote: "Dead letters get a recovery plan. Errors get an audit trail.",
      },
    },
    {
      name: "InternFly",
      slug: "internfly",
      category: "AGENT SIMULATION / CONNECTOMICS",
      description: "A fruit-fly agent living the internship grind in a 3D room: DSA, fictional job drafts, coffee, sleep, repeat. Optional Male CNS v1.0 connectivity influences its high-level choices.",
      technologies: ["Python", "FastAPI", "React", "TypeScript", "Three.js", "SQLite"],
      details: ["A durable state machine coordinates bounded tasks, energy, recovery, memory, and five simulated hours of sleep.", "A live React/Three.js dashboard shows the fly's room and a neural observatory through WebSocket state updates.", "An optional selected Male CNS v1.0 subgraph feeds an engineered controller. The default uses an offline development fixture and fictional job listings."],
      repository: "https://github.com/Mehul-bisht-0/MaleCNSv1.0-InternFly",
      story: {
        purpose: "InternFly turns the software-internship grind into an observable agent simulation. A tiny fruit fly moves between DSA practice, fictional job searches, application drafts, coffee, and sleep in an interactive 3D room. Behind the workplace comedy is a durable task loop, memory consolidation, and an optional connectome-inspired controller.",
        example: {
          input: "Start an offline session and watch the fly begin another day of trying to become a software engineer.",
          output: "It practices Python problems, evaluates fictional internships, prepares drafts, drinks fictional coffee, and sleeps for five simulated hours. The dashboard exposes its state, controller activity, and next steps.",
        },
        flow: [
          { label: "Observe", detail: "Encode the current environment, task outcomes, energy, and memory into controller inputs." },
          { label: "Choose", detail: "A sparse recurrent controller suggests action preferences; deterministic policy gates enforce budgets and deadlines." },
          { label: "Act", detail: "Specialists handle DSA, fictional jobs, reflection, coffee, and sleep. Docker provides a separate restricted code runner." },
          { label: "Remember", detail: "Persist state and events in SQLite, then replay and consolidate memories during simulated sleep." },
        ],
        decisions: [
          { title: "Connectivity with provenance", description: "The optional importer selects a versioned Male CNS v1.0 subgraph and records neuron identities, connection weights, selection parameters, attribution, and a content hash. Engineered dynamics turn that structure into action preferences." },
          { title: "A room you can inspect", description: "React, TypeScript, and Three.js render the room and neural observatory. WebSockets stream live state from FastAPI, so the visual story follows the running agent." },
          { title: "A loop that survives restarts", description: "SQLite stores durable events and state. Bounded tasks, attempt limits, pause and emergency-stop controls, and sleep transitions keep the simulation manageable over long sessions." },
        ],
        limitations: [
          "The default runs with a synthetic development fixture. Real Male CNS v1.0 connectivity requires importing a selected subgraph; this does not simulate the entire connectome.",
          "Controller dynamics and the expanded neural visualization are engineered layers, not recorded biological firing. Ordinary software handles language and code behavior; the connectome influences high-level choices.",
          "Jobs, emotions, stress, and caffeine effects are fictional. Offline mode creates local drafts and submits no external job applications.",
        ],
        footnote: "Six legs. Zero years of experience. One very persistent applicant.",
      },
    },
  ] satisfies Project[],
};
