import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { upsertPejabat, getPejabatList } from "@/lib/actions/admin/pejabat-actions";
import { toast } from "sonner";
import { ModernSelect } from "@/components/ui/modern-select";
import { useEffect } from "react";

export default function PejabatFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: initialData?.id || "",
    tipePejabat: initialData?.tipePejabat || "Atasan Langsung",
    unitKerja: initialData?.unitKerja || "",
    nama: initialData?.nama || "",
    nip: initialData?.nip || "",
    jabatan: initialData?.jabatan || "",
  });

  const [unitKerjaOptions, setUnitKerjaOptions] = useState<string[]>([]);

  useEffect(() => {
    async function loadOptions() {
      const res = await getPejabatList();
      if (res.success && res.data) {
        setUnitKerjaOptions(Array.from(new Set(res.data.map((p: any) => p.unitKerja).filter(Boolean))));
      }
    }
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Ensure unitKerja is properly set depending on type
    if (formData.tipePejabat === "Pejabat Berwenang" && !formData.unitKerja) {
      formData.unitKerja = "Kepala Kantor";
    }

    const res = await upsertPejabat(formData);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Data berhasil disimpan!");
      onSuccess();
    } else {
      toast.error(res.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold">
            {initialData ? "Edit Pejabat" : "Tambah Pejabat"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <form id="pejabat-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipe Pejabat
              </label>
              <ModernSelect
                required
                options={["Atasan Langsung", "Pejabat Berwenang"]}
                value={formData.tipePejabat}
                onChange={(val) =>
                  setFormData({ ...formData, tipePejabat: val })
                }
              />
            </div>

            {formData.tipePejabat === "Atasan Langsung" ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Unit Kerja (Seksi/KUA)
                </label>
                <input
                  type="text"
                  required
                  placeholder="-- Ketik atau Pilih Unit Kerja --"
                  list="unitKerjaList"
                  value={formData.unitKerja}
                  onChange={(e) =>
                    setFormData({ ...formData, unitKerja: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="unitKerjaList">
                  <option value="Pejabat Eselon IV" />
                  {unitKerjaOptions.filter((v) => v !== "Pejabat Eselon IV").map((opt, idx) => (
                    <option key={idx} value={opt} />
                  ))}
                </datalist>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jabatan Spesifik (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kepala Kantor"
                  value={formData.unitKerja}
                  onChange={(e) =>
                    setFormData({ ...formData, unitKerja: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: H. Arbaja, S.Ag., M.A.P."
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                NIP
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 197311212001121001"
                value={formData.nip}
                onChange={(e) =>
                  setFormData({ ...formData, nip: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={formData.jabatan}
                onChange={(e) =>
                  setFormData({ ...formData, jabatan: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={onClose} type="button">
            Batal
          </Button>
          <Button
            type="submit"
            form="pejabat-form"
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
