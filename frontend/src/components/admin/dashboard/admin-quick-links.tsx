import Link from "@/lib/next-compat/link";
import { ChevronRight } from "lucide-react";

export function AdminQuickLinks({ quickMenus }: { quickMenus: any[] }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
        Akses Cepat Menu
      </h2>

      <div className="rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden p-2">
        <div className="flex flex-col gap-1">
          {quickMenus.map((menu: any) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group flex items-center justify-between rounded-xl p-3 transition-all hover:bg-slate-50 active:bg-slate-100"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${menu.bg} ${menu.color} transition-transform group-hover:scale-105`}
                >
                  <menu.icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                  {menu.label}
                </span>
              </div>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-sm">
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
