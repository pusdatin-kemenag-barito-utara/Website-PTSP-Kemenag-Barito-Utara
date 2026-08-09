"use client";

import { useState, useEffect, useMemo } from "react";
import { useServiceWizard } from "@/hooks/use-service-wizard";
import dynamic from "next/dynamic";
import { AddEditItemModal } from "@/components/admin/item-layanan/add-edit-item-modal";
import { FloatingManageFieldsModal } from "@/components/admin/layanan/wizard/floating-manage-fields-modal";
import { AlertDialog } from "@/components/ui/alert-dialog";

const WizardItemList = dynamic(() => import("./wizard/wizard-item-list").then((mod) => mod.WizardItemList), {
  ssr: false,
});

export function ServiceWizardClient({
  initialService,
  isSuperAdmin = false,
}: {
  initialService: any;
  isSuperAdmin?: boolean;
}) {
  const wizard = useServiceWizard(initialService);
  const { service, isPending, modals, forms } = wizard;

  const itemsList = service.serviceItems || service.items || [];

  // Items sorted by sort_order for modals
  const sortedItems = useMemo(
    () => [...itemsList].sort(
      (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ) || [],
    [service.serviceItems, service.items],
  );

  const [floatingManageItem, setFloatingManageItem] = useState<any | null>(null);

  // Synchronize item data if updated while floating modal is open
  const currentFloatingItem = useMemo(() => {
    if (!floatingManageItem) return null;
    return itemsList.find((i: any) => i.id === floatingManageItem.id) || floatingManageItem;
  }, [itemsList, floatingManageItem]);

  return (
    <div className="space-y-8">
      {/* HEADER SECTION: Items List */}
      <WizardItemList
        service={service}
        isSuperAdmin={isSuperAdmin}
        wizard={wizard}
        onOpenFloatingManage={(item: any) => {
          setFloatingManageItem(item);
          // Langsung aktifkan form input field baru tanpa harus klik lagi
          modals.field.setEditing(null);
          forms.field.setData({
            serviceItemId: item.id.toString(),
            label: "",
            name: "",
            type: "text",
            placeholder: "",
            isRequired: true,
            options: "",
          });
          modals.field.setOpen(true);
        }}
      />

      {/* FLOATING MANAGE FIELDS & REQUIREMENTS MODAL */}
      <FloatingManageFieldsModal
        item={currentFloatingItem}
        onClose={() => setFloatingManageItem(null)}
        isSuperAdmin={isSuperAdmin}
        fieldForms={forms.field}
        fieldModals={modals.field}
        reqForms={forms.req}
        reqModals={modals.req}
        handlers={wizard.handlers}
      />

      {/* MODALS */}
      <AddEditItemModal
        isOpen={modals.item.isOpen}
        editingItem={modals.item.editing}
        services={[initialService]}
        formData={forms.item.data}
        isPending={isPending}
        onClose={() => {
          modals.item.setOpen(false);
          modals.item.setEditing(null);
        }}
        onChangeName={(e) => forms.item.onChangeName(e.target.value)}
        onChangeFormData={(updates) =>
          forms.item.setData((p: any) => ({ ...p, ...updates }))
        }
        onSubmit={forms.item.onSubmit}
      />

      <AlertDialog
        open={wizard.deleteModal.state.isOpen}
        onOpenChange={wizard.deleteModal.setOpen}
        title={wizard.deleteModal.state.title}
        description={wizard.deleteModal.state.description}
        onConfirm={wizard.deleteModal.execute}
        loading={isPending}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}
