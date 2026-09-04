'use client';

import { PERSONAS, type Persona } from '@/lib/persona';
import { usePersona } from './PersonaProvider';
import { t, type StringKey } from '@/lib/i18n';

const LABEL = (p: Persona) => `persona.${p}` as StringKey;
const HINT = (p: Persona) => `persona.${p}.hint` as StringKey;

/**
 * The audience lens.
 *
 * Presented as a radiogroup rather than a dropdown so the whole range is visible:
 * a reader should be able to see that a more expert view exists and reach it,
 * which is the point of a lens over a gate.
 */
export function PersonaSwitch({ compact = false }: { compact?: boolean }) {
  const { persona, setPersona } = usePersona();

  return (
    <div className={compact ? '' : 'rounded-md border border-border bg-surface p-3'}>
      {!compact && (
        <p className="label-caps mb-2">{t('persona.label')}</p>
      )}
      <div
        role="radiogroup"
        aria-label={t('persona.label')}
        className="flex flex-wrap gap-1"
      >
        {PERSONAS.map((p) => {
          const active = p === persona;
          return (
            <button
              key={p}
              type="button"
              role="radio"
              aria-checked={active}
              title={t(HINT(p))}
              onClick={() => setPersona(p)}
              className={`state-layer rounded-full border px-3 py-1 text-small font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary-container text-on-primary-container'
                  : 'border-border text-text-muted'
              }`}
            >
              {t(LABEL(p))}
            </button>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-2 text-small text-text-faint">{t('persona.description')}</p>
      )}
    </div>
  );
}
