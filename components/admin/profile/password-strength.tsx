"use client";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string; color: string; bg: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const map = [
    { label: "Sangat Lemah", color: "text-red-600", bg: "bg-red-500" },
    { label: "Lemah", color: "text-orange-600", bg: "bg-orange-500" },
    { label: "Sedang", color: "text-yellow-600", bg: "bg-yellow-500" },
    { label: "Kuat", color: "text-emerald-600", bg: "bg-emerald-500" },
    { label: "Sangat Kuat", color: "text-green-700", bg: "bg-green-600" },
  ];

  return { score, ...map[Math.min(score, 4)] };
}

const checks = [
  { key: "length", label: "Minimal 8 karakter", test: (p: string) => p.length >= 8 },
  { key: "lower", label: "Huruf kecil", test: (p: string) => /[a-z]/.test(p) },
  { key: "upper", label: "Huruf besar", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "Angka", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "Karakter khusus", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color, bg } = getStrength(password);
  const pct = (score / 5) * 100;

  return (
    <div className="space-y-3 mt-2">
      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Label */}
      <p className={`text-xs font-bold ${color}`}>{label}</p>

      {/* Checklist */}
      <ul className="space-y-1">
        {checks.map((c) => {
          const passed = c.test(password);
          return (
            <li
              key={c.key}
              className={`flex items-center gap-2 text-xs font-medium ${
                passed ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  passed
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                {passed ? (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 12 12">
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.5 6l2.5 2.5 4.5-5"
                    />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
              </span>
              {c.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
