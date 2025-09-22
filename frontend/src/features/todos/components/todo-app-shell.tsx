import type { PropsWithChildren } from "react";

export function TodoAppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Launchpad Template
            </p>
            <h1 className="text-2xl font-semibold">Todo Command Center</h1>
          </div>
          <a
            href="https://github.com/forge-labs/fullstack-launchpad"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground transition hover:text-foreground"
          >
            View on GitHub
          </a>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">{children}</main>
    </div>
  );
}
