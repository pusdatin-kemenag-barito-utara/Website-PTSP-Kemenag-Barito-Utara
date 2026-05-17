"use client";

import { ChevronDown, ChevronRight, GripVertical, Pencil, Trash2, FormInput, ListChecks } from "lucide-react";
import { m, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { WizardFieldSection } from "./wizard-field-section";
import { WizardRequirementSection } from "./wizard-requirement-section";

interface WizardItemRowProps {
  item: any;
  isSuperAdmin: boolean;
  expandedItemId: number | null;
  setExpandedItemId: (id: number | null) => void;
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
      <div
        className={`p-4 sm:px-6 flex items-center justify-between cursor-pointer transition-colors select-none ${
          isExpanded ? "bg-emerald-50/30" : "hover:bg-slate-50"
        }`}
        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
      >
        <div className="flex items-center gap-4">
          {/* DRAG HANDLE */}
          <div className="w-10 shrink-0 flex items-center justify-center -ml-2" onClick={(e) => e.stopPropagation()}>
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2"
            >
              <GripVertical className="h-5 w-5 pointer-events-none" />
            </div>
          </div>


          <div
            className={`p-2 rounded-lg transition-colors ${
              isExpanded ? "bg-[#059669] text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
            }`}
          >
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{item.name}</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{item.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>

          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold mr-4 ${
              item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            }`}
          >
            {item.isActive ? "AKTIF" : "NONAKTIF"}
          </span>

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
            className="p-2 text-slate-400 hover:text-[#059669] hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handlers.deleteItem(item.id)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
