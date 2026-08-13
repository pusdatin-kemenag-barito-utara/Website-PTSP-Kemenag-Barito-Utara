import { useState, useTransition } from "react";
import {
  Check,
  Loader2,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  verifyPetugasAction,
  rejectPetugasAction,
} from "@/lib/actions/auth/register-petugas";
import { formatDate } from "@/lib/utils";
import { RoleBadge } from "./role-badge";

export function PendingUserCard({
  user,
  onVerify,
  onReject,
}: {
  user: any;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);

  const handleAction = (action: "approve" | "reject") => {
    startTransition(async () => {
      if (action === "approve") {
        const result = await verifyPetugasAction(user.id);
        if (result.error) {
          toast.error("Gagal memverifikasi", { description: result.error });
        } else {
          toast.success("Petugas Diverifikasi!", {
            description: `${user.fullName || user.email} berhasil diaktifkan sebagai petugas.`,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
          });
          onVerify(user.id);
        }
      } else {
        const result = await rejectPetugasAction(user.id);
        if (result.error) {
          toast.error("Gagal menolak", { description: result.error });
        } else {
          toast.success("Pendaftaran Ditolak", {
            description: `Akun ${user.fullName || user.email} telah dihapus dari sistem.`,
            icon: <XCircle className="h-5 w-5 text-red-500" />,
          });
          onReject(user.id);
        }
      }
      setConfirmAction(null);
    });
  };

  return (
    <div className="px-5 py-4 hover:bg-orange-50/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-black text-sm shadow-sm">
            {(user.fullName || user.email || "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 truncate">
              {user.fullName || "Tanpa Nama"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {user.phone && (
            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-white border border-orange-200 text-slate-600">
              <Phone className="h-3 w-3 text-orange-400" /> {user.phone}
            </span>
          )}
          {user.unitKerja && (
            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-white border border-orange-200 text-slate-600">
              <Building2 className="h-3 w-3 text-orange-400" /> {user.unitKerja}
            </span>
          )}
          <RoleBadge role={user.role} />
          <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-orange-100 text-orange-700 font-semibold">
            <Clock className="h-3 w-3" /> {formatDate(user.createdAt)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence mode="wait">
            {confirmAction === null ? (
              <m.div
                key="buttons"
                className="flex gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  type="button"
                  onClick={() => setConfirmAction("approve")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Terima
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction("reject")}
                  disabled={isPending}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all active:scale-95 disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Tolak
                </button>
              </m.div>
            ) : (
              <m.div
                key="confirm"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <span
                  className={`text-xs font-bold ${confirmAction === "approve" ? "text-emerald-700" : "text-red-700"}`}
                >
                  {confirmAction === "approve"
                    ? "Terima petugas ini?"
                    : "Tolak & hapus akun?"}
                </span>
                <button
                  type="button"
                  onClick={() => handleAction(confirmAction)}
                  disabled={isPending}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white transition-all active:scale-95 disabled:opacity-50 ${
                    confirmAction === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  Ya
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  disabled={isPending}
                  className="flex items-center px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                >
                  Batal
                </button>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
