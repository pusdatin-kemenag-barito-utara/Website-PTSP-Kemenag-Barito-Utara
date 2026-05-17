"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import {
  createFieldAction,
  updateFieldAction,
  deleteFieldAction,
  reorderFieldsAction,
} from "@/lib/actions/admin/admin-fields";
import { DeleteFieldModal } from "./delete-field-modal";
import { AddEditFieldModal } from "./add-edit-field-modal";
import { FormFieldTable } from "./form-field-table";

import { snakeCase } from "@/lib/utils";

export function FormLayananClient({
  initialFields,
  items,
}: {
  initialFields: any[];
  items: any[];
}) {
  const [fields, setFields] = useState(
    [...initialFields].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  );
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [deletingField, setDeletingField] = useState<any | null>(null);

  // Debounce ref
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    serviceItemId: "",
    label: "",
    name: "",
    type: "text",
    placeholder: "",
    options: "",
    sortOrder: 0,
    isRequired: true,
  });

  // Filter state
  const [selectedItemFilter, setSelectedItemFilter] = useState("all");

  useEffect(() => {
    setFields(initialFields);
  }, [initialFields]);

  const filteredFields =
    selectedItemFilter === "all"
      ? fields
      : fields.filter(
          (field) => field.serviceItemId.toString() === selectedItemFilter,
        );

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setFormData((prev) => ({
      ...prev,
      label: newLabel,
      name: snakeCase(newLabel),
    }));
  };

  const openEdit = (field: any) => {
    setEditingField(field);
    setFormData({
      serviceItemId: field.serviceItemId.toString(),
      label: field.label,
      name: field.name,
      type: field.type,
      placeholder: field.placeholder || "",
      options: field.options || "",
      sortOrder: field.sortOrder || 0,
      isRequired: field.isRequired,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceItemId) {
      toast.error("Pilih Item Layanan terlebih dahulu.");
      return;
    }

    const data = new FormData();
    data.append("serviceItemId", formData.serviceItemId);
    data.append("label", formData.label);
    data.append("name", formData.name);
    data.append("type", formData.type);
    data.append("placeholder", formData.placeholder);
    data.append("options", formData.options);
    data.append("sortOrder", formData.sortOrder.toString());
    if (formData.isRequired) data.append("isRequired", "on");

    startTransition(async () => {
      try {
        if (editingField) {
          data.append("id", editingField.id.toString());
          await updateFieldAction(data);
          toast.success("Berhasil Memperbarui", {
            description: "Field form telah diperbarui.",
          });
        } else {
          await createFieldAction(data);
          toast.success("Berhasil Menambahkan", {
            description: "Field form baru telah ditambahkan.",
          });
        }
        setIsAddOpen(false);
        setEditingField(null);
        setFormData({
          serviceItemId: "",
          label: "",
          name: "",
          type: "text",
          placeholder: "",
          options: "",
          sortOrder: 0,
          isRequired: true,
        });
      } catch (error) {
        toast.error("Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingField) return;
    const data = new FormData();
    data.append("id", deletingField.id.toString());
    startTransition(async () => {
      try {
        await deleteFieldAction(data);
        toast.success("Field Dihapus", {
          description: "Field form berhasil dihapus secara permanen.",
        });
        setDeletingField(null);
      } catch (error) {
        toast.error("Gagal menghapus field form.");
      }
    });
  };

  const handleReorder = (newFields: any[]) => {
    // Optimistic UI update
    setFields((prev) => {
      const newFullList = [...prev];
      newFields.forEach((newField, index) => {
        const fullIndex = newFullList.findIndex((f) => f.id === newField.id);
        if (fullIndex !== -1) {
          newFullList[fullIndex] = { ...newField, sortOrder: index + 1 };
        }
      });
      return newFullList;
    });

    const ids = newFields.map((f) => f.id.toString());

    // Debounce server action
    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await reorderFieldsAction(ids);
          toast.success("Urutan Tersimpan", {
            description: "Urutan field form telah diperbarui.",
          });
        } catch (error) {
          toast.error("Gagal menyimpan urutan.");
        }
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Field
          </span>
          <span className="text-sm font-black text-slate-900">
            {fields.length}
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedItemFilter}
            onChange={(e) => setSelectedItemFilter(e.target.value)}
            className="w-full sm:w-[250px] font-medium border-slate-200/80 bg-slate-50"
          >
            <option value="all">Semua Item Layanan</option>
            {(items ?? []).map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>

          <button
            onClick={() => {
              setFormData({
                serviceItemId:
                  selectedItemFilter !== "all" ? selectedItemFilter : "",
                label: "",
                name: "",
                type: "text",
                placeholder: "",
                options: "",
                sortOrder: 0,
                isRequired: true,
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Tambah Field
          </button>
        </div>
      </div>

      <FormFieldTable
        filteredFields={filteredFields}
        onEdit={openEdit}
        onDelete={setDeletingField}
        onReorder={handleReorder}
        isReorderable={selectedItemFilter !== "all"}
        isPending={isPending}
      />

      <AddEditFieldModal
        isOpen={isAddOpen || !!editingField}
        editingField={editingField}
        items={items}
        formData={formData}
        isPending={isPending}
        onClose={() => {
          setIsAddOpen(false);
          setEditingField(null);
        }}
        onChangeLabel={handleLabelChange}
        onChangeFormData={setFormData}
        onSubmit={handleSave}
      />

      <DeleteFieldModal
        deletingField={deletingField}
        isPending={isPending}
        onClose={() => setDeletingField(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

