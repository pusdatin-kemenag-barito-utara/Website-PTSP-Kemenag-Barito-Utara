import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-[100dvh] w-full flex flex-col bg-slate-50">
      {children}
    </main>
  );
}
