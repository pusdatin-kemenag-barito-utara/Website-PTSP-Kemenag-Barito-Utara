import Link from "@/lib/next-compat/link";
import { ChevronRight } from "lucide-react";

export function AdminQuickLinks({ quickMenus }: { quickMenus: any[] }) {
  return (
    <div className="space-y-2.5">
      <h2 className="text-sm font-bold text-slate-800">
        Akses Cepat Menu
      </h2>

      <div className="rounded-xl border border-slate-200/70 bg-white shadow-sm overflow-hidden p-1.5">
        <div className="flex flex-col gap-0.5">
          {quickMenus.map((menu: any) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-all hover:bg-slate-50 active:bg-slate-100"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${menu.bg} ${menu.color} transition-transform group-hover:scale-105`}
                >
                  <menu.icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                  {menu.label}
                </span>
              </div>
              <div className="flex h-5 w-5 items-center justify-center rounded-full text-slate-400 group-hover:text-slate-700">
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
