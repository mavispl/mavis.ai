'use client';

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import {
  DEFAULT_PERSONA, PERSONA_ATTR, PERSONA_STORAGE_KEY, isPersona, type Persona,
} from '@/lib/persona';

interface PersonaContextValue {
  persona: Persona;
  setPersona: (p: Persona) => void;
  /** Bumped whenever the persona changes, so blocks can drop manual overrides. */
  epoch: number;
  /** False until the stored persona has been read; used to defer transitions. */
  ready: boolean;
}

const PersonaContext = createContext<PersonaContextValue>({
  persona: DEFAULT_PERSONA,
  setPersona: () => {},
  epoch: 0,
  ready: false,
});

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  // Always start at the default so the first client render matches the
  // prerendered HTML exactly. The stored value is adopted in the effect below.
  const [persona, setPersonaState] = useState<Persona>(DEFAULT_PERSONA);
  const [epoch, setEpoch] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(PERSONA_STORAGE_KEY);
    } catch {
      /* storage blocked — the default persona is a perfectly good page */
    }
    if (isPersona(stored) && stored !== DEFAULT_PERSONA) {
      setPersonaState(stored);
      setEpoch((n) => n + 1);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(PERSONA_ATTR, persona);
  }, [persona]);

  const setPersona = useCallback((next: Persona) => {
    setPersonaState(next);
    setEpoch((n) => n + 1);
    try {
      window.localStorage.setItem(PERSONA_STORAGE_KEY, next);
    } catch {
      /* the switch still works for this session */
    }
  }, []);

  const value = useMemo(
    () => ({ persona, setPersona, epoch, ready }),
    [persona, setPersona, epoch, ready],
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export const usePersona = () => useContext(PersonaContext);
