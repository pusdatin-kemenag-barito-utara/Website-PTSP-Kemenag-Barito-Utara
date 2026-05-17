"use client";

import { Plus, Settings2 } from "lucide-react";
import { Reorder } from "framer-motion";
import { WizardItemRow } from "./wizard-item-row";

interface WizardItemListProps {
  service: any;
  isSuperAdmin: boolean;
  wizard: any;
}

export function WizardItemList({ service, isSuperAdmin, wizard }: WizardItemListProps) {
  const { modals, ui, forms, handlers } = wizard;

  // Items sorted by sort_order
  const sortedItems =
    [...(service.serviceItems || [])].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-lg font-black text-slate-800">Daftar Item Layanan</h2>
          <p className="text-sm text-slate-500 mt-1">Kelola jenis-jenis layanan turunan di dalam layanan ini.</p>
        </div>
        <button
          onClick={() => {
            modals.item.setEditing(null);
            forms.item.setData({
              serviceId: service.id,
              name: "",
              slug: "",
              estimatedTime: "1-3 Hari Kerja",
              isActive: true,
            });
            modals.item.setOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          Tambah Item
        </button>
      </div>

      <Reorder.Group
        axis="y"
        values={sortedItems}
        onReorder={handlers.reorderItems}
        className="divide-y divide-slate-100 flex flex-col"
      >
        {sortedItems.map((item: any) => (
          <WizardItemRow
            key={item.id}
            item={item}
            isSuperAdmin={isSuperAdmin}
            expandedItemId={ui.expandedItemId}
            setExpandedItemId={ui.setExpandedItemId}
            activeTab={ui.activeTab}
            setActiveTab={ui.setActiveTab}
            itemModals={modals.item}
            itemForms={forms.item}
            fieldForms={forms.field}
            fieldModals={modals.field}
            reqForms={forms.req}
            reqModals={modals.req}
            handlers={handlers}
            serviceId={service.id}
          />
        ))}

        {sortedItems.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
              <Settings2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-slate-500 font-bold">Layanan Kosong</h3>
            <p className="text-sm text-slate-400 mt-1">Mulai dengan menambahkan item layanan pertama.</p>
          </div>
        )}
      </Reorder.Group>
    </div>
  );
}
