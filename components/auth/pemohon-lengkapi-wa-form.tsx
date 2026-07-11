"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, CheckCircle2, AlertCircle, Loader2, IdCard, MapPin, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePemohonWhatsappAction } from "@/lib/actions/auth/complete-profile";
import { Field } from "@/components/ui/field";

export function PemohonLengkapiWaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phone, setPhone] = useState("");
  const [nik, setNik] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [alamat, setAlamat] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawPhone = phone.replace(/\D/g, "");
    if (!rawPhone || rawPhone.length < 10) {
      return setError("Masukkan nomor WhatsApp yang valid.");
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("phone", rawPhone);
    formData.append("nik", nik);
    formData.append("pekerjaan", pekerjaan);
    formData.append("alamat", alamat);

    const result = await updatePemohonWhatsappAction(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Data Profil Berhasil Disimpan!", {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      
      const nextPath = searchParams.get("next");
      if (nextPath && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        router.push("/dashboard");
      }
    }
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const match = digits.match(/.{1,4}/g);
    return match ? match.join("-") : "";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-black text-slate-900">
          Lengkapi Data Anda
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Silakan masukkan nomor WhatsApp Anda agar bisa digunakan untuk masuk (login) dan menerima notifikasi layanan.
        </p>
      </div>

      <div className="space-y-4">
        <Field label="Nomor WhatsApp" required>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <Input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="0812-3456-..."
              className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </Field>

        <Field label="NIK (Nomor Induk Kependudukan)">
          <div className="relative group">
            <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <Input
              type="text"
              inputMode="numeric"
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
              placeholder="16 digit NIK"
              maxLength={16}
              className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </Field>

        <Field label="Pekerjaan">
          <div className="relative group">
            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <Input
              type="text"
              value={pekerjaan}
              onChange={(e) => setPekerjaan(e.target.value)}
              placeholder="Contoh: Wiraswasta, Pegawai Swasta..."
              className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </Field>

        <Field label="Alamat">
          <div className="relative group">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            <Input
              type="text"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Alamat domisili saat ini"
              className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-teal-500 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </Field>

        {error && (
          <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || phone.replace(/\D/g, "").length < 10}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-teal-700 to-teal-600 hover:from-teal-800 hover:to-teal-700 text-white shadow-xl shadow-teal-500/20 hover:shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Simpan Data & Lanjutkan
        </Button>
      </div>
    </form>
  );
}
