/**
 * Stage 4 companion — wiki harvest.
 *
 * Every term a lesson declares in `defines` needs a canonical entry, or the graph
 * audit fails. Generating them from one table rather than 28 hand-edited files
 * keeps the shape consistent (one-line summary, then an analogy, then the real
 * definition) and makes the cross-links mechanical rather than remembered.
 *
 *   pnpm tsx scripts/gen-wiki.ts
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { logRecord, newRunId } from './lib/log.ts';

interface Entry {
  term: string;
  slug: string;
  aliases?: string[];
  summary: string;
  analogy?: string;
  category: string;
  related?: string[];
  lessons: string[];
  body: string;
  sources?: { url: string; title: string; publisher: string; accessedOn: string }[];
}

const ATTENTION_SRC = {
  url: 'https://arxiv.org/abs/1706.03762',
  title: 'Attention Is All You Need',
  publisher: 'Vaswani et al., arXiv',
  accessedOn: '2026-09-04',
};
const CTX_SRC = {
  url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
  title: 'Context windows',
  publisher: 'Anthropic',
  accessedOn: '2026-09-04',
};
const PRICING_SRC = {
  url: 'https://platform.claude.com/docs/en/about-claude/pricing',
  title: 'Pricing',
  publisher: 'Anthropic',
  accessedOn: '2026-09-04',
};
const HALLU_SRC = {
  url: 'https://arxiv.org/abs/2509.04664',
  title: 'Why Language Models Hallucinate',
  publisher: 'Kalai et al., arXiv',
  accessedOn: '2026-09-04',
};
const BPE_SRC = {
  url: 'https://arxiv.org/abs/2508.04796',
  title: 'Parity-Aware Byte-Pair Encoding',
  publisher: 'Foroutan et al., arXiv',
  accessedOn: '2026-09-04',
};
const TOOLS_SRC = {
  url: 'https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview',
  title: 'Tool use overview',
  publisher: 'Anthropic',
  accessedOn: '2026-09-04',
};

const ENTRIES: Entry[] = [
  {
    term: 'Harness', slug: 'harness', category: 'Mechanics',
    aliases: ['Agent harness', 'Scaffold'],
    summary: 'The program wrapped around a model that assembles context, executes tools, runs the loop, and enforces what the model is allowed to touch.',
    analogy: 'The model is someone locked in a windowless room who can only pass notes. The harness is the person outside the door who actually fetches things.',
    related: ['Tool call', 'Context window', 'Agentic'],
    lessons: ['w1.m01.b01'],
    sources: [TOOLS_SRC],
    body: `A model is stateless and can execute nothing. Every capability people attribute to "the AI" — reading files, calling APIs, remembering earlier sessions, working through a task over many steps — belongs to the harness.

Harnesses differ in vocabulary and agree on structure. All of them configure the same four things: **which model**, **what context**, **which tools**, and **what authority**. Learning one transfers to the rest, which is why this course teaches the four rather than any single product's settings screen.

The practical consequence for engineers: the harness is where your leverage is, and where your bugs are. The model is bought at a published price and your competitor can buy the same one.`,
  },
  {
    term: 'Tool call', slug: 'tool-call', category: 'Tools',
    aliases: ['Tool use', 'tool_use block'],
    summary: 'A structured request a model emits naming a tool and its arguments. The harness executes it; the model never does.',
    analogy: 'An order slip passed through a hatch. Writing the slip is not cooking the meal.',
    related: ['Function calling', 'Tool result', 'Harness'],
    lessons: ['w1.m01.b01', 'w1.m01.b05'],
    sources: [TOOLS_SRC],
    body: `The model returns a content block of type \`tool_use\` carrying an id, a tool name, and an input object, with \`stop_reason: "tool_use"\`. Your harness matches the name against a real function, runs it, and returns a \`tool_result\` referencing that id.

Two things follow that catch people out. A model can *describe* a tool call in prose instead of emitting the block — the turn succeeds, nothing runs, and no error is raised. And one assistant message may contain several \`tool_use\` blocks; all their results must come back in a **single** user message, or the model stops batching calls for the rest of that conversation.`,
  },
  {
    term: 'Agentic', slug: 'agentic', category: 'Mechanics',
    summary: 'Describes a system where the model decides what to do next in a loop, rather than producing one response to one prompt.',
    analogy: 'The difference between asking someone a question and giving them an errand.',
    related: ['Harness', 'Tool call'],
    lessons: ['w1.m01.b01'],
    body: `"Agentic" is not a property of a model. The same model is agentic or not depending on whether the surrounding program loops: calling the model, executing whatever it requests, feeding the result back, and repeating until some stop condition.

The word is used loosely enough in marketing to be nearly meaningless. The useful question about any "agentic" system is concrete: **what decides when it stops, and what is it allowed to touch while it runs?**`,
  },
  {
    term: 'Completion', slug: 'completion', category: 'Mechanics',
    summary: 'The text a model generates in response to an input. The model continues a sequence; it does not answer a question in any other sense.',
    related: ['Token', 'Autoregressive'],
    lessons: ['w1.m01.b01'],
    body: `The name is a leftover from an earlier API shape and it is more honest than "response". The operation is continuation: given these tokens, produce likely following tokens.

Chat-shaped APIs hide this behind roles and messages, but the underlying operation has not changed — the messages are serialised into one sequence and the model continues it.`,
  },
  {
    term: 'Token', slug: 'token', category: 'Mechanics',
    summary: 'The unit a model actually operates on — usually a word fragment, not a word or a character. It is also the unit you are billed in.',
    analogy: 'Not the letters and not the words, but the pieces a very particular scissors happens to cut text into.',
    related: ['Byte-pair encoding', 'Context window'],
    lessons: ['w1.m01.b02'],
    sources: [PRICING_SRC],
    body: `Text is segmented into tokens before the model sees anything, and each token becomes an integer id. The model never sees characters, which is why letter-counting and string-reversal questions fail: they ask about information the input representation discarded.

A token is **not a stable unit**. Segmentation depends on the tokenizer, and tokenizers change: Anthropic's documentation states that Claude 4.7 and later produce approximately 30% more tokens for the same text than earlier models. Any budget or capacity plan expressed in tokens is specific to one tokenizer generation.`,
  },
  {
    term: 'Byte-pair encoding', slug: 'byte-pair-encoding', category: 'Mechanics',
    aliases: ['BPE'],
    summary: 'The algorithm behind most tokenizers: repeatedly merge the most frequent adjacent byte pair into a new vocabulary entry until the vocabulary is full.',
    related: ['Token', 'Generalization'],
    lessons: ['w1.m01.b02'],
    sources: [BPE_SRC],
    body: `The merge table is learned once over the training corpus and frozen. It never adapts to your input, which is why unusual text — minified code, base64, rare identifiers — fragments into many short tokens.

Because training corpora are predominantly English, English compresses into fewer, longer tokens than other scripts. Since providers bill per token and latency scales with token count, that inequality is passed to users as unequal cost purely by language choice — the motivation for work on parity-aware tokenization, which reports reducing the Gini coefficient of per-language cost by up to 89% relative to classical BPE.`,
  },
  {
    term: 'Attention', slug: 'attention', category: 'Mechanics',
    summary: 'The mechanism that lets each position in a sequence draw on every other position, weighted by learned relevance rather than uniformly.',
    analogy: 'Reading a page with some words in bold — except which words are bold is recomputed for every word you read.',
    related: ['Token', 'Context rot', 'Latent space'],
    lessons: ['w1.m01.b02', 'w1.m01.b06'],
    sources: [ATTENTION_SRC],
    body: `Each position produces a query; every position produces a key and a value. Queries are compared against keys, scores are normalised into weights, and the output is the weighted sum of values. Multiple heads do this in parallel with different learned projections.

Three consequences matter in practice. Cost is **quadratic** in sequence length. Position is **not neutral** — the weighting over positions is learned, not uniform, which is the mechanism behind context rot. And there is **no privilege channel**: a system prompt is not marked as more authoritative in the mathematics than a document a tool fetched, which is why prompt injection is structural rather than a fixable bug.`,
  },
  {
    term: 'Autoregressive', slug: 'autoregressive', category: 'Mechanics',
    summary: 'Generating one token at a time, each conditioned on everything produced so far. There is no plan for the sentence before it starts.',
    related: ['Completion', 'Reasoning tokens'],
    lessons: ['w1.m01.b02'],
    body: `The model produces a distribution over the vocabulary for the next token, one is selected, and the whole sequence is fed back in.

The useful implication: **the start of a response constrains the rest of it more than the prompt does.** Once the first sentence commits to a direction, every later token is conditioned on that commitment. It is also why reasoning-before-answering works — intermediate results end up in the sequence for the answer to condition on.`,
  },
  {
    term: 'Instruction following', slug: 'instruction-following', category: 'Mechanics',
    summary: 'A learned behaviour added after pre-training, not a property of next-token prediction. Strong and reliable, but still a statistical tendency.',
    related: ['Generalization', 'Attention'],
    lessons: ['w1.m01.b02'],
    body: `Raw next-token prediction over web text would *continue* your instruction rather than obey it. Obedience comes from fine-tuning on instruction-response pairs and preference optimisation.

Two things follow. Instructions phrased like the training distribution work better than clever ones. And instruction following can be outcompeted by a sufficiently strong pattern elsewhere in the context — the mechanism behind prompt injection.`,
  },
  {
    term: 'Confabulation', slug: 'confabulation', category: 'Limits',
    aliases: ['Hallucination'],
    summary: 'Fluent, confident production of false detail with no awareness that a gap is being filled. The confidence carries no information about accuracy.',
    analogy: 'Not seeing something that is not there — sincerely filling in a missing memory and believing the result.',
    related: ['Base knowledge', 'Knowledge cutoff'],
    lessons: ['w1.m01.b03'],
    sources: [HALLU_SRC],
    body: `"Confabulation" is the more accurate word. A hallucination is a false perception; confabulation is the sincere generation of plausible detail to fill a gap. That is precisely what next-token prediction does when no continuation is strongly supported.

It is not a mysterious flaw but a predictable consequence of training **and evaluation**. Most benchmarks score binary — one point for correct, zero for wrong, zero for "I don't know" — under which guessing strictly dominates abstaining. We selected for confident guessing.

Which is why prompt-level pleading ("be accurate") achieves so little. The fixes are structural: supply the information, make claims checkable, or provide a tool that can verify.`,
  },
  {
    term: 'Knowledge cutoff', slug: 'knowledge-cutoff', category: 'Limits',
    summary: 'The date the training data ends. Fixed for the life of the model, and the model does not reliably know its own.',
    related: ['Base knowledge', 'Context window'],
    lessons: ['w1.m01.b03'],
    body: `Nothing after the cutoff is in base knowledge, and nothing updates it. A model trained before a library's version 3 will describe version 2's API fluently and will not signal that it is doing so.

Asking the model for its cutoff is not a check — the answer is generated, not introspected. The only remedy is the context window: supply current information rather than relying on recall.`,
  },
  {
    term: 'Base knowledge', slug: 'base-knowledge', category: 'Limits',
    summary: 'What a model knows without being told. Frozen at the cutoff and unevenly distributed — thinnest exactly where your work is most specific.',
    related: ['Knowledge cutoff', 'Confabulation'],
    lessons: ['w1.m01.b03'],
    body: `Base knowledge is not a database with uniform coverage. Widely-discussed topics are represented richly; a library with two hundred stars is represented thinly or not at all.

"Thinly represented" does not produce silence — it produces confident invention. So the failure is worst precisely where you are most likely to rely on it: your internal systems, your conventions, the niche tool you chose because nobody else uses it.`,
  },
  {
    term: 'Context window', slug: 'context-window', category: 'Context',
    summary: 'The working memory of a single request. Everything counts toward it — system prompt, messages, tool results, images, tool definitions, and the generated output.',
    analogy: 'A desk, not a filing cabinet. What is on it right now is all the model can see.',
    related: ['Context rot', 'Token', 'Prompt caching'],
    lessons: ['w1.m01.b03'],
    sources: [CTX_SRC],
    body: `The only channel for anything the training data lacks. Two edges behave differently: input alone exceeding the window returns a 400, while generation that *reaches* the limit stops with a distinct stop reason and returns a truncated response that looks complete unless you check.

Caching changes what you pay for a prefix, never whether it occupies the window. It is a cost optimisation, not a capacity one.`,
  },
  {
    term: 'Context rot', slug: 'context-rot', category: 'Context',
    summary: 'The degradation of accuracy and recall as a context window fills. Capacity and usable attention are different quantities.',
    analogy: 'A desk does not get more useful as you pile more onto it.',
    related: ['Context window', 'Attention'],
    lessons: ['w1.m01.b03'],
    sources: [CTX_SRC],
    body: `A one-million-token window is not a million tokens of reliable recall. Vendor documentation states the effect directly: as token count grows, accuracy and recall degrade, which makes curating what is in context as important as how much space remains.

The practical consequence is a common wrong turn. When a long-running agent starts underperforming, the instinct is a bigger window; the problem is usually signal-to-noise inside the window. Compaction, clearing stale tool results, and restarting with a written summary all beat more capacity.`,
  },
  {
    term: 'Output limit', slug: 'output-limit', category: 'Limits',
    aliases: ['max_tokens'],
    summary: 'A hard ceiling on generated tokens that the model is not aware of. It does not pace itself — it is cut off mid-token.',
    related: ['Context window'],
    lessons: ['w1.m01.b03'],
    sources: [CTX_SRC],
    body: `Because the model cannot see the limit, truncation is abrupt and can look like a complete response. A JSON object cut off at 90% is not a parse error you notice in review.

Lowballing the limit costs more than it saves: you pay for the truncated output and then pay again for the retry. Very large outputs need streaming, since a non-streaming request will hit transport timeouts before it finishes.`,
  },
  {
    term: 'Prompt caching', slug: 'prompt-caching', category: 'Cost',
    summary: 'Reusing the processing of a stable prompt prefix across requests. Typically a cache read costs about a tenth of the base input price.',
    analogy: 'Leaving the book open at the right page instead of finding it again each time.',
    related: ['Context window', 'Model mixing'],
    lessons: ['w1.m01.b04'],
    sources: [PRICING_SRC],
    body: `Caching is a **prefix match**: any byte change anywhere in the prefix invalidates everything after it. That is why a timestamp in a system prompt silently reverts every request to full price — nothing errors and behaviour is unchanged.

Order requests so stability decreases left to right: frozen system prompt and deterministically ordered tools first, volatile content last. Verify with the cache-read token count rather than assuming; zero across repeated requests means an invalidator is at work.

Caches are **model-scoped**, so a multi-model cascade forfeits reuse between its models.`,
  },
  {
    term: 'Model routing', slug: 'model-routing', category: 'Cost',
    summary: 'Sending each request to a model chosen by task shape rather than standardising on one model everywhere.',
    related: ['Model mixing', 'Effort'],
    lessons: ['w1.m01.b04'],
    body: `Routing works when the rule is about the *shape* of the task — extraction and classification to a small fast model, planning and ambiguous debugging to a flagship, bulk work to a batch endpoint.

Routing disappoints when the rule is a quality cascade that retries on a bigger model. You pay for both attempts, you need a failure signal that usually does not exist, latency is the sum rather than the minimum, and you lose cache reuse across models.`,
  },
  {
    term: 'Model mixing', slug: 'model-mixing', category: 'Cost',
    summary: 'Using several models within one system, each for the work it suits. Usually where real cost savings live — and real complexity.',
    related: ['Model routing', 'Prompt caching'],
    lessons: ['w1.m01.b04'],
    body: `The saving is real and the accounting is subtle. Judge **cost per completed task, not per request**: a model at a third of the price that needs two attempts, more tool calls, or a human correction is not cheaper.

Before building a cascade, measure the simpler alternative — the stronger model at lower effort. It often matches the cascade's quality at comparable cost, in one cache namespace, with a fraction of the moving parts.`,
  },
  {
    term: 'Effort', slug: 'effort', category: 'Cost',
    summary: 'A control that trades thoroughness against token spend within a single model. Often a better first move than switching models.',
    related: ['Reasoning tokens', 'Model routing'],
    lessons: ['w1.m01.b04'],
    sources: [PRICING_SRC],
    body: `Lower effort on a strong current model frequently matches or beats a previous-generation model at high effort, and keeps you in one cache namespace.

Which workloads repay higher effort is a property of the workload, not a universal setting: coding and long-horizon agentic work respond strongly; chat and high-volume classification often do not. Tune per route, on a sample of real requests, rather than globally.`,
  },
  {
    term: 'Structured output', slug: 'structured-output', category: 'Tools',
    aliases: ['Structured outputs', 'Constrained decoding'],
    summary: 'Constraining generation against a schema so the response is a valid instance rather than something that merely resembles one.',
    analogy: 'A form with typed fields, not a blank page with instructions about what to write.',
    related: ['Schema', 'Function calling'],
    lessons: ['w1.m01.b05'],
    sources: [TOOLS_SRC],
    body: `The difference from asking for JSON in a prompt is enforcement. A prompt is a request the model usually honours; a schema constraint is a guarantee about shape. Prompt-based parsing fails intermittently — a preamble, a code fence, a trailing comma — and those failures cluster on unusual inputs.

Schema design decides how the model fails. A required field the source document does not contain forces an invention; make it optional or add an explicit absence variant, and an invented value becomes a correct "not found".`,
  },
  {
    term: 'Schema', slug: 'schema', category: 'Tools',
    summary: 'The typed description of an object a model must produce — for a structured output or for a tool’s arguments.',
    related: ['Structured output', 'Function calling'],
    lessons: ['w1.m01.b05'],
    body: `A schema does two jobs at once: it constrains generation, and it tells the model what is wanted. Both matter, which is why an overly permissive schema underperforms twice — you get a validated blob, and the model had less guidance about what to put in it.

Push real structure in: enums for closed sets, arrays for repeats, nested objects for relationships, and explicit variants for "absent" and "unknown".`,
  },
  {
    term: 'Function calling', slug: 'function-calling', category: 'Tools',
    aliases: ['Tool calling'],
    summary: 'The pattern where a model requests an operation and your code performs it, returning the outcome into the conversation.',
    related: ['Tool call', 'Tool result', 'Native tool'],
    lessons: ['w1.m01.b05'],
    sources: [TOOLS_SRC],
    body: `The tool's **description is a prompt**, not documentation — it is the only thing telling the model when to reach for it. Descriptions written like API reference get used at the wrong times or not at all.

Granularity is a genuine tradeoff: narrow tools are unambiguous and safe but burn input tokens on every request forever; one broad tool is cheap in context and grants more authority. Both are defensible. Drifting into forty narrow tools without deciding is not.`,
  },
  {
    term: 'Tool result', slug: 'tool-result', category: 'Tools',
    summary: 'The output of an executed tool, appended to the conversation as ordinary context with no privilege marker.',
    analogy: 'A note slipped into the same folder as your instructions, in the same handwriting.',
    related: ['Tool call', 'Context window'],
    lessons: ['w1.m01.b01', 'w1.m01.b05'],
    sources: [TOOLS_SRC],
    body: `Two properties do most of the work. **Results are context**, so their size is a cost — a tool returning 4,000 lines has technically succeeded and practically failed. And results are **untrusted input**: content a tool fetched sits alongside your instructions with nothing marking which is which, which is the entire basis of prompt injection.

Errors are results too. A failed tool returns a result flagged as an error with a message the model can act on; dropping it leaves an unresolved call and usually triggers a retry loop.`,
  },
  {
    term: 'Native tool', slug: 'native-tool', category: 'Tools',
    aliases: ['Server-side tool'],
    summary: 'A capability the model vendor runs on their own infrastructure — web search, web fetch, code execution — rather than one you execute.',
    related: ['Function calling', 'Tool result'],
    lessons: ['w1.m01.b05'],
    sources: [PRICING_SRC],
    body: `You declare it and results arrive in the same response, with no execution loop to write and no infrastructure to run. In exchange you give up control over what is fetched or executed, and take a dependency on the provider's implementation.

Pricing works differently: native tools commonly bill **outside** the token model — a per-search charge, or container-hours for code execution. A cost model built only from input and output rates can be materially wrong for a tool-heavy agent.`,
  },
  {
    term: 'Latent space', slug: 'latent-space', category: 'Mechanics',
    summary: 'The high-dimensional representation a model computes over, where related concepts sit near each other. Useful as intuition, imprecise as description.',
    analogy: 'A map where nearness means relatedness — except there are thousands of directions and no compass.',
    related: ['Attention', 'Generalization'],
    lessons: ['w1.m01.b06'],
    sources: [ATTENTION_SRC],
    body: `The useful intuition: steering is **movement, not selection**. You are not choosing from a menu of behaviours; you are nudging a starting position, and nearby positions produce related-but-different output. That explains why small phrasing changes sometimes produce large shifts and large rewrites sometimes produce none.

The imprecision worth knowing: there is no single latent space. There is a residual stream read and written by every layer, and the representation at layer 3 and layer 40 are different spaces. "The model's latent space" is a convenient fiction over a stack of them.`,
  },
  {
    term: 'Generalization', slug: 'generalization', category: 'Mechanics',
    summary: 'Handling inputs never seen in training by applying learned patterns. Also the reason a model sometimes applies a pattern you did not intend.',
    related: ['Latent space', 'Instruction following'],
    lessons: ['w1.m01.b06'],
    body: `Generalization is what makes the technology work and what makes it slippery — the pattern generalised from is not always the one you had in mind.

The operative unit is association. Ask in a domain's vocabulary and you inherit that domain's conventions and blind spots. Include an example of sloppy work and output drifts toward sloppy, because "text that follows sloppy text" is what is being predicted. **Everything in your context is an example of what to produce next**, including material you put there for other reasons.`,
  },
  {
    term: 'Self-querying', slug: 'self-querying', category: 'Mechanics',
    aliases: ['Self-critique', 'Self-review'],
    summary: 'Asking a model to review its own output. Helps when the review is a genuinely different task; collapses into agreement when the original framing is present.',
    related: ['Reasoning tokens', 'Confabulation'],
    lessons: ['w1.m01.b06'],
    body: `It helps when the second pass is a different prediction problem over material now in context — "here is a function, list its edge cases" is not the same task as "write this function".

It does not help when the original answer sits in the context with its original framing, because the likeliest continuation of a confident answer plus "is that right?" is agreement. You get a continuation, not a second opinion.

**Verification needs an outside source of truth** — tests, types, a source document, a tool that can disagree — or it becomes a longer version of the original answer. "Ask the AI to check its own work" is widely deployed as a control and is not one.`,
  },
  {
    term: 'Reasoning tokens', slug: 'reasoning-tokens', category: 'Mechanics',
    aliases: ['Chain of thought', 'Thinking tokens'],
    summary: 'Intermediate text a model generates before its answer, so the answer can condition on partial results instead of leaping in one step.',
    related: ['Autoregressive', 'Effort', 'Self-querying'],
    lessons: ['w1.m01.b06'],
    sources: [CTX_SRC],
    body: `The mechanism is conditioning, not deliberation. Each token is predicted given everything before it, so putting intermediate results into the sequence gives the final answer more to condition on.

Two consequences. Reasoning **can be wrong and still sound sound** — it is generated by the same predictive process, and is not a trace of a separate computation that produced the answer. And reasoning **costs**: these tokens are billed as output and occupy the window, so on tasks needing no decomposition they are pure expense.`,
  },
];

const dir = join(process.cwd(), 'content', 'wiki');
mkdirSync(dir, { recursive: true });

const runId = newRunId('author');
const esc = (s: string) => (/[:#\[\]{}''"|>*&!%@`]/.test(s) ? JSON.stringify(s) : s);

for (const e of ENTRIES) {
  const fm = [
    '---',
    `term: ${esc(e.term)}`,
    `slug: ${e.slug}`,
    ...(e.aliases?.length ? [`aliases: [${e.aliases.map(esc).join(', ')}]`] : []),
    `summary: ${JSON.stringify(e.summary)}`,
    ...(e.analogy ? [`analogy: ${JSON.stringify(e.analogy)}`] : []),
    `category: ${esc(e.category)}`,
    ...(e.related?.length ? [`relatedTerms: [${e.related.map(esc).join(', ')}]`] : []),
    `lessons: [${e.lessons.join(', ')}]`,
    ...(e.sources?.length
      ? [
          'sources:',
          ...e.sources.flatMap((s) => [
            `  - url: ${s.url}`,
            `    title: ${esc(s.title)}`,
            `    publisher: ${esc(s.publisher)}`,
            `    accessedOn: ${s.accessedOn}`,
          ]),
        ]
      : []),
    'verifiedOn: 2026-09-04',
    '---',
    '',
    e.body,
    '',
  ].join('\n');

  writeFileSync(join(dir, `${e.slug}.mdx`), fm);
}

logRecord({
  runId, stage: 'author', subject: 'w1.m01/wiki', status: 'ok',
  outputs: { entries: ENTRIES.length, dir: 'content/wiki' },
});

console.log(`wiki: ${ENTRIES.length} entries written to content/wiki/`);
