import { useState, useEffect, useRef, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "@/lib/next-compat/navigation";
import { toast } from "sonner";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoginTurnstile, type TurnstileRef } from "./_components/login-turnstile";
import { registerPetugasAction } from "@/lib/actions/auth/register-petugas";
import { ModernSelect } from "@/components/ui/modern-select";
import { fetchAPI } from "@/lib/api";

export function RegisterPetugasForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [unitKerja, setUnitKerja] = useState("");
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<string[]>([]);
  const [petugasRoles, setPetugasRoles] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAPI<any>("/master-options")
      .then((res) => {
        if (res?.success && Array.isArray(res?.data)) {
          const uks = res.data
            .filter((o: any) => o.category === "unit_kerja" && o.is_active !== false)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((o: any) => o.label || o.value);
          setUnitKerjaOptions(uks);

          const roles = res.data
            .filter((o: any) => o.category === "role_admin" && o.is_active !== false && o.value !== "super_admin")
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((o: any) => ({ value: o.value, label: o.label }));
          setPetugasRoles(roles);
        }
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!turnstileToken) {
      setLoading(false);
      setError("Silakan selesaikan verifikasi keamanan.");
      toast.error("Silakan selesaikan verifikasi keamanan.", { id: "register-petugas-toast" });
      return;
    }

    toast.loading("Mendaftarkan akun petugas...", { id: "register-petugas-toast" });

    const formData = new FormData(event.currentTarget);
    formData.append("turnstile_token", turnstileToken);

    const result = await registerPetugasAction(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error, { id: "register-petugas-toast" });
      return;
    }

    toast.success("Pendaftaran Berhasil!", {
      id: "register-petugas-toast",
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
            options={unitKerjaOptions}
            value={unitKerja}
            onChange={setUnitKerja}
            placeholder="- Pilih Unit Kerja -"
            required
            enableSearch
          />
        </Field>

        <Field label="Role Petugas" required>
          <Select name="role" required defaultValue={petugasRoles[0]?.value || "admin_ptsp"}>
            {petugasRoles.map((role) => (
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
