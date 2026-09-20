import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Eye, EyeOff } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";

import { registerPemohonAction } from "@/lib/actions/auth/register-pemohon";
import { loginViaGolangAction } from "@/lib/actions/auth/login-helper";
import { isSafeRedirect } from "@/lib/utils";
import { toast } from "sonner";

function normalizeWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  return digits;
}

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [passwordVal, setPasswordVal] = useState("");

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(passwordVal);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "bg-red-500";
    if (score === 2) return "bg-amber-500";
    if (score === 3) return "bg-blue-500";
    return "bg-emerald-500";
  };

  const getStrengthTextColor = (score: number) => {
    if (score <= 1) return "text-red-600";
    if (score === 2) return "text-amber-600";
    if (score === 3) return "text-blue-600";
    return "text-emerald-600";
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return "Lemah";
    if (score === 2) return "Sedang";
    if (score === 3) return "Kuat";
    return "Sangat Kuat";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSubmittingRef = useRef(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingRef.current) return;
    
    setError("");
    setMessage("");
    setLoading(true);
    isSubmittingRef.current = true;

    if (!turnstileToken) {
      setLoading(false);
      isSubmittingRef.current = false;
      setError("Silakan selesaikan verifikasi keamanan.");
      toast.error("Silakan selesaikan verifikasi keamanan.", { id: "register-toast" });
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawPhone = String(formData.get("phone") || "").trim();
    const normalizedPhone = normalizeWhatsappNumber(rawPhone);
    const password = String(formData.get("password") || "");

    formData.set("phone", normalizedPhone);
    formData.append("turnstile_token", turnstileToken);

    if (!normalizedPhone || normalizedPhone.length < 10) {
      setLoading(false);
      isSubmittingRef.current = false;
      setError("Nomor Telepon / WhatsApp tidak valid.");
      toast.error("Nomor Telepon / WhatsApp tidak valid.", { id: "register-toast" });
      return;
    }

    toast.loading("Memproses pendaftaran...", { id: "register-toast" });

    try {
      const result = await registerPemohonAction(formData);
      if (result.success) {
        // Simpan nomor telepon di localStorage untuk auto-fill login
        try {
          localStorage.setItem("ptsp_remember_phone", normalizedPhone);
        } catch (e) {}

        const safeCallback = callbackUrl && isSafeRedirect(callbackUrl) ? callbackUrl : "/masyarakat";

        // Coba login otomatis setelah registrasi berhasil
        try {
          const loginRes = await loginViaGolangAction({
            identifier: normalizedPhone,
            password,
            mode: "pemohon",
            rememberMe: true,
          });

          if (loginRes.success && loginRes.token) {
            const maxAge = 30 * 24 * 3600;
            document.cookie = `ptsp-auth=${encodeURIComponent(loginRes.token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
            try {
              localStorage.setItem("ptsp-auth-token", loginRes.token);
              if (loginRes.user) {
                localStorage.setItem("ptsp-auth-user", JSON.stringify(loginRes.user));
              }
            } catch (e) {}

            setMessage("Pendaftaran berhasil! Mengalihkan ke dashboard...");
            toast.success("Pendaftaran & Login Berhasil!", {
              id: "register-toast",
              description: "Mengalihkan Anda ke portal pemohon...",
            });

            setTimeout(() => {
              window.location.replace(safeCallback);
            }, 1000);
            return;
          }
        } catch (loginErr) {
          console.warn("Auto-login error after registration:", loginErr);
        }

        // Fallback: Arahkan ke halaman login masyarakat secara tegas
        const loginUrl = `/login/masyarakat?registered=true&phone=${encodeURIComponent(normalizedPhone)}&callbackUrl=${encodeURIComponent(safeCallback)}`;
        setMessage("Registrasi berhasil! Mengalihkan ke halaman login...");
        toast.success("Registrasi Berhasil!", {
          id: "register-toast",
          description: "Mengalihkan ke halaman login masyarakat...",
        });

        setTimeout(() => {
          window.location.replace(loginUrl);
        }, 1200);
      } else {
        const errMsg = result.error || "Gagal membuat akun.";
        setError(errMsg);
        toast.error(errMsg, { id: "register-toast" });
        setLoading(false);
        isSubmittingRef.current = false;
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } catch (err: any) {
      const errMsg = err.message || "Gagal memproses permintaan.";
      setError(errMsg);
      toast.error(errMsg, { id: "register-toast" });
      setLoading(false);
      isSubmittingRef.current = false;
      turnstileRef.current?.reset();
      setTurnstileToken(null);
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
      className="space-y-2.5" 
      onSubmit={onSubmit} 
      autoComplete="off"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <m.div variants={itemVariants}>
        <Field label="Nama Lengkap" required labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Input
            name="full_name"
            required
            placeholder="Masukkan nama lengkap"
            autoComplete="off"
            className="h-9 text-xs sm:text-sm py-1.5"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[0-9]/g, "");
            }}
          />
        </Field>
      </m.div>

      <m.div variants={itemVariants}>
        <Field
          label="Nomor Telepon / WhatsApp"
          required
          labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-200"
        >
          <Input
            name="phone"
            required
            placeholder="Nomor WhatsApp aktif (cth: 08123456789)"
            autoComplete="off"
            type="tel"
            inputMode="numeric"
            className="h-9 text-xs sm:text-sm py-1.5"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
            }}
          />
        </Field>
      </m.div>

      <m.div variants={itemVariants}>
        <Field label="Alamat" required labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <Textarea
            name="address"
            required
            placeholder="Masukkan alamat lengkap"
            className="min-h-[44px] h-11 max-h-16 py-1.5 px-3 text-xs sm:text-sm resize-none"
            autoComplete="off"
          />
        </Field>
      </m.div>

      <m.div variants={itemVariants}>
        <Field label="Password" required labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-200">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={8}
              required
              placeholder="Minimal 8 karakter"
              className="pr-10 h-9 text-xs sm:text-sm py-1.5"
              autoComplete="new-password"
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
          
          <AnimatePresence>
            {passwordVal.length > 0 && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1 space-y-0.5 overflow-hidden"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-full rounded-full transition-colors ${
                        strengthScore >= level ? getStrengthColor(strengthScore) : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[10px] font-medium ${getStrengthTextColor(strengthScore)}`}>
                  Kekuatan password: {getStrengthLabel(strengthScore)}
                </p>
              </m.div>
            )}
          </AnimatePresence>
        </Field>
      </m.div>

      <AnimatePresence mode="wait">
        {error && (
          <m.div
            key="error-msg"
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          </m.div>
        )}
        {message && (
          <m.div
            key="success-msg"
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 border border-emerald-100">{message}</p>
          </m.div>
        )}
      </AnimatePresence>

      <m.div variants={itemVariants} className="pt-0.5 flex justify-center scale-90 sm:scale-95 origin-center">
        <LoginTurnstile
          mounted={mounted}
          ref={turnstileRef}
          onTokenChange={setTurnstileToken}
        />
      </m.div>

      <m.div variants={itemVariants} className="pt-0.5">
        <m.div whileTap={loading || !turnstileToken ? {} : { scale: 0.98 }}>
          <Button
            className="w-full h-10 text-xs sm:text-sm font-bold shadow-xs transition-colors bg-emerald-700! hover:bg-emerald-800! rounded-xl cursor-pointer"
            disabled={loading || !turnstileToken}
          >
            {loading ? "Memproses..." : "Daftar Akun Pemohon"}
          </Button>
        </m.div>
      </m.div>
    </m.form>
  );
}
