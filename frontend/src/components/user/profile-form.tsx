import { useState } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/components/ui/password-strength";
import { updateProfileAction } from "@/lib/actions/user/user";
import { toast } from "sonner";
import { 
  User, 
  Phone, 
  MapPin, 
  KeyRound, 
  Shield, 
  AlertCircle, 
  Save, 
  CheckCircle2, 
  Calendar
} from "lucide-react";

export function ProfileForm({ profile }: { profile: any }) {
  const [activeTab, setActiveTab] = useState<"data" | "security">("data");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const nameStr = profile.fullName || profile.name || "Pemohon";
  const initialChar = nameStr.charAt(0).toUpperCase();

  const formatDisplayPhone = (raw?: string) => {
    if (!raw) return "";
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("62")) return "0" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success("Profil Berhasil Diperbarui!", {
          description: result.message || "Perubahan profil Anda telah tersimpan dan disinkronkan ke sistem.",
        });
        setNewPassword("");
        const passInput = form.elements.namedItem("password") as HTMLInputElement;
        if (passInput) passInput.value = "";
      } else {
        const msg = result.error || "Gagal memperbarui profil";
        setError(msg);
        toast.error("Gagal Memperbarui Profil", { description: msg });
      }
    } catch (err: any) {
      const msg = err.message || "Terjadi kesalahan sistem";
      setError(msg);
      toast.error("Kesalahan Sistem", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ── 1. Kartu Identitas Ringkas (Profile Hero Card) ─────────────── */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-5 text-center sm:text-left">
          {/* Avatar Inisial */}
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white font-black text-2xl sm:text-3xl shadow-md shadow-emerald-600/20 border-2 border-white dark:border-slate-800 select-none">
            {initialChar}
          </div>

          {/* Info Akun & Lencana */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {nameStr}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                Masyarakat
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {formatDisplayPhone(profile.phone) || "-"}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px] sm:max-w-none">
                {profile.email || "-"}
              </span>
            </p>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1 pt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              <span>
                Terdaftar: {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. Tab Menu & Kontainer Formulir Terpadu ───────────────────── */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Navigasi Tab */}
        <div className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-2 sm:p-3 md:p-4">
          <div className="flex flex-row md:flex-col gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-150 whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start cursor-pointer ${
                activeTab === "data"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/70 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <User className={`h-4 w-4 ${activeTab === "data" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              <span>Data Diri</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors duration-150 whitespace-nowrap flex-1 md:flex-none justify-center md:justify-start cursor-pointer ${
                activeTab === "security"
                  ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/70 dark:border-slate-700"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50"
              }`}
            >
              <KeyRound className={`h-4 w-4 ${activeTab === "security" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
              <span>Keamanan</span>
            </button>
          </div>
        </div>

        {/* Konten Formulir */}
        <div className="flex-1 p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className={activeTab === "data" ? "space-y-4 sm:space-y-5" : "hidden"}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Data Pribadi & Kontak
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Informasi ini digunakan otomatis saat mengajukan permohonan layanan PTSP.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nama Lengkap Sesuai KTP" required>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors z-10" />
                    <Input
                      name="full_name"
                      defaultValue={nameStr}
                      required
                      className="h-10 sm:h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-emerald-600/10 font-semibold text-xs sm:text-sm"
                      placeholder="Contoh: Muhammad Nazilah, S.E"
                    />
                  </div>
                </Field>

                <Field label="Nomor WhatsApp / HP Aktif" required>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors z-10" />
                    <Input
                      name="phone"
                      defaultValue={formatDisplayPhone(profile.phone)}
                      required
                      className="h-10 sm:h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-emerald-600/10 font-semibold text-xs sm:text-sm"
                      placeholder="Contoh: 08123456789"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                      }}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Alamat Domisili Lengkap" required>
                <div className="relative group">
                  <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors z-10" />
                  <Textarea
                    name="address"
                    defaultValue={profile.address || ""}
                    required
                    className="min-h-[85px] sm:min-h-[100px] pl-10 pt-2.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-emerald-600/10 font-medium text-xs sm:text-sm leading-relaxed resize-none"
                    placeholder="Tuliskan nama jalan, RT/RW, kelurahan, kecamatan, dan kabupaten"
                  />
                </div>
              </Field>
            </div>

            <div className={activeTab === "security" ? "space-y-4 sm:space-y-5" : "hidden"}>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  Keamanan & Kredensial Akun
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Kelola password baru dan identitas akses akun portal Anda.
                </p>
              </div>

              {/* Info Akun Sistem */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  ID Akses Sistem (Email)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    value={profile.email || "-"}
                    readOnly
                    className="h-10 sm:h-11 pl-10 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  ID unik yang dihasilkan sistem untuk autentikasi data Anda.
                </p>
              </div>

              {/* Password Baru */}
              <Field 
                label="Password Baru" 
                hint="Kosongkan jika Anda tidak ingin mengubah password saat ini."
              >
                <div className="relative group">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors z-10" />
                  <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru (minimal 6 karakter)"
                    className="h-10 sm:h-11 pl-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-emerald-600 focus:ring-emerald-600/10 font-semibold text-xs sm:text-sm"
                  />
                </div>
                <PasswordStrength password={newPassword} minChar={6} />
              </Field>

              {/* Panduan Ringkas */}
              <div className="flex gap-3 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 sm:p-3.5">
                <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
                  Jika diubah, gunakan kombinasi huruf dan angka agar akun Anda tetap aman. Password baru langsung berlaku untuk login berikutnya.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 sm:pt-3 flex items-center justify-end border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-10 sm:h-11 px-6 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Menyimpan Perubahan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
