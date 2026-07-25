"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createFieldAction,
  updateFieldAction,
  deleteFieldAction,
  reorderFieldsAction,
} from "@/lib/actions/admin/admin-fields";

export function useWizardFields(startTransition: any) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const reorderTimeout = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({});

  const [formData, setFormData] = useState({
    serviceItemId: "",
    label: "",
    name: "",
    type: "text",
    placeholder: "",
    isRequired: true,
    options: "",
  });

  const handleReorder = (itemId: number, newFields: any[], setService: any) => {
    // Update sortOrder locally so optimistic rendering doesn't snap back due to .sort()
    const updatedFields = newFields.map((field, index) => ({
      ...field,
      sortOrder: index,
    }));

    setService((prev: any) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((item: any) =>
        item.id === itemId ? { ...item, serviceFormFields: updatedFields } : item
      ),
    }));
    if (reorderTimeout.current[itemId]) clearTimeout(reorderTimeout.current[itemId]!);
    reorderTimeout.current[itemId] = setTimeout(() => {
      startTransition(async () => {
        const ids = updatedFields.map((f: any) => f.id.toString());
        const result = await reorderFieldsAction(ids);
        if (result.success) {
          toast.success("Urutan Field Diperbarui");
          router.refresh();
        } else {
          toast.error(result.error || "Gagal memperbarui urutan.");
        }
      });
    }, 500);
  };

  const handleDelete = (id: number) => {
    const fd = new FormData();
    fd.append("id", id.toString());
    startTransition(async () => {
      const result = await deleteFieldAction(fd);
      if (result.success) {
        toast.success("Field Dihapus");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus field.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("serviceItemId", formData.serviceItemId);
    fd.append("label", formData.label);
    fd.append("name", formData.name);
    fd.append("type", formData.type);
    fd.append("placeholder", formData.placeholder);
    fd.append("options", formData.options);
    if (formData.isRequired) fd.append("isRequired", "on");

    startTransition(async () => {
      let result;
      if (editingField) {
        fd.append("id", editingField.id.toString());
        result = await updateFieldAction(fd);
      } else {
        result = await createFieldAction(fd);
      }

      if (result.success) {
        toast.success(editingField ? "Field Diperbarui" : "Field Ditambahkan");
        if (editingField) {
          setModalOpen(false);
          setEditingField(null);
        } else {
          setFormData((p) => ({ ...p, label: "", name: "", placeholder: "" }));
        }
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan field.");
      }
    });
  };

  const handleChangeLabel = (val: string | React.ChangeEvent<HTMLInputElement>) => {
    const label = typeof val === "string" ? val : val.target.value;
    setFormData((p) => ({
      ...p,
      label,
      name: (label || "").toLowerCase().replace(/[^a-z0-9]/g, "_"),
    }));
  };

  return {
    isOpen: isModalOpen,
    setOpen: setModalOpen,
    editing: editingField,
    setEditing: setEditingField,
    formData,
    setFormData,
    handleReorder,
    handleDelete,
    handleSubmit,
    handleChangeLabel,
  };
}
