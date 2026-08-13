import { Plus, Settings2 } from "lucide-react";
import { Reorder } from "framer-motion";
import { WizardItemRow } from "./wizard-item-row";

interface WizardItemListProps {
  service: any;
  isSuperAdmin: boolean;
  wizard: any;
  onOpenFloatingManage?: (item: any) => void;
}

export function WizardItemList({ service, isSuperAdmin, wizard, onOpenFloatingManage }: WizardItemListProps) {
  const { modals, ui, forms, handlers } = wizard;

  const parentIsActive = service.is_active !== undefined ? Boolean(service.is_active) : (service.isActive !== undefined ? Boolean(service.isActive) : true);

  // Items sorted by sort_order
  const itemsList = service.serviceItems || service.items || [];
  const sortedItems =
    [...itemsList].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800">Daftar Item Layanan</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
              Total {sortedItems.length} Layanan
            </span>
          </div>
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
          className="inline-flex items-center gap-2 rounded-xl bg-[#059669] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Item</span>
        </button>
      </div>

      {/* Table Header Bar */}
      <div className="px-6 py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span className="w-5 text-center shrink-0">#</span>
          <span>Nama Jenis Layanan</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="w-24 text-center shrink-0">Status</span>
          <span className="w-32 text-center shrink-0">Tindakan Admin</span>
        </div>
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
            parentIsActive={parentIsActive}
            isSuperAdmin={isSuperAdmin}
            expandedItemId={ui.expandedItemId}
            setExpandedItemId={ui.setExpandedItemId}
            onOpenFloatingManage={onOpenFloatingManage || (() => {})}
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
