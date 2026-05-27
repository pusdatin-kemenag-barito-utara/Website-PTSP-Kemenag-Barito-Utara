"use client";

import { useState, useEffect, useMemo } from "react";
import { useServiceWizard } from "@/hooks/use-service-wizard";
import dynamic from "next/dynamic";
import { AddEditItemModal } from "@/components/admin/item-layanan/add-edit-item-modal";
import { AddEditFieldModal } from "@/components/admin/form-layanan/add-edit-field-modal";
import { AddEditRequirementModal } from "@/components/admin/persyaratan/add-edit-requirement-modal";
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

  // Items sorted by sort_order for modals
  const sortedItems = useMemo(
    () => [...(service.serviceItems || [])].sort(
      (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ) || [],
    [service.serviceItems],
  );

  return (
    <div className="space-y-8">
      {/* HEADER SECTION: Items List */}
      <WizardItemList
        service={service}
        isSuperAdmin={isSuperAdmin}
        wizard={wizard}
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

      <AddEditFieldModal
        isOpen={modals.field.isOpen}
        editingField={modals.field.editing}
        items={sortedItems}
        formData={forms.field.data}
        isPending={isPending}
        onClose={() => {
          modals.field.setOpen(false);
          modals.field.setEditing(null);
        }}
        onChangeLabel={(e) => forms.field.onChangeLabel(e.target.value)}
        onChangeFormData={(updates) =>
          forms.field.setData((p: any) => ({ ...p, ...updates }))
        }
        onSubmit={forms.field.onSubmit}
      />

      <AddEditRequirementModal
        isOpen={modals.req.isOpen}
        editingRequirement={modals.req.editing}
        items={sortedItems}
        formData={forms.req.data}
        isPending={isPending}
        onClose={() => {
          modals.req.setOpen(false);
          modals.req.setEditing(null);
        }}
        onChangeFormData={(updates) =>
          forms.req.setData((p: any) => ({ ...p, ...updates }))
        }
        onExtensionChange={forms.req.onExtensionChange}
        onSubmit={forms.req.onSubmit}
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
