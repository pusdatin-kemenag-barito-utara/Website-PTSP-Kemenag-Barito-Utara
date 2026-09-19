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
  Crown,
  Copy,
  Check,
  Info,
} from "lucide-react";
import { impersonatePegawaiAction } from "@/lib/actions/admin/admin-users";
import { toast } from "sonner";

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchState = "idle" | "searching" | "found" | "not_found" | "error";

interface EmployeeResult {
  name: string;
  nip: string;
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
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setNip("");
      setState("idle");
      setEmployee(null);
      setErrorMsg("");
      setCopied(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  const handleSearch = async () => {
    const cleanNip = nip.trim();
    if (!cleanNip) {
      toast.error("Silakan masukkan NIP pegawai.");
      return;
    }

    setState("searching");
    setEmployee(null);
    setErrorMsg("");

    try {
      const data = await impersonatePegawaiAction(cleanNip);

      if (data && data.success) {
        setEmployee(data);
        setState("found");
      } else {
        const message = data?.error || "Pegawai dengan NIP tersebut tidak ditemukan.";
        setErrorMsg(message);
        setState(data?.error?.includes("tidak ditemukan") ? "not_found" : "error");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kendala koneksi ke server. Pastikan backend aktif.");
      setState("error");
    }
  };

  const handleOpen = () => {
    let target = employee?.magicLink || (employee?.nip ? `/pegawai?nip=${encodeURIComponent(employee.nip)}` : "");
    if (!target) return;

    // Bersihkan jika ada string protokol invalid atau referensi port backend
    if (target.includes("HTTP/") || target.includes(":8080")) {
      target = `/pegawai?nip=${encodeURIComponent(employee?.nip || "")}`;
    }

    // Pastikan relative path diawali dengan '/'
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
      if (!target.startsWith("/")) target = `/${target}`;
    }

    window.open(target, "_blank", "noopener,noreferrer");
    toast.success(`Membuka dashboard pegawai: ${employee?.name}`);
  };

  const handleCopyNip = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("NIP disalin ke clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && state !== "searching") {
      e.preventDefault();
      handleSearch();
    }
    if (e.key === "Escape") onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          title="Tutup Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start gap-3.5 mb-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm bg-[#059669]"
              style={{ backgroundColor: "#059669" }}
            >
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1 pr-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  Akses Dashboard Pegawai
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
                  <Crown className="h-3 w-3 text-amber-500" />
                  Super Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bypass & simulasi portal mandiri ASN untuk memantau data cuti dan laporan kinerja pegawai.
              </p>
            </div>
          </div>

          {/* NIP Input Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Nomor Induk Pegawai (NIP)
              </label>
              {nip && (
                <button
                  type="button"
                  onClick={() => {
                    setNip("");
                    setState("idle");
                    setEmployee(null);
                    inputRef.current?.focus();
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="flex gap-2.5">
              <div className="relative flex-1">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value.replace(/\D/g, ""));
                    if (state !== "idle") {
                      setState("idle");
                      setEmployee(null);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Masukkan 18 digit NIP..."
                  maxLength={18}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-sm text-slate-800 font-mono placeholder:text-slate-400 placeholder:font-sans focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 focus:bg-white outline-none transition-all shadow-2xs"
                  disabled={state === "searching"}
                />
              </div>
              <button
                type="button"
                onClick={handleSearch}
                disabled={!nip.trim() || state === "searching"}
                className="flex items-center justify-center gap-2 h-11 rounded-xl text-white px-5 text-sm font-semibold transition-all active:scale-95 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-[#059669] hover:bg-[#047857]"
                style={{
                  backgroundColor: !nip.trim() || state === "searching" ? "#94a3b8" : "#059669",
                  color: "#ffffff",
                }}
              >
                {state === "searching" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span>{state === "searching" ? "Mencari..." : "Cari Pegawai"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body / States */}
        <div className="px-6 pb-6 pt-1">
          {/* State: Found */}
          {state === "found" && employee && (
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 overflow-hidden shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="p-4 space-y-3.5">
                {/* Status Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <UserRoundCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Pegawai Terverifikasi
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyNip(employee.nip)}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 hover:text-emerald-700 bg-white border border-slate-200/80 px-2 py-0.5 rounded-md transition-colors"
                    title="Salin NIP"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <Copy className="h-3 w-3 text-slate-400" />
                    )}
                    {employee.nip}
                  </button>
                </div>

                {/* Employee Info Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-base shadow-xs bg-[#059669]"
                    style={{ backgroundColor: "#059669", color: "#ffffff" }}
                  >
                    {employee.name ? employee.name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Nama Lengkap
                    </p>
                    <p className="text-base font-bold text-slate-900 truncate leading-snug">
                      {employee.name}
                    </p>
                  </div>
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                      <Briefcase className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Jabatan
                      </p>
                      <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2">
                        {employee.jabatan || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Unit Kerja
                      </p>
                      <p className="text-xs font-semibold text-slate-800 leading-snug mt-0.5 line-clamp-2">
                        {employee.unitKerja || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 bg-slate-100/70 border-t border-slate-200/70">
                <button
                  type="button"
                  onClick={handleOpen}
                  className="w-full flex items-center justify-center gap-2 rounded-xl text-white py-3 px-4 text-sm font-bold shadow-sm transition-all active:scale-[0.98] group bg-[#059669] hover:bg-[#047857]"
                  style={{ backgroundColor: "#059669", color: "#ffffff" }}
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                  <span>Buka Dashboard Pegawai</span>
                  <ArrowRight className="h-4 w-4 text-white opacity-80 -translate-x-0.5 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                </button>
                <p className="text-[11px] text-center text-slate-400 mt-2">
                  Terbuka di tab baru tanpa mempengaruhi sesi admin Anda saat ini.
                </p>
              </div>
            </div>
          )}

          {/* State: Not Found */}
          {state === "not_found" && (
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 flex items-start gap-3.5 animate-in fade-in duration-200">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <UserRoundX className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-red-800">Pegawai Tidak Ditemukan</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  {errorMsg || `Pegawai dengan NIP "${nip}" tidak terdaftar di database.`}
                </p>
                <p className="text-[11px] text-red-500/80 mt-1">
                  Pastikan 18 digit NIP sudah sesuai atau tambahkan pegawai melalui menu Manajemen Pegawai.
                </p>
              </div>
            </div>
          )}

          {/* State: Error */}
          {state === "error" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3.5 animate-in fade-in duration-200">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-amber-900">Gagal Memproses Permintaan</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{errorMsg}</p>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="mt-2 text-xs font-bold text-amber-800 underline hover:text-amber-950"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}

          {/* State: Idle Hint */}
          {state === "idle" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 flex items-start gap-2.5 text-slate-500">
              <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <p className="font-semibold text-slate-700">Petunjuk Penggunaan:</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Masukkan NIP pegawai (contoh: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">199809202023211007</code>) untuk membuka portal mandiri pegawai secara langsung di tab baru.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
