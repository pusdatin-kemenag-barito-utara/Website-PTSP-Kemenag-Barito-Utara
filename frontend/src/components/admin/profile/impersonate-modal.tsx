import { getClientApiBase, getClientAuthToken } from "@/lib/client-api";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Loader2,
  ExternalLink,
  X,
  ShieldCheck,
  Building2,
  Briefcase,
  Hash,
  AlertCircle,
  UserRoundX,
  UserRoundCheck,
  ArrowRight,
} from "lucide-react";

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchState = "idle" | "searching" | "found" | "not_found" | "error";

interface EmployeeResult {
  name: string;
  jabatan: string;
  unitKerja: string;
  role: string;
  magicLink: string;
}

export function ImpersonateModal({ open, onOpenChange }: ImpersonateModalProps) {
  const [nip, setNip] = useState("");
  const [state, setState] = useState<SearchState>("idle");
  const [employee, setEmployee] = useState<EmployeeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNip("");
      setState("idle");
      setEmployee(null);
      setErrorMsg("");
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const handleSearch = async () => {
    if (!nip.trim()) return;
    setState("searching");
    setEmployee(null);
    setErrorMsg("");

    try {
      const res = await fetch(`${getClientApiBase()}/admin/impersonate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getClientAuthToken()
            ? { Authorization: `Bearer ${getClientAuthToken()}` }
            : {}),
        },
        body: JSON.stringify({ nip: nip.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setEmployee(data);
        setState("found");
      } else {
        setErrorMsg(data.error ?? "Pegawai tidak ditemukan.");
        setState(res.status === 404 ? "not_found" : "error");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setState("error");
    }
  };

  const handleOpen = () => {
    if (!employee?.magicLink) return;
    window.open(employee.magicLink, "_blank", "noopener,noreferrer");
    // Reset to allow opening another employee
    setNip("");
    setState("idle");
    setEmployee(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && state !== "searching") handleSearch();
    if (e.key === "Escape") onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#064e3b] to-[#059669] shadow-lg shadow-emerald-500/25">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Akses Dashboard Pegawai</h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-tight">Masukkan NIP untuk memantau akun pegawai</p>
            </div>
          </div>

          {/* NIP Input */}
          <div className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Nomor Induk Pegawai (NIP)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                    if (state !== "idle") {
                      setState("idle");
                      setEmployee(null);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="198001012010011001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-3 text-sm text-slate-800 font-mono placeholder:text-slate-300 placeholder:font-sans focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/10 focus:bg-white outline-none transition-all"
                  disabled={state === "searching"}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={!nip.trim() || state === "searching"}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] disabled:bg-slate-100 disabled:text-slate-400 text-white px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 shrink-0 shadow-sm shadow-emerald-500/20"
              >
                {state === "searching" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {state === "searching" ? "Mencari..." : "Cari"}
              </button>
            </div>
          </div>
        </div>

        {/* Result Area */}
        <div className="px-6 pb-6">
          {/* State: Found */}
          {state === "found" && employee && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
              {/* Employee card */}
              <div className="p-4 space-y-3">
                {/* Name */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                    <UserRoundCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nama Pegawai</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{employee.name}</p>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                <div className="grid grid-cols-2 gap-3">
                  {/* Jabatan */}
                  <div className="flex items-start gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jabatan</p>
                      <p className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">{employee.jabatan}</p>
                    </div>
                  </div>
                  {/* Unit Kerja */}
                  <div className="flex items-start gap-2">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unit Kerja</p>
                      <p className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">{employee.unitKerja}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={handleOpen}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#064e3b] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white py-3 text-sm font-bold transition-all active:scale-[0.98] group"
              >
                <ExternalLink className="h-4 w-4" />
                Buka Dashboard Pegawai
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          )}

          {/* State: Not Found */}
          {state === "not_found" && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <UserRoundX className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Pegawai Tidak Ditemukan</p>
                <p className="text-xs text-red-500 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* State: Error */}
          {state === "error" && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Terjadi Kesalahan</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* State: Idle hint */}
          {state === "idle" && (
            <div className="flex items-center gap-2 text-slate-400 py-1">
              <div className="h-px flex-1 bg-slate-100" />
              <p className="text-[10px] font-medium whitespace-nowrap">Dapat dibuka di banyak tab sekaligus</p>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
