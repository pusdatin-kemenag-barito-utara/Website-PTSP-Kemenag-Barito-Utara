import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";
import { checkEmailExistsAction } from "@/lib/actions/auth/reset-password";

export function PetugasResetForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSendEmailLink = async () => {
    if (!email) return setError("Masukkan email petugas Anda.");
    if (!turnstileToken) return setError("Silakan selesaikan verifikasi keamanan.");
    setLoading(true);
    setError("");

    // 1. Verifikasi Turnstile dan Cek Keberadaan & Hak Akses Email Petugas
    const checkRes = await checkEmailExistsAction(email, turnstileToken);
    if (checkRes.error) {
      setLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      return setError(checkRes.error);
    }

    // 2. Kirim Link Reset Password melalui Supabase Auth
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );

    setLoading(false);
    if (resetError) {
      turnstileRef.current?.reset();
      setTurnstileToken(null);
      setError(resetError.message);
    } else {
      toast.success("Email Terkirim!", {
        description: "Silakan cek inbox email Anda untuk link reset password.",
      });
      router.push("/login/petugas");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">
          Reset Password Petugas
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Masukkan email petugas Anda. Kami akan mengirimkan link untuk mengatur
          ulang password ke inbox Anda.
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@kemenag.go.id"
            className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"
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
          onClick={handleSendEmailLink}
          disabled={loading || !turnstileToken}
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#0f8a54] to-[#14b870] hover:from-[#0b7446] hover:to-[#0f8a54] text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300 font-black tracking-wide"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Kirim Link Reset
        </Button>
      </div>
    </div>
  );
}
