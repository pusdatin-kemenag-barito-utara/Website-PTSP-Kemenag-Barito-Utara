"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function PetugasResetForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendEmailLink = async () => {
    if (!email) return setError("Masukkan email petugas Anda.");
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      },
    );

    setLoading(false);
    if (resetError) {
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
            className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
          />
        </div>
        {error && (
          <p className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertCircle className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        <Button
          onClick={handleSendEmailLink}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#1f4bb7] hover:bg-[#1a3fa3] font-bold text-base shadow-lg shadow-blue-500/20"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Kirim Link Reset
        </Button>
      </div>
    </div>
  );
}
