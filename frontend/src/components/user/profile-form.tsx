import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { updateProfileAction } from "@/lib/actions/user/user";
import { toast } from "sonner";
import { 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  Shield, 
  AlertCircle, 
  Save 
} from "lucide-react";

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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: DATA PRIBADI */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Data Pribadi Pemohon</h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Informasi identitas diri Anda untuk berkas permohonan</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nama Lengkap" required>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059669] dark:group-focus-within:text-emerald-400 transition-colors z-10" />
              <Input
                name="full_name"
                defaultValue={profile.fullName || ""}
                required
                className="h-12 pl-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#059669] focus:ring-[#059669]/10 font-semibold text-sm transition-all"
                placeholder="Masukkan nama lengkap sesuai KTP"
              />
            </div>
          </Field>

          <Field label="Nomor Telepon / WhatsApp" required>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059669] dark:group-focus-within:text-emerald-400 transition-colors z-10" />
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                required
                className="h-12 pl-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#059669] focus:ring-[#059669]/10 font-semibold text-sm transition-all"
                placeholder="Contoh: 08123456789"
              />
            </div>
          </Field>
        </div>

        <Field label="Alamat Lengkap Pemohon" required>
          <div className="relative group">
            <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059669] dark:group-focus-within:text-emerald-400 transition-colors z-10" />
            <Textarea
              name="address"
              defaultValue={profile.address || ""}
              required
              className="min-h-[100px] pl-11 pt-3 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#059669] focus:ring-[#059669]/10 font-medium text-sm transition-all resize-none leading-relaxed"
              placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kabupaten"
            />
          </div>
        </Field>
      </div>

      {/* SECTION 2: KEAMANAN & SISTEM */}
      <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Keamanan & Kredensial Akun</h3>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">Kelola password baru dan informasi akses akun Anda</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field 
            label="Password Baru" 
            hint="Kosongkan jika Anda tidak ingin mengubah password saat ini."
          >
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-[#059669] dark:group-focus-within:text-emerald-400 transition-colors z-10" />
              <PasswordInput
                name="password"
                autoComplete="new-password"
                placeholder="Masukkan password baru (opsional)"
                className="h-12 pl-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#059669] focus:ring-[#059669]/10 font-semibold text-sm transition-all"
              />
            </div>
          </Field>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              ID Akses / Email Akun (Otomatis)
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500 z-10" />
              <Input
                value={profile.email || ""}
                readOnly
                className="h-12 pl-11 bg-slate-100/70 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-mono text-xs rounded-xl border-slate-200/80 dark:border-slate-800 cursor-not-allowed select-none"
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
              Identitas email unik yang digunakan sistem untuk otentikasi login akun Anda.
            </p>
          </div>
        </div>

        {/* Info Alert Note */}
        <div className="flex gap-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 transition-all duration-300">
          <AlertCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">Petunjuk Perubahan Password:</span>
            <p className="text-xs text-emerald-800/90 dark:text-emerald-400/90 leading-relaxed font-medium">
              Password minimal 6 karakter. Jika diisi, password baru akan langsung berlaku untuk sesi login berikutnya.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex gap-3 p-4 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <Button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-12 px-8 rounded-xl font-extrabold bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-950/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Simpan Perubahan Profil</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
