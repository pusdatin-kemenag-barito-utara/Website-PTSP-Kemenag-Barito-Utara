"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordHashAction } from "@/lib/actions/auth/auth";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: "", color: "bg-slate-200", textColor: "text-slate-400" };
  
  let score = 0;
  
  // Rule 1: Panjang minimal 6 karakter
  if (pass.length >= 6) score += 1;
  // Rule 2: Ada angka
  if (/\d/.test(pass)) score += 1;
  // Rule 3: Ada campuran huruf besar & kecil
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  // Rule 4: Ada karakter khusus (symbol)
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score += 1;

  // Jika panjang di bawah 6 karakter, selalu kembalikan score 0 (terlalu pendek)
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

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = getPasswordStrength(password);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 6) {
      setLoading(false);
      return setError("Password baru minimal harus 6 karakter.");
    }

    if (password !== confirmPassword) {
      setLoading(false);
      return setError("Konfirmasi password baru tidak cocok.");
    }

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setLoading(false);
        if (updateError.message.includes("Auth session missing") || updateError.message.includes("session missing")) {
          setError("Sesi kedaluwarsa! Silakan kembali ke halaman Lupa Password untuk mengirimkan link atur ulang yang baru.");
        } else {
          setError(updateError.message);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updatePasswordHashAction(user.id, password);
      }

      setSuccess(true);
      setLoading(false);
      toast.success("Password Berhasil Diperbarui!", {
        description: "Akun Anda sekarang aman dengan password baru Anda.",
      });

      // Tunggu sebentar lalu redirect ke halaman login
      setTimeout(() => {
        router.push("/login/petugas");
      }, 2000);
    } catch (err: any) {
      setLoading(false);
      setError("Terjadi kesalahan internal: " + err.message);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 ring-8 ring-indigo-500/5">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900">Pembaruan Berhasil!</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">
            Password Anda telah berhasil diperbarui. Mengalihkan Anda ke halaman login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      {/* Password Baru Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Password Baru <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Masukkan password baru"
            className="pl-11 pr-11"
            minLength={6}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password.length > 0 ? (
          <div className="space-y-1.5 mt-2 transition-all duration-300">
            <div className="flex gap-1.5 h-1.5">
              {[1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    index <= (strength.score === 0 && password.length >= 6 ? 1 : strength.score)
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
          <p className="text-[11px] text-slate-400 font-medium">Minimal 6 karakter.</p>
        )}
      </div>

      {/* Konfirmasi Password Baru Field */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Konfirmasi Password Baru <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Masukkan kembali password baru"
            className="pl-11 pr-11"
            minLength={6}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            disabled={loading}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-700 border border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          {error.includes("Lupa Password") && (
            <Link
              href="/forgot-password/petugas"
              className="block text-center text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors mt-2"
            >
              Klik di sini untuk ke Halaman Lupa Password →
            </Link>
          )}
        </div>
      )}

      <Button
        className="w-full h-11 text-[15px] font-bold shadow-md bg-indigo-600! hover:bg-indigo-700! text-white transition-all flex items-center justify-center gap-2 rounded-xl"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menyimpan Password...</span>
          </>
        ) : (
          "Simpan Password Baru"
        )}
      </Button>
    </form>
  );
}
