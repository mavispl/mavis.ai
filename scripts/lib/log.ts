/**
 * Structured run logging (ADR-003).
 *
 * Every pipeline stage appends one JSONL record per unit of work to
 * `log/<stage>.jsonl`. The point is forensic: months later, any page on the site
 * should be traceable to the run that produced it, the inputs that run saw, and
 * the audit that cleared it.
 *
 * Append-only, one JSON object per line, no rewriting of history.
 */

import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export type Stage =
  | 'harvest' | 'design' | 'map' | 'research' | 'author' | 'audit' | 'build';

export interface RunRecord {
  runId: string;
  stage: Stage;
  ts: string;
  /** What this record is about — a lesson id, a module, a file. */
  subject?: string;
  status: 'ok' | 'warn' | 'fail';
  durationMs?: number;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  notes?: string;
}

const LOG_DIR = join(process.cwd(), 'log');

export function newRunId(stage: Stage): string {
  return `${stage}-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`;
}

export function logRecord(record: Omit<RunRecord, 'ts'> & { ts?: string }): void {
  mkdirSync(LOG_DIR, { recursive: true });
  const line = JSON.stringify({ ts: new Date().toISOString(), ...record });
  appendFileSync(join(LOG_DIR, `${record.stage}.jsonl`), line + '\n', 'utf8');
}

/** Wraps a stage so timing and failure are recorded whether or not it throws. */
export async function runStage<T>(
  stage: Stage,
  subject: string,
  fn: () => Promise<T> | T,
  inputs?: Record<string, unknown>,
): Promise<T> {
  const runId = newRunId(stage);
  const started = Date.now();
  try {
    const result = await fn();
    logRecord({
      runId, stage, subject, status: 'ok',
      durationMs: Date.now() - started, inputs,
      outputs: typeof result === 'object' && result !== null ? undefined : { result },
    });
    return result;
  } catch (error) {
    logRecord({
      runId, stage, subject, status: 'fail',
      durationMs: Date.now() - started, inputs,
      notes: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
