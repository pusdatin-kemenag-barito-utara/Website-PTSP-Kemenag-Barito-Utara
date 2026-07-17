"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Info,
  Layers,
  Calendar,
  Upload,
  CheckCircle2,
  Copy,
  Ticket,
  Search,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  LoginTurnstile,
  TurnstileRef,
} from "@/components/auth/_components/login-turnstile";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { trackAduanAction } from "@/lib/actions/public/track-aduan";
import { motion, AnimatePresence } from "framer-motion";

export function HomeSaranPengaduan({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const [activeTab, setActiveTab] = useState<"buat" | "lacak">("buat");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Saran");
  const [serviceType, setServiceType] = useState("PTSP");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ticketResult, setTicketResult] = useState<string | null>(null);
  
  // Tracking states
  const [trackTicket, setTrackTicket] = useState("");
  const [trackPhone, setTrackPhone] = useState("");
  const [trackResult, setTrackResult] = useState<any>(null);
  
  const turnstileRef = useRef<TurnstileRef>(null);
  const trackTurnstileRef = useRef<TurnstileRef>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !content) {
      toast.error("Formulir Belum Lengkap", {
        description: "Silakan isi semua bidang formulir.",
      });
      return;
    }

    if (name.length < 2) {
      toast.error("Nama Terlalu Pendek", { description: "Nama harus berisi minimal 2 karakter." });
      return;
    }

    if (phone.length < 9 || phone.length > 20) {
      toast.error("Nomor HP Tidak Valid", { description: "Masukkan nomor HP yang valid (9-20 digit)." });
      return;
    }

    if (content.length < 10) {
      toast.error("Isi Pesan Terlalu Pendek", { description: "Harap jelaskan saran/pengaduan Anda lebih rinci (minimal 10 karakter)." });
      return;
    }

    if (attachment && attachment.size > 5 * 1024 * 1024) {
      toast.error("File Terlalu Besar", { description: "Ukuran file lampiran maksimal 5MB." });
      return;
    }

    if (!turnstileToken) {
      toast.error("Verifikasi Keamanan Diperlukan", {
        description:
          "Silakan tunggu hingga verifikasi Cloudflare Turnstile selesai.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("category", category);
      formData.append("serviceType", serviceType);
      formData.append("isAnonymous", isAnonymous.toString());
      formData.append("content", content);
      if (incidentDate) formData.append("incidentDate", incidentDate);
      if (incidentLocation) formData.append("incidentLocation", incidentLocation);
      if (turnstileToken) formData.append("turnstileToken", turnstileToken);
      if (attachment) formData.append("attachment", attachment);

      const res = await fetch("/api/e-pengaduan", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Gagal mengirim pengaduan");
      }

      toast.success("Terima Kasih!", {
        description:
          "Saran & pengaduan Anda telah berhasil kami terima dan akan segera ditindaklanjuti.",
      });

      setTicketResult(result.data.ticketNumber);

      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      toast.error("Gagal Mengirim", {
        description:
          err.message || "Terjadi kesalahan sistem saat mengirim saran Anda.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTicket || !trackPhone) {
      toast.error("Formulir Belum Lengkap", { description: "Masukkan Nomor Tiket dan Nomor Handphone Anda." });
      return;
    }
    if (!turnstileToken) {
      toast.error("Verifikasi Keamanan Diperlukan");
      return;
    }

    setSubmitting(true);
    try {
      const res = await trackAduanAction(trackTicket, trackPhone, turnstileToken);
      if (res.success) {
        setTrackResult(res.data);
      } else {
        toast.error("Gagal Melacak", { description: res.error });
      }
    } catch (err: any) {
      toast.error("Terjadi Kesalahan", { description: "Gagal menghubungi server." });
    } finally {
      setSubmitting(false);
      setTurnstileToken(null);
      trackTurnstileRef.current?.reset();
    }
  };

  const handleCopyTicket = () => {
    if (ticketResult) {
      navigator.clipboard.writeText(ticketResult);
      toast.success("Nomor Tiket Tersalin!");
    }
  };

  if (ticketResult) {
    return (
      <section className={`relative overflow-hidden bg-white ${hideHeader ? "py-6 md:py-12" : "py-24 md:py-32"}`}>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="mx-auto w-full max-w-2xl px-6 sm:px-10 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Aduan Berhasil Dikirim!</h2>
          <p className="text-slate-600">
            Terima kasih atas laporan Anda. Gunakan Nomor Tiket di bawah ini untuk melacak status laporan Anda.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-6">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Nomor Tiket Anda</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl font-black text-emerald-700 font-mono tracking-wider">{ticketResult}</span>
              <button 
                onClick={handleCopyTicket}
                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Salin Nomor Tiket"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={() => {
                setTicketResult(null);
                setName("");
                setPhone("");
                setContent("");
                setIncidentDate("");
                setIncidentLocation("");
                setAttachment(null);
                setIsAnonymous(false);
                setTurnstileToken(null);
                turnstileRef.current?.reset();
              }}
              variant="outline"
              className="px-8"
            >
              Kirim Aduan Lainnya
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative overflow-hidden bg-white ${hideHeader ? "py-6 md:py-12" : "py-24 md:py-32"}`}>
      {/* Decorative clean ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className={`mx-auto w-full ${hideHeader ? "px-0 sm:px-6" : "px-6 sm:px-10"} lg:px-16 xl:px-24 relative z-10`}>
        {/* Section Header */}
        {!hideHeader && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8 text-center max-w-3xl mx-auto space-y-4"
          >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/80 animate-pulse">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Saran & Pengaduan
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sampaikan{" "}
            <span className="text-emerald-600">Saran & Pengaduan</span> Anda
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Silakan isi form di bawah yang berisi saran maupun kendala yang Anda
            hadapi saat menggunakan Layanan kami. Isikan nomor HP yang valid
            untuk keperluan konfirmasi tanggapan atas pengaduan Anda.
          </p>
        </motion.div>
        )}

        {/* Mode Toggle (Buat / Lacak) */}
        <div className="flex justify-center mb-8 relative z-20">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab("buat"); setTrackResult(null); }}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "buat" 
                  ? "bg-white text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Kirim Aduan Baru
            </button>
            <button
              onClick={() => { setActiveTab("lacak"); setTicketResult(null); }}
              className={`px-6 py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                activeTab === "lacak" 
                  ? "bg-white text-emerald-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Ticket className="w-4 h-4" />
              Lacak Aduan Saya
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "buat" && (
            <motion.div
              key="tab-buat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full mx-auto"
            >
              {/* Tata Cara Pengaduan Infographic */}
              <div className="max-w-4xl mx-auto mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
              <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Tulis Laporan</h4>
              <p className="text-xs text-slate-500">Isi form pengaduan dengan jelas & lengkap.</p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
              <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Proses Verifikasi</h4>
              <p className="text-xs text-slate-500">Laporan Anda akan diverifikasi oleh petugas.</p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
              <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Tindak Lanjut</h4>
              <p className="text-xs text-slate-500">Petugas terkait akan menindaklanjuti laporan.</p>
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm text-center">
              <div className="w-10 h-10 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold mb-3">4</div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">Selesai</h4>
              <p className="text-xs text-slate-500">Anda dapat melacak status penyelesaian aduan.</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="w-full mx-auto"
        >
          {/* Feedback Form */}
          <div className={`bg-[#f8fafc] sm:rounded-3xl border-y sm:border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.03)] p-6 sm:p-10 relative ${hideHeader ? "rounded-none" : "rounded-3xl"}`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Kategori */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="feedback-category"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <ModernSelect
                    options={[
                      { value: "Saran", label: "💡 Saran / Masukan" },
                      { value: "Pengaduan", label: "⚠️ Pengaduan / Keluhan" },
                    ]}
                    value={category}
                    onChange={setCategory}
                    icon={Info}
                    placeholder="Pilih Kategori"
                    required
                  />
                </div>

                {/* Jenis Layanan */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="feedback-service"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Terkait Layanan Apa? <span className="text-red-500">*</span>
                  </label>
                  <ModernSelect
                    options={[
                      {
                        value: "PTSP",
                        label: "Pelayanan Terpadu Satu Pintu (PTSP)",
                      },
                      {
                        value: "Sub Bagian Tata Usaha",
                        label: "Sub Bagian Tata Usaha",
                      },
                      {
                        value: "Seksi Pendidikan Madrasah",
                        label: "Seksi Pendidikan Madrasah",
                      },
                      {
                        value: "Seksi Pendidikan Agama Islam",
                        label: "Seksi Pendidikan Agama Islam",
                      },
                      {
                        value: "Seksi Bimbingan Masyarakat Islam",
                        label: "Seksi Bimbingan Masyarakat Islam",
                      },
                      {
                        value: "Seksi Penyelenggara Haji & Umrah",
                        label: "Seksi Penyelenggara Haji & Umrah",
                      },
                      {
                        value: "Seksi Bimbingan Masyarakat Kristen",
                        label: "Seksi Bimbingan Masyarakat Kristen",
                      },
                      {
                        value: "Seksi Bimbingan Masyarakat Katolik",
                        label: "Seksi Bimbingan Masyarakat Katolik",
                      },
                      {
                        value: "Penyelenggara Zakat & Wakaf",
                        label: "Penyelenggara Zakat & Wakaf",
                      },
                      {
                        value: "Penyelenggara Hindu",
                        label: "Penyelenggara Hindu",
                      },
                      { value: "Lainnya", label: "Umum / Lainnya" },
                    ]}
                    value={serviceType}
                    onChange={setServiceType}
                    icon={Layers}
                    placeholder="Pilih Jenis Layanan"
                    enableSearch={true}
                    required
                  />
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="feedback-name"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value.replace(/[0-9]/g, ""))
                    }
                    placeholder="Masukkan nama lengkap..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Phone / Whatsapp */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="feedback-phone"
                    className="text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Nomor Handphone / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="feedback-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="feedback-content"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Isi Saran / Pengaduan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="feedback-content"
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan saran, kritik, masukan, atau pengaduan secara terperinci..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y min-h-[120px]"
                />
              </div>

              {/* Conditional Fields for Pengaduan */}
              {category === "Pengaduan" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-orange-50/50 border border-orange-100 rounded-xl">
                  <div className="flex flex-col gap-1.5">
                    <ModernDatePicker
                      label="Tanggal Kejadian (Opsional)"
                      value={incidentDate}
                      onChange={setIncidentDate}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="incident-location" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Lokasi Kejadian <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="incident-location"
                        type="text"
                        value={incidentLocation}
                        onChange={(e) => setIncidentLocation(e.target.value)}
                        placeholder="Contoh: Loket 2 PTSP"
                        className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-3 text-sm text-slate-800 shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label htmlFor="attachment" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Upload Lampiran / Bukti <span className="text-slate-400 font-normal">(Opsional, Max 5MB)</span>
                    </label>
                    <div className="relative flex items-center justify-center w-full">
                      <label htmlFor="attachment" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 mb-2 text-slate-400" />
                          <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Klik untuk upload</span> atau drag and drop</p>
                          <p className="text-xs text-slate-400">PNG, JPG, PDF (MAX. 5MB)</p>
                          {attachment && (
                            <p className="mt-2 text-sm font-semibold text-emerald-600">{attachment.name}</p>
                          )}
                        </div>
                        <input id="attachment" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => setAttachment(e.target.files?.[0] || null)} />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-100 hover:border-emerald-100 transition-colors">
                <input
                  type="checkbox"
                  id="feedback-anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600 focus:ring-offset-slate-50 cursor-pointer"
                />
                <label
                  htmlFor="feedback-anonymous"
                  className="text-xs sm:text-sm font-bold text-slate-700 cursor-pointer select-none"
                >
                  Kirim sebagai Anonim{" "}
                  <span className="font-semibold text-slate-500">
                    (Rahasiakan identitas saya kepada publik)
                  </span>
                </label>
              </div>

              {/* Turnstile Verification - Centered */}
              <div className="flex justify-center pt-2">
                <LoginTurnstile
                  mounted={mounted}
                  ref={turnstileRef}
                  onTokenChange={setTurnstileToken}
                />
              </div>

              {/* Submit Button - Centered */}
              <div className="flex justify-center pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-12 py-4 text-xs sm:text-sm font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirimkan...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Saran & Pengaduan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    )}

      {activeTab === "lacak" && (
        <motion.div
          key="tab-lacak"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className={`bg-[#f8fafc] sm:rounded-3xl border-y sm:border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.03)] p-6 sm:p-10 relative ${hideHeader ? "rounded-none" : "rounded-3xl"}`}>
            
            {!trackResult ? (
              <form onSubmit={handleTrackSubmit} className="space-y-6">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">Lacak Status Aduan</h3>
                  <p className="text-slate-500 mt-2 text-sm">Masukkan Nomor Tiket dan Nomor HP yang Anda gunakan saat melapor.</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Tiket</label>
                    <input
                      type="text"
                      required
                      value={trackTicket}
                      onChange={(e) => setTrackTicket(e.target.value.toUpperCase())}
                      placeholder="Contoh: PTSP-241231-ABCD"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nomor Handphone</label>
                    <input
                      type="tel"
                      required
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="Nomor HP saat melapor"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <LoginTurnstile mounted={mounted} ref={trackTurnstileRef} onTokenChange={setTurnstileToken} />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-sm font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all"
                >
                  {submitting ? "Mencari..." : "Lacak Tiket"}
                </Button>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50" />
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Nomor Tiket Anda</p>
                    <h4 className="text-2xl sm:text-3xl font-black text-slate-800 font-mono tracking-tight flex items-center gap-2">
                      {trackResult.ticketNumber}
                    </h4>
                  </div>
                  <div>
                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${
                      trackResult.status === "pending" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                      trackResult.status === "processed" ? "bg-blue-50 text-blue-600 border border-blue-200" :
                      trackResult.status === "resolved" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                      "bg-red-50 text-red-600 border border-red-200"
                    }`}>
                      {trackResult.status === "pending" ? "Menunggu" : 
                       trackResult.status === "processed" ? "Diproses" : 
                       trackResult.status === "resolved" ? "Selesai" : 
                       "Ditolak"}
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Calendar className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Tanggal Lapor</p>
                      <p className="font-bold text-slate-700 text-sm">{new Date(trackResult.createdAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}</p>
                    </div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <Layers className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Layanan Terkait</p>
                      <p className="font-bold text-slate-700 text-sm">{trackResult.serviceType}</p>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm relative">
                  <div className="absolute top-6 right-6 opacity-5">
                    <MessageSquare className="w-24 h-24" />
                  </div>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">Isi Laporan Anda</p>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap relative z-10 font-medium">"{trackResult.content}"</p>
                </div>

                {/* Admin Reply Section */}
                {trackResult.adminReply && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50/30 rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full -z-10 opacity-30" />
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Tanggapan Petugas</p>
                    </div>
                    <p className="text-emerald-900 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">{trackResult.adminReply}</p>
                  </div>
                )}

                {/* Back Button */}
                <div className="pt-2 flex justify-center">
                  <Button 
                    onClick={() => setTrackResult(null)} 
                    className="group px-8 py-6 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase tracking-widest text-xs shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Kembali Pencarian
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
</section>
);
}
