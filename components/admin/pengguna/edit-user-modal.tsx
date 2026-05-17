import { m, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

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
            <Input
              value={editForm.unitKerja}
              onChange={(e) =>
                onFormChange({ ...editForm, unitKerja: e.target.value })
              }
              placeholder="Contoh: Seksi Pendidikan Madrasah"
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
              />
              <button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </Field>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 rounded-2xl h-12 font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl h-12 font-bold bg-[#059669]"
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
