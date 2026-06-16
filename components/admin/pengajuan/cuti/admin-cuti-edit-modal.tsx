"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Save, Trash2, AlertCircle } from "lucide-react";
import { updateAdminPengajuanCuti, deleteAdminPengajuanCuti } from "@/lib/actions/admin/admin-cuti";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { ModernSelect } from "@/components/ui/modern-select";

const JENIS_CUTI_OPTIONS = [
  "Cuti Tahunan",
  "Cuti Besar",
  "Cuti Sakit",
  "Cuti Bersalin",
  "Cuti Alasan Penting",
  "Cuti Di Luar Tanggungan Negara",
];

export function AdminCutiEditModal({
  isOpen,
  onClose,
  cutiData,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  cutiData: any;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    jenisCuti: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    alasan: "",
  });

  useEffect(() => {
    if (cutiData && isOpen) {
      setFormData({
        jenisCuti: cutiData.jenisCuti || "",
        // Convert to YYYY-MM-DD if needed
        tanggalMulai: cutiData.tanggalMulai ? new Date(cutiData.tanggalMulai).toISOString().split('T')[0] : "",
        tanggalSelesai: cutiData.tanggalSelesai ? new Date(cutiData.tanggalSelesai).toISOString().split('T')[0] : "",
        alasan: cutiData.alasan || "",
      });
    }
  }, [cutiData, isOpen]);

  if (!isOpen || !cutiData) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Menyimpan perubahan...", { id: "edit-cuti" });

    const res = await updateAdminPengajuanCuti(cutiData.id, formData);

    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error, { id: "edit-cuti" });
    } else {
      toast.success("Data pengajuan berhasil diperbarui!", { id: "edit-cuti" });
      onSuccess?.();
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("PERINGATAN: Apakah Anda yakin ingin menghapus data cuti ini secara permanen dari sistem? Aksi ini tidak dapat dibatalkan!")) {
      return;
    }

    setIsDeleting(true);
    toast.loading("Menghapus data cuti...", { id: "delete-cuti" });

    const res = await deleteAdminPengajuanCuti(cutiData.id);

    setIsDeleting(false);

    if (res.error) {
      toast.error(res.error, { id: "delete-cuti" });
    } else {
      toast.success("Data pengajuan berhasil dihapus!", { id: "delete-cuti" });
      onSuccess?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  Edit Data Pengajuan Cuti
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-amber-50 text-amber-800 p-3 rounded-lg flex gap-3 text-sm mb-6 border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p>
                    Anda sedang mengedit pengajuan cuti atas nama <strong>{cutiData.pemohon?.nama || "Pegawai"}</strong>.
                    Perubahan di sini akan memengaruhi data cuti di akun pegawai bersangkutan.
                  </p>
                </div>

                <form id="edit-cuti-form" onSubmit={handleSubmit} className="space-y-4">
                  <Field label="Jenis Cuti" required>
                    <ModernSelect
                      options={JENIS_CUTI_OPTIONS.map(opt => ({ label: opt, value: opt }))}
                      value={formData.jenisCuti}
                      onChange={(val) => setFormData({ ...formData, jenisCuti: val })}
                      placeholder="Pilih Jenis Cuti"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Tanggal Mulai" required>
                      <Input
                        type="date"
                        value={formData.tanggalMulai}
                        onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                        required
                      />
                    </Field>
                    <Field label="Tanggal Selesai" required>
                      <Input
                        type="date"
                        value={formData.tanggalSelesai}
                        onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                        required
                      />
                    </Field>
                  </div>

                  <Field label="Alasan Cuti / Keterangan" required>
                    <textarea
                      value={formData.alasan}
                      onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                      required
                      rows={3}
                      className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all resize-none"
                    />
                  </Field>
                </form>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-between gap-3 bg-slate-50 flex-shrink-0">
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={isSubmitting || isDeleting}
                  className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? "Menghapus..." : "Hapus Permanen"}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting || isDeleting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    form="edit-cuti-form"
                    disabled={isSubmitting || isDeleting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
