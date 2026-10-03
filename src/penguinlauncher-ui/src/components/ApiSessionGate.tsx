import React, { useId, useRef, useState, useSyncExternalStore } from 'react';
import { apiSession, type ApiSession } from '../api/session';

export type ApiSessionGateProps = {
  children: React.ReactNode;
  session?: ApiSession;
  allowDevelopmentEntry?: boolean;
};

export function ApiSessionGate({
  children,
  session = apiSession,
  allowDevelopmentEntry = false,
}: ApiSessionGateProps): React.ReactElement {
  const snapshot = useSyncExternalStore(session.subscribe, session.getSnapshot);
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [invalidEntry, setInvalidEntry] = useState(false);

  if (snapshot.connected) return <>{children}</>;

  function connect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = input.current?.value ?? '';
    if (input.current) input.current.value = '';
    setInvalidEntry(!session.connect(token));
  }

  return (
    <main className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground">
      <h1>Launcher disconnected</h1>
      {allowDevelopmentEntry ? (
        <form onSubmit={connect}>
          <p>Enter the session token configured for the development server.</p>
          <label htmlFor={inputId}>Session token</label>
          <input id={inputId} ref={input} type="password" autoComplete="off" spellCheck={false} />
          <button type="submit">Connect</button>
          {invalidEntry && <p role="alert">Enter a valid session token.</p>}
        </form>
      ) : <p>Relaunch the native Penguin Launcher to reconnect.</p>}
    </main>
  );
}
