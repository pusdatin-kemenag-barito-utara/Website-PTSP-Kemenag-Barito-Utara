"use client";

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
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#059669]">
            <User className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Data Pribadi Pemohon</h3>
            <p className="text-xs text-slate-400">Informasi identitas diri Anda untuk berkas pengajuan</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nama Lengkap" required>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#059669] transition-colors z-10" />
              <Input
                name="full_name"
                defaultValue={profile.fullName || ""}
                required
                className="h-12 pl-11 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 transition-all font-medium text-slate-800"
                placeholder="Masukkan nama lengkap sesuai KTP"
              />
            </div>
          </Field>

          <Field label="Nomor Telepon / WhatsApp" required>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#059669] transition-colors z-10" />
              <Input
                name="phone"
                defaultValue={profile.phone || ""}
                required
                className="h-12 pl-11 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 transition-all font-medium text-slate-800"
                placeholder="Contoh: 08123456789"
              />
            </div>
          </Field>
        </div>

        <Field label="Alamat Lengkap" required>
          <div className="relative group">
            <MapPin className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#059669] transition-colors z-10" />
            <Textarea
              name="address"
              defaultValue={profile.address || ""}
              required
              className="min-h-[100px] pl-11 pt-3 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 transition-all font-medium text-slate-800 resize-none leading-relaxed"
              placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kabupaten"
            />
          </div>
        </Field>
      </div>

      {/* SECTION 2: KEAMANAN & SISTEM */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#059669]">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Keamanan & Kredensial</h3>
            <p className="text-xs text-slate-400">Kelola password dan informasi sistem keamanan Anda</p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field 
            label="Password Baru" 
            hint="Kosongkan jika Anda tidak ingin mengubah password saat ini."
          >
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 group-focus-within:text-[#059669] transition-colors z-10" />
              <PasswordInput
                name="password"
                placeholder="••••••••"
                className="h-12 pl-11 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 transition-all font-medium text-slate-800"
              />
            </div>
          </Field>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              ID Sistem Internal (Otomatis)
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 z-10" />
              <Input
                value={profile.email || ""}
                readOnly
                className="h-12 pl-11 bg-slate-50 text-slate-400 font-mono text-xs rounded-xl border-slate-200/80 cursor-not-allowed select-none"
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              ID unik yang dibuat oleh sistem untuk identitas akun Anda di database.
            </p>
          </div>
        </div>

        {/* Warning Alert Note */}
        <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 transition-all duration-300">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-800">Catatan Penting Perubahan WhatsApp:</span>
            <p className="text-xs text-amber-700/90 leading-relaxed font-medium">
              Jika Anda melakukan perubahan pada nomor telepon/WhatsApp, kredensial login Anda akan berubah secara otomatis. Untuk sesi login berikutnya, gunakan nomor telepon yang baru diinput di atas.
            </p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex gap-2 p-4 text-sm font-semibold text-red-700 bg-red-50 border border-red-100 rounded-2xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4 flex justify-end">
        <Button 
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-[0_10px_25px_-5px_rgba(5,150,105,0.4)] hover:shadow-[0_12px_30px_-5px_rgba(5,150,105,0.5)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
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
