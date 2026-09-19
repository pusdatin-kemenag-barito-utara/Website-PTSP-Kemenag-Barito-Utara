import { Plus, GripVertical, Pencil, Trash2, FileText, CheckCircle2, CircleDot } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";

interface WizardFieldSectionProps {
  item: any;
  isSuperAdmin: boolean;
  fieldForms: any;
  fieldModals: any;
  deleteField: (id: number) => void;
  reorderFields: (itemId: number, newFields: any[]) => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: "Teks Singkat",
  textarea: "Teks Panjang",
  number: "Angka",
  date: "Pilihan Tanggal",
  select: "Dropdown",
  file: "Unggah Berkas",
};

export function WizardFieldSection({
  item,
  isSuperAdmin,
  fieldForms,
  fieldModals,
  deleteField,
  reorderFields,
}: WizardFieldSectionProps) {
  const fieldsList = item.serviceFormFields || item.formFields || item.form_fields || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-700">Daftar Kolom Isian</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
            {fieldsList.length} Kolom
          </span>
        </div>

        <button
          onClick={() => {
            fieldModals.setEditing(null);
            fieldForms.setData({
              serviceItemId: item.id.toString(),
              label: "",
              name: "",
              type: "text",
              placeholder: "",
              isRequired: true,
              options: "",
            });
            fieldModals.setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Field
        </button>
      </div>

      {fieldsList.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <p className="text-xs text-slate-500 font-medium">Belum ada formulir input yang ditambahkan.</p>
          <p className="text-[11px] text-slate-400 mt-1">Gunakan formulir di sebelah kanan untuk menambahkan kolom isian pertama.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* HEADER ROW */}
          <div className="flex items-center bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider select-none">
            <div className="w-8 shrink-0 text-center">#</div>
            <div className="flex-1 px-2">Label Field</div>
            <div className="w-28 shrink-0 px-2 text-center">Tipe Input</div>
            <div className="w-20 shrink-0 px-2 text-center">Kewajiban</div>
            <div className="w-16 shrink-0 px-2 text-right">Aksi</div>
          </div>

          {/* BODY */}
          <Reorder.Group
            axis="y"
            values={[...fieldsList].sort(
              (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            )}
            onReorder={(newFields: any[]) => reorderFields(item.id, newFields)}
            className="divide-y divide-slate-100 flex flex-col"
          >
            {[...fieldsList]
              .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
              .map((field: any) => (
                <FieldRow
                  key={field.id}
                  field={field}
                  item={item}
                  isSuperAdmin={isSuperAdmin}
                  fieldForms={fieldForms}
                  fieldModals={fieldModals}
                  deleteField={deleteField}
                />
              ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}

function FieldRow({ field, item, isSuperAdmin, fieldForms, fieldModals, deleteField }: any) {
  const dragControls = useDragControls();
  const isRequired = field.is_required !== undefined ? Boolean(field.is_required) : (field.isRequired !== undefined ? Boolean(field.isRequired) : true);
  const isCurrentlyEditing = fieldModals.editing?.id === field.id;

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className={`flex items-center px-4 py-2.5 transition-colors relative select-none ${
        isCurrentlyEditing 
          ? "bg-emerald-50/70 border-l-4 border-l-emerald-600" 
          : "hover:bg-slate-50/80 bg-white"
      }`}
    >
      <div className="w-8 shrink-0 flex items-center justify-center -ml-1">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-600 transition-colors p-1"
          title="Tarik untuk urutan"
        >
          <GripVertical className="h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 px-2 min-w-0">
        <p className="font-bold text-xs text-slate-800 tracking-tight truncate">
          {field.label}
        </p>
        <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
          {field.name}
        </p>
      </div>

      <div className="w-28 shrink-0 px-2 text-center">
        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-[10px] font-bold text-slate-600 truncate max-w-full">
          {TYPE_LABELS[field.type] || field.type}
        </span>
      </div>

      <div className="w-20 shrink-0 px-2 text-center">
        {isRequired ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            Wajib
          </span>
        ) : (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
            Opsional
          </span>
        )}
      </div>

      <div className="w-16 shrink-0 px-2 flex items-center justify-end gap-1">
        <button
          onClick={() => {
            fieldModals.setEditing(field);
            fieldForms.setData({
              serviceItemId: item.id.toString(),
              label: field.label,
              name: field.name,
              type: field.type,
              placeholder: field.placeholder || "",
              isRequired: isRequired,
              options: field.options || "",
            });
            fieldModals.setOpen(true);
          }}
          className="text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Edit Field Ini"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => deleteField(field.id)}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Hapus Field Ini"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
