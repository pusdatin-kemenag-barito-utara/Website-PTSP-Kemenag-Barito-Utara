"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";
import { registerPetugasAction } from "@/lib/actions/auth/register-petugas";
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";
import { ModernSelect } from "@/components/ui/modern-select";

const PETUGAS_ROLES = [
  { value: "admin_ptsp", label: "Admin PTSP (Umum)" },
  { value: "admin_sub_bagian_tata_usaha", label: "Admin Sub Bagian Tata Usaha" },
  { value: "admin_pendidikan_madrasah", label: "Admin Pendidikan Madrasah" },
  { value: "admin_pendidikan_agama_islam", label: "Admin Pendidikan Agama Islam" },
  { value: "admin_pendidikan_diniyah_pondok_pesantren", label: "Admin Pendidikan Diniyah & Pondok Pesantren" },
  { value: "admin_bimbingan_masyarakat_islam", label: "Admin Bimbingan Masyarakat Islam" },
  { value: "admin_bimbingan_masyarakat_kristen_katolik", label: "Admin Bimbingan Masyarakat Kristen & Katolik" },
  { value: "admin_penyelenggara_zakat_wakaf", label: "Admin Penyelenggara Zakat & Wakaf" },
  { value: "admin_penyelenggara_hindu", label: "Admin Penyelenggara Hindu" },
  { value: "kasubag_tu", label: "Kasubag TU" },
  { value: "kepala_kantor", label: "Kepala Kantor" },
];

export function RegisterPetugasForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [unitKerja, setUnitKerja] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!turnstileToken) {
      setLoading(false);
      setError("Silakan selesaikan verifikasi keamanan.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.append("turnstile_token", turnstileToken);

    const result = await registerPetugasAction(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    toast.success("Pendaftaran Berhasil!", {
      description: "Akun Anda menunggu verifikasi dari Super Admin sebelum dapat digunakan.",
    });

    setTimeout(() => {
      router.push("/login/petugas");
      router.refresh();
    }, 3000);
  };

  return (
    <>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Nama Lengkap" required>
          <Input
            name="full_name"
            required
            placeholder="Masukkan nama lengkap"
          />
        </Field>

        <Field label="Email" required>
          <Input
            type="email"
            name="email"
            required
            placeholder="nama@gmail.com"
            autoComplete="off"
          />
        </Field>

        <Field
          label="Nomor Telepon"
          hint="Gunakan nomor penuh tanpa tanda - (contoh: 081234567890)"
        >
          <Input name="phone" placeholder="081234567890" />
        </Field>

        <Field label="Unit Kerja" required>
          <ModernSelect
            name="unit_kerja"
            options={UNIT_KERJA_OPTIONS}
            value={unitKerja}
            onChange={setUnitKerja}
            placeholder="- Pilih Unit Kerja -"
            required
            enableSearch
          />
        </Field>

        <Field label="Role Petugas" required>
          <Select name="role" required defaultValue="admin_ptsp">
            {PETUGAS_ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Password" required hint="Minimal 8 karakter">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={8}
              required
              placeholder="Masukkan password"
              autoComplete="new-password"
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

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <LoginTurnstile
          mounted={mounted}
          ref={turnstileRef}
          onTokenChange={setTurnstileToken}
        />

        <Button
          className="w-full h-11 text-[15px] font-bold shadow-md transition-all bg-[#0f8a54]! hover:bg-[#0b7446]! hover:shadow-emerald-500/25"
          disabled={loading || !turnstileToken}
        >
          {loading ? "Memproses..." : "Daftar Akun Petugas"}
        </Button>
      </form>
    </>
  );
}
