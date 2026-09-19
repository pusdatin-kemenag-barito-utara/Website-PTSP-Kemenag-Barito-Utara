import { useState, useMemo } from "react";
import { Plus, Settings2, Search, Layers, Sparkles } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const parentIsActive = service.is_active !== undefined ? Boolean(service.is_active) : (service.isActive !== undefined ? Boolean(service.isActive) : true);

  // Items sorted by sort_order
  const itemsList = service.serviceItems || service.items || [];
  const sortedItems = useMemo(() => {
    return [...itemsList].sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) || [];
  }, [itemsList]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return sortedItems;
    const q = searchQuery.toLowerCase();
    return sortedItems.filter(
      (item: any) =>
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.slug && item.slug.toLowerCase().includes(q))
    );
  }, [sortedItems, searchQuery]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200/60 shadow-2xs shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                  Daftar Item Layanan
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {sortedItems.length} Layanan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola jenis-jenis layanan turunan, formulir isian, dan persyaratan dokumen di dalam layanan ini.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama atau slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tambah Item Button */}
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-2xs hover:shadow-emerald-600/20 transition-all duration-200 active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Header Bar with Balanced Proportions */}
      <div className="px-5 sm:px-6 py-3 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 select-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-5 text-center shrink-0">#</span>
          <span>Nama Jenis Layanan</span>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <span className="hidden md:inline-block w-48 text-left">Kelengkapan</span>
          <span className="w-24 text-center">Status</span>
          <span className="w-32 text-center">Tindakan Admin</span>
        </div>
      </div>

      <Reorder.Group
        axis="y"
        values={sortedItems}
        onReorder={handlers.reorderItems}
        className="divide-y divide-slate-100 flex flex-col"
      >
        {filteredItems.map((item: any) => (
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
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3 text-slate-400">
              <Settings2 className="h-7 w-7" />
            </div>
            <h3 className="text-sm text-slate-700 font-bold">Layanan Kosong</h3>
            <p className="text-xs text-slate-400 mt-1">Mulai dengan menambahkan item layanan turunan pertama.</p>
          </div>
        )}

        {sortedItems.length > 0 && filteredItems.length === 0 && (
          <div className="p-10 text-center text-slate-400 text-xs">
            Tidak ditemukan item layanan dengan kata kunci <span className="font-bold text-slate-600">"{searchQuery}"</span>
          </div>
        )}
      </Reorder.Group>
    </div>
  );
}
