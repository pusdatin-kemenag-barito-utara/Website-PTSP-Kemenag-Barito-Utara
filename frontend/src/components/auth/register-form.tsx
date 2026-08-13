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
import { isSafeRedirect } from "@/lib/utils";

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
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawPhone = String(formData.get("phone") || "").trim();
    const normalizedPhone = normalizeWhatsappNumber(rawPhone);

    formData.set("phone", normalizedPhone);
    formData.append("turnstile_token", turnstileToken);

    if (!normalizedPhone || normalizedPhone.length < 10) {
      setLoading(false);
      isSubmittingRef.current = false;
      setError("Nomor Telepon / WhatsApp tidak valid.");
      return;
    }

    try {
      const result = await registerPemohonAction(formData);
      if (result.success) {
        setMessage("Registrasi berhasil! Mengalihkan Anda ke halaman login...");

        const safeCallback = callbackUrl && isSafeRedirect(callbackUrl) ? callbackUrl : "/masyarakat";
        const loginUrl = `/login/masyarakat?callbackUrl=${encodeURIComponent(safeCallback)}`;
          
        setTimeout(() => {
          router.push(loginUrl);
          router.refresh();
        }, 1500);
      } else {
        setError(result.error || "Gagal membuat akun.");
        setLoading(false);
        isSubmittingRef.current = false;
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memproses permintaan.");
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
      className="space-y-4" 
      onSubmit={onSubmit} 
      autoComplete="off"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <m.div variants={itemVariants}>
        <Field label="Nama Lengkap" required>
          <Input
            name="full_name"
            required
            placeholder="Masukkan nama lengkap"
            autoComplete="off"
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
          hint="Contoh: 081234567890"
        >
          <Input
            name="phone"
            required
            placeholder="Masukkan nomor WhatsApp aktif"
            autoComplete="off"
            type="tel"
            inputMode="numeric"
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
            }}
          />
        </Field>
      </m.div>

      <m.div variants={itemVariants}>
        <Field label="Alamat" required>
          <Textarea
            name="address"
            required
            placeholder="Masukkan alamat lengkap"
            className="min-h-16 resize-none"
            autoComplete="off"
          />
        </Field>
      </m.div>

      <m.div variants={itemVariants}>
        <Field label="Password" required hint="Minimal 8 karakter">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={8}
              required
              placeholder="Masukkan password"
              className="pr-11"
              autoComplete="new-password"
              value={passwordVal}
              onChange={(e) => setPasswordVal(e.target.value)}
            />
            <button
              type="button"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          <AnimatePresence>
            {passwordVal.length > 0 && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 space-y-1 overflow-hidden"
              >
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1.5 w-full rounded-full transition-colors ${
                        strengthScore >= level ? getStrengthColor(strengthScore) : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[11px] font-medium ${getStrengthTextColor(strengthScore)}`}>
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
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-red-50 px-3 py-3 text-sm text-red-700">{error}</p>
          </m.div>
        )}
        {message && (
          <m.div
            key="success-msg"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="rounded-lg bg-emerald-50 px-3 py-3 text-sm text-emerald-700 border border-emerald-100">{message}</p>
          </m.div>
        )}
      </AnimatePresence>

      <m.div variants={itemVariants} className="pt-2 flex justify-center">
        <LoginTurnstile
          mounted={mounted}
          ref={turnstileRef}
          onTokenChange={setTurnstileToken}
        />
      </m.div>

      <m.div variants={itemVariants} className="pt-2">
        <m.div whileTap={loading || !turnstileToken ? {} : { scale: 0.96 }}>
          <Button
            className="w-full h-12 text-[15px] font-bold shadow-md transition-all bg-[#059669]! hover:bg-[#047857]! hover:shadow-emerald-500/25 rounded-xl"
            disabled={loading || !turnstileToken}
          >
            {loading ? "Memproses..." : "Daftar Akun Pemohon"}
          </Button>
        </m.div>
      </m.div>
    </m.form>
  );
}
