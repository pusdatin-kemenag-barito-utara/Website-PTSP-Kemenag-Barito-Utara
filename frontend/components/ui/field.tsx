import type { ReactNode } from 'react';

export function Field({
  label,
  required,
  hint,
  children,
  className,
  labelClassName
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <label className={`block space-y-1.5 ${className || ""}`}>
      <span className={`block text-sm font-bold text-slate-800 dark:text-slate-100 ${labelClassName || ""}`}>
        {label}
        {required ? <span className="ml-1 text-rose-500 font-extrabold">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs text-slate-400 dark:text-slate-500 leading-relaxed">{hint}</span>
      ) : null}
    </label>
  );
}
