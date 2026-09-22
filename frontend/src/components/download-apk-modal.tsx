import { useState, useEffect } from "react";
import { 
  X, 
  Smartphone, 
  Download, 
  QrCode, 
  ShieldCheck, 
  Copy, 
  Check, 
  HelpCircle, 
  ChevronDown,
  Info,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";
import { toast } from "sonner";

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadApkModal({ isOpen, onClose }: DownloadApkModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("/downloads/ptsp-kemenag.apk");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDownloadUrl(`${window.location.origin}/downloads/ptsp-kemenag.apk`);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl);
      setCopied(true);
      toast.success("Tautan unduh APK berhasil disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/40 my-auto text-slate-800 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient emerald header light */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative border-b border-slate-100 dark:border-slate-800/80 px-5 sm:px-7 pt-5 sm:pt-6 pb-4 sm:pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-700/30 shrink-0">
                    <Smartphone className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aplikasi Resmi Daerah • Android v1.0.0
                    </div>
                    <h3 className="mt-1 text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                      PTSP SI ATAK{" "}
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Kemenag Barito Utara
                      </span>
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      Kantor Kementerian Agama Kabupaten Barito Utara, Kalimantan Tengah
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Banner Keterangan Daerah (Bukan Pusat) */}
              <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 sm:p-3 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200">
                <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="leading-snug">
                  <strong className="font-bold">Khusus Layanan Kemenag Kabupaten Barito Utara:</strong>{" "}
                  Aplikasi ini dikembangkan dan dikelola secara mandiri oleh Kantor Kemenag Kab. Barito Utara untuk pelayanan masyarakat dan ASN daerah setempat (bukan aplikasi dari Kemenag Pusat).
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="relative p-5 sm:p-7 space-y-5 max-h-[calc(85vh-190px)] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                {/* QR Code Section (Scan via HP) */}
                <div className="md:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4 sm:p-5 text-center">
                  <div className="relative p-3 bg-white rounded-xl shadow-sm border border-slate-200/60 mb-3 flex items-center justify-center">
                    <QRCode
                      value={downloadUrl}
                      size={140}
                      level="H"
                      className="h-32 w-32 sm:h-36 sm:w-36"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white p-1 rounded-full shadow-md border border-slate-100">
                        <img
                          src="/kemenag.svg"
                          alt="Kemenag"
                          className="w-5 h-5 object-contain"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <QrCode className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Scan via Kamera HP</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Arahkan kamera HP Anda ke QR code ini untuk langsung mengunduh file APK ke ponsel.
                  </p>
                </div>

                {/* Direct Download Section */}
                <div className="md:col-span-7 flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 p-4 sm:p-5">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                      Informasi Berkas Aplikasi
                    </h4>

                    {/* App Highlights / Specs */}
                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-slate-500 dark:text-slate-400">Nama Aplikasi</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                          PTSP SI ATAK Kemenag Barut
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-slate-500 dark:text-slate-400">Instansi Penerbit</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                          Kemenag Barito Utara
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-slate-500 dark:text-slate-400">Ukuran & Format</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">~25 MB (.APK)</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60">
                        <span className="text-slate-500 dark:text-slate-400">Kompatibilitas</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Android 8.0 Oreo ke atas</span>
                      </div>
                    </div>

                    {/* Verified Security Tag */}
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 mb-4">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>Bebas virus & malware. Terverifikasi oleh Tim Pusdatin Kemenag Barito Utara.</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <a
                      href="/downloads/ptsp-kemenag.apk"
                      download="PTSP-SI-ATAK-Kemenag-Barito-Utara.apk"
                      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-950/20 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 active:scale-98"
                    >
                      <Download className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                      <span>Unduh APK PTSP SI ATAK</span>
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Tautan Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>Salin Link Unduh untuk Dibagikan</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Installation Guide */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowGuide(!showGuide)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-100/60 dark:hover:bg-slate-800/40 cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <HelpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Cara Pasang (Instal) File APK di Smartphone Android</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      showGuide ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showGuide && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        1
                      </span>
                      <p>
                        Setelah proses unduh selesai, buka bilah notifikasi ponsel atau buka folder <strong>Download</strong> di aplikasi File Manager Anda.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        2
                      </span>
                      <p>
                        Ketuk file <strong>PTSP-SI-ATAK-Kemenag-Barito-Utara.apk</strong> untuk memulai pemasangan.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        3
                      </span>
                      <p>
                        Jika muncul peringatan <em>"Demi keamanan, perangkat diblokir dari memasang aplikasi dari sumber ini"</em>, ketuk <strong>Setelan (Settings)</strong> ➔ aktifkan centang <strong>"Izinkan dari sumber ini"</strong>, lalu ketuk <strong>Instal</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 px-5 sm:px-7 py-3.5 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Server PTSP Kemenag Kabupaten Barito Utara</span>
              <button
                type="button"
                onClick={onClose}
                className="font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
