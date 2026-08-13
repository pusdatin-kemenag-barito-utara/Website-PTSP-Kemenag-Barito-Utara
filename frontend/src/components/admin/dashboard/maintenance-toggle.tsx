import { useState, useTransition } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  Power,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Globe,
  ServerCrash,
} from "lucide-react";
import { toast } from "sonner";
import { toggleMaintenanceAction } from "@/lib/actions/system/maintenance";

interface MaintenanceToggleProps {
  initialEnabled: boolean;
  initialMessage: string;
  startedAt: string | null;
  startedByName: string | null;
}

export function MaintenanceToggle({
  initialEnabled,
  initialMessage,
  startedAt,
  startedByName,
}: MaintenanceToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleToggle = () => {
    if (!enabled) {
      // Activating — show confirmation
      setShowConfirm(true);
    } else {
      // Deactivating — proceed directly
      executeToggle(false);
    }
  };

  const executeToggle = (newState: boolean) => {
    startTransition(async () => {
      const result = await toggleMaintenanceAction(newState, message);
      if (result.success) {
        setEnabled(newState);
        toast.success(newState ? "Mode Pemeliharaan Aktif" : "Mode Pemeliharaan Dinonaktifkan", {
          description: result.message,
        });
      } else {
        toast.error("Gagal", { description: result.error });
      }
      setShowConfirm(false);
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 ${
          enabled
            ? "border-red-200 bg-gradient-to-br from-red-50 to-orange-50"
            : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
        }`}
      >
        {/* Animated background pulse when active */}
        {enabled && (
          <m.div
            className="absolute inset-0 bg-red-100/30"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <m.div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg ${
                  enabled
                    ? "bg-red-500 text-white shadow-red-200"
                    : "bg-emerald-500 text-white shadow-emerald-200"
                }`}
                animate={enabled ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {enabled ? (
                  <ServerCrash className="h-8 w-8" />
                ) : (
                  <Globe className="h-8 w-8" />
                )}
              </m.div>
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Status Website
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex h-2.5 w-2.5 rounded-full ${
                      enabled ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={`text-sm font-bold ${
                      enabled ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {enabled ? "Dalam Pemeliharaan" : "Online — Berjalan Normal"}
                  </span>
                </div>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={`group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-wider transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                enabled
                  ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200"
                  : "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
              }`}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Power className="h-5 w-5" />
              )}
              {enabled ? "Nonaktifkan" : "Aktifkan Pemeliharaan"}
            </button>
          </div>

          {/* Active info */}
          {enabled && startedAt && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-bold text-red-700/70">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Aktif sejak: {new Date(startedAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</span>
              </div>
              {startedByName && (
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  <span>Oleh: {startedByName}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom Message */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-slate-400" />
          Pesan Pemeliharaan
        </h3>
        <p className="text-xs text-slate-500 font-medium mb-3 leading-relaxed">
          Pesan ini akan ditampilkan kepada pengunjung saat mode pemeliharaan aktif.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 transition-all resize-none placeholder:text-slate-400"
          placeholder="Tulis pesan pemeliharaan..."
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800 mb-1">Tetap Bisa Diakses</p>
              <ul className="text-[11px] text-emerald-700/80 space-y-1 font-medium leading-relaxed">
                <li>• Panel Admin (/admin/*)</li>
                <li>• Login Admin (/login/petugas)</li>
                <li>• API Internal (Sistem)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-1">Akan Diblokir (Dialihkan)</p>
              <ul className="text-[11px] text-amber-700/80 space-y-1 font-medium leading-relaxed">
                <li>• Seluruh Halaman Publik</li>
                <li>• Login Pemohon & Register</li>
                <li>• Dashboard Pemohon</li>
                <li>• Form Layanan & Buku Tamu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isPending && setShowConfirm(false)}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="flex justify-center mb-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">
                  Aktifkan Mode Pemeliharaan?
                </h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Seluruh halaman publik website PTSP akan menampilkan halaman
                  pemeliharaan. Pengunjung tidak akan bisa mengakses layanan publik.
                </p>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={isPending}
                  className="flex-1 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => executeToggle(true)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Power className="h-4 w-4" />
                  )}
                  Ya, Aktifkan
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
