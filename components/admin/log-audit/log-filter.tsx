"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export function LogAuditFilter({ initialQ, initialAction }: { initialQ: string; initialAction: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);
  const [action, setAction] = useState(initialAction);
  const debouncedQ = useDebounce(q, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQ) params.set("q", debouncedQ);
    else params.delete("q");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [debouncedQ]);

  const handleActionChange = (newAction: string) => {
    setAction(newAction);
    const params = new URLSearchParams(searchParams.toString());
    if (newAction && newAction !== "all") params.set("action", newAction);
    else params.delete("action");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <div className="relative flex-1 group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#059669] transition-colors" />
        <Input
          placeholder="Cari nama petugas, email, atau objek..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 h-11 bg-slate-50/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-500/20 font-medium text-sm transition-all"
        />
        {q && (
          <button 
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-48 group">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#059669] transition-colors" />
          <select
            value={action}
            onChange={(e) => handleActionChange(e.target.value)}
            className="w-full pl-10 pr-4 h-11 bg-slate-50/50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-bold text-[11px] uppercase tracking-wider text-slate-600 cursor-pointer appearance-none outline-none transition-all"
          >
            <option value="all">Semua Aksi</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="VERIFY">Verify</option>
            <option value="REJECT">Reject</option>
            <option value="APPROVE">Approve</option>
            <option value="STATUS_CHANGE">Status Change</option>
          </select>
        </div>
      </div>
    </div>
  );
}
