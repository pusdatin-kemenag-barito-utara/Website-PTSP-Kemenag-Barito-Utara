import { useState, useTransition, useEffect, useMemo } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Loader2,
  KeyRound,
  LayoutDashboard,
  FolderKanban,
  FileOutput,
  FileText,
  Users,
  Database,
  BookOpen,
  Calendar,
  CalendarCheck,
  UserCog,
  BadgeCheck,
  Search,
  RotateCcw,
  CheckCheck,
  Eye,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import { updateUserPermissionsAction } from "@/lib/actions/admin/admin-users";
import { DEFAULT_ADMIN_PERMISSIONS } from "@/lib/constants";

export type ActionType = "read" | "create" | "update" | "delete" | "approve";

export interface PermissionAction {
  id: ActionType;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  activeColor: string;
  activeBg: string;
  activeBorder: string;
}

const ACTION_CONFIGS: Record<ActionType, PermissionAction> = {
  read: {
    id: "read",
    label: "Lihat",
    shortLabel: "R",
    icon: Eye,
    activeColor: "text-emerald-700",
    activeBg: "bg-emerald-50",
    activeBorder: "border-emerald-300",
  },
  create: {
    id: "create",
    label: "Tambah",
    shortLabel: "C",
    icon: Plus,
    activeColor: "text-sky-700",
    activeBg: "bg-sky-50",
    activeBorder: "border-sky-300",
  },
  update: {
    id: "update",
    label: "Ubah",
    shortLabel: "U",
    icon: Pencil,
    activeColor: "text-amber-700",
    activeBg: "bg-amber-50",
    activeBorder: "border-amber-300",
  },
  delete: {
    id: "delete",
    label: "Hapus",
    shortLabel: "D",
    icon: Trash2,
    activeColor: "text-rose-700",
    activeBg: "bg-rose-50",
    activeBorder: "border-rose-300",
  },
  approve: {
    id: "approve",
    label: "Setujui",
    shortLabel: "A",
    icon: CheckCircle2,
    activeColor: "text-purple-700",
    activeBg: "bg-purple-50",
    activeBorder: "border-purple-300",
  },
};

export interface PermissionModule {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  actions: ActionType[];
}

export interface PermissionGroup {
  name: string;
  icon: React.ElementType;
  modules: PermissionModule[];
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: "Utama",
    icon: LayoutDashboard,
    modules: [
      {
        id: "ringkasan",
        label: "Ringkasan Dashboard",
        description: "Statistik permohonan, grafik layanan, dan pemantauan aktivitas sistem terkini",
        icon: LayoutDashboard,
        actions: ["read"],
      },
    ],
  },
  {
    name: "Layanan Masyarakat",
    icon: FolderKanban,
    modules: [
      {
        id: "pengajuan_masyarakat",
        label: "Pengajuan Masyarakat",
        description: "Kelola permohonan izin, rekomendasi, dan berkas persyaratan dari masyarakat",
        icon: FolderKanban,
        actions: ["read", "create", "update", "delete", "approve"],
      },
      {
        id: "dokumen_hasil_masyarakat",
        label: "Dokumen Hasil (Masyarakat)",
        description: "Penerbitan SK digital, surat keterangan, dan pengarsipan hasil layanan warga",
        icon: FileOutput,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "layanan",
        label: "Pengaturan Layanan Masyarakat",
        description: "Kelola katalog layanan, persyaratan berkas, formulir, dan alur permohonan publik",
        icon: FileText,
        actions: ["read", "create", "update", "delete"],
      },
    ],
  },
  {
    name: "Layanan Pegawai",
    icon: CalendarCheck,
    modules: [
      {
        id: "pengajuan_pegawai",
        label: "Pengajuan Pegawai (ASN)",
        description: "Permohonan usul dinas, surat izin, dan permohonan administrasi internal pegawai",
        icon: FolderKanban,
        actions: ["read", "create", "update", "delete", "approve"],
      },
      {
        id: "dokumen_hasil_pegawai",
        label: "Dokumen Hasil (Pegawai)",
        description: "Penerbitan surat tugas, SK cuti, dan arsip dokumen resmi kepegawaian",
        icon: FileOutput,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "layanan_asn",
        label: "Pengaturan Layanan Pegawai",
        description: "Konfigurasi katalog SOP dan formulir pengajuan khusus internal ASN Kemenag",
        icon: Users,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "manajemen_pegawai",
        label: "Manajemen Cuti Pegawai",
        description: "Verifikasi pengajuan cuti, perhitungan saldo kuota cuti tahunan, dan rekapitulasi",
        icon: CalendarCheck,
        actions: ["read", "create", "update", "delete", "approve"],
      },
    ],
  },
  {
    name: "Layanan Publik",
    icon: BookOpen,
    modules: [
      {
        id: "buku_tamu",
        label: "Buku Tamu Digital",
        description: "Pencatatan dan monitoring kehadiran tamu kunjungan langsung ke kantor Kemenag",
        icon: BookOpen,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "janji_temu",
        label: "Janji Temu Pejabat",
        description: "Penjadwalan audiensi dan permohonan konsultasi tatap muka bersama pejabat",
        icon: Calendar,
        actions: ["read", "create", "update", "delete"],
      },
    ],
  },
  {
    name: "Kepegawaian",
    icon: FileText,
    modules: [
      {
        id: "e_laporan_kinerja",
        label: "E-Laporan Kinerja",
        description: "Rekapitulasi pengisian E-LK harian, bulanan, dan dokumen kinerja pegawai",
        icon: FileText,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "unit_kerja",
        label: "Unit Kerja & Role Admin",
        description: "Kelola struktur Unit Kerja / Seksi dan Role Akses Petugas secara dinamis",
        icon: Building2,
        actions: ["read", "create", "update", "delete"],
      },
    ],
  },
  {
    name: "Manajemen Pengguna",
    icon: UserCog,
    modules: [
      {
        id: "pengguna_petugas",
        label: "Petugas Admin",
        description: "Kelola akun admin/staf PTSP, role akses seksi, status akun, dan izin menu ini",
        icon: UserCog,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "pengguna_pegawai",
        label: "Data Pegawai Kemenag",
        description: "Database seluruh ASN & staf instansi, tersinkronisasi langsung ke data cuti",
        icon: BadgeCheck,
        actions: ["read", "create", "update", "delete"],
      },
      {
        id: "pengguna_pemohon",
        label: "Pemohon Masyarakat",
        description: "Data warga pengguna PTSP yang mendaftar via WhatsApp OTP atau Akun Google",
        icon: Users,
        actions: ["read", "create", "update", "delete"],
      },
    ],
  },
  {
    name: "Sistem",
    icon: Database,
    modules: [
      {
        id: "pemeliharaan_storage",
        label: "Pemeliharaan Storage",
        description: "Pemeriksaan integritas file, pembersihan dokumen temporer, dan kuota Supabase",
        icon: Database,
        actions: ["read", "update", "delete"],
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen && user) {
      const rawPerms = user.permissions || DEFAULT_ADMIN_PERMISSIONS;
      setPermissions(Array.isArray(rawPerms) ? rawPerms : []);
      setSearchQuery("");
    }
  }, [isOpen, user]);

  // Check if a specific module is active (has base id or read permission)
  const isModuleActive = (moduleId: string) => {
    return (
      permissions.includes(moduleId) ||
      permissions.includes(`${moduleId}:read`) ||
      permissions.some((p) => p.startsWith(`${moduleId}:`))
    );
  };

  // Check if an action is active
  const isActionActive = (moduleId: string, actionId: ActionType) => {
    if (actionId === "read") {
      return (
        permissions.includes(moduleId) ||
        permissions.includes(`${moduleId}:read`)
      );
    }
    return permissions.includes(`${moduleId}:${actionId}`);
  };

  // Toggle master module switch
  const handleToggleModule = (mod: PermissionModule) => {
    const currentlyActive = isModuleActive(mod.id);

    setPermissions((prev) => {
      if (currentlyActive) {
        // Deactivate all actions for this module
        return prev.filter(
          (p) => p !== mod.id && !p.startsWith(`${mod.id}:`)
        );
      } else {
        // Activate all actions for this module
        const newActions = [mod.id, ...mod.actions.map((act) => `${mod.id}:${act}`)];
        const cleanPrev = prev.filter(
          (p) => p !== mod.id && !p.startsWith(`${mod.id}:`)
        );
        return [...cleanPrev, ...newActions];
      }
    });
  };

  // Toggle individual granular action
  const handleToggleAction = (moduleId: string, actionId: ActionType) => {
    const actionKey = `${moduleId}:${actionId}`;
    const currentlyActive = isActionActive(moduleId, actionId);

    setPermissions((prev) => {
      if (currentlyActive) {
        if (actionId === "read") {
          // If turning off 'read', deactivate entire module because other CRUD need read access
          return prev.filter(
            (p) => p !== moduleId && !p.startsWith(`${moduleId}:`)
          );
        } else {
          // Remove this specific action
          return prev.filter((p) => p !== actionKey);
        }
      } else {
        // Activate this action, and make sure base module ID and 'read' are enabled
        const toAdd = [actionKey];
        if (!prev.includes(moduleId)) toAdd.push(moduleId);
        if (!prev.includes(`${moduleId}:read`)) toAdd.push(`${moduleId}:read`);

        return Array.from(new Set([...prev, ...toAdd]));
      }
    });
  };

  // Quick Action: Select All (Full Access)
  const handleSelectAll = () => {
    const allPerms: string[] = [];
    PERMISSION_GROUPS.forEach((group) => {
      group.modules.forEach((mod) => {
        allPerms.push(mod.id);
        mod.actions.forEach((act) => {
          allPerms.push(`${mod.id}:${act}`);
        });
      });
    });
    setPermissions(Array.from(new Set(allPerms)));
  };

  // Quick Action: Read Only
  const handleSelectReadOnly = () => {
    const readPerms: string[] = [];
    PERMISSION_GROUPS.forEach((group) => {
      group.modules.forEach((mod) => {
        readPerms.push(mod.id);
        readPerms.push(`${mod.id}:read`);
      });
    });
    setPermissions(Array.from(new Set(readPerms)));
  };

  // Quick Action: Reset / Clear
  const handleReset = () => {
    setPermissions([]);
  };

  // Filter modules based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return PERMISSION_GROUPS;

    const q = searchQuery.toLowerCase().trim();
    return PERMISSION_GROUPS.map((group) => {
      const matchedModules = group.modules.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          group.name.toLowerCase().includes(q)
      );
      return {
        ...group,
        modules: matchedModules,
      };
    }).filter((g) => g.modules.length > 0);
  }, [searchQuery]);

  // Total active permissions count
  const activeCount = permissions.length;

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateUserPermissionsAction(user.id, permissions);

      if (result.error) {
        toast.error("Gagal menyimpan hak akses", { description: result.error });
      } else {
        toast.success("Hak Akses Berhasil Disimpan!", {
          description: `Perizinan untuk ${user.nama || user.fullName || user.email} telah diperbarui.`,
        });
        onSave(user.id, permissions);
        onClose();
      }
    });
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      >
        <m.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-sm shadow-amber-500/20">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 text-base tracking-tight">
                    Pengaturan Hak Akses & Perizinan Menu
                  </h3>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CRUD Granular
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-600 font-bold">
                    {user.nama || user.fullName || user.email}
                  </p>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {user.unit_kerja || "Petugas Kemenag"}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Subheader / Quick Actions & Search Toolbar */}
          <div className="shrink-0 px-6 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari menu / perizinan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleSelectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-[#059669] text-xs font-bold border border-emerald-200/70 transition-colors cursor-pointer"
                title="Berikan semua hak akses ke semua menu"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Pilih Semua
              </button>
              <button
                type="button"
                onClick={handleSelectReadOnly}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100/80 text-sky-700 text-xs font-bold border border-sky-200/70 transition-colors cursor-pointer"
                title="Hanya berikan hak akses melihat (Read-Only)"
              >
                <Eye className="h-3.5 w-3.5" />
                Hanya Lihat
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200/70 transition-colors cursor-pointer"
                title="Kosongkan semua hak akses"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Kosongkan
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            {filteredGroups.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-xs font-bold text-slate-500">
                  Tidak ada menu yang sesuai dengan kata kunci &quot;{searchQuery}&quot;
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-1 text-xs text-emerald-600 font-bold underline cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              filteredGroups.map((group) => {
                const GroupIcon = group.icon;

                // Count active actions in this group
                let groupActiveCount = 0;
                let groupTotalCount = 0;
                group.modules.forEach((mod) => {
                  groupTotalCount += mod.actions.length;
                  mod.actions.forEach((act) => {
                    if (isActionActive(mod.id, act)) groupActiveCount++;
                  });
                });

                return (
                  <div
                    key={group.name}
                    className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs"
                  >
                    {/* Group Header */}
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GroupIcon className="h-4 w-4 text-slate-500" />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                          {group.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                          groupActiveCount > 0
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {groupActiveCount} / {groupTotalCount} Izin Aktif
                      </span>
                    </div>

                    {/* Modules in Group */}
                    <div className="divide-y divide-slate-100">
                      {group.modules.map((mod) => {
                        const ModIcon = mod.icon;
                        const modActive = isModuleActive(mod.id);

                        return (
                          <div
                            key={mod.id}
                            className={`p-4 transition-colors ${
                              modActive ? "bg-emerald-50/20" : "bg-white hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                              {/* Left: Icon, Name, Description */}
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                  className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                                    modActive
                                      ? "bg-emerald-100 text-[#059669]"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  <ModIcon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="text-xs font-black text-slate-800">
                                      {mod.label}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-400">
                                      ({mod.id})
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                    {mod.description}
                                  </p>
                                </div>
                              </div>

                              {/* Right: Master Toggle & Granular Action Chips */}
                              <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between md:justify-end border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                                {/* Granular CRUD Chips */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {mod.actions.map((act) => {
                                    const actConfig = ACTION_CONFIGS[act];
                                    const isActActive = isActionActive(mod.id, act);
                                    const ActIcon = actConfig.icon;

                                    return (
                                      <button
                                        key={act}
                                        type="button"
                                        onClick={() => handleToggleAction(mod.id, act)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer select-none ${
                                          isActActive
                                            ? `${actConfig.activeBg} ${actConfig.activeColor} ${actConfig.activeBorder} shadow-2xs`
                                            : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
                                        }`}
                                        title={`${actConfig.label} data pada menu ${mod.label}`}
                                      >
                                        <ActIcon className="h-3 w-3 shrink-0" />
                                        <span>{actConfig.label}</span>
                                        {isActActive && (
                                          <Check className="h-2.5 w-2.5 ml-0.5 text-current stroke-[3]" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Master Module Toggle Switch */}
                                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleModule(mod)}
                                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      modActive ? "bg-[#059669]" : "bg-slate-200"
                                    }`}
                                    title={modActive ? "Nonaktifkan seluruh menu ini" : "Aktifkan seluruh menu ini"}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        modActive ? "translate-x-4" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                <span className="text-emerald-700 font-extrabold">{activeCount}</span> hak akses dipilih
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Simpan Hak Akses
              </button>
            </div>
          </div>
        </m.div>
      </m.div>
    </AnimatePresence>
  );
}
