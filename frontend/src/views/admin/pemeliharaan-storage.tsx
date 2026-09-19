import { useState, useEffect, useCallback } from "react";
import {
  Cloud,
  Database,
  Files,
  Sparkles,
  Trash2,
  RefreshCw,
  Activity,
  ShieldCheck,
  Bot,
  Power,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Lock,
  FileCheck2,
  FileText,
  History,
  Radio,
  Clock,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { SystemService } from "@/lib/services/system-service";
import { cleanupOldStorageAction } from "@/lib/actions/system/cleanup";
import { toggleAIChatAction } from "@/lib/actions/system/maintenance";

interface StorageMaintenanceViewProps {
  aiChatEnabled?: boolean;
}

export function StorageMaintenanceView({
  aiChatEnabled = true,
}: StorageMaintenanceViewProps) {
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [pinging, setPinging] = useState(false);
  const [lastPingResult, setLastPingResult] = useState<{
    latency: number;
    time: string;
    success: boolean;
  } | null>(null);

  // System States
  const [isAiChatOn, setIsAiChatOn] = useState(aiChatEnabled);
  const [isManualGuestBookOn, setIsManualGuestBookOn] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [togglingGuestBook, setTogglingGuestBook] = useState(false);

  // Overview Data State
  const [data, setData] = useState({
    cloudflareR2: {
      usage: 0,
      fileCount: 0,
      status: "ready",
    },
    database: {
      activeReqDocs: 0,
      activeGenDocs: 0,
      totalRequests: 0,
      completedRequests: 0,
      expiredRequests: 0,
      totalGuestBook: 0,
      totalPegawai: 0,
      dbLatencyMs: 0,
      dbConnected: true,
    },
    systemStatus: {
      aiChatEnabled: true,
      allowManualGuestBook: false,
      maintenanceMode: false,
      maintenanceMessage: "Sistem berjalan normal.",
    },
  });

  const loadData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const overview = await SystemService.getStorageOverview();
      setData(overview);
      setIsAiChatOn(overview.systemStatus.aiChatEnabled ?? true);
      setIsManualGuestBookOn(overview.systemStatus.allowManualGuestBook ?? false);
      if (showToast) {
        toast.success("Statistik & Status Sistem Berhasil Dimuat");
      }
    } catch (err: any) {
      console.error("Gagal memuat statistik sistem:", err);
      if (showToast) {
        toast.error("Gagal memuat status sistem", {
          description: err.message || "Periksa koneksi backend",
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Format Bytes ke ukuran yang mudah dibaca
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Jalankan Ping Diagnostik
  const handlePing = async () => {
    setPinging(true);
    try {
      const res = await SystemService.pingSystem();
      setLastPingResult(res);
      if (res.success) {
        toast.success(`Server & DB Aktif (${res.latency} ms)`, {
          description: "Koneksi ke backend Fiber & PostgreSQL berjalan normal.",
        });
      } else {
        toast.warning("Respon lambat dari server", {
          description: `Latensi: ${res.latency} ms`,
        });
      }
    } catch (err: any) {
      toast.error("Ping gagal", {
        description: err.message || "Tidak dapat menghubungi server backend.",
      });
    } finally {
      setPinging(false);
    }
  };

  // Toggle Asisten AI Chat
  const handleToggleAi = async () => {
    setTogglingAi(true);
    const nextStatus = !isAiChatOn;
    try {
      const res = await toggleAIChatAction(nextStatus);
      if (res.success) {
        setIsAiChatOn(nextStatus);
        toast.success(
          nextStatus
            ? "Asisten AI Chat Diaktifkan"
            : "Asisten AI Chat Dinonaktifkan",
          {
            description: nextStatus
              ? "Balon chat AI kini tampil di seluruh portal publik & dashboard."
              : "Balon chat AI disembunyikan dari semua halaman publik.",
          }
        );
      } else {
        toast.error("Gagal mengubah status AI Chat", {
          description: res.error,
        });
      }
    } catch (err: any) {
      toast.error("Gagal mengubah status AI Chat", {
        description: err.message,
      });
    } finally {
      setTogglingAi(false);
    }
  };

  // Toggle Mode Buku Tamu Mandiri
  const handleToggleGuestBook = async () => {
    setTogglingGuestBook(true);
    const nextStatus = !isManualGuestBookOn;
    try {
      const res = await SystemService.updateSettings({
        allowManual: nextStatus,
      });
      if (res?.success) {
        setIsManualGuestBookOn(nextStatus);
        toast.success(
          nextStatus
            ? "Mode Buku Tamu Mandiri Aktif"
            : "Mode Buku Tamu Mandiri Ditutup",
          {
            description: nextStatus
              ? "Tamu di front office diizinkan mengisi buku tamu mandiri."
              : "Pengisian buku tamu kini dibatasi melalui bantuan petugas loket.",
          }
        );
      } else {
        toast.error("Gagal mengubah mode buku tamu", {
          description: res?.error,
        });
      }
    } catch (err: any) {
      toast.error("Gagal memperbarui pengaturan", {
        description: err.message,
      });
    } finally {
      setTogglingGuestBook(false);
    }
  };

  // Pembersihan Storage Kadaluarsa
  const handleCleanup = async () => {
    const expiredCount = data.database.expiredRequests;
    if (expiredCount === 0) {
      toast.info("Penyimpanan Sudah Optimal", {
        description:
          "Tidak ada berkas lama yang perlu dibersihkan saat ini.",
      });
      return;
    }

    toast(`Hapus permanen ${expiredCount} berkas permohonan kadaluarsa?`, {
      description:
        "Berkas persyaratan lama (> 3 bulan selesai) akan dibersihkan. Dokumen hasil resmi PTSP tetap aman.",
      action: {
        label: "Ya, Bersihkan",
        onClick: async () => {
          setCleaning(true);
          const toastId = toast.loading("Sedang membersihkan file penyimpanan...");
          try {
            const res = await cleanupOldStorageAction();
            toast.dismiss(toastId);
            if (res.success) {
              toast.success("Pembersihan Selesai", {
                description: res.message || "Penyimpanan berhasil dioptimalkan.",
              });
              loadData();
            } else {
              toast.error("Gagal membersihkan", {
                description: res.error || "Terjadi kesalahan.",
              });
            }
          } catch (err: any) {
            toast.dismiss(toastId);
            toast.error("Gagal melakukan pembersihan", {
              description: err.message,
            });
          } finally {
            setCleaning(false);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
      duration: 8000,
    });
  };

  const hasExpired = data.database.expiredRequests > 0;
  const totalDocs =
    data.database.activeReqDocs + data.database.activeGenDocs;

  return (
    <div className="w-full space-y-5 pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider mb-2 border border-emerald-100/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sistem Pemeliharaan & Integrasi Storage
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Pemeliharaan Storage & Sistem
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Optimalisasi ruang penyimpanan berkas cloud, integritas arsip digital database,
            dan kendali sinkronisasi sistem terpadu PTSP Kemenag Barito Utara.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePing}
            disabled={pinging}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Tes latensi koneksi ke server backend dan basis data"
          >
            <Activity
              className={`h-3.5 w-3.5 text-indigo-600 ${
                pinging ? "animate-spin" : ""
              }`}
            />
            <span>
              {pinging
                ? "Mengetes..."
                : lastPingResult
                ? `${lastPingResult.latency} ms`
                : "Tes Ping Latensi"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Segarkan seluruh statistik penyimpanan dan data sistem"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Cloudflare R2 */}
        <Card className="p-4 border-none shadow-2xs bg-white rounded-2xl ring-1 ring-slate-100 relative overflow-hidden group hover:ring-emerald-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Cloud className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Cloudflare R2
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Volume Berkas
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {formatBytes(data.cloudflareR2.usage)}
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-50">
              <span>Jumlah Objek File</span>
              <span className="font-bold text-slate-800 font-mono">
                {data.cloudflareR2.fileCount} File
              </span>
            </div>
          </div>
        </Card>

        {/* Card 2: Basis Data PostgreSQL */}
        <Card className="p-4 border-none shadow-2xs bg-white rounded-2xl ring-1 ring-slate-100 relative overflow-hidden group hover:ring-indigo-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Database className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-100">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              PostgreSQL DB
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Arsip Permohonan & Tamu
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {data.database.totalRequests} Pengajuan
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-50">
              <span>Buku Tamu / Pegawai</span>
              <span className="font-bold text-slate-800 font-mono">
                {data.database.totalGuestBook} / {data.database.totalPegawai}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 3: Dokumen Digital Aktif */}
        <Card className="p-4 border-none shadow-2xs bg-white rounded-2xl ring-1 ring-slate-100 relative overflow-hidden group hover:ring-sky-200 transition-all">
          <div className="flex items-start justify-between">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <Files className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-100">
              Arsip Digital
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Dokumen Terdaftar
            </p>
            <p className="text-xl font-black text-slate-900 mt-0.5 tracking-tight">
              {totalDocs} Dokumen
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-50">
              <span>Persyaratan / Hasil</span>
              <span className="font-bold text-slate-800 font-mono">
                {data.database.activeReqDocs} / {data.database.activeGenDocs}
              </span>
            </div>
          </div>
        </Card>

        {/* Card 4: Kebersihan Storage */}
        <Card className="p-4 border-none shadow-2xs bg-white rounded-2xl ring-1 ring-slate-100 relative overflow-hidden group hover:ring-amber-200 transition-all">
          <div className="flex items-start justify-between">
            <div
              className={`p-2.5 rounded-xl ${
                hasExpired
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Sparkles className="h-5 w-5" />
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] border ${
                hasExpired
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
              }`}
            >
              {hasExpired ? "Perlu Pembersihan" : "100% Optimal"}
            </span>
          </div>
          <div className="mt-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Berkas Kadaluarsa
            </p>
            <p
              className={`text-xl font-black mt-0.5 tracking-tight ${
                hasExpired ? "text-amber-700" : "text-slate-900"
              }`}
            >
              {data.database.expiredRequests} Berkas
            </p>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-50">
              <span>Kriteria Retensi</span>
              <span className="font-bold text-slate-800">
                &gt; 3 Bulan Selesai
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: 2 Columns Balanced */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Aksi Pemeliharaan & Kontrol Sinkronisasi (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card A: Pemeliharaan Storage Kadaluarsa */}
          <Card className="p-5 border-none shadow-2xs bg-white rounded-3xl ring-1 ring-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Pemeliharaan Ruang Penyimpanan
                  </h2>
                  <p className="text-xs text-slate-400">
                    Otomasi pembersihan file kadaluarsa untuk efisiensi kapasitas
                  </p>
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  hasExpired
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {hasExpired ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    <span>{data.database.expiredRequests} Berkas Lama</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Storage Bersih</span>
                  </>
                )}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {hasExpired ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Ditemukan Berkas Kadaluarsa yang Dapat Dibersihkan</span>
                  </div>
                  <p className="text-xs text-amber-800/90 leading-relaxed">
                    Terdapat{" "}
                    <strong>{data.database.expiredRequests} permohonan</strong> yang
                    telah berstatus <strong>COMPLETED</strong> lebih dari 3 bulan.
                    Menghapus berkas persyaratan lama akan mengosongkan ruang di
                    Cloudflare R2 tanpa memengaruhi dokumen resmi hasil.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={cleaning}
                      onClick={handleCleanup}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                    >
                      {cleaning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span>Jalankan Pembersihan Sekarang</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50/80 border border-slate-100 text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">
                    Kapasitas Penyimpanan Optimal
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                    Tidak ada berkas permohonan lama yang perlu dibersihkan saat ini.
                    Semua data tersusun rapi dan memenuhi standar kebijakan retensi.
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => loadData(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      <span>Cek Ulang Kesiapan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Jaminan Keamanan */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100/80 text-[11px] text-slate-600 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800">Proteksi Arsip Hasil PTSP:</strong>{" "}
                  Pembersihan hanya menargetkan berkas persyaratan pemohon lama. Seluruh
                  SK, Surat Rekomendasi resmi yang diterbitkan, dan riwayat transaksi
                  database tetap terlindungi secara permanen.
                </div>
              </div>
            </div>
          </Card>

          {/* Card B: Kontrol Sinkronisasi Sistem Terpadu */}
          <Card className="p-5 border-none shadow-2xs bg-white rounded-3xl ring-1 ring-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">
                    Kontrol Sinkronisasi Fitur Global
                  </h2>
                  <p className="text-xs text-slate-400">
                    Pengaturan modul sistem yang terhubung langsung ke portal dan dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {/* Item 1: Asisten AI Chat */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Asisten Virtual AI Chat (Si ATAK)
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Menampilkan balon chat asisten virtual AI di seluruh portal publik
                      dan dashboard pengguna.
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-slate-400">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Multi-LLM Fallback (Groq, Gemini, Mistral)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAi}
                  disabled={togglingAi}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isAiChatOn ? "bg-emerald-500" : "bg-slate-300"
                  } ${togglingAi ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isAiChatOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {togglingAi ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    ) : (
                      <Power
                        className={`h-3 w-3 ${
                          isAiChatOn ? "text-emerald-500" : "text-slate-400"
                        }`}
                      />
                    )}
                  </span>
                </button>
              </div>

              {/* Item 2: Mode Buku Tamu Mandiri */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Radio className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Mode Buku Tamu Mandiri Front-Office
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Mengizinkan pengunjung di ruang tunggu loket menginput data buku tamu
                      secara langsung tanpa verifikasi ketat.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleToggleGuestBook}
                  disabled={togglingGuestBook}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isManualGuestBookOn ? "bg-emerald-500" : "bg-slate-300"
                  } ${togglingGuestBook ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span
                    className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isManualGuestBookOn ? "translate-x-5" : "translate-x-0"
                    }`}
                  >
                    {togglingGuestBook ? (
                      <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                    ) : (
                      <Power
                        className={`h-3 w-3 ${
                          isManualGuestBookOn
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      />
                    )}
                  </span>
                </button>
              </div>

              {/* Item 3: Status Pemeliharaan Terpusat (Pusdatin) */}
              <div className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
                    <Lock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      Mode Pemeliharaan Situs (Maintenance Guard)
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {data.systemStatus.maintenanceMessage ||
                        "Sistem berjalan normal dan aktif melayani permohonan."}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold shrink-0 border border-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Pusdatin Terpusat
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Kebijakan Retensi & SOP Integritas (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card C: Kebijakan Retensi Dokumen */}
          <Card className="p-5 border-none shadow-2xs bg-white rounded-3xl ring-1 ring-slate-100">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Kebijakan Retensi Dokumen
                </h3>
                <p className="text-[10px] text-slate-400">
                  Pedoman siklus penyimpanan digital instansi
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Kebijakan 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    1. Berkas Persyaratan Pemohon
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200/60">
                    Siklus 90 Hari
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Berkas unggahan pemohon (KTP, Surat Rekomendasi, Proposal, dll)
                  memenuhi syarat dibersihkan otomatis jika permohonan telah berstatus{" "}
                  <strong className="text-slate-800">COMPLETED</strong> lebih dari 3 bulan
                  untuk menjaga kerahasiaan data pribadi & efisiensi cloud.
                </p>
              </div>

              {/* Kebijakan 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" />
                    2. Dokumen Hasil Terbitan PTSP
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200/60">
                    Permanen
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Dokumen resmi yang diterbitkan PTSP (SK, Piagam, Surat Rekomendasi,
                  Sertifikat) <strong className="text-emerald-700">TIDAK AKAN DIHAPUS</strong>{" "}
                  dan disimpan selamanya sebagai arsip negara digital.
                </p>
              </div>

              {/* Kebijakan 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-indigo-600" />
                    3. Riwayat Transaksi Database
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200/60">
                    Abadi / Audit
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Seluruh data teks (nama pemohon, jenis layanan, tanggal pengajuan, nomor
                  registrasi) <strong className="text-indigo-700">TETAP UTUH</strong> di
                  database untuk kebutuhan rekapitulasi, pelaporan, dan audit BPK/Itjen.
                </p>
              </div>
            </div>
          </Card>

          {/* Card D: Catatan Protokol & Integritas */}
          <Card className="p-5 border-none shadow-2xs bg-white rounded-3xl ring-1 ring-slate-100">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                <History className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  Protokol Keamanan & Integritas
                </h3>
                <p className="text-[10px] text-slate-400">
                  Standar operasional prosedur pemeliharaan sistem
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5 text-[11px] text-slate-500 font-medium leading-relaxed">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Setiap tindakan pembersihan dicatat otomatis pada sistem{" "}
                  <strong className="text-slate-800">Audit Log</strong> dengan nama
                  petugas, waktu, dan jumlah berkas yang diproses.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Cloud className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                <span>
                  Sistem mendukung integrasi multi-storage{" "}
                  <strong className="text-slate-800">Cloudflare R2</strong>, Supabase
                  Storage bucket, serta fallback disk lokal yang aman.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Disarankan melakukan pemeliharaan ruang penyimpanan secara berkala
                  (misal: sebulan sekali) untuk menjaga kinerja optimal.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default StorageMaintenanceView;
