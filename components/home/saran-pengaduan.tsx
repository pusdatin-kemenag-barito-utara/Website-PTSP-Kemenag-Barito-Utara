"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginTurnstile, TurnstileRef } from "@/components/auth/_components/login-turnstile";
import { submitFeedbackAction } from "@/lib/actions/public/feedback";

export function HomeSaranPengaduan() {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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
        description: "Silakan tunggu hingga verifikasi Cloudflare Turnstile selesai.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitFeedbackAction({
        name,
        phone,
        content,
        turnstileToken,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Terima Kasih!", {
        description: "Saran & pengaduan Anda telah berhasil kami terima dan akan segera ditindaklanjuti.",
      });

      setName("");
      setPhone("");
      setContent("");
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } catch (err: any) {
      toast.error("Gagal Mengirim", {
        description: err.message || "Terjadi kesalahan sistem saat mengirim saran Anda.",
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
        <div className="mb-20 text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/80 animate-pulse">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
              Saran & Pengaduan
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Sampaikan <span className="text-emerald-600">Saran & Pengaduan</span> Anda
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-semibold max-w-2xl mx-auto leading-relaxed">
            Silakan isi form di bawah yang berisi saran maupun kendala yang Anda hadapi saat menggunakan Layanan kami. Isikan nomor HP yang valid untuk keperluan konfirmasi tanggapan atas pengaduan Anda.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 max-w-6xl mx-auto items-start">
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
            {/* Phone */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#f8fafc] border border-slate-100 hover:border-emerald-100 transition-all duration-300 shadow-sm group">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <Phone className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">
                  Telepon / Fax
                </p>
                <p className="text-xs sm:text-base font-extrabold text-slate-800">
                  (0519) 21269
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#f8fafc] border border-slate-100 hover:border-emerald-100 transition-all duration-300 shadow-sm group">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                <Mail className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">
                  Email Resmi
                </p>
                <p className="text-xs sm:text-base font-extrabold text-slate-800 break-all leading-tight">
                  ptspkemenagbaritoutara@gmail.com
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#f8fafc] border border-slate-100 hover:border-emerald-100 transition-all duration-300 shadow-sm group">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 sm:mb-1">
                  Alamat Kantor
                </p>
                <p className="text-xs sm:text-base font-extrabold text-slate-800 leading-relaxed">
                  Jl. Ahmad Yani No.126 Muara Teweh 73811
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Feedback Form */}
          <div className="lg:col-span-7 bg-[#f8fafc] rounded-3xl border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.03)] p-8 sm:p-10 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-name" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                {/* Phone / Whatsapp */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="feedback-phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nomor Handphone / WA <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="feedback-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="feedback-content" className="text-xs font-bold uppercase tracking-wider text-slate-500">
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
        </div>
      </div>
    </section>
  );
}
