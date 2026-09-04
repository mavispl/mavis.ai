# Curriculum backlog

Generated from `spec/curriculum/map.json` on 2026-09-04.
Do not edit by hand — run `pnpm tsx scripts/gen-backlog.ts`.

**6 of 107 lessons authored.**

Each module is generated and audited as one unit by `.claude/skills/course-run`.
Recheck cadence follows the module's volatility: a page about pricing rots in weeks,
a page about attention does not.

| Week | Module | Lessons | Done | Volatility | Recheck | Status |
|---|---|---:|---:|---|---|---|
| 1 Core | 01 Mechanics Behind Generative AI | 6 | 6 | medium | 90 days | **complete** |
| 1 Core | 02 Steering Models Through Context | 6 | 0 | high | 30 days | queued |
| 1 Core | 03 Building Knowledge Systems | 6 | 0 | medium | 90 days | queued |
| 1 Core | 04 Working with AI Harnesses | 6 | 0 | high | 30 days | queued |
| 1 Core | 05 Building Workflows, Not Tool Stacks | 6 | 0 | medium | 90 days | queued |
| 2 Agents | 01 Mechanics Behind AI Agents | 5 | 0 | medium | 90 days | queued |
| 2 Agents | 02 Thinking in Agentic Primitives | 5 | 0 | low | 365 days | queued |
| 2 Agents | 03 Augmenting Agents with Tools and Data | 5 | 0 | high | 30 days | queued |
| 2 Agents | 04 Designing Custom Agentic Systems | 5 | 0 | high | 30 days | queued |
| 2 Agents | 05 Engineering Multi-Agent Systems | 5 | 0 | medium | 90 days | queued |
| 3 Product | 01 Mechanics Behind Product Engineering | 5 | 0 | low | 365 days | queued |
| 3 Product | 02 Translating Intent into Agent Work | 6 | 0 | low | 365 days | queued |
| 3 Product | 03 AI-Native Product Development | 6 | 0 | medium | 90 days | queued |
| 3 Product | 04 Verifying Product Outcomes | 5 | 0 | low | 365 days | queued |
| 3 Product | 05 Products That Learn After Release | 5 | 0 | medium | 90 days | queued |
| 4 Takeoff | 01 Mechanics Behind Autonomous Systems | 5 | 0 | medium | 90 days | queued |
| 4 Takeoff | 02 Building Portable Agent Control Planes | 5 | 0 | high | 30 days | queued |
| 4 Takeoff | 03 Orchestrating Autonomous Agent Teams | 5 | 0 | medium | 90 days | queued |
| 4 Takeoff | 04 Automating Work Beyond Code | 5 | 0 | high | 30 days | queued |
| 4 Takeoff | 05 Building Self-Improving Engineering Systems | 5 | 0 | medium | 90 days | queued |

## Next up

`w1.m02 — Steering Models Through Context`. Run the pipeline for one module at a time:

```bash
pnpm tsx scripts/build-map.ts && pnpm content && pnpm tsx scripts/audit-all.ts
```

Stage 3 (research) and Stage 4 (authoring) are driven by `.claude/skills/course-run`,
which gates on the design system being accepted before it writes any content.

## Standing work

- **Fact re-audit.** High-volatility pages fall due every 30 days; `audit:schema` raises
  a `recheck-due` finding at the window and `stale-verification` past it.
- **Crash-course path.** Fixed in the agenda, so it fills in as its source lessons are
  authored. The sequencing check only enforces contiguity once every step exists.
- **Polish translation.** Content ids are locale-independent and UI strings go through
  `t()`, so a `translate` stage slots between Author and Audit without restructuring
  (ADR-004).
