import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";

interface WizardFieldSectionProps {
  item: any;
  isSuperAdmin: boolean;
  fieldForms: any;
  fieldModals: any;
  deleteField: (id: number) => void;
  reorderFields: (itemId: number, newFields: any[]) => void;
}

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
    <div className="space-y-4">
      <div className="flex justify-end">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-3 w-3" /> Tambah Field
        </button>
      </div>

      {fieldsList.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">Belum ada form input.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* HEADER ROW */}
              <div className="flex items-center bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs uppercase text-slate-500 font-bold">
                <div className="w-16 shrink-0"></div>
                <div className="flex-1 px-4">Label</div>
                <div className="w-32 shrink-0 px-4">Tipe</div>
                <div className="w-24 shrink-0 px-4 text-center">Wajib</div>
                <div className="w-24 shrink-0 px-4 text-right">Aksi</div>
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
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ field, item, isSuperAdmin, fieldForms, fieldModals, deleteField }: any) {
  const dragControls = useDragControls();
  const isRequired = field.is_required !== undefined ? Boolean(field.is_required) : (field.isRequired !== undefined ? Boolean(field.isRequired) : true);

  return (
    <Reorder.Item
      value={field}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center px-4 py-3 hover:bg-slate-50 bg-white relative select-none"
    >
      <div className="w-16 shrink-0 flex items-center justify-center">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2"
        >
          <GripVertical className="h-5 w-5 pointer-events-none" />
        </div>
      </div>
      <div className="flex-1 px-4 font-medium text-slate-900">
        {field.label}
      </div>
      <div className="w-32 shrink-0 px-4 text-slate-600">
        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono">
          {field.type}
        </span>
      </div>
      <div className="w-24 shrink-0 px-4 text-center">
        {isRequired ? "✅" : "-"}
      </div>
      <div className="w-24 shrink-0 px-4 flex items-center justify-end gap-1">
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
          className="text-slate-400 hover:text-emerald-600 p-1"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => deleteField(field.id)}
          className="text-slate-400 hover:text-rose-600 p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
