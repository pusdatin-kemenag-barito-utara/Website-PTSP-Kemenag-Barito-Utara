import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, FormInput, ListChecks, SlidersHorizontal, Settings2, Layers, Clock, FileText } from "lucide-react";
import { motion as m, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { WizardFieldSection } from "./wizard-field-section";
import { WizardRequirementSection } from "./wizard-requirement-section";

interface WizardItemRowProps {
  item: any;
  parentIsActive?: boolean;
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
  parentIsActive = true,
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
  const rawItemActive = item.is_active !== undefined ? Boolean(item.is_active) : (item.isActive !== undefined ? Boolean(item.isActive) : true);
  const itemIsActive = parentIsActive === false ? false : rawItemActive;

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="group relative bg-white flex flex-col"
    >
      {/* ITEM ROW */}
      <div className="p-4 sm:px-6 flex items-center justify-between transition-colors select-none hover:bg-slate-50/80">
        <div className="flex items-center gap-3 min-w-0 pr-4">
          {/* DRAG HANDLE */}
          <div className="shrink-0 flex items-center justify-center -ml-2" onClick={(e) => e.stopPropagation()}>
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-600 transition-colors p-2"
              title="Tarik untuk mengubah urutan posisi"
            >
              <GripVertical className="h-4.5 w-4.5 pointer-events-none" />
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-800 tracking-tight truncate group-hover:text-emerald-800 transition-colors">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-500 font-mono">
                /{item.slug}
              </span>
              <span className="md:hidden text-[10px] text-slate-400 font-medium">
                • {item.estimatedTime || "1-3 Hari Kerja"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Kolom Tengah: Kelengkapan (Estimasi & Berkas/Form) */}
          <div className="hidden md:flex w-48 flex-col justify-center gap-1 text-left">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
              <Clock className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="truncate">{item.estimatedTime || "1-3 Hari Kerja"}</span>
            </div>
            {(() => {
              const fieldCount = (item.serviceFormFields || item.formFields || item.form_fields || []).length;
              const reqCount = (item.serviceRequirements || item.requirements || item.requirements_list || []).length;
              return (
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                    <FormInput className="h-2.5 w-2.5 text-emerald-600" /> {fieldCount} Field
                  </span>
                  <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                    <FileText className="h-2.5 w-2.5 text-blue-600" /> {reqCount} Berkas
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Kolom Status Badge */}
          <div className="w-24 text-center shrink-0">
            <span
              className={`inline-flex items-center justify-center gap-1.5 w-full py-1 rounded-full text-[10px] font-extrabold tracking-wider ${
                itemIsActive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80" 
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${itemIsActive ? "bg-emerald-500" : "bg-slate-400"}`} />
              {itemIsActive ? "AKTIF" : "NONAKTIF"}
            </span>
          </div>

          {/* Kolom Tindakan Admin */}
          <div className="w-32 flex items-center justify-center gap-1.5 shrink-0">
            {/* Fitur 1: Kelola Field & Persyaratan (Ikon + Badge Count) */}
            {(() => {
              const fieldReqCount = (item.serviceFormFields || item.formFields || item.form_fields || []).length + (item.serviceRequirements || item.requirements || item.requirements_list || []).length;
              return (
                <button
                  onClick={() => onOpenFloatingManage(item)}
                  className="relative p-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-2xs hover:from-emerald-700 hover:to-teal-800 transition-all cursor-pointer hover:scale-105 active:scale-95 shrink-0"
                  title={`Kelola Formulir & Dokumen Persyaratan (${fieldReqCount} Item)`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {fieldReqCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-amber-950 rounded-full border border-amber-300 shadow-2xs leading-tight">
                      {fieldReqCount}
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Fitur 2: Edit Layanan */}
            <button
              onClick={() => {
                itemModals.setEditing(item);
                itemForms.setData({
                  serviceId: serviceId,
                  name: item.name,
                  slug: item.slug,
                  estimatedTime: item.estimatedTime || "1-3 Hari Kerja",
                  isActive: itemIsActive,
                });
                itemModals.setOpen(true);
              }}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200/80 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
              title="Edit Detail Layanan (Nama, Slug, Estimasi Waktu)"
            >
              <Pencil className="h-4 w-4 text-emerald-600" />
            </button>

            {/* Fitur 3: Hapus Item Layanan */}
            <button
              onClick={() => handlers.deleteItem(item.id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/80 transition-all cursor-pointer shrink-0 hover:scale-105 active:scale-95"
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
