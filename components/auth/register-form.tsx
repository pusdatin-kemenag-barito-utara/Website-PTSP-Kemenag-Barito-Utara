"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { registerPemohonAction } from "@/lib/actions/auth/register-pemohon";

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const rawPhone = String(formData.get("phone") || "").trim();
    const normalizedPhone = normalizeWhatsappNumber(rawPhone);

    // Replace the phone in formData with normalized one
    formData.set("phone", normalizedPhone);

    if (!normalizedPhone || normalizedPhone.length < 10) {
      setLoading(false);
      setError("Nomor Telepon / WhatsApp tidak valid.");
      return;
    }

    try {
      const result = await registerPemohonAction(formData);
      if (result.success) {
        setMessage(
          "Registrasi berhasil! Mengalihkan Anda ke halaman login dalam 2 detik...",
        );

        // Automatic redirect after 2 seconds
        const loginUrl = callbackUrl 
          ? `/login/pemohon?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "/login/pemohon";
          
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 2000);
        // We keep loading as true to prevent double clicks during the 2-second wait
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat akun.");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit} autoComplete="off">
      <Field label="Nama Lengkap" required>
        <Input
          name="full_name"
          required
          placeholder="Masukkan nama lengkap"
          autoComplete="off"
        />
      </Field>

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
        />
      </Field>

      <Field label="Alamat" required>
        <Textarea
          name="address"
          required
          placeholder="Masukkan alamat lengkap"
          className="min-h-24"
          autoComplete="off"
        />
      </Field>

      <Field label="Password" required hint="Minimal 6 karakter">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            minLength={6}
            required
            placeholder="Masukkan password"
            className="pr-11"
            autoComplete="new-password"
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

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}

      <Button
        className="w-full h-11 text-[15px] font-bold shadow-md transition-all bg-[#059669]! hover:bg-[#047857]! hover:shadow-emerald-500/25"
        disabled={loading}
      >
        {loading ? "Memproses..." : "Buat Akun"}
      </Button>
    </form>
  );
}
