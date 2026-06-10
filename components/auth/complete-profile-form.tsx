"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeProfileAction } from "@/lib/actions/auth/complete-profile";
import { toast } from "sonner";
import { User, Phone, MapPin } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface CompleteProfileFormProps {
  initialName?: string;
  initialPhone?: string;
}

export function CompleteProfileForm({ initialName = "", initialPhone = "" }: CompleteProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await completeProfileAction(formData);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      toast.success("Profil berhasil disimpan!", {
        description: "Anda akan diarahkan ke dasbor...",
      });
      // Beri jeda sedikit untuk toast
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium flex items-start gap-2.5"
        >
          <div className="mt-0.5 min-w-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p>{error}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-1.5">
        <label htmlFor="fullName" className="text-slate-700 font-bold ml-1 text-sm block mb-1">Nama Lengkap</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <User className="h-5 w-5" />
          </div>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={initialName}
            placeholder="Masukkan nama lengkap Anda"
            className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-white"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <label htmlFor="phone" className="text-slate-700 font-bold ml-1 text-sm block mb-1">Nomor WhatsApp Aktif</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Phone className="h-5 w-5" />
          </div>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={initialPhone}
            placeholder="Contoh: 081234567890"
            className="pl-11 h-12 rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-white"
          />
        </div>
        <p className="text-xs text-slate-500 ml-1 mt-1 font-medium">
          Kami akan menggunakan nomor ini untuk mengirim notifikasi status layanan.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-1.5">
        <label htmlFor="address" className="text-slate-700 font-bold ml-1 text-sm block mb-1">Alamat Lengkap</label>
        <div className="relative">
          <div className="absolute top-3.5 left-0 flex items-start pl-3.5 pointer-events-none text-slate-400">
            <MapPin className="h-5 w-5" />
          </div>
          <Textarea
            id="address"
            name="address"
            required
            placeholder="Masukkan alamat domisili Anda"
            className="pl-11 min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-white resize-none"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-bold text-[15px] bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? "Menyimpan Data..." : "Simpan Profil & Lanjutkan"}
        </Button>
      </motion.div>
    </form>
  );
}
