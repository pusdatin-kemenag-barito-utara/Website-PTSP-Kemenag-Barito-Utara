import React from "react";
import { Check, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
  showCriteria?: boolean;
  minChar?: number;
}

export function PasswordStrength({ 
  password, 
  showCriteria = true,
  minChar = 6 
}: PasswordStrengthProps) {
  if (!password) return null;

  const hasMinLength = password.length >= minChar;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Hitung kriteria terpenuhi
  let criteriaCount = 0;
  if (hasMinLength) criteriaCount++;
  if (hasLower && hasUpper) criteriaCount++;
  else if (hasLower || hasUpper) criteriaCount += 0.5;
  if (hasNumber) criteriaCount++;
  if (hasSpecial) criteriaCount++;
  if (password.length >= 8) criteriaCount += 0.5;

  let score = 1;
  let label = "Sangat Lemah";
  let color = "bg-rose-500";
  let textColor = "text-rose-500 dark:text-rose-400";

  if (!hasMinLength) {
    score = 1;
    label = `Min. ${minChar} Karakter`;
    color = "bg-rose-500";
    textColor = "text-rose-500 dark:text-rose-400";
  } else if (criteriaCount < 2) {
    score = 1;
    label = "Sangat Lemah";
    color = "bg-rose-500";
    textColor = "text-rose-500 dark:text-rose-400";
  } else if (criteriaCount < 3) {
    score = 2;
    label = "Lemah";
    color = "bg-amber-500";
    textColor = "text-amber-500 dark:text-amber-400";
  } else if (criteriaCount < 4) {
    score = 3;
    label = "Sedang";
    color = "bg-yellow-500";
    textColor = "text-yellow-600 dark:text-yellow-400";
  } else {
    score = 4;
    label = "Sangat Kuat";
    color = "bg-emerald-500";
    textColor = "text-emerald-600 dark:text-emerald-400";
  }

  const checklist = [
    { label: `Min. ${minChar} karakter`, valid: hasMinLength },
    { label: "Huruf besar & kecil", valid: hasLower && hasUpper },
    { label: "Angka (0-9)", valid: hasNumber },
    { label: "Simbol unik", valid: hasSpecial },
  ];

  return (
    <div className="space-y-2 mt-2 pt-1 transition-all duration-300">
      {/* Bar meter dengan 4 segmen */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Kekuatan Password:
          </span>
          <span className={`text-[11px] font-bold tracking-tight transition-colors duration-200 flex items-center gap-1 ${textColor}`}>
            {score >= 3 ? <ShieldCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {label}
          </span>
        </div>

        {/* 4-segment animated indicator */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
          {[1, 2, 3, 4].map((step) => {
            const isActive = score >= step;
            return (
              <div
                key={step}
                className={`h-full rounded-full transition-all duration-300 ${
                  isActive ? color : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive checklist badges */}
      {showCriteria && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {checklist.map((item, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                item.valid
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 font-semibold shadow-xs"
                  : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800/50"
              }`}
            >
              {item.valid ? (
                <Check className="h-2.5 w-2.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in duration-150" />
              ) : (
                <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              )}
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
