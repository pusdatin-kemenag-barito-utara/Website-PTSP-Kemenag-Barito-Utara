"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePegawaiPhoneAction } from "@/lib/actions/auth/complete-profile";

export function PegawaiLengkapiWaForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      return setError("Masukkan nomor WhatsApp yang valid.");
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("phone", phone);

    const result = await updatePegawaiPhoneAction(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Nomor WhatsApp Berhasil Disimpan!", {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      // Redirect to admin dashboard after completion
      router.push("/admin");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-black text-slate-900">
          Lengkapi Profil
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          Silakan masukkan nomor WhatsApp aktif Anda untuk keperluan keamanan (termasuk Lupa Password).
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            placeholder="Nomor WhatsApp (Contoh: 0812345...)"
            className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || phone.length < 10}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : null}
          Simpan & Masuk ke Dashboard
        </Button>
      </div>
    </form>
  );
}
