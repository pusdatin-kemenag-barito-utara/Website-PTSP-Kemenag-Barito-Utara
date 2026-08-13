import { cn, getStatusTone, REQUEST_STATUS_LABELS } from '@/lib/utils';

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = getStatusTone(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide',
        tone === 'success' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
        tone === 'danger' && 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
        tone === 'warning' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
        tone === 'info' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
        tone === 'muted' && 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          tone === 'success' && 'bg-emerald-500',
          tone === 'danger' && 'bg-red-500',
          tone === 'warning' && 'bg-amber-500',
          tone === 'info' && 'bg-emerald-500',
          tone === 'muted' && 'bg-slate-400'
        )}
      />
      {REQUEST_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold',
        variant === 'default' && 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60',
        variant === 'success' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
        variant === 'danger' && 'bg-red-50 text-red-700 ring-1 ring-red-200/60',
        variant === 'warning' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
        variant === 'info' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60',
        className
      )}
    >
      {children}
    </span>
  );
}
