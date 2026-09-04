# ADR-003: Generation as a staged, logged, auditable pipeline

- **Status:** accepted
- **Date:** 2026-09-04
- **Stage:** all

## Context
"Generate a course website" is not a single prompt. The requirement is that every
section be produced by an orchestrated run that leaves behind specs, logs, and audit
findings — content whose provenance can be inspected months later.

## Decision
Six stages, each writing structured output to a fixed location:

| Stage | Name | Writes |
|---|---|---|
| 0 | Harvest | `spec/curriculum/inventory.json` |
| 1 | Design | `spec/design/`, acceptance gate |
| 2 | Map | `spec/curriculum/map.json` |
| 3 | Research | `research/<module>/sources.json` |
| 4 | Author | `content/**` |
| 5 | Audit | `audit/<run-id>/findings.json`, `report.md` |
| 6 | Build | `out/`, deploy |

Every stage appends one JSONL record per unit of work to `log/<stage>.jsonl`
(run id, inputs, outputs, duration, status). The orchestrator is a Claude Code skill
(`.claude/skills/course-run/`); research and audit run as subagents so their context
stays isolated from the authoring context.

The course is therefore built with the practices it teaches — skills, subagents,
specs, bounded context — and the repo is itself a worked example.

## Consequences
- A run is reproducible and inspectable: any page can be traced to the research that
  informed it and the audit that cleared it.
- Stages are independently re-runnable. Re-auditing Week 1 does not regenerate it.
- Overhead is real: authoring a page is not "write MDX", it is "write MDX that
  satisfies the schema, cites its sources, and survives five audit passes".
