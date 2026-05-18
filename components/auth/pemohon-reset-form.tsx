"use client";

import { useState, useEffect, useRef } from "react";
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
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: "", color: "bg-slate-200", textColor: "text-slate-400" };
  
  let score = 0;
  
  if (pass.length >= 6) score += 1;
  if (/\d/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

  if (pass.length < 6) {
    return { score: 0, label: "Terlalu Pendek (Min. 6 Karakter)", color: "bg-rose-500", textColor: "text-rose-500" };
  }

  switch (score) {
    case 1:
      return { score: 1, label: "Lemah 😕", color: "bg-orange-400", textColor: "text-orange-500" };
    case 2:
      return { score: 2, label: "Sedang 😐", color: "bg-yellow-400", textColor: "text-yellow-600" };
    case 3:
      return { score: 3, label: "Kuat 🙂", color: "bg-green-500", textColor: "text-green-600" };
    case 4:
    default:
      return { score: 4, label: "Sangat Kuat! 💪🚀", color: "bg-emerald-500", textColor: "text-emerald-600" };
  }
};

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
  
  const strength = getPasswordStrength(newPassword);

  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckPhone = async () => {
    if (!phone) return setError("Masukkan nomor HP Anda.");
    if (!turnstileToken) return setError("Silakan selesaikan verifikasi keamanan.");
    setLoading(true);
    setError("");

    const result = await checkPhoneExistsAction(phone, turnstileToken);

    setLoading(false);
    if (result.error) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return setError(result.error);
    }

    if (!result.exists) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
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

            <LoginTurnstile
              mounted={mounted}
              ref={turnstileRef}
              onTokenChange={setTurnstileToken}
            />

            <Button
              onClick={handleCheckPhone}
              disabled={loading || !turnstileToken}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#0f8a54] to-[#14b870] hover:from-[#0b7446] hover:to-[#0f8a54] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
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
            {newPassword.length > 0 ? (
              <div className="space-y-1.5 mt-2 transition-all duration-300">
                <div className="flex gap-1.5 h-1.5">
                  {[1, 2, 3, 4].map((index) => (
                    <div
                      key={index}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        index <= (strength.score === 0 && newPassword.length >= 6 ? 1 : strength.score)
                          ? strength.color
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-400">Kekuatan Password</span>
                  <span className={`transition-colors duration-300 ${strength.textColor}`}>
                    {strength.label}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 font-medium pl-1">Minimal 6 karakter.</p>
            )}
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
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#0f8a54] to-[#14b870] hover:from-[#0b7446] hover:to-[#0f8a54] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
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
