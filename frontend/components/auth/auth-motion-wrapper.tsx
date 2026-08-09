"use client";

import type { ReactNode } from "react";

export function AuthCardMotion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function AuthPageSwipeMotion({
  children,
}: {
  children: ReactNode;
  direction?: "left" | "right";
}) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row min-h-screen relative">
      {children}
    </div>
  );
}

export function AuthBgMotionPemohon() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#059669]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#5eeaa5]/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-yellow-300/10 blur-[100px]" />
    </>
  );
}

export function AuthBgMotionPetugas() {
  return (
    <>
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#0f8a54]/30 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#14b870]/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-teal-300/10 blur-[100px]" />
    </>
  );
}

