"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";

export function PegawaiResetForm() {
  const router = useRouter();
  const [nip, setNip] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Nomor WhatsApp Official Petugas/Admin PTSP Kemenag Barito Utara
  const OFFICIAL_WA_ADMIN = "6285117491212";

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenWhatsApp = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanNip = nip.replace(/\D/g, "").trim();
    if (!cleanNip || cleanNip.length < 10) {
      setError("Masukkan NIP Pegawai Anda dengan benar (minimal 10 digit).");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "").trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Nomor WhatsApp terdaftar tidak valid (minimal 10 digit).");
      return;
    }

    if (!turnstileToken) {
      setError("Silakan selesaikan verifikasi keamanan Turnstile di bawah.");
      return;
    }

    setLoading(true);

    let formattedPhone = cleanPhone;
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1);
    }

    const nowStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const message = `Halo Admin Kepegawaian PTSP Kemenag Barito Utara, saya pegawai ingin mengajukan pemulihan/reset password akun Portal Pegawai.\n\n*Detail Data Pegawai:*\n• NIP Pegawai: ${cleanNip}\n• No. WhatsApp Terdaftar: ${formattedPhone}\n• Waktu Pengajuan: ${nowStr} WIB\n\nMohon bantuan Bapak/Ibu Admin untuk memverifikasi data NIP dan me-reset password akun Pegawai saya. Terima kasih.`;

    const generatedUrl = `https://wa.me/${OFFICIAL_WA_ADMIN}?text=${encodeURIComponent(message)}`;
    setWaUrl(generatedUrl);

    // Track submission success
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      toast.success("Pengajuan Terkirim!", {
        description: "WhatsApp Admin PTSP sedang dibuka...",
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      window.open(generatedUrl, "_blank");
    }, 600);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setNip("");
    setPhone("");
    setWaUrl("");
    setError("");
    turnstileRef.current?.reset();
    setTurnstileToken(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <m.form
            key="reset-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleOpenWhatsApp}
            className="space-y-3.5 text-left"
          >
            <p className="text-xs text-slate-500 leading-relaxed text-center font-medium mb-3">
              Masukkan NIP dan Nomor WhatsApp terdaftar Anda untuk terhubung langsung dengan <strong>Admin Kepegawaian PTSP</strong>.
            </p>

            {/* Input NIP */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                NIP Pegawai <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <UserCircle2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="text"
                  required
                  value={nip}
                  onChange={(e) => setNip(e.target.value.replace(/\D/g, ""))}
                  placeholder="Masukkan 18 Digit NIP Anda"
                  maxLength={18}
                  className="h-11 pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 font-mono text-xs transition-all"
                />
              </div>
            </div>

            {/* Input Phone */}
            <div className="space-y-1">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                Nomor WhatsApp Terdaftar <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <Input
                  type="tel"
                  required
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Contoh: 081234567890"
                  maxLength={15}
                  className="h-11 pl-10 rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 font-mono text-xs transition-all"
                />
              </div>
            </div>

            {error && (
              <m.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80 leading-relaxed"
              >
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </m.p>
            )}

            {/* Turnstile Security Check */}
            <div className="pt-0.5">
              <LoginTurnstile
                mounted={mounted}
                ref={turnstileRef}
                onTokenChange={setTurnstileToken}
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !turnstileToken || nip.length < 10 || phone.length < 10}
              className="w-full h-11 sm:h-12 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.98] duration-300 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 fill-white/20" />
              )}
              <span>Kirim Pengajuan ke WhatsApp Admin</span>
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Verifikasi Keamanan NIP & Layanan Kepegawaian PTSP</span>
            </div>
          </m.form>
        ) : (
          /* Success Screen */
          <m.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 text-center py-2"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50 shadow-inner">
              <MessageSquare className="h-10 w-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Pengajuan Dibuat</span>
              </span>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">
                Pengajuan Terkirim ke Admin
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                Pesan pengajuan reset password untuk NIP <strong className="font-mono text-emerald-700">{nip}</strong> telah disiapkan. Apabila WhatsApp belum terbuka, silakan tekan tombol di bawah.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 h-14 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-xl shadow-emerald-600/20 font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.98]"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Buka WhatsApp Admin PTSP</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleResetForm}
                className="flex w-full items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-bold transition-all hover:bg-slate-50 hover:text-slate-800"
              >
                <RotateCcw className="h-4 w-4 text-slate-400" />
                <span>Ajukan Kembali / Ubah Data</span>
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PegawaiResetForm;
