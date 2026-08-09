"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createServiceItemAction,
  updateServiceItemAction,
  deleteServiceItemAction,
  reorderServiceItemsAction,
} from "@/lib/actions/admin/admin-items";
import { slugify } from "@/lib/utils";

export function useWizardItems(serviceId: any, startTransition: any) {
  const router = useRouter();
  const [isItemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    serviceId: serviceId,
    name: "",
    slug: "",
    estimatedTime: "1-3 Hari Kerja",
    isActive: true,
  });

  const handleReorder = (newItems: any[], setService: any) => {
    // Update sortOrder locally so optimistic rendering doesn't snap back due to .sort()
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));

    setService((prev: any) => ({ ...prev, serviceItems: updatedItems, items: updatedItems }));
    
    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      startTransition(async () => {
        const ids = updatedItems.map((i: any) => Number(i.id));
        const result = await reorderServiceItemsAction(ids);
        if (result.success) {
          toast.success("Urutan Item Diperbarui");
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
      const result = await deleteServiceItemAction(fd);
      if (result.success) {
        toast.success("Item Dihapus");
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menghapus item.");
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("serviceId", formData.serviceId.toString());
    fd.append("name", formData.name);
    fd.append("slug", formData.slug);
    fd.append("estimatedTime", formData.estimatedTime);
    if (formData.isActive) fd.append("isActive", "on");

    startTransition(async () => {
      let result;
      if (editingItem) {
        fd.append("id", editingItem.id.toString());
        result = await updateServiceItemAction(fd);
      } else {
        result = await createServiceItemAction(fd);
      }

      if (result.success) {
        toast.success(editingItem ? "Item Diperbarui" : "Item Ditambahkan");
        if (editingItem) {
          setItemModalOpen(false);
          setEditingItem(null);
        } else {
          setFormData((p) => ({ ...p, name: "", slug: "", estimatedTime: "1-3 Hari Kerja" }));
        }
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan item.");
      }
    });
  };

  const handleChangeName = (name: string) => {
    setFormData((p) => ({ ...p, name, slug: slugify(name) }));
  };

  return {
    isOpen: isItemModalOpen,
    setOpen: setItemModalOpen,
    editing: editingItem,
    setEditing: setEditingItem,
    formData,
    setFormData,
    handleReorder,
    handleDelete,
    handleSubmit,
    handleChangeName,
  };
}
