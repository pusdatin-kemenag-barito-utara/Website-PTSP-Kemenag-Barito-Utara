"use client";

import { useState, useTransition, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, ShieldAlert, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { updateUserPermissionsAction } from "@/lib/actions/user-permissions";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/constants";

const MENUS = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "pengajuan", label: "Pengajuan" },
  { id: "layanan", label: "Layanan" },
  { id: "item_layanan", label: "Item Layanan" },
  { id: "form_layanan", label: "Form Layanan" },
  { id: "persyaratan", label: "Persyaratan" },
  { id: "pengguna", label: "Pengguna" },
  { id: "dokumen_hasil", label: "Dokumen Hasil" },
  { id: "surat_masuk", label: "Surat Masuk" },
  { id: "surat_keluar", label: "Surat Keluar" },
];

export function UserPermissionsModal({
  user,
  isOpen,
  onClose,
  onSave,
}: {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, perms: string[]) => void;
}) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  // Load existing permissions
  useEffect(() => {
    if (isOpen && user) {
      setPermissions(user.permissions || DEFAULT_ADMIN_PERMISSIONS);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleTogglePermission = (menuId: string) => {
    setPermissions((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId);
      }
      return [...prev, menuId];
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserPermissionsAction(user.id, permissions);

      if (result.error) {
        toast.error("Gagal menyimpan hak akses", { description: result.error });
      } else {
        toast.success("Hak Akses Diperbarui!", {
          description: `Hak akses untuk ${user.full_name || user.email} telah disimpan.`,
        });
        onSave(user.id, permissions);
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Hak Akses Petugas
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {user.full_name || user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-sm">
              <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600" />
              <p>
                Pilih menu apa saja yang boleh diakses oleh{" "}
                <b>{user.full_name || user.email}</b> di panel admin.
              </p>
            </div>

            {/* Permissions Checkboxes */}
            <div className="space-y-3">
              {MENUS.map((menu) => {
                const isChecked = permissions.includes(menu.id);
                return (
                  <label
                    key={menu.id}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                      isChecked
                        ? "border-[#1f4bb7] bg-blue-50/50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${isChecked ? "text-[#1f4bb7]" : "text-slate-700"}`}
                    >
                      Menu {menu.label}
                    </span>
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded transition-colors ${
                        isChecked
                          ? "bg-[#1f4bb7] text-white"
                          : "bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={() => handleTogglePermission(menu.id)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#1f4bb7] to-[#2557c9] hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Simpan Hak Akses
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
