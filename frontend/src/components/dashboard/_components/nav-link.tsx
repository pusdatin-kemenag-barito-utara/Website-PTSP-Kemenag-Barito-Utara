import Link from "@/lib/next-compat/link";
import { ChevronRight } from "lucide-react";
import type { NavItem } from "@/lib/navigation";

export function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-200 ${
        isActive
          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:shadow-none"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-white/20 text-white"
            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-slate-800 dark:group-hover:text-slate-100 shadow-2xs"
        }`}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && <ChevronRight className="h-4 w-4 opacity-70 shrink-0" />}
    </Link>
  );
}
