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
      <span className={`block text-sm font-medium text-slate-700 ${labelClassName || ""}`}>
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? (
        <span className="block text-xs text-slate-400 leading-relaxed">{hint}</span>
      ) : null}
    </label>
  );
}
