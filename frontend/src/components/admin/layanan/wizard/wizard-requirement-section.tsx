import { Plus, GripVertical, Pencil, Trash2, FolderCheck } from "lucide-react";
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
  const reqsList = item.serviceRequirements || item.requirements || item.requirements_list || [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold text-slate-700">Daftar Dokumen Persyaratan</h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
            {reqsList.length} Dokumen
          </span>
        </div>

        <button
          onClick={() => {
            reqModals.setEditing(null);
            reqForms.setData({
              serviceItemId: item.id.toString(),
              documentName: "",
              description: "",
              isRequired: true,
              allowedExtensions: "pdf,jpg,jpeg,png",
              maxFileSizeMb: 5,
            });
            reqModals.setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Persyaratan
        </button>
      </div>

      {reqsList.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <p className="text-xs text-slate-500 font-medium">Belum ada dokumen persyaratan yang ditambahkan.</p>
          <p className="text-[11px] text-slate-400 mt-1">Gunakan formulir di sebelah kanan untuk menambahkan berkas syarat pertama.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          {/* HEADER ROW */}
          <div className="flex items-center bg-slate-50 border-b border-slate-200/80 px-4 py-2.5 text-[10px] uppercase text-slate-500 font-extrabold tracking-wider select-none">
            <div className="w-8 shrink-0 text-center">#</div>
            <div className="flex-1 px-2">Nama Dokumen</div>
            <div className="w-36 shrink-0 px-2 text-center">Format & Ukuran</div>
            <div className="w-20 shrink-0 px-2 text-center">Kewajiban</div>
            <div className="w-16 shrink-0 px-2 text-right">Aksi</div>
          </div>

          {/* BODY */}
          <Reorder.Group
            axis="y"
            values={[...reqsList].sort(
              (a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            )}
            onReorder={(newReqs: any[]) => reorderReqs(item.id, newReqs)}
            className="divide-y divide-slate-100 flex flex-col"
          >
            {[...reqsList]
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
      )}
    </div>
  );
}

function ReqRow({ req, item, isSuperAdmin, reqForms, reqModals, deleteReq }: any) {
  const dragControls = useDragControls();
  const isRequired = req.is_required !== undefined ? Boolean(req.is_required) : (req.isRequired !== undefined ? Boolean(req.isRequired) : true);
  const isCurrentlyEditing = reqModals.editing?.id === req.id;
  const exts = req.allowedExtensions || req.allowed_extensions || "";
  const maxSize = req.maxFileSizeMb || req.max_file_size_mb || 5;

  return (
    <Reorder.Item
      value={req}
      dragListener={false}
      dragControls={dragControls}
      className={`flex items-center px-4 py-2.5 transition-colors relative select-none ${
        isCurrentlyEditing 
          ? "bg-emerald-50/70 border-l-4 border-l-emerald-600" 
          : "hover:bg-slate-50/80 bg-white"
      }`}
    >
      <div className="w-8 shrink-0 flex items-center justify-center -ml-1">
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-600 transition-colors p-1"
          title="Tarik untuk urutan"
        >
          <GripVertical className="h-4 w-4 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 px-2 min-w-0">
        <p className="font-bold text-xs text-slate-800 tracking-tight truncate">
          {req.documentName || req.document_name}
        </p>
        {req.description && (
          <p className="text-[10px] text-slate-400 line-clamp-1 truncate mt-0.5">
            {req.description}
          </p>
        )}
      </div>

      <div className="w-36 shrink-0 px-2 text-center">
        <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded-md text-[10px] font-mono text-slate-600 truncate max-w-full">
          .{exts.split(",").slice(0, 3).join(", .")}{exts.split(",").length > 3 ? "..." : ""} • {maxSize}MB
        </span>
      </div>

      <div className="w-20 shrink-0 px-2 text-center">
        {isRequired ? (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
            Wajib
          </span>
        ) : (
          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
            Opsional
          </span>
        )}
      </div>

      <div className="w-16 shrink-0 px-2 flex items-center justify-end gap-1">
        <button
          onClick={() => {
            reqModals.setEditing(req);
            reqForms.setData({
              serviceItemId: item.id.toString(),
              documentName: req.documentName || req.document_name,
              description: req.description || "",
              isRequired: isRequired,
              allowedExtensions: req.allowedExtensions || req.allowed_extensions,
              maxFileSizeMb: maxSize,
            });
            reqModals.setOpen(true);
          }}
          className="text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Edit Persyaratan Ini"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => deleteReq(req.id)}
          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          title="Hapus Persyaratan Ini"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
