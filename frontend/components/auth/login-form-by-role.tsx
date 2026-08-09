"use client";

import {
  getEmailByPhoneAction,
  verifyTurnstileAction,
  handlePegawaiLoginAction,
} from "@/lib/actions/auth/login-helper";
import { getProfileAfterLoginAction } from "@/lib/actions/auth/auth";
import { logLoginAction } from "@/lib/actions/auth/login-audit";
import { checkLoginLockoutAction, recordFailedLoginAction } from "@/lib/actions/auth/login-lockout";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { m, AnimatePresence } from "framer-motion";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/constants";
import { isSafeRedirect } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

// Local Components
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";
import { GoogleOneTap } from "./google-one-tap";

type LoginRoleMode = "pemohon" | "petugas" | "pegawai";

function normalizeWhatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function LoginFormByRole({
  mode,
  callbackUrl,
  initialError = "",
  nip = "",
}: {
  mode: LoginRoleMode;
  callbackUrl?: string;
  initialError?: string;
  nip?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedIdentifier, setSavedIdentifier] = useState("");
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const storageKey =
    mode === "pemohon" ? "ptsp_remember_phone" :
    mode === "petugas" ? "ptsp_remember_email" :
    "ptsp_remember_nip";

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setSavedIdentifier(stored);
      setRememberMe(true);
    }
  }, [storageKey]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const supabase = createClient();

    // Handle remember me for all modes
    if (mode === "pemohon") {
      const phoneRaw = String(formData.get("phone") || "");
      const val = normalizeWhatsappNumber(phoneRaw);
      rememberMe && val ? localStorage.setItem(storageKey, val) : localStorage.removeItem(storageKey);
    } else if (mode === "petugas") {
      const emailVal = String(formData.get("email") || "");
      rememberMe && emailVal ? localStorage.setItem(storageKey, emailVal) : localStorage.removeItem(storageKey);
    } else if (mode === "pegawai") {
      const nipVal = String(formData.get("nip") || "");
      rememberMe && nipVal ? localStorage.setItem(storageKey, nipVal) : localStorage.removeItem(storageKey);
    }
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
    } else if (mode === "pegawai") {
      const nip = String(formData.get("nip") || "");
      if (!nip) {
        setLoading(false);
        setError("NIP wajib diisi.");
        return;
      }
      
      const result = await handlePegawaiLoginAction(nip, password, turnstileToken || undefined);
      if (result.error || !result.email) {
        setLoading(false);
        setError(result.error || "Gagal memverifikasi NIP.");
        turnstileRef.current?.reset();
        setTurnstileToken(null);
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

    // Optimization: Run Turnstile verification and Lockout check in parallel (Promise.all)
    const [verifyResult, lockoutCheck] = await Promise.all([
      mode !== "pegawai" 
        ? verifyTurnstileAction(turnstileToken) 
        : Promise.resolve({ success: true, error: undefined }),
      checkLoginLockoutAction(email)
    ]);

    if (!verifyResult.success) {
      setLoading(false);
      setError(verifyResult.error || "Verifikasi keamanan gagal. Silakan coba lagi.");
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return;
    }

    if (lockoutCheck.error) {
      setLoading(false);
      setError(lockoutCheck.error);
      return;
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setLoading(false);
        if (signInError.message === "Invalid login credentials") {
          await recordFailedLoginAction(email);
          setError("Email atau password salah. Pastikan akun Anda sudah terdaftar.");
        } else {
          setError(signInError.message);
        }
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      const user = signInData.user;
      if (!user) {
        setLoading(false);
        setError("Gagal memuat data pengguna.");
        return;
      }

      const { data: profile, error: profileError } = await getProfileAfterLoginAction(user.id);
      if (profileError || !profile) {
        await supabase.auth.signOut();
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

      logLoginAction().catch((err) => console.warn("Failed to write login audit log:", err));

      let safeRedirect = callbackUrl && isSafeRedirect(callbackUrl) 
        ? callbackUrl 
        : (mode === "petugas" ? "/admin" : (mode === "pegawai" ? "/pegawai" : "/masyarakat"));

      // Jika pemohon dan belum mengisi no HP/WhatsApp, arahkan ke lengkapi profil
      if (mode === "pemohon" && (!profile.phone || profile.phone.trim() === "" || profile.phone === "-")) {
        safeRedirect = "/login/masyarakat/lengkapi-profil";
      }
        
      window.location.href = safeRedirect;
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Terjadi kesalahan saat login.");
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    try {
      const redirectUrl = `${window.location.origin}/auth/callback${callbackUrl ? `?next=${encodeURIComponent(callbackUrl)}` : ""}`;
      
      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      
      if (signInError) throw signInError;

      if (data?.url) {
        const width = 550;
        const height = 650;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.url,
          "GoogleLoginPopup",
          `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=1`
        );

        if (!popup || popup.closed || typeof popup.closed === "undefined") {
          window.location.href = data.url;
          return;
        }

        // Add 60s safety timeout to auto-reset loading state if user leaves popup open
        const timeoutId = setTimeout(() => {
          setLoading(false);
        }, 60000);

        const checkPopupInterval = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(checkPopupInterval);
            clearTimeout(timeoutId);
            setLoading(false);
          }
        }, 500);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Terjadi kesalahan saat login dengan Google.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <m.form 
      className="space-y-4" 
      onSubmit={onSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {mode === "pemohon" ? (
        <m.div variants={itemVariants}>
          <Field label="Nomor WhatsApp / HP Aktif" required hint="Contoh: 08123456789">
            <Input 
              key={savedIdentifier || 'phone'}
              name="phone" 
              required 
              placeholder="Contoh: 08123456789" 
              type="tel"
              inputMode="numeric"
              defaultValue={savedIdentifier}
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
              }}
            />
          </Field>
        </m.div>
      ) : mode === "pegawai" ? (
        <m.div variants={itemVariants}>
          <Field label="NIP (Nomor Induk Pegawai)" required>
            <Input 
              key={nip || savedIdentifier || 'nip'}
              type="text" 
              name="nip" 
              required 
              defaultValue={nip || savedIdentifier}
              placeholder="Masukkan NIP Anda" 
              onInput={(e) => {
                e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
              }}
            />
          </Field>
        </m.div>
      ) : (
        <m.div variants={itemVariants}>
          <Field label="Email" required>
            <Input key={savedIdentifier || 'email'} type="email" name="email" required placeholder="nama@gmail.com" defaultValue={savedIdentifier} />
          </Field>
        </m.div>
      )}

      <m.div variants={itemVariants} className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="block text-sm font-medium text-slate-700">
            Password <span className="text-red-500">*</span>
          </span>
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
      </m.div>

      <m.div variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer group select-none w-fit" onClick={() => setRememberMe((prev) => !prev)}>
            <div
              className={`relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 ${
                rememberMe
                  ? mode === "petugas" ? "bg-[#0f8a54]" : mode === "pegawai" ? "bg-[#047857]" : "bg-emerald-500"
                  : "bg-slate-200 group-hover:bg-slate-300"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${
                  rememberMe ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
              Ingat Saya
            </span>
          </div>
          {mode !== "petugas" && (
            <Link
              href={`/forgot-password/${mode}`}
              className={`text-xs font-bold hover:underline transition-colors ${
                mode === "pegawai"
                  ? "text-[#047857] hover:text-[#064e3b]"
                  : "text-[#059669] hover:text-[#047857]"
              }`}
            >
              Lupa password?
            </Link>
          )}
        </div>
      </m.div>

      <m.div variants={itemVariants}>
        <LoginTurnstile
          mounted={mounted}
          ref={turnstileRef}
          onTokenChange={setTurnstileToken}
        />
      </m.div>

      <AnimatePresence mode="wait">
        {error && (
          <m.div
            key="error-msg"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 mb-2">{error}</p>
          </m.div>
        )}
      </AnimatePresence>

      <m.div variants={itemVariants}>
        <m.div whileTap={loading || !turnstileToken ? {} : { scale: 0.96 }}>
          <Button
            className={`w-full h-11 text-[15px] font-bold shadow-md transition-all ${
              mode === "petugas" 
                ? "bg-[#0f8a54]! hover:bg-[#0b7446]!" 
                : mode === "pegawai"
                  ? "bg-[#047857]! hover:bg-[#064e3b]!"
                  : "bg-[#059669]! hover:bg-[#047857]!"
            }`}
            disabled={loading || !turnstileToken}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </span>
            ) : mode === "petugas" ? "Masuk Sebagai Petugas" : mode === "pegawai" ? "Masuk Sebagai Pegawai" : "Masuk Sebagai Pemohon"}
          </Button>
        </m.div>
      </m.div>

      {mode === "pemohon" && (
        <>
          <GoogleOneTap callbackUrl={callbackUrl} />
          <m.div variants={itemVariants} className="mt-1">
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black tracking-widest uppercase">
                <span className="bg-white px-3 text-slate-400">Atau</span>
              </div>
            </div>
            <m.div whileTap={loading ? {} : { scale: 0.96 }}>
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 text-[14px] font-bold shadow-sm transition-all border-slate-200 hover:bg-slate-50 text-slate-600 flex items-center justify-center gap-2.5"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Masuk dengan Google
              </Button>
            </m.div>
          </m.div>
        </>
      )}
    </m.form>
  );
}
