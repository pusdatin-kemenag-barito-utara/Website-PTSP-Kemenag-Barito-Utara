"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createRequirementAction,
  updateRequirementAction,
  deleteRequirementAction,
  reorderRequirementsAction,
} from "@/lib/actions/admin/admin-requirements";

export function useWizardRequirements(startTransition: any) {
  const router = useRouter();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<any>(null);
  const reorderTimeout = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({});

  const [formData, setFormData] = useState({
    serviceItemId: "",
    documentName: "",
    isRequired: true,
    allowedExtensions: "pdf,jpg,jpeg,png",
    maxFileSizeMb: 5,
  });

  const handleReorder = (itemId: number, newReqs: any[], setService: any) => {
    // Update sortOrder locally so optimistic rendering doesn't snap back due to .sort()
    const updatedReqs = newReqs.map((req, index) => ({
      ...req,
      sortOrder: index,
    }));

    setService((prev: any) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((item: any) =>
        item.id === itemId ? { ...item, serviceRequirements: updatedReqs } : item
      ),
    }));
    if (reorderTimeout.current[itemId]) clearTimeout(reorderTimeout.current[itemId]!);
    reorderTimeout.current[itemId] = setTimeout(() => {
      startTransition(async () => {
        const ids = updatedReqs.map((r: any) => r.id.toString());
        const result = await reorderRequirementsAction(ids);
        if (result.success) {
          toast.success("Urutan Persyaratan Diperbarui");
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
      const result = await deleteRequirementAction(fd);
      if (result.success) {
        toast.success("Persyaratan Dihapus");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus persyaratan.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("serviceItemId", formData.serviceItemId);
    fd.append("documentName", formData.documentName);
    fd.append("allowedExtensions", formData.allowedExtensions);
    fd.append("maxFileSizeMb", formData.maxFileSizeMb.toString());
    if (formData.isRequired) fd.append("isRequired", "on");

    startTransition(async () => {
      let result;
      if (editingReq) {
        fd.append("id", editingReq.id.toString());
        result = await updateRequirementAction(fd);
      } else {
        result = await createRequirementAction(fd);
      }

      if (result.success) {
        toast.success(editingReq ? "Persyaratan Diperbarui" : "Persyaratan Ditambahkan");
        if (editingReq) {
          setModalOpen(false);
          setEditingReq(null);
        } else {
          setFormData((p) => ({ ...p, documentName: "" }));
        }
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan persyaratan.");
      }
    });
  };

  const handleExtensionChange = (ext: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev.allowedExtensions
        ? prev.allowedExtensions.split(",").map((e: string) => e.trim()).filter(Boolean)
        : [];
      let next;
      if (checked) {
        if (current.includes(ext)) return prev;
        next = [...current, ext];
      } else {
        next = current.filter((e: string) => e !== ext);
      }
      return { ...prev, allowedExtensions: next.join(",") };
    });
  };

  return {
    isOpen: isModalOpen,
    setOpen: setModalOpen,
    editing: editingReq,
    setEditing: setEditingReq,
    formData,
    setFormData,
    handleReorder,
    handleDelete,
    handleSubmit,
    handleExtensionChange,
  };
}
