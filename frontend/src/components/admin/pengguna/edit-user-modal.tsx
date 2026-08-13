import { motion as m } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ModernSelect } from "@/components/ui/modern-select";
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";

export function EditUserModal({
  editingUser,
  editForm,
  showNewPassword,
  isPending,
  onClose,
  onFormChange,
  onTogglePassword,
  onSubmit,
}: {
  editingUser: any;
  editForm: any;
  showNewPassword: boolean;
  isPending: boolean;
  onClose: () => void;
  onFormChange: (data: any) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (!editingUser) return null;

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1; 
    if (pass.length >= 8) score += 1; 
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass) && /\d/.test(pass)) score += 1; 
    if (/[^A-Za-z0-9]/.test(pass)) score += 1; 
    return Math.max(1, score);
  };

  const strength = getPasswordStrength(editForm.newPassword);
  const strengthColors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-[#059669]", "bg-emerald-500"];
  const strengthLabels = ["", "Sangat Lemah", "Sedang", "Kuat", "Sangat Kuat"];
  
  // Supabase mewajibkan minimal 6 karakter
  const isPasswordValid = !editForm.newPassword || editForm.newPassword.length >= 6;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <m.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl border border-slate-100"
      >
        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900">Edit Profil</h3>
          <p className="text-sm text-slate-500 mt-1">
            Perbarui informasi akun {editingUser.fullName || editingUser.email}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email (Read Only)">
              <Input value={editForm.email} disabled className="bg-slate-50" />
            </Field>
            <Field label="No. WhatsApp">
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  onFormChange({ ...editForm, phone: e.target.value })
                }
                placeholder="0812..."
              />
            </Field>
          </div>

          <Field label="Unit Kerja / Jabatan">
            <ModernSelect
              options={UNIT_KERJA_OPTIONS}
              value={editForm.unitKerja || ""}
              onChange={(val) =>
                onFormChange({ ...editForm, unitKerja: val })
              }
              placeholder="Pilih Unit Kerja"
              enableSearch
            />
          </Field>

          <Field
            label="Ganti Password (Opsional)"
            hint="Kosongkan jika tidak ingin ganti"
          >
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={editForm.newPassword}
                onChange={(e) =>
                  onFormChange({ ...editForm, newPassword: e.target.value })
                }
                placeholder="Password baru..."
                className={!isPasswordValid ? "border-red-300 focus-visible:ring-red-200" : ""}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {editForm.newPassword && (
              <div className="mt-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-1 w-full rounded-full transition-all duration-300 ${
                        strength >= level ? strengthColors[strength] : "bg-slate-100"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-[10px] font-bold ${
                    strength <= 1 ? "text-red-500" : 
                    strength === 2 ? "text-amber-500" : 
                    "text-[#059669]"
                  }`}>
                    {strengthLabels[strength]}
                  </p>
                  {!isPasswordValid && (
                    <p className="text-[10px] font-medium text-red-500">
                      Minimal 6 karakter
                    </p>
                  )}
                </div>
              </div>
            )}
          </Field>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl h-12 font-bold hover:bg-slate-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isPasswordValid}
              className="flex-1 rounded-2xl h-12 font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-sm disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </div>
        </form>
      </m.div>
    </div>
  );
}
