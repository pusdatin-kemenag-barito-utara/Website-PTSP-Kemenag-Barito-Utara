import { motion as m } from "framer-motion";
import { Loader2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";

export function FieldFormContent({
  items,
  formData,
  isPending,
  onChangeLabel,
  onChangeFormData,
  onSubmit,
  onClose,
}: {
  items: any[];
  formData: any;
  isPending: boolean;
  onChangeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFormData: (updates: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-5">
      <Field label="Item Layanan" required>
        <Select
          name="serviceItemId"
          value={formData.serviceItemId || ""}
          onChange={(e) => onChangeFormData({ serviceItemId: e.target.value })}
          required
          className="font-medium"
        >
          <option value="">-- Pilih Item Layanan --</option>
          {(items ?? []).map((item: any) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Label Field"
          required
          hint="Label yang terlihat oleh pengguna."
        >
          <Input
            name="label"
            value={formData.label || ""}
            onChange={onChangeLabel}
            required
            placeholder="Contoh: Nama Lengkap"
            className="font-medium"
          />
        </Field>

        <Field
          label="Nama Field (Variabel)"
          hint="Digenerate otomatis, dilarang ada spasi."
        >
          <Input
            name="name"
            value={formData.name || ""}
            onChange={(e) => onChangeFormData({ name: e.target.value })}
            required
            className="font-mono text-sm text-[#059669] bg-slate-50"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Field label="Tipe Field" required>
          <Select
            name="type"
            value={formData.type || "text"}
            onChange={(e) => onChangeFormData({ type: e.target.value })}
            required
          >
            <option value="text">Text Pendek (text)</option>
            <option value="textarea">Teks Panjang (textarea)</option>
            <option value="number">Angka (number)</option>
            <option value="date">Tanggal (date)</option>
            <option value="select">Dropdown (select)</option>
          </Select>
        </Field>
      </div>

      <Field
        label="Placeholder (Opsional)"
        hint="Teks bayangan di dalam kolom input."
      >
        <Input
          name="placeholder"
          value={formData.placeholder || ""}
          onChange={(e) => onChangeFormData({ placeholder: e.target.value })}
          placeholder="Contoh: Masukkan nama lengkap Anda..."
        />
      </Field>

      {formData.type === "select" && (
        <m.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="p-4 bg-amber-50 rounded-xl border border-amber-200/60"
        >
          <Field
            label="Opsi Dropdown (JSON)"
            hint='Wajib jika tipe Select. Contoh format: ["Islam", "Katolik", "Protestan"]'
          >
            <Input
              name="options"
              value={formData.options || ""}
              onChange={(e) => onChangeFormData({ options: e.target.value })}
              placeholder='["Opsi 1", "Opsi 2"]'
              className="font-mono text-sm"
              required={formData.type === "select"}
            />
          </Field>
        </m.div>
      )}

      <div className="pt-2">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={formData.isRequired}
              onChange={(e) =>
                onChangeFormData({ isRequired: e.target.checked })
              }
              className="peer sr-only"
            />
            <div className="w-10 h-6 bg-slate-300 rounded-full peer-checked:bg-rose-500 transition-colors relative after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              Wajib Diisi (Required)
            </p>
            <p className="text-[11px] text-slate-500">
              Pemohon tidak bisa melanjutkan jika kolom ini kosong.
            </p>
          </div>
        </label>
      </div>

      <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white border-t border-slate-100 pt-4 mt-6 -mx-6 px-6 pb-2">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#059669] to-[#047857] hover:shadow-md hover:shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          Simpan Perubahan
        </button>
      </div>
    </form>
  );
}
