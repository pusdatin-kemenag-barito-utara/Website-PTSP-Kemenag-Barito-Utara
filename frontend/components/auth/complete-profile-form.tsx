"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { completeProfileAction } from "@/lib/actions/auth/complete-profile";
import { toast } from "sonner";
import { User, Phone, MapPin, LogOut } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { signOutAction } from "@/lib/actions/auth/sign-out";

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
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1500);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOutAction("/login/pemohon");
    } catch (err) {
      // Ignore Next.js redirect error
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.form 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      onSubmit={handleSubmit} 
      className="space-y-6"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-start gap-3 shadow-sm"
        >
          <div className="mt-0.5 min-w-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="leading-relaxed">{error}</p>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-2 relative group">
        <label htmlFor="fullName" className="text-slate-600 font-bold ml-1 text-[13px] uppercase tracking-wider block">Nama Lengkap</label>
        <div className="relative transition-all duration-300 group-focus-within:-translate-y-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <User className="h-5 w-5" />
          </div>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={initialName}
            placeholder="Ketik nama lengkap Anda..."
            className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-[15px] font-medium shadow-sm transition-all"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2 relative group">
        <label htmlFor="phone" className="text-slate-600 font-bold ml-1 text-[13px] uppercase tracking-wider block">Nomor WhatsApp Aktif</label>
        <div className="relative transition-all duration-300 group-focus-within:-translate-y-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Phone className="h-5 w-5" />
          </div>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={initialPhone}
            placeholder="Contoh: 081234567890"
            className="pl-12 h-14 rounded-2xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-[15px] font-medium shadow-sm transition-all"
          />
        </div>
        <p className="text-[12px] text-slate-500 ml-1 mt-1.5 font-medium leading-relaxed">
          Penting: Kami akan mengirimkan notifikasi status pengajuan Anda ke nomor ini.
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-2 relative group">
        <label htmlFor="address" className="text-slate-600 font-bold ml-1 text-[13px] uppercase tracking-wider block">Alamat Lengkap</label>
        <div className="relative transition-all duration-300 group-focus-within:-translate-y-1">
          <div className="absolute top-4 left-0 flex items-start pl-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <MapPin className="h-5 w-5" />
          </div>
          <Textarea
            id="address"
            name="address"
            required
            placeholder="Masukkan alamat domisili lengkap Anda saat ini..."
            className="pl-12 pt-4 min-h-[110px] rounded-2xl border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-[15px] font-medium shadow-sm resize-none transition-all"
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-4 flex flex-col gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl font-bold text-[16px] bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_8px_30px_rgb(5,150,105,0.25)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(5,150,105,0.4)] hover:-translate-y-1 active:translate-y-0"
        >
          {loading ? "Menyimpan Data..." : "Simpan Profil & Mulai Layanan"}
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          disabled={loading}
          className="w-full h-12 rounded-2xl font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Batal & Ganti Akun Google
        </Button>
      </motion.div>
    </motion.form>
  );
}
