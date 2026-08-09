import type { ReactNode } from "react";
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/40 px-4 py-10">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.92_0.04_250_/_0.7),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,oklch(0.3_0.04_250_/_0.35),transparent_42%)]"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </main>
  );
}
