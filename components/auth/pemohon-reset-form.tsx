"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  resetPasswordByPhoneAction,
  checkPhoneExistsAction,
} from "@/lib/actions/auth/reset-password";

export function PemohonResetForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleCheckPhone = async () => {
    if (!phone) return setError("Masukkan nomor HP Anda.");
    setLoading(true);
    setError("");

    const result = await checkPhoneExistsAction(phone);

    setLoading(false);
    if (result.error) {
      return setError(result.error);
    }

    if (!result.exists) {
      return setError("Nomor HP tidak ditemukan dalam sistem.");
    }

    setStep(2);
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return setError("Password minimal 6 karakter.");
    if (newPassword !== confirmPassword)
      return setError("Konfirmasi password tidak cocok.");

    setLoading(true);
    setError("");

    const result = await resetPasswordByPhoneAction(phone, newPassword);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Password Berhasil Diperbarui!", {
        description: `Halo ${result.name}, password Anda telah berhasil diubah.`,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      router.push("/login/pemohon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">
          {step === 1 ? "Verifikasi Nomor HP" : "Atur Password Baru"}
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {step === 1
            ? "Masukkan nomor WhatsApp yang terdaftar untuk verifikasi akun Anda."
            : "Nomor ditemukan! Sekarang masukkan password baru yang aman."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <m.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Masukkan nomor WhatsApp (Contoh: 0812345...)"
                className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
            <Button
              onClick={handleCheckPhone}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-base shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Lanjutkan
            </Button>
          </m.div>
        ) : (
          <m.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password Baru"
                className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi Password Baru"
                className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}
            <Button
              onClick={handleUpdatePassword}
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-base shadow-lg shadow-emerald-600/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Update Password
            </Button>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
