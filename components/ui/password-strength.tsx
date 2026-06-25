"use client";

import React from "react";

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: "Lemah", color: "bg-rose-500", text: "text-rose-500" };
    if (score <= 4) return { score: 2, label: "Sedang", color: "bg-amber-500", text: "text-amber-500" };
    return { score: 3, label: "Kuat", color: "bg-emerald-500", text: "text-emerald-500" };
  };

  const strength = getStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1 h-1.5 w-full">
        <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 1 ? strength.color : "bg-slate-200"}`} />
        <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 2 ? strength.color : "bg-slate-200"}`} />
        <div className={`h-full flex-1 rounded-full transition-colors ${strength.score >= 3 ? strength.color : "bg-slate-200"}`} />
      </div>
      <p className={`text-[10px] font-semibold text-right ${strength.text}`}>
        {strength.label}
      </p>
    </div>
  );
}
