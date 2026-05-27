"use client";

import {
  getEmailByPhoneAction,
  verifyTurnstileAction,
} from "@/lib/actions/auth/login-helper";
import { getProfileAfterLoginAction } from "@/lib/actions/auth/auth";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/constants";
import { isSafeRedirect } from "@/lib/utils";

// Local Components
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";

type LoginRoleMode = "pemohon" | "petugas";

function normalizeWhatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function LoginFormByRole({
  mode,
  callbackUrl,
}: {
  mode: LoginRoleMode;
  callbackUrl?: string;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const supabase = createClient();
    let email = String(formData.get("email") || "");

    if (mode === "pemohon") {
      const phoneRaw = String(formData.get("phone") || "");
      const normalizedPhone = normalizeWhatsappNumber(phoneRaw);

      if (!normalizedPhone) {
        setLoading(false);
        setError("Nomor WhatsApp wajib diisi.");
        return;
      }

      const result = await getEmailByPhoneAction(normalizedPhone);
      if (result.error || !result.email) {
        setLoading(false);
        setError(result.error || "Nomor WhatsApp tidak ditemukan.");
        return;
      }
      email = result.email;
    }

    if (!email) {
      setLoading(false);
      setError("Akun ini belum memiliki email yang valid. Silakan hubungi admin.");
      return;
    }

    if (!turnstileToken) {
      setLoading(false);
      setError("Silakan selesaikan verifikasi keamanan.");
      return;
    }

    const verifyResult = await verifyTurnstileAction(turnstileToken);
    if (!verifyResult.success) {
      setLoading(false);
      setError(verifyResult.error || "Verifikasi keamanan gagal. Silakan coba lagi.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        setError(signInError.message === "Invalid login credentials" 
          ? "Email atau password salah. Pastikan akun Anda sudah terdaftar." 
          : signInError.message);
        return;
      }

      const { data: userRes, error: userError } = await supabase.auth.getUser();
      if (userError || !userRes.user) {
        setLoading(false);
        setError(userError?.message || "Gagal memuat data pengguna.");
        return;
      }

      const { data: profile, error: profileError } = await getProfileAfterLoginAction(userRes.user.id);
      if (profileError || !profile) {
        setLoading(false);
        setError(profileError || "Gagal memuat profil.");
        return;
      }

      const role = String(profile.role || "user");
      const isPetugasRole = isAdminRole(role);

      if (isPetugasRole && profile.isVerified === false) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Akun Anda sedang menunggu verifikasi dari Super Admin.");
        return;
      }

      if (mode === "petugas" && !isPetugasRole) {
        await supabase.auth.signOut();
        setLoading(false);
        setError("Akun ini bukan akun petugas/admin.");
        return;
      }

      const safeRedirect = callbackUrl && isSafeRedirect(callbackUrl) ? callbackUrl : (mode === "petugas" ? "/admin" : "/dashboard");
      window.location.href = safeRedirect;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Terjadi kesalahan saat login.");
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      {mode === "pemohon" ? (
        <Field label="Nomor WhatsApp" required hint="Contoh: 08123456789">
          <Input name="phone" required placeholder="Masukkan nomor WhatsApp" />
        </Field>
      ) : (
        <Field label="Email" required>
          <Input type="email" name="email" required placeholder="nama@gmail.com" />
        </Field>
      )}

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-slate-700">
            Password <span className="text-red-500">*</span>
          </span>
          <Link
            href="/forgot-password"
            className={`text-xs font-bold hover:underline transition-colors ${
              mode === "petugas"
                ? "text-[#0f8a54] hover:text-[#0b7446]"
                : "text-[#059669] hover:text-[#047857]"
            }`}
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Masukkan password"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <LoginTurnstile
        mounted={mounted}
        ref={turnstileRef}
        onTokenChange={setTurnstileToken}
      />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <Button
        className={`w-full h-11 text-[15px] font-bold shadow-md transition-all ${mode === "petugas" ? "bg-[#0f8a54]! hover:bg-[#0b7446]!" : "bg-[#059669]! hover:bg-[#047857]!"}`}
        disabled={loading || !turnstileToken}
      >
        {loading ? "Memproses..." : mode === "petugas" ? "Masuk Sebagai Petugas" : "Masuk Sebagai Pemohon"}
      </Button>
    </form>
  );
}
