"use client";

import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, FormInput, ListChecks, SlidersHorizontal, Settings2, Layers } from "lucide-react";
import { m, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { WizardFieldSection } from "./wizard-field-section";
import { WizardRequirementSection } from "./wizard-requirement-section";

interface WizardItemRowProps {
  item: any;
  isSuperAdmin: boolean;
  expandedItemId: number | null;
  setExpandedItemId: (id: number | null) => void;
  onOpenFloatingManage: (item: any) => void;
  activeTab: "form" | "req";
  setActiveTab: (tab: "form" | "req") => void;
  itemModals: any;
  itemForms: any;
  fieldForms: any;
  fieldModals: any;
  reqForms: any;
  reqModals: any;
  handlers: any;
  serviceId: any;
}

export function WizardItemRow({
  item,
  isSuperAdmin,
  expandedItemId,
  setExpandedItemId,
  onOpenFloatingManage,
  activeTab,
  setActiveTab,
  itemModals,
  itemForms,
  fieldForms,
  fieldModals,
  reqForms,
  reqModals,
  handlers,
  serviceId,
}: WizardItemRowProps) {
  const isExpanded = expandedItemId === item.id;
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="group relative bg-white flex flex-col"
    >
      {/* ITEM ROW */}
      <div className="p-4 sm:px-6 flex items-center justify-between transition-colors select-none hover:bg-slate-50">
        <div className="flex items-center gap-3">
          {/* DRAG HANDLE */}
          <div className="shrink-0 flex items-center justify-center -ml-2" onClick={(e) => e.stopPropagation()}>
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2"
              title="Tarik untuk mengubah urutan"
            >
              <GripVertical className="h-5 w-5 pointer-events-none" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{item.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-6" onClick={(e) => e.stopPropagation()}>
          {/* Kolom 1: Status Badge */}
          <div className="w-24 text-center shrink-0">
            <span
              className={`inline-block w-full py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                item.isActive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" 
                  : "bg-rose-50 text-rose-700 border border-rose-200/80"
              }`}
            >
              {item.isActive ? "AKTIF" : "NONAKTIF"}
            </span>
          </div>

          {/* Kolom 2: Tindakan Admin (Posisi Center di antara 3 Fitur) */}
          <div className="flex items-center justify-center gap-2">
            {/* Fitur 1: Kelola Field (Modal Floating) */}
            <button
              onClick={() => onOpenFloatingManage(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-bold shadow-xs hover:from-emerald-700 hover:to-teal-800 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
              title="Kelola Formulir & Persyaratan Dokumen (Modal Floating)"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Kelola Field ({ (item.serviceFormFields?.length || 0) + (item.serviceRequirements?.length || 0) })</span>
            </button>

            {/* Fitur 2: Edit Layanan */}
            <button
              onClick={() => {
                itemModals.setEditing(item);
                itemForms.setData({
                  serviceId: serviceId,
                  name: item.name,
                  slug: item.slug,
                  estimatedTime: item.estimatedTime || "1-3 Hari Kerja",
                  isActive: item.isActive,
                });
                itemModals.setOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200/80 text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Edit Detail Layanan (Nama, Slug, Estimasi Waktu)"
            >
              <Pencil className="h-3.5 w-3.5 text-emerald-600" />
              <span>Edit Layanan</span>
            </button>

            {/* Fitur 3: Hapus Item Layanan */}
            <button
              onClick={() => handlers.deleteItem(item.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/80 transition-all cursor-pointer shrink-0"
              title="Hapus Item Layanan Ini"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT (Forms & Requirements) */}
      <AnimatePresence>
        {isExpanded && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-50/50 border-t border-slate-100"
          >
            <div className="p-6">
              {/* Sub-tabs for Form and Requirements */}
              <div className="flex gap-4 mb-6 border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("form")}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === "form"
                      ? "border-[#059669] text-[#059669]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <FormInput className="h-4 w-4" />
                  Form Input ({item.serviceFormFields?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab("req")}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
                    activeTab === "req"
                      ? "border-[#059669] text-[#059669]"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <ListChecks className="h-4 w-4" />
                  Persyaratan Dokumen ({item.serviceRequirements?.length || 0})
                </button>
              </div>

              {activeTab === "form" ? (
                <WizardFieldSection
                  item={item}
                  isSuperAdmin={isSuperAdmin}
                  fieldForms={fieldForms}
                  fieldModals={fieldModals}
                  deleteField={handlers.deleteField}
                  reorderFields={handlers.reorderFields}
                />
              ) : (
                <WizardRequirementSection
                  item={item}
                  isSuperAdmin={isSuperAdmin}
                  reqForms={reqForms}
                  reqModals={reqModals}
                  deleteReq={handlers.deleteReq}
                  reorderReqs={handlers.reorderReqs}
                />
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}
