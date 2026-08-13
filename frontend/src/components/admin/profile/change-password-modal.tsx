import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "./password-strength";
import { updateAdminPasswordAction } from "@/lib/actions/admin/admin-profile";
import { toast } from "sonner";
import { Lock, Loader2, AlertCircle, CheckCircle, Shield } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const result = await updateAdminPasswordAction(password);
      if (!result.success) throw new Error(result.error);

      toast.success("Password berhasil diperbarui");
      handleClose();
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui password");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPassword("");
      setConfirm("");
      setError("");
    }, 200);
  };

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const canSubmit = password.length >= 8 && passwordsMatch;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Ubah Password</DialogTitle>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Minimal 8 karakter dengan kombinasi huruf dan angka
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Password baru */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Password Baru
            </label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password baru"
              className="h-12 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 font-medium text-slate-800"
              autoComplete="new-password"
            />
            <PasswordStrength password={password} />
          </div>

          {/* Konfirmasi password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              Konfirmasi Password Baru
            </label>
            <PasswordInput
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
              className="h-12 rounded-xl border-slate-200 focus:border-[#059669] focus:ring-[#059669]/10 font-medium text-slate-800"
              autoComplete="new-password"
            />
            {confirm.length > 0 && (
              <div
                className={`flex items-center gap-1.5 text-xs font-semibold mt-1.5 px-3 py-1.5 rounded-lg ${
                  passwordsMatch
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {passwordsMatch ? (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    Password cocok
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    Password tidak cocok
                  </>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full h-12 rounded-xl font-bold bg-[#059669] hover:bg-[#047857] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Simpan Password Baru
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
