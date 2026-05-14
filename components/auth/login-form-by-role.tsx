"use client";

import {
  getEmailByPhoneAction,
  verifyRecaptchaAction,
} from "@/lib/actions/login-helper";
import ReCAPTCHA from "react-google-recaptcha";
import { useMemo, useState, useEffect, useRef, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { isAdminRole } from "@/lib/constants";

type LoginRoleMode = "pemohon" | "petugas";

function normalizeWhatsappNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function LoginFormByRole({ mode }: { mode: LoginRoleMode }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [mounted, setMounted] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

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

      // Use the server-side helper to get email (bypasses RLS)
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
      setError(
        "Akun ini belum memiliki email yang valid. Silakan hubungi admin.",
      );
      return;
    }

    if (mode === "petugas") {
      if (!recaptchaToken) {
        setLoading(false);
        setError("Silakan selesaikan reCAPTCHA untuk verifikasi keamanan.");
        return;
      }

      const verifyResult = await verifyRecaptchaAction(recaptchaToken);
      if (!verifyResult.success) {
        setLoading(false);
        setError(
          verifyResult.error ||
            "Verifikasi reCAPTCHA gagal. Silakan coba lagi.",
        );
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        return;
      }
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      if (signInError.message === "Invalid login credentials") {
        setError(
          "Email atau password salah. Pastikan akun Anda sudah terdaftar.",
        );
      } else {
        setError(signInError.message);
      }
      return;
    }

    const { data: userRes, error: userError } = await supabase.auth.getUser();

    if (userError || !userRes.user) {
      setLoading(false);
      setError(userError?.message || "Gagal memuat data pengguna.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, is_verified")
      .eq("id", userRes.user.id)
      .maybeSingle();

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    const role = String(profile?.role || "user");
    const isAdmin = isAdminRole(role);
    const isPetugasRole = isAdminRole(role);

    // Cek verifikasi: petugas yang belum diverifikasi Super Admin tidak bisa login
    if (mode === "petugas" && isPetugasRole && profile?.is_verified === false) {
      await supabase.auth.signOut();
      setLoading(false);
      setError(
        "Akun Anda sedang menunggu verifikasi dari Super Admin. Silakan hubungi admin untuk aktivasi.",
      );
      return;
    }

    if (mode === "petugas" && !isPetugasRole) {
      await supabase.auth.signOut();
      setLoading(false);
      setError("Akun ini bukan akun petugas/admin.");
      return;
    }

    setLoading(false);
    if (mode === "petugas") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      {mode === "pemohon" ? (
        <Field label="Nomor WhatsApp" required hint="Contoh: 08123456789">
          <Input name="phone" required placeholder="Masukkan nomor WhatsApp" />
        </Field>
      ) : (
        <Field label="Email" required>
          <Input
            type="email"
            name="email"
            required
            placeholder="nama@gmail.com"
          />
        </Field>
      )}

      <Field label="Password" required>
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
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </Field>

      {mode === "petugas" ? (
        <Field
          label="Verifikasi Keamanan"
          required
        >
          <div className="relative group overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50/30">
            <div className="relative flex min-h-[78px] items-center justify-center">
              {mounted ? (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                  onChange={(token) => {
                    setRecaptchaToken(token);
                  }}
                  onExpired={() => setRecaptchaToken(null)}
                  className="scale-[0.85] sm:scale-95 origin-center drop-shadow-sm"
                />
              ) : (
                <div className="h-[78px] w-full animate-pulse rounded-xl bg-slate-100" />
              )}
            </div>

            {recaptchaToken && (
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 animate-in fade-in zoom-in-95 duration-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Terverifikasi</span>
              </div>
            )}
          </div>
        </Field>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button
        className={`w-full h-11 text-[15px] font-bold shadow-md transition-all ${mode === "petugas" ? "bg-[#0f8a54]! hover:bg-[#0b7446]! hover:shadow-emerald-500/25" : "bg-[#059669]! hover:bg-[#047857]! hover:shadow-emerald-500/25"}`}
        disabled={loading}
      >
        {loading
          ? "Memproses..."
          : mode === "petugas"
            ? "Masuk Sebagai Petugas"
            : "Masuk Sebagai Pemohon"}
      </Button>
    </form>
  );
}
