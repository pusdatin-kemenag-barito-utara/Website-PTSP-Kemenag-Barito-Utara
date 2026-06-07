"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare, Info, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModernSelect } from "@/components/ui/modern-select";
import {
  LoginTurnstile,
  TurnstileRef,
} from "@/components/auth/_components/login-turnstile";
import { submitFeedbackAction } from "@/lib/actions/public/feedback";
import { motion } from "framer-motion";

export function HomeSaranPengaduan() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Saran");
  const [serviceType, setServiceType] = useState("PTSP");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);

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

    if (!turnstileToken) {
      toast.error("Verifikasi Keamanan Diperlukan", {
        description:
          "Silakan tunggu hingga verifikasi Cloudflare Turnstile selesai.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitFeedbackAction({
        name,
        phone,
        category,
        serviceType,
        isAnonymous,
        content,
        turnstileToken,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Terima Kasih!", {
        description:
          "Saran & pengaduan Anda telah berhasil kami terima dan akan segera ditindaklanjuti.",
      });

      setName("");
      setPhone("");
      setCategory("Saran");
      setServiceType("PTSP");
      setIsAnonymous(false);
      setContent("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (err: any) {
      toast.error("Gagal Mengirim", {
        description:
          err.message || "Terjadi kesalahan sistem saat mengirim saran Anda.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-white">
      {/* Decorative clean ambient gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="mx-auto w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10">
        {/* Section Header */}
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

        {/* Form Container */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          {/* Feedback Form */}
          <div className="bg-[#f8fafc] rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.03)] p-8 sm:p-10 relative">
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
                      { value: "PTSP", label: "Pelayanan Terpadu Satu Pintu (PTSP)" },
                      { value: "Sub Bagian Tata Usaha", label: "Sub Bagian Tata Usaha" },
                      { value: "Seksi Pendidikan Madrasah", label: "Seksi Pendidikan Madrasah" },
                      { value: "Seksi Pendidikan Agama Islam", label: "Seksi Pendidikan Agama Islam" },
                      { value: "Seksi Bimbingan Masyarakat Islam", label: "Seksi Bimbingan Masyarakat Islam" },
                      { value: "Seksi Penyelenggara Haji & Umrah", label: "Seksi Penyelenggara Haji & Umrah" },
                      { value: "Penyelenggara Kristen", label: "Penyelenggara Kristen" },
                      { value: "Penyelenggara Hindu", label: "Penyelenggara Hindu" },
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                />
              </div>

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
      </div>
    </section>
  );
}
