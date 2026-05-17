"use client";

import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { updateProfileAction } from "@/lib/actions/user/user";
import { toast } from "sonner"; // Assuming sonner is used, if not we use manual state

export function ProfileForm({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    try {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success(result.message || "Profil berhasil diperbarui");
      } else {
        setError(result.error || "Gagal memperbarui profil");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nama Lengkap" required>
          <Input
            name="full_name"
            defaultValue={profile.fullName || ""}
            required
            className="h-12"
          />
        </Field>

        <Field label="Nomor Telepon / WhatsApp" required>
          <Input
            name="phone"
            defaultValue={profile.phone || ""}
            required
            className="h-12"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Alamat Lengkap" required>
          <Textarea
            name="address"
            defaultValue={profile.address || ""}
            required
            className="min-h-[120px] resize-none"
          />
        </Field>

        <Field 
          label="Password Baru" 
          hint="Kosongkan jika tidak ingin mengubah password."
        >
          <PasswordInput
            name="password"
            placeholder="••••••••"
            className="h-12"
          />
          <p className="mt-2 text-[10px] font-medium text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100 leading-normal">
            ⚠️ Catatan: Jika Anda mengubah nomor telepon, login berikutnya harus menggunakan nomor yang baru.
          </p>
        </Field>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <Field
          label="ID Sistem Internal (Otomatis)"
          hint="ID unik ini dibuat oleh sistem, tidak perlu diubah."
        >
          <Input
            value={profile.email || ""}
            readOnly
            className="bg-slate-100/50 text-slate-500 font-mono text-sm border-slate-200"
            disabled
          />
        </Field>
      </div>

      {error && (
        <p className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </p>
      )}

      <div className="pt-2">
        <Button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-500/25 transition-all"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan Profil"}
        </Button>
      </div>
    </form>
  );
}
