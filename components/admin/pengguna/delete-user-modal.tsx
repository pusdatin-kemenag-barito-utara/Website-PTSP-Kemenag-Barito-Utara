import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteUserModal({
  deletingUser,
  isPending,
  onClose,
  onConfirm,
}: {
  deletingUser: any;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!deletingUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-slate-100"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600">
            <AlertTriangle className="h-10 w-10 animate-bounce" />
          </div>

          <h3 className="mb-2 text-xl font-black text-slate-900">
            Hapus Akun?
          </h3>
          <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
            Apakah Anda yakin ingin menghapus akun{" "}
            <span className="font-bold text-slate-900">
              {deletingUser.full_name || deletingUser.email}
            </span>
            ? Tindakan ini permanen dan tidak dapat dibatalkan.
          </p>

          <div className="flex w-full flex-col gap-3">
            <Button
              onClick={onConfirm}
              disabled={isPending}
              className="h-14 rounded-2xl bg-red-600 font-bold hover:bg-red-700 shadow-lg shadow-red-500/20"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Ya, Hapus Permanen"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="h-14 rounded-2xl font-bold text-slate-500"
            >
              Batalkan
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
