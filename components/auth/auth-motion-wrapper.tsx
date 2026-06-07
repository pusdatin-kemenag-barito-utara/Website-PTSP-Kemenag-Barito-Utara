"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";

export function AuthCardMotion({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        type: "spring",
        bounce: 0.3,
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}

export function AuthBgMotionPemohon() {
  return (
    <>
      <m.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#059669]/30 blur-[120px]"
      />
      <m.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#5eeaa5]/20 blur-[120px]"
      />
    </>
  );
}

export function AuthBgMotionPetugas() {
  return (
    <>
      <m.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-[#0f8a54]/30 blur-[120px]"
      />
      <m.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#14b870]/20 blur-[120px]"
      />
    </>
  );
}
