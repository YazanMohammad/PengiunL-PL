export type ApiSessionSnapshot = Readonly<{ connected: boolean; generation: number }>;
export type SessionEnvironment = {
  location: Pick<Location, 'hash' | 'pathname' | 'search'>;
  history: Pick<History, 'replaceState'>;
  storage: () => Storage;
};
export interface ApiSession {
  initialize(): void;
  connect(token: string): boolean;
  getCredential(): string | null;
  getSnapshot(): ApiSessionSnapshot;
  subscribe(listener: () => void): () => void;
  invalidate(generation: number): void;
}

const STORAGE_KEY = 'penguin.api.session';
// A 32-byte unpadded encoding has two zero padding bits in its last character.
const canonicalToken = (token: string) => /^[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]$/.test(token);

export function createApiSession(environment: SessionEnvironment): ApiSession {
  let initialized = false;
  let scrubbingFailed = false;
  let credential: string | null = null;
  let snapshot: ApiSessionSnapshot = Object.freeze({ connected: false, generation: 0 });
  const listeners = new Set<() => void>();

  function persist(token: string | null) {
    try {
      const storage = environment.storage();
      if (token === null) storage.removeItem(STORAGE_KEY);
      else storage.setItem(STORAGE_KEY, token);
    } catch {
      // Storage is optional; never propagate errors that can include credentials.
    }
  }

  function transition(token: string | null) {
    credential = token;
    persist(token);
    snapshot = Object.freeze({ connected: token !== null, generation: snapshot.generation + 1 });
    listeners.forEach(listener => listener());
  }

  const session: ApiSession = {
    initialize() {
      if (initialized) return;
      initialized = true;
      const entries = environment.location.hash.replace(/^#/, '').split('&');
      const fragments = entries.filter(entry => {
        const key = entry.split('=', 1)[0];
        try { return decodeURIComponent(key) === 'penguin-session'; }
        catch { return key.startsWith('penguin-session'); }
      });
      if (fragments.length > 0) {
        try {
          environment.history.replaceState(null, '', environment.location.pathname + environment.location.search);
        } catch {
          scrubbingFailed = true;
          transition(null);
          return;
        }
        const fragment = fragments[0];
        const token = fragment.slice(fragment.indexOf('=') + 1);
        if (fragments.length === 1 && fragment.startsWith('penguin-session=') && canonicalToken(token)) {
          transition(token);
        } else transition(null);
        return;
      }
      let stored: string | null = null;
      try { stored = environment.storage().getItem(STORAGE_KEY); } catch { /* Optional storage. */ }
      if (stored !== null) {
        if (canonicalToken(stored)) transition(stored);
        else transition(null);
      }
    },
    connect(token) {
      initialized = true;
      if (scrubbingFailed || !canonicalToken(token)) {
        transition(null);
        return false;
      }
      transition(token);
      return true;
    },
    getCredential() { return credential; },
    getSnapshot() { return snapshot; },
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    invalidate(generation) {
      if (generation === snapshot.generation) transition(null);
    },
  };
  return session;
}

export const apiSession = createApiSession({
  location: window.location,
  history: window.history,
  storage: () => window.sessionStorage,
});
