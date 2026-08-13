import { useState, useTransition, useEffect } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Loader2,
  ShieldAlert,
  KeyRound,
  LayoutDashboard,
  FolderKanban,
  FileOutput,
  FileText,
  Inbox,
  Send,
  Users,
  History,
  Database,
  BookOpen,
  Calendar,
  Mail,
  Construction,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserPermissionsAction } from "@/lib/actions/admin/admin-users";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/constants";

const MENU_GROUPS = [
  {
    name: "Utama",
    menus: [
      { id: "ringkasan", label: "Ringkasan", icon: LayoutDashboard },
      { id: "pengajuan", label: "Pengajuan", icon: FolderKanban },
      { id: "dokumen_hasil", label: "Dokumen Hasil", icon: FileOutput },
    ],
  },
  {
    name: "Master Data",
    menus: [{ id: "layanan", label: "Manajemen Layanan", icon: FileText }],
  },
  {
    name: "Layanan Publik",
    menus: [
      { id: "buku_tamu", label: "Monitoring Buku Tamu", icon: BookOpen },
      { id: "janji_temu", label: "Monitoring Janji Temu", icon: Calendar },
      { id: "saran_pengaduan", label: "Saran & Pengaduan", icon: Mail },
    ],
  },
  {
    name: "Tata Naskah",
    menus: [
      { id: "surat_masuk", label: "Surat Masuk", icon: Inbox },
      { id: "surat_keluar", label: "Surat Keluar", icon: Send },
    ],
  },
  {
    name: "Kepegawaian",
    menus: [
      { id: "manajemen_pegawai", label: "Manajemen Pegawai", icon: Users },
      { id: "e_laporan_kinerja", label: "E-Laporan Kinerja", icon: FileText },
    ],
  },
  {
    name: "Sistem",
    menus: [
      { id: "pengguna", label: "Manajemen Pengguna", icon: Users },
      { id: "log_audit", label: "Log Audit Aktivitas", icon: History },
      {
        id: "pemeliharaan_storage",
        label: "Pemeliharaan Storage",
        icon: Database,
      },
      {
        id: "mode_pemeliharaan",
        label: "Mode Pemeliharaan",
        icon: Construction,
      },
    ],
  },
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
          description: `Hak akses untuk ${user.fullName || user.email} telah disimpan.`,
        });
        onSave(user.id, permissions);
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4"
      >
        <m.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                  Pengaturan Izin
                </h3>
                <p className="text-sm text-slate-500 font-bold">
                  {user.fullName || user.email}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-90"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-sm">
              <ShieldAlert className="h-6 w-6 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Pemberian Akses Petugas</p>
                <p className="text-xs text-emerald-700/80 leading-relaxed">
                  Pilih menu yang dapat diakses oleh petugas ini. Admin dengan
                  izin terbatas hanya akan melihat menu yang dicentang pada
                  sidebar mereka.
                </p>
              </div>
            </div>

            {/* Menu Sections */}
            <div className="space-y-8">
              {MENU_GROUPS.map((group: any) => (
                <div key={group.name} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {group.name}
                    </span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.menus.map((menu: any) => {
                      const isChecked = permissions.includes(menu.id);
                      const Icon = menu.icon;
                      return (
                        <div
                          key={menu.id}
                          onClick={() => handleTogglePermission(menu.id)}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer group select-none ${
                            isChecked
                              ? "border-[#059669] bg-emerald-50/30"
                              : "border-slate-50 bg-slate-50/50 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl transition-colors ${isChecked ? "bg-emerald-100 text-[#059669]" : "bg-white text-slate-400"}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`text-xs font-bold ${isChecked ? "text-[#059669]" : "text-slate-600"}`}
                            >
                              {menu.label}
                            </span>
                          </div>

                          {/* Toggle Switch */}
                          <div
                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isChecked ? "bg-[#059669]" : "bg-slate-200"}`}
                          >
                            <m.div
                              animate={{ x: isChecked ? 20 : 2 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                              }}
                              className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-8 py-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-200 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#059669] to-[#047857] shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Simpan Hak Akses
            </button>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
