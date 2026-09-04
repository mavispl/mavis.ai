/**
 * The agenda, as data.
 *
 * This is the single authoritative transcription of the course outline. Stage 2
 * (curriculum-mapper) derives every lesson id, permalink, prerequisite edge and
 * audit target from it, so the outline is changed here and nowhere else.
 *
 * `volatility` is set per module and overridden per bullet where a bullet is
 * markedly more or less perishable than its module. It drives two things: whether
 * the schema demands sources, and how often the fact audit requeues the page.
 */

export type Volatility = 'low' | 'medium' | 'high';
export type Persona = 'junior' | 'mid' | 'senior' | 'lead' | 'cto';

export interface BulletSpec {
  /** The agenda's own bullet label, e.g. "Mechanics". */
  label: string;
  /** The lesson title as it will read on the page. */
  title: string;
  /** The agenda's sub-topics for this bullet — the lesson must cover all of them. */
  covers: string[];
  volatility?: Volatility;
  personas?: Persona[];
  estMinutes?: number;
  /** Position in the curated crash-course path, if promoted. */
  crashCourse?: number;
}

export interface ModuleSpec {
  module: number;
  title: string;
  volatility: Volatility;
  bullets: BulletSpec[];
}

export interface WeekSpec {
  week: number;
  title: string;
  goal: string;
  modules: ModuleSpec[];
}

const ALL: Persona[] = ['junior', 'mid', 'senior', 'lead', 'cto'];
const BUILDERS: Persona[] = ['junior', 'mid', 'senior'];
const SENIOR_UP: Persona[] = ['mid', 'senior', 'lead', 'cto'];
const LEADERSHIP: Persona[] = ['senior', 'lead', 'cto'];

export const AGENDA: WeekSpec[] = [
  {
    week: 1,
    title: 'Core',
    goal: 'Understand generative AI deeply enough to reason beyond current tools.',
    modules: [
      {
        module: 1,
        title: 'Mechanics Behind Generative AI',
        volatility: 'medium',
        bullets: [
          { label: 'Introduction', title: 'What generative AI actually is, and what a harness adds',
            covers: ['generative AI', 'harnesses', 'configuration', 'agentic tooling', 'custom tools'],
            volatility: 'medium', personas: ALL, estMinutes: 12, crashCourse: 1 },
          { label: 'Mechanics', title: 'Tokens, prediction, and attention: what happens to your prompt',
            covers: ['instructions', 'completion', 'tokenization', 'prediction', 'attention', 'instruction following'],
            volatility: 'low', personas: ALL, estMinutes: 16, crashCourse: 2 },
          { label: 'Limitations', title: 'Confabulation, cutoffs, and the edges of the context window',
            covers: ['illusions', 'confabulation', 'base knowledge', 'knowledge cutoff', 'context windows', 'output limits'],
            volatility: 'medium', personas: ALL, estMinutes: 14, crashCourse: 3 },
          { label: 'Providers', title: 'Choosing and mixing models without guessing',
            covers: ['models', 'capabilities', 'features', 'settings', 'pricing', 'specialization', 'model mixing'],
            volatility: 'high', personas: SENIOR_UP, estMinutes: 13 },
          { label: 'Interactions', title: 'Text, structured output, and function calling',
            covers: ['text generation', 'structured outputs', 'function calling', 'native tools', 'external tools'],
            volatility: 'medium', personas: ALL, estMinutes: 15, crashCourse: 5 },
          { label: 'Steering', title: 'Steering a model: generalization, association, and latent space',
            covers: ['generalization', 'associations', 'self-querying', 'latent space', 'J-space', 'reasoning'],
            volatility: 'low', personas: SENIOR_UP, estMinutes: 15 },
        ],
      },
      {
        module: 2,
        title: 'Steering Models Through Context',
        volatility: 'high',
        bullets: [
          { label: 'Settings', title: 'Profiles, projects, and permissions: the configuration surface',
            covers: ['profiles', 'projects', 'agents', 'permissions', 'history', 'connectors'],
            volatility: 'high', personas: ALL, estMinutes: 12 },
          { label: 'Context', title: 'Context is the whole interface',
            covers: ['sessions', 'threads', 'metadata', 'environment', 'tools', 'skills', 'modes', 'compression'],
            volatility: 'medium', personas: ALL, estMinutes: 16, crashCourse: 4 },
          { label: 'Processing', title: 'What the model can take in: text, threads, attachments, multimodality',
            covers: ['text', 'threads', 'context', 'multimodality', 'attachments', 'real-time interactions'],
            volatility: 'high', personas: ALL, estMinutes: 12 },
          { label: 'Skills', title: 'Skills: packaged instructions the model loads on demand',
            covers: ['structure', 'selection', 'scope', 'graphs', 'scripts', 'dynamic resources', 'generation'],
            volatility: 'high', personas: BUILDERS, estMinutes: 15 },
          { label: 'Tools', title: 'Tool design: schemas, results, and recovery',
            covers: ['discovery', 'schemas', 'results', 'hints', 'recovery', 'code mode', 'Bash'],
            volatility: 'high', personas: BUILDERS, estMinutes: 16, crashCourse: 6 },
          { label: 'Subagents', title: 'Subagents: bounded context, handoffs, and what they cost',
            covers: ['mechanics', 'settings', 'state', 'handoffs', 'shared context'],
            volatility: 'high', personas: SENIOR_UP, estMinutes: 14, crashCourse: 7 },
        ],
      },
      {
        module: 3,
        title: 'Building Knowledge Systems',
        volatility: 'medium',
        bullets: [
          { label: 'Files', title: 'Files as the interface: Markdown, artifacts, executables, logs',
            covers: ['Markdown', 'HTML', 'artifacts', 'executables', 'logs'],
            volatility: 'medium', personas: ALL, estMinutes: 12, crashCourse: 8 },
          { label: 'Style Guide', title: 'Writing for models: structure, essence, and levels of depth',
            covers: ['dynamic structures', 'extracting the essence', 'levels of depth', 'diff strategies'],
            volatility: 'low', personas: ALL, estMinutes: 13 },
          { label: 'Specifications', title: 'Specifications that stay true: synchronization, maps, and history',
            covers: ['structures', 'automatic synchronization', 'global specifications', 'maps', 'exploration', 'history'],
            volatility: 'low', personas: SENIOR_UP, estMinutes: 15 },
          { label: 'Tasks', title: 'Task shape: scope, requirements, progress, and completion',
            covers: ['source', 'scope', 'requirements', 'progress tracking', 'stage splitting', 'completion indicators'],
            volatility: 'low', personas: ALL, estMinutes: 13 },
          { label: 'Library', title: 'A personal and shared library of reusable resources',
            covers: ['personal resources', 'shared resources', 'internal configurations', 'custom generators'],
            volatility: 'medium', personas: SENIOR_UP, estMinutes: 11 },
          { label: 'Research', title: 'Autonomous research and context providers',
            covers: ['discovery', 'autonomous research', 'context providers'],
            volatility: 'high', personas: SENIOR_UP, estMinutes: 12 },
        ],
      },
      {
        module: 4,
        title: 'Working with AI Harnesses',
        volatility: 'high',
        bullets: [
          { label: 'Harnesses', title: 'What a harness is, and what every harness shares',
            covers: ['overview', 'common features', 'personalization', 'harness-agnostic workflows'],
            volatility: 'high', personas: ALL, estMinutes: 14, crashCourse: 9 },
          { label: 'Interfaces', title: 'Desktop, CLI, and programmatic: picking the right surface',
            covers: ['desktop', 'CLI', 'chat features', 'programmatic calls', 'custom scripts'],
            volatility: 'high', personas: ALL, estMinutes: 12 },
          { label: 'Settings', title: 'Routing, connectors, extensions, and worktrees',
            covers: ['providers', 'model routing', 'connectors', 'extensions', 'repositories', 'worktrees'],
            volatility: 'high', personas: BUILDERS, estMinutes: 13 },
          { label: 'Workflows', title: 'The working loop: load context, iterate, verify',
            covers: ['context loading', 'iteration', 'automatic feedback', 'verification', 'multi-threaded work'],
            volatility: 'medium', personas: ALL, estMinutes: 16, crashCourse: 10 },
          { label: 'Teamwork', title: 'Reviews that hold: enriched diffs and multi-agent review',
            covers: ['issue management', 'enriched reviews', 'layered diffs', 'multi-agent review'],
            volatility: 'medium', personas: LEADERSHIP, estMinutes: 14 },
          { label: 'Product', title: 'Dashboards, issue enrichment, and automated resolution',
            covers: ['dynamic dashboards', 'issue enrichment', 'automatic issue resolution', 'communication management'],
            volatility: 'medium', personas: LEADERSHIP, estMinutes: 13 },
        ],
      },
      {
        module: 5,
        title: 'Building Workflows, Not Tool Stacks',
        volatility: 'medium',
        bullets: [
          { label: 'Workflows', title: 'Executable Markdown, deterministic tools, and graphs',
            covers: ['executable Markdown', 'dynamic apps', 'deterministic tools', 'graphs'],
            volatility: 'medium', personas: BUILDERS, estMinutes: 14 },
          { label: 'Quality', title: 'Checklists, safeguards, and review loops that actually catch things',
            covers: ['checklists', 'safeguards', 'review loops', 'performance markers'],
            volatility: 'low', personas: ALL, estMinutes: 13, crashCourse: 11 },
          { label: 'User Experience', title: 'Synthetic scenarios, recordings, and behavioural analysis',
            covers: ['synthetic scenarios', 'visual notes', 'recordings', 'deep behavioral analysis'],
            volatility: 'medium', personas: SENIOR_UP, estMinutes: 13 },
          { label: 'User Interfaces', title: 'Visual prototyping and design systems with an agent',
            covers: ['visual prototyping', 'design systems', 'augmented visual analysis'],
            volatility: 'medium', personas: BUILDERS, estMinutes: 12 },
          { label: 'Security', title: 'Critical loops, layered reviews, and dependency risk',
            covers: ['critical loops', 'checklists', 'layered reviews', 'dependency reviews'],
            volatility: 'medium', personas: ALL, estMinutes: 15, crashCourse: 12 },
          { label: 'Business', title: 'From product analysis to roadmap inputs',
            covers: ['product analysis', 'insights', 'dynamic reports', 'roadmap inputs'],
            volatility: 'low', personas: LEADERSHIP, estMinutes: 12 },
        ],
      },
    ],
  },
  {
    week: 2,
    title: 'Agents',
    goal: 'Shape and build agentic systems that deliver value with bounded supervision.',
    modules: [
      { module: 1, title: 'Mechanics Behind AI Agents', volatility: 'medium', bullets: [
        { label: 'Core', title: 'What makes something an agent rather than a call', covers: ['agent loop', 'goal', 'termination'] },
        { label: 'Context', title: 'Context as the agent’s working memory', covers: ['window budget', 'retrieval', 'compaction'] },
        { label: 'Memory', title: 'Memory: what persists, and what should not', covers: ['episodic', 'semantic', 'scoping', 'staleness'] },
        { label: 'Sandboxing', title: 'Sandboxing: bounding what an agent can reach', covers: ['isolation', 'credentials', 'filesystem', 'network'], volatility: 'high' },
        { label: 'Multi-Agent Systems', title: 'When one agent should become several', covers: ['decomposition', 'cost', 'failure modes'] },
      ]},
      { module: 2, title: 'Thinking in Agentic Primitives', volatility: 'low', bullets: [
        { label: 'Primitives', title: 'The primitives every agentic system is built from', covers: ['tool', 'context', 'loop', 'policy'] },
        { label: 'Environment', title: 'The environment an agent acts in', covers: ['state', 'observability', 'side effects'] },
        { label: 'Execution', title: 'Execution: steps, retries, and stopping', covers: ['step budget', 'retry', 'idempotence'] },
        { label: 'Authority', title: 'Authority: what an agent is allowed to do', covers: ['permissions', 'escalation', 'approval'] },
        { label: 'Trust', title: 'Trust boundaries and untrusted content', covers: ['prompt injection', 'data vs instruction', 'provenance'], volatility: 'medium' },
      ]},
      { module: 3, title: 'Augmenting Agents with Tools and Data', volatility: 'high', bullets: [
        { label: 'Deep Dive', title: 'How a tool call actually travels', covers: ['schema', 'invocation', 'result', 'error'] },
        { label: 'Tool Design', title: 'Designing tools an agent can use correctly', covers: ['naming', 'granularity', 'hints', 'failure messages'] },
        { label: 'External Tools', title: 'External tools and protocols', covers: ['MCP', 'connectors', 'auth', 'rate limits'] },
        { label: 'Internal Tools', title: 'Internal tools over your own systems', covers: ['wrapping APIs', 'safety', 'observability'] },
        { label: 'Practice', title: 'Putting a real tool into an agent’s hands', covers: ['end-to-end', 'testing', 'iteration'] },
      ]},
      { module: 4, title: 'Designing Custom Agentic Systems', volatility: 'high', bullets: [
        { label: 'Direct Work', title: 'Working directly with an agent, well', covers: ['framing', 'feedback', 'verification'] },
        { label: 'Subagents', title: 'Subagents as context isolation', covers: ['delegation', 'handoff', 'cost'] },
        { label: 'Multiple Threads', title: 'Running several threads without losing the plot', covers: ['parallelism', 'merge', 'conflict'] },
        { label: 'Background Tasks', title: 'Background and long-running work', covers: ['scheduling', 'notification', 'recovery'] },
        { label: 'Team Workflows', title: 'Agentic workflows across a team', covers: ['shared config', 'conventions', 'review'] },
      ]},
      { module: 5, title: 'Engineering Multi-Agent Systems', volatility: 'medium', bullets: [
        { label: 'Roles', title: 'Roles and responsibility boundaries', covers: ['specialisation', 'overlap', 'ownership'] },
        { label: 'Context', title: 'Context sharing between agents', covers: ['handoff payloads', 'duplication', 'drift'] },
        { label: 'Communication', title: 'How agents talk without flooding each other', covers: ['messages', 'summaries', 'protocols'] },
        { label: 'Coordination', title: 'Coordination and contention', covers: ['ordering', 'locking', 'deadlock'] },
        { label: 'Evaluation', title: 'Evaluating a system, not a prompt', covers: ['task success', 'traces', 'regression'] },
      ]},
    ],
  },
  {
    week: 3,
    title: 'Product',
    goal: 'Direct AI toward meaningful system changes and verify what ships.',
    modules: [
      { module: 1, title: 'Mechanics Behind Product Engineering', volatility: 'low', bullets: [
        { label: 'Shift', title: 'What changes when generation is cheap', covers: ['cost of code', 'bottleneck moves'] },
        { label: 'Ownership', title: 'Owning outcomes you did not type', covers: ['accountability', 'review depth'] },
        { label: 'Judgment', title: 'Judgment as the scarce input', covers: ['taste', 'tradeoffs', 'when to stop'] },
        { label: 'Systems Thinking', title: 'Seeing the system, not the diff', covers: ['coupling', 'second-order effects'] },
        { label: 'Leverage', title: 'Where leverage actually comes from', covers: ['repeatability', 'compounding', 'automation'] },
      ]},
      { module: 2, title: 'Translating Intent into Agent Work', volatility: 'low', bullets: [
        { label: 'Intent', title: 'Getting to the real intent behind a request', covers: ['problem framing', 'assumptions'] },
        { label: 'Context', title: 'Supplying the context the work needs', covers: ['codebase', 'constraints', 'history'] },
        { label: 'Requirements', title: 'Requirements an agent can act on', covers: ['acceptance', 'non-goals', 'edge cases'] },
        { label: 'Specifications', title: 'Specifications as the durable artefact', covers: ['structure', 'traceability'] },
        { label: 'Decomposition', title: 'Cutting work into agent-sized pieces', covers: ['slices', 'dependencies', 'parallelism'] },
        { label: 'Evaluation', title: 'Deciding in advance what "done" means', covers: ['criteria', 'evidence'] },
      ]},
      { module: 3, title: 'AI-Native Product Development', volatility: 'medium', bullets: [
        { label: 'Exploration', title: 'Exploring a problem space with an agent', covers: ['spikes', 'prototypes', 'discard cost'] },
        { label: 'Planning', title: 'Planning that survives contact with generation', covers: ['sequencing', 'risk first'] },
        { label: 'Execution', title: 'Execution loops that keep you in control', covers: ['increments', 'checkpoints'] },
        { label: 'Feedback', title: 'Feedback the agent can actually use', covers: ['tests', 'logs', 'human notes'] },
        { label: 'Engineering', title: 'Keeping engineering standards under speed', covers: ['structure', 'debt', 'refactor cadence'] },
        { label: 'Delivery', title: 'Shipping and what has to be true first', covers: ['release', 'rollback', 'comms'] },
      ]},
      { module: 4, title: 'Verifying Product Outcomes', volatility: 'low', bullets: [
        { label: 'Acceptance', title: 'Acceptance as a decision, not a ceremony', covers: ['criteria', 'evidence', 'sign-off'] },
        { label: 'Review', title: 'Reviewing generated change at the right altitude', covers: ['what to read', 'what to trust'] },
        { label: 'Verification', title: 'Verification beyond "the tests pass"', covers: ['behaviour', 'invariants', 'manual checks'] },
        { label: 'System Diff', title: 'Reading the system diff, not the code diff', covers: ['surface change', 'contract change'] },
        { label: 'Quality Gates', title: 'Gates that block the right things', covers: ['automation', 'false positives', 'escape hatches'] },
      ]},
      { module: 5, title: 'Products That Learn After Release', volatility: 'medium', bullets: [
        { label: 'Signals', title: 'Signals worth collecting', covers: ['usage', 'errors', 'qualitative'] },
        { label: 'Observation', title: 'Observing behaviour without drowning in it', covers: ['sampling', 'tracing', 'privacy'] },
        { label: 'Synthesis', title: 'Turning observation into a claim', covers: ['aggregation', 'bias', 'confidence'] },
        { label: 'Decisions', title: 'Deciding from evidence', covers: ['thresholds', 'reversibility'] },
        { label: 'Feedback Loops', title: 'Closing the loop back into the product', covers: ['cadence', 'ownership'] },
      ]},
    ],
  },
  {
    week: 4,
    title: 'Takeoff',
    goal: 'Build autonomous systems that operate, recover, and improve over time.',
    modules: [
      { module: 1, title: 'Mechanics Behind Autonomous Systems', volatility: 'medium', bullets: [
        { label: 'Autonomy', title: 'What autonomy actually means here', covers: ['degrees', 'supervision', 'blast radius'] },
        { label: 'Runtime', title: 'The runtime an autonomous system lives in', covers: ['process', 'scheduling', 'limits'] },
        { label: 'State', title: 'State that survives restarts', covers: ['durability', 'idempotence', 'resume'] },
        { label: 'Control', title: 'Control surfaces: start, stop, override', covers: ['kill switch', 'pause', 'manual take-over'] },
        { label: 'Observation and Recovery', title: 'Noticing failure and getting back on track', covers: ['health', 'alerting', 'self-repair'] },
      ]},
      { module: 2, title: 'Building Portable Agent Control Planes', volatility: 'high', bullets: [
        { label: 'Configuration', title: 'Configuration as code, not as clicks', covers: ['files', 'precedence', 'secrets'] },
        { label: 'Portability', title: 'Running the same setup anywhere', covers: ['machines', 'CI', 'cloud'] },
        { label: 'Environment', title: 'Environment parity and drift', covers: ['containers', 'toolchain', 'reproducibility'] },
        { label: 'Knowledge Delivery', title: 'Getting knowledge to the agent that needs it', covers: ['skills', 'docs', 'retrieval'] },
        { label: 'Operations', title: 'Operating the control plane day to day', covers: ['rollout', 'versioning', 'incident'] },
      ]},
      { module: 3, title: 'Orchestrating Autonomous Agent Teams', volatility: 'medium', bullets: [
        { label: 'Organization', title: 'Organising agents around work, not org charts', covers: ['topology', 'granularity'] },
        { label: 'Coordination', title: 'Coordination without a central bottleneck', covers: ['queues', 'claims', 'backpressure'] },
        { label: 'Parallelism', title: 'Parallelism and the cost of merging', covers: ['fan-out', 'conflict', 'serialisation points'] },
        { label: 'Routing', title: 'Routing work to the right agent', covers: ['capability', 'cost', 'fallback'] },
        { label: 'Supervision', title: 'Supervising without watching everything', covers: ['exceptions', 'sampling', 'escalation'] },
      ]},
      { module: 4, title: 'Automating Work Beyond Code', volatility: 'high', bullets: [
        { label: 'Events', title: 'Events as the trigger surface', covers: ['sources', 'filtering', 'idempotence'] },
        { label: 'Hooks', title: 'Hooks: deterministic control around a model', covers: ['pre', 'post', 'blocking'] },
        { label: 'Pipelines', title: 'Pipelines that chain agent work', covers: ['stages', 'artefacts', 'failure'] },
        { label: 'Push Systems', title: 'Push systems that reach you, not the reverse', covers: ['notification', 'summarisation', 'noise'] },
        { label: 'Boundaries', title: 'Boundaries: what must never be automated', covers: ['irreversibility', 'authority', 'consent'] },
      ]},
      { module: 5, title: 'Building Self-Improving Engineering Systems', volatility: 'medium', bullets: [
        { label: 'Feedback', title: 'Feedback the system can consume', covers: ['signals', 'labels', 'traces'] },
        { label: 'Evaluation', title: 'Evaluation harnesses that catch regressions', covers: ['datasets', 'metrics', 'drift'] },
        { label: 'Distillation', title: 'Distilling what worked into reusable knowledge', covers: ['patterns', 'skills', 'docs'] },
        { label: 'Optimization', title: 'Optimising cost, latency, and quality together', covers: ['tradeoffs', 'routing', 'caching'] },
        { label: 'Governance', title: 'Governance that does not stop the work', covers: ['policy', 'audit', 'accountability'] },
      ]},
    ],
  },
];

export const pad2 = (n: number) => String(n).padStart(2, '0');
export const lessonIdOf = (w: number, m: number, b: number) => `w${w}.m${pad2(m)}.b${pad2(b)}`;
export const permalinkOf = (w: number, m: number, b: number) =>
  `/deep-dive/w${w}/m${pad2(m)}/b${pad2(b)}`;
