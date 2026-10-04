import React, { useId, useRef, useState, useSyncExternalStore } from 'react';
import { apiSession, type ApiSession } from '../api/session';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
    <main className="h-screen w-screen overflow-y-auto bg-background p-6 text-foreground flex">
      <section className="m-auto w-full max-w-md rounded-lg border border-border bg-card p-6 space-y-5">
        <div role="status"><h1 className="text-lg font-semibold">Launcher disconnected</h1></div>
        {allowDevelopmentEntry ? (
          <form onSubmit={connect} className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter the session token configured for the development server.</p>
            <div className="space-y-2">
              <label htmlFor={inputId} className="block text-sm font-medium">Session token</label>
              <Input id={inputId} ref={input} type="password" autoComplete="off" spellCheck={false} />
            </div>
            <Button type="submit">Connect</Button>
            {invalidEntry && <p role="alert" className="rounded-md border border-destructive bg-background p-3 text-sm text-red-300">Enter a valid session token.</p>}
          </form>
        ) : <p className="text-sm leading-relaxed text-muted-foreground">Relaunch the native Penguin Launcher to reconnect.</p>}
      </section>
    </main>
  );
}
