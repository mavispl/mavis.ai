/**
 * Per-reader progress. Local to one browser, by design: the site is a static
 * export with no account system (ADR-001). Every read and write is guarded —
 * private windows, cleared site data, and storage-blocking browsers must all
 * render a correct page with no stored value.
 */

export const PROGRESS_STORAGE_KEY = 'mavis.progress.v1';

export type ProgressMap = Record<string, number>; // lesson id -> completed epoch ms

function safeParse(raw: string | null): ProgressMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: ProgressMap = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function readProgress(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    return safeParse(window.localStorage.getItem(PROGRESS_STORAGE_KEY));
  } catch {
    return {};
  }
}

export function writeProgress(map: ProgressMap): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('mavis:progress', { detail: map }));
  } catch {
    /* storage unavailable — progress is a convenience, never a requirement */
  }
}

export function toggleLesson(id: string, done?: boolean): ProgressMap {
  const map = readProgress();
  const next = done ?? !(id in map);
  if (next) map[id] = Date.now();
  else delete map[id];
  writeProgress(map);
  return map;
}

export function resetProgress(): void {
  writeProgress({});
}

export function completionOf(ids: readonly string[], map: ProgressMap) {
  const done = ids.filter((id) => id in map).length;
  return { done, total: ids.length, ratio: ids.length ? done / ids.length : 0 };
}
