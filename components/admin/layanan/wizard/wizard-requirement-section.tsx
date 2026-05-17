"use client";

import { Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";

interface WizardRequirementSectionProps {
  item: any;
  isSuperAdmin: boolean;
  reqForms: any;
  reqModals: any;
  deleteReq: (id: number) => void;
  reorderReqs: (itemId: number, newReqs: any[]) => void;
}

export function WizardRequirementSection({
  item,
  isSuperAdmin,
  reqForms,
  reqModals,
  deleteReq,
  reorderReqs,
}: WizardRequirementSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            reqModals.setEditing(null);
            reqForms.setData({
              serviceItemId: item.id.toString(),
              documentName: "",
              isRequired: true,
              allowedExtensions: "pdf,jpg,jpeg,png",
              maxFileSizeMb: 5,
            });
            reqModals.setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="h-3 w-3" /> Tambah Persyaratan
        </button>
      </div>

      {(!item.serviceRequirements || item.serviceRequirements.length === 0) ? (
        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-sm text-slate-500">Belum ada persyaratan dokumen.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* HEADER ROW */}
              <div className="flex items-center bg-slate-50 border-b border-slate-200 px-4 py-3 text-xs uppercase text-slate-500 font-bold">
                <div className="w-16 shrink-0"></div>
                <div className="flex-1 px-4">Nama Dokumen</div>
                <div className="w-48 shrink-0 px-4">Format</div>
                <div className="w-24 shrink-0 px-4 text-center">Wajib</div>
                <div className="w-24 shrink-0 px-4 text-right">Aksi</div>
              </div>

              {/* BODY */}
              <Reorder.Group
                axis="y"
                values={[...(item.serviceRequirements || [])].sort(
                  (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
                )}
                onReorder={(newReqs: any[]) => reorderReqs(item.id, newReqs)}
                className="divide-y divide-slate-100 flex flex-col"
              >
                {[...(item.serviceRequirements || [])]
                  .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((req: any) => (
                    <ReqRow
                      key={req.id}
                      req={req}
                      item={item}
                      isSuperAdmin={isSuperAdmin}
                      reqForms={reqForms}
                      reqModals={reqModals}
                      deleteReq={deleteReq}
                    />
                  ))}
              </Reorder.Group>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReqRow({ req, item, isSuperAdmin, reqForms, reqModals, deleteReq }: any) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={req}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center px-4 py-3 hover:bg-slate-50 bg-white relative select-none"
    >
      <div className="w-16 shrink-0 flex items-center justify-center">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2"
        >
          <GripVertical className="h-5 w-5 pointer-events-none" />
        </div>
      </div>
      <div className="flex-1 px-4 font-medium text-slate-900">
        {req.documentName}
      </div>
      <div className="w-48 shrink-0 px-4 text-slate-600">
        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono">
          {req.allowedExtensions}
        </span>
      </div>
      <div className="w-24 shrink-0 px-4 text-center">
        {req.isRequired ? "✅" : "-"}
      </div>
      <div className="w-24 shrink-0 px-4 flex items-center justify-end gap-1">
        <button
          onClick={() => {
            reqModals.setEditing(req);
            reqForms.setData({
              serviceItemId: item.id.toString(),
              documentName: req.documentName,
              isRequired: req.isRequired,
              allowedExtensions: req.allowedExtensions,
              maxFileSizeMb: req.maxFileSizeMb || 5,
            });
            reqModals.setOpen(true);
          }}
          className="text-slate-400 hover:text-emerald-600 p-1"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => deleteReq(req.id)}
          className="text-slate-400 hover:text-rose-600 p-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
