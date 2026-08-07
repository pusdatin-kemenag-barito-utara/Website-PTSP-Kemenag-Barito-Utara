"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  PhoneCall, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  MapPin, 
  UserCheck,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePemohonWhatsappAction } from "@/lib/actions/auth/complete-profile";
import { Field } from "@/components/ui/field";

export function PemohonLengkapiWaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [alamat, setAlamat] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, "");
    if (!namaLengkap.trim()) {
      return setError("Masukkan nama lengkap Anda.");
    }
    if (!rawPhone || rawPhone.length < 10) {
      return setError("Masukkan nomor WhatsApp / HP yang valid (minimal 10 digit).");
    }
    if (!alamat.trim()) {
      return setError("Masukkan alamat domisili lengkap Anda.");
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("phone", rawPhone);
    formData.append("namaLengkap", namaLengkap.trim());
    formData.append("alamat", alamat.trim());

    const result = await updatePemohonWhatsappAction(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Data Profil Berhasil Disimpan!", {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      
      const nextPath = searchParams.get("next");
      if (nextPath && nextPath.startsWith("/") && nextPath !== "/dashboard") {
        router.push(nextPath);
      } else {
        router.push("/masyarakat");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-1 text-left">
      <p className="text-xs sm:text-sm text-slate-500 text-center leading-relaxed font-medium px-1">
        Silakan isi data profil diri Anda di bawah ini agar dapat digunakan untuk verifikasi layanan & penerimaan notifikasi status pengajuan.
      </p>

      <div className="space-y-4">
        <Field label="Nama Lengkap" required>
          <div className="relative group">
            <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <Input
              type="text"
              required
              value={namaLengkap}
              onInput={(e) => {
                const filtered = e.currentTarget.value.replace(/[^a-zA-Z\s'.,`-]/g, "");
                e.currentTarget.value = filtered;
                setNamaLengkap(filtered);
                if (error) setError("");
              }}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^a-zA-Z\s'.,`-]/g, "");
                setNamaLengkap(filtered);
                if (error) setError("");
              }}
              placeholder="Ketik nama lengkap sesuai identitas"
              className="h-12 pl-12 rounded-2xl border-slate-200 focus:border-teal-600 focus:ring-teal-600/10 text-xs sm:text-sm font-semibold bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
        </Field>

        <Field label="Nomor WhatsApp / HP Aktif" required hint="Contoh: 081234567890">
          <div className="relative group">
            <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <Input
              type="tel"
              required
              inputMode="numeric"
              value={phone}
              onInput={(e) => {
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
              placeholder="Masukkan nomor WhatsApp / HP aktif"
              className="h-12 pl-12 rounded-2xl border-slate-200 focus:border-teal-600 focus:ring-teal-600/10 text-xs sm:text-sm font-semibold bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
        </Field>

        <Field label="Alamat Lengkap" required>
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
            <Input
              type="text"
              required
              value={alamat}
              onChange={(e) => {
                setAlamat(e.target.value);
                if (error) setError("");
              }}
              placeholder="Masukkan alamat lengkap saat ini"
              className="h-12 pl-12 rounded-2xl border-slate-200 focus:border-teal-600 focus:ring-teal-600/10 text-xs sm:text-sm font-semibold bg-slate-50/50 focus:bg-white transition-all"
            />
          </div>
        </Field>

        {error && (
          <p className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 animate-shake">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </p>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading || phone.length < 10 || !namaLengkap.trim() || !alamat.trim()}
            className="group relative w-full h-13 rounded-2xl bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white shadow-xl shadow-teal-600/25 hover:shadow-teal-700/35 transition-all duration-300 font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 overflow-hidden hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <>
                <span>Simpan Data & Lanjutkan</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
