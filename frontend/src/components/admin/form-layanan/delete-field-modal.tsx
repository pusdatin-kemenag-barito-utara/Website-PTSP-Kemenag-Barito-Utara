import { motion as m, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export function DeleteFieldModal({
  deletingField,
  isPending,
  onClose,
  onConfirm,
}: {
  deletingField: any | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {deletingField && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-3xl shadow-2xl z-[60] overflow-hidden p-6 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 mb-4 ring-8 ring-rose-50">
              <AlertTriangle className="h-8 w-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800">Hapus Field?</h3>
            <p className="text-sm font-medium text-slate-500 mt-2 mb-6">
              Anda yakin ingin menghapus field{" "}
              <span className="font-bold text-slate-800">
                "{deletingField.label}"
              </span>
              ? Aksi ini tidak dapat dibatalkan.
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isPending}
                className="w-full flex justify-center items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 hover:shadow-md hover:shadow-rose-600/25 transition-all active:scale-95 disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Ya, Hapus Permanen
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="w-full px-5 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-70"
              >
                Batal
              </button>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
