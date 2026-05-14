import * as React from 'react';
import { cn } from '@/lib/utils';

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-200',
        'hover:border-slate-400',
        'focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 focus:shadow-md focus:shadow-emerald-500/5',
        'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
        props.className
      )}
    />
  );
}
