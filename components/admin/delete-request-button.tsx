"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteRequestAction } from "@/lib/actions/admin-requests";

export function DeleteRequestButton({ requestId }: { requestId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (formData: FormData) => {
    setIsDeleting(true);
    // No try-catch here because redirect() throws a special error
    // that should NOT be caught if we want the redirect to work.
    await deleteRequestAction(formData);
    // If it reaches here, it might have failed without throwing,
    // but usually redirect() will stop execution.
  };

  return (
    <>
      {/* Main Button */}
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 active:scale-[0.98] border-none"
      >
        <Trash2 className="h-4 w-4 mr-2.5 animate-pulse" />
        Hapus Pengajuan Permanen
      </Button>

      {/* Premium Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => !isDeleting && setIsOpen(false)}
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-md transform overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95 border border-slate-100">
            {/* Decoration */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-red-50 opacity-50" />

            <div className="relative flex flex-col items-center text-center">
              {/* Icon Container */}
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-600 shadow-inner ring-8 ring-red-50/50">
                <AlertTriangle className="h-10 w-10 animate-bounce" />
              </div>

              <h3 className="mb-2 text-xl font-black text-slate-900">
                Konfirmasi Penghapusan
              </h3>
              <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
                Apakah Anda yakin ingin menghapus pengajuan ini?
                <span className="block mt-2 font-bold text-red-600">
                  Seluruh data dan berkas di Google Drive akan ikut terhapus
                  permanen dan tidak bisa dikembalikan.
                </span>
              </p>

              <div className="flex w-full flex-col gap-3">
                <form action={handleDelete}>
                  <input type="hidden" name="request_id" value={requestId} />
                  <Button
                    type="submit"
                    disabled={isDeleting}
                    className="w-full h-14 rounded-2xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 shadow-xl shadow-red-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sedang Menghapus...
                      </>
                    ) : (
                      "Ya, Hapus Sekarang"
                    )}
                  </Button>
                </form>

                <Button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  className="h-14 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                >
                  Batalkan
                </Button>
              </div>
            </div>

            {/* Close Button */}
            {!isDeleting && (
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
