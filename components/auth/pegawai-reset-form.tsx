"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import {
  UserCircle2,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageSquareShare,
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  resetPasswordByPhoneAction,
  checkPegawaiPhoneExistsAction,
  verifyOtpAction,
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

export function PegawaiResetForm() {
  const router = useRouter();
  // 1: NIP & Phone, 2: OTP, 3: New Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [nip, setNip] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const strength = getPasswordStrength(newPassword);

  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckAccount = async () => {
    if (!nip) return setError("Masukkan NIP Anda.");
    if (!phone) return setError("Masukkan nomor HP Anda.");
    if (!turnstileToken) return setError("Silakan selesaikan verifikasi keamanan.");
    setLoading(true);
    setError("");

    const result = await checkPegawaiPhoneExistsAction(nip, phone, turnstileToken);

    setLoading(false);
    if (result.error) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return setError(result.error);
    }

    if (!result.exists) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return setError("Akun tidak bisa direset / NIP & No HP tidak sesuai.");
    }

    toast.success("OTP Dikirim!", {
      description: "Silakan periksa pesan WhatsApp Anda.",
    });
    setStep(2);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return setError("Masukkan 6 digit kode OTP.");
    
    setLoading(true);
    setError("");

    const result = await verifyOtpAction(phone, otp);

    setLoading(false);
    if (result.error) {
      return setError(result.error);
    }

    if (result.success && result.resetToken) {
      setResetToken(result.resetToken);
      setStep(3);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) return setError("Password minimal 6 karakter.");
    if (newPassword !== confirmPassword)
      return setError("Konfirmasi password tidak cocok.");

    setLoading(true);
    setError("");

    const result = await resetPasswordByPhoneAction(phone, newPassword, resetToken, "pegawai");

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      toast.success("Password Berhasil Diperbarui!", {
        description: `Password Anda telah berhasil diubah.`,
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      });
      router.push("/login/pegawai");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-black text-slate-900">
          {step === 1 && "Reset Password Pegawai"}
          {step === 2 && "Masukkan Kode OTP"}
          {step === 3 && "Atur Password Baru"}
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          {step === 1 && "Masukkan NIP dan Nomor WhatsApp Anda. Kami akan mengirimkan kode OTP."}
          {step === 2 && "Kami telah mengirimkan 6 digit kode OTP ke nomor WhatsApp Anda."}
          {step === 3 && "Kode OTP valid! Sekarang masukkan password baru yang aman."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <m.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative group">
              <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/\D/g, ""))}
                placeholder="Masukkan NIP Anda"
                className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
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
              onClick={handleCheckAccount}
              disabled={loading || !turnstileToken || phone.length < 10 || nip.length < 10}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Kirim OTP ke WhatsApp
            </Button>
          </m.div>
        )}

        {step === 2 && (
          <m.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative group">
              <MessageSquareShare className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                type="tel"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="● ● ● ● ● ●"
                maxLength={6}
                className="h-14 pl-12 pr-12 text-center tracking-[0.5em] placeholder:tracking-normal font-bold text-3xl rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10 transition-all"
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
                <AlertCircle className="h-3.5 w-3.5" /> {error}
              </p>
            )}

            <Button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : null}
              Verifikasi OTP
            </Button>

            <button 
              onClick={() => setStep(1)}
              className="w-full text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
            >
              Ganti Nomor / Kirim Ulang OTP
            </button>
          </m.div>
        )}

        {step === 3 && (
          <m.div
            key="step3"
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
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#064e3b] hover:to-[#047857] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
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
