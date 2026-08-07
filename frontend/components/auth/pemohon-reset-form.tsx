"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquare, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PemohonResetForm() {
  const router = useRouter();
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  // Nomor WhatsApp Official Petugas Loket PTSP Kemenag Barito Utara
  const OFFICIAL_WA_PETUGAS = "6285117491212";

  const handleOpenWhatsApp = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Nomor WhatsApp / HP tidak valid (minimal 10 digit).");
      return;
    }

    const message = `Halo Petugas PTSP Kemenag Barito Utara, saya butuh bantuan pemulihan/reset password akun PTSP Pemohon.\n\n*Detail Akun Saya:*\n- Nama Lengkap: ${nama.trim()}\n- Nomor WhatsApp/HP: ${cleanPhone}\n\nMohon bantuannya untuk me-reset password akun saya. Terima kasih.`;

    const waUrl = `https://wa.me/${OFFICIAL_WA_PETUGAS}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    // Otomatis kembalikan pemohon ke halaman login masyarakat setelah membuka WhatsApp
    setTimeout(() => {
      router.push("/login/masyarakat");
    }, 500);
  };

  return (
    <form onSubmit={handleOpenWhatsApp} className="space-y-6 pt-2 text-left">
      <p className="text-xs sm:text-sm text-slate-500 text-center leading-relaxed font-medium px-2">
        Silakan lengkapi data wajib Anda di bawah ini untuk terhubung langsung dengan <strong>Petugas Loket PTSP Kemenag Barito Utara</strong> via WhatsApp.
      </p>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            required
            value={nama}
            onInput={(e) => {
              const filtered = e.currentTarget.value.replace(/[^a-zA-Z\s'.,`-]/g, "");
              e.currentTarget.value = filtered;
              setNama(filtered);
              if (error) setError("");
            }}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^a-zA-Z\s'.,`-]/g, "");
              setNama(filtered);
              if (error) setError("");
            }}
            placeholder="Masukkan nama lengkap sesuai akun"
            className="h-12 bg-slate-50/70 text-xs sm:text-sm font-semibold rounded-2xl border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all shadow-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-bold text-slate-800">
            Nomor WhatsApp / HP Terdaftar <span className="text-rose-500">*</span>
          </label>
          <Input
            type="tel"
            required
            inputMode="numeric"
            value={phone}
            onInput={(e) => {
              // Hanya memperbolehkan angka (0-9)
              const filtered = e.currentTarget.value.replace(/[^0-9]/g, "");
              e.currentTarget.value = filtered;
              setPhone(filtered);
              if (error) setError("");
            }}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^0-9]/g, "");
              setPhone(filtered);
              if (error) setError("");
            }}
            placeholder="Contoh: 085117491212"
            className="h-12 bg-slate-50/70 text-xs sm:text-sm font-semibold rounded-2xl border-slate-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500/20 transition-all shadow-sm"
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-shake">
            {error}
          </p>
        )}

        <div className="pt-3">
          <Button
            type="submit"
            className="group relative w-full py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-700 hover:to-emerald-800 text-white shadow-xl shadow-teal-600/25 hover:shadow-teal-700/35 transition-all duration-300 font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-3 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Soft glowing ambient effect */}
            <span className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <MessageSquare className="h-5 w-5 shrink-0 group-hover:rotate-12 transition-transform duration-300 text-teal-100" />
            
            <div className="flex flex-col items-center justify-center leading-tight">
              <span className="font-extrabold text-xs sm:text-sm">Hubungi Petugas PTSP</span>
              <span className="font-medium text-[11px] sm:text-xs text-amber-200 flex items-center gap-1 mt-0.5">
                via WhatsApp <Sparkles className="h-3 w-3 inline-block animate-pulse text-amber-300" />
              </span>
            </div>
          </Button>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 text-center">
        <Link
          href="/login/masyarakat"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-teal-600 transition-colors py-1 px-3 rounded-full hover:bg-teal-50/50"
        >
          <ArrowRight className="h-4 w-4 rotate-180" />
          <span>Kembali ke Halaman Login</span>
        </Link>
      </div>
    </form>
  );
}
