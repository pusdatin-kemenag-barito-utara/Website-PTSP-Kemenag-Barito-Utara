import { useState, useTransition, useEffect } from "react";
import { useWizardItems } from "./wizard/use-wizard-items";
import { useWizardFields } from "./wizard/use-wizard-fields";
import { useWizardRequirements } from "./wizard/use-wizard-requirements";

export function useServiceWizard(initialService: any) {
  const [service, setService] = useState(initialService);
  const [isPending, startTransition] = useTransition();

  // Sync state with props when router.refresh() is called
  useEffect(() => {
    setService(initialService);
  }, [initialService]);

  // Sub-hooks
  const items = useWizardItems(initialService.id, startTransition);
  const fields = useWizardFields(startTransition);
  const reqs = useWizardRequirements(startTransition);

  // Accordion state for items
  const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "req">("form");

  // Global Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: "item" | "field" | "req" | null;
    id: number | null;
    title: string;
    description: string;
  }>({ isOpen: false, type: null, id: null, title: "", description: "" });

  return {
    service,
    isPending,
    modals: {
      item: { isOpen: items.isOpen, setOpen: items.setOpen, editing: items.editing, setEditing: items.setEditing },
      field: { isOpen: fields.isOpen, setOpen: fields.setOpen, editing: fields.editing, setEditing: fields.setEditing },
      req: { isOpen: reqs.isOpen, setOpen: reqs.setOpen, editing: reqs.editing, setEditing: reqs.setEditing },
    },
    ui: {
      expandedItemId,
      setExpandedItemId,
      activeTab,
      setActiveTab,
    },
    forms: {
      item: { data: items.formData, setData: items.setFormData, onSubmit: items.handleSubmit, onChangeName: items.handleChangeName },
      field: { data: fields.formData, setData: fields.setFormData, onSubmit: fields.handleSubmit, onChangeLabel: fields.handleChangeLabel },
      req: { data: reqs.formData, setData: reqs.setFormData, onSubmit: reqs.handleSubmit, onExtensionChange: reqs.handleExtensionChange },
    },
    handlers: {
      reorderItems: (newItems: any[]) => items.handleReorder(newItems, setService),
      reorderFields: (itemId: number, newFields: any[]) => fields.handleReorder(itemId, newFields, setService),
      reorderReqs: (itemId: number, newReqs: any[]) => reqs.handleReorder(itemId, newReqs, setService),
      deleteItem: (id: number) => setDeleteConfirm({ isOpen: true, type: "item", id, title: "Hapus Item Layanan?", description: "Anda yakin ingin menghapus item layanan ini beserta semua form dan persyaratannya? Aksi ini tidak dapat dibatalkan." }),
      deleteField: (id: number) => setDeleteConfirm({ isOpen: true, type: "field", id, title: "Hapus Field Form?", description: "Anda yakin ingin menghapus field input ini? Aksi ini tidak dapat dibatalkan." }),
      deleteReq: (id: number) => setDeleteConfirm({ isOpen: true, type: "req", id, title: "Hapus Persyaratan?", description: "Anda yakin ingin menghapus persyaratan dokumen ini? Aksi ini tidak dapat dibatalkan." }),
    },
    deleteModal: {
      state: deleteConfirm,
      setOpen: (isOpen: boolean) => setDeleteConfirm((p) => ({ ...p, isOpen })),
      execute: () => {
        if (!deleteConfirm.id) return;
        if (deleteConfirm.type === "item") items.handleDelete(deleteConfirm.id);
        else if (deleteConfirm.type === "field") fields.handleDelete(deleteConfirm.id);
        else if (deleteConfirm.type === "req") reqs.handleDelete(deleteConfirm.id);
        setDeleteConfirm((p) => ({ ...p, isOpen: false }));
      }
    }
  };
}
