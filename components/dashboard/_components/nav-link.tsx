import Link from "next/link";
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
      className={`group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-[#059669] to-[#047857] text-white shadow-md shadow-emerald-500/20"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-white/20 shadow-sm shadow-white/10"
            : "bg-slate-100/80 group-hover:bg-white group-hover:shadow-sm"
        }`}
      >
        <Icon
          className={`h-3.5 w-3.5 ${
            isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
          }`}
        />
      </span>
      <span className="flex-1 leading-tight truncate">{item.label}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />}
    </Link>
  );
}
