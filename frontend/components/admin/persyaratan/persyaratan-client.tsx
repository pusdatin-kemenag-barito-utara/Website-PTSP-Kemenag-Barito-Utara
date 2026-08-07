"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import {
  createRequirementAction,
  updateRequirementAction,
  deleteRequirementAction,
  reorderRequirementsAction,
} from "@/lib/actions/admin/admin-requirements";
import { DeleteRequirementModal } from "./delete-requirement-modal";
import { AddEditRequirementModal } from "./add-edit-requirement-modal";
import { RequirementTable } from "./requirement-table";

export function PersyaratanClient({
  initialRequirements,
  items,
}: {
  initialRequirements: any[];
  items: any[];
}) {
  const [requirements, setRequirements] = useState(
    [...initialRequirements].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    ),
  );
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<any | null>(
    null,
  );
  const [deletingRequirement, setDeletingRequirement] = useState<any | null>(
    null,
  );

  // Debounce ref
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    serviceItemId: "",
    documentName: "",
    description: "",
    allowedExtensions: "pdf,jpg,jpeg,png",
    maxFileSizeMb: 5,
    isRequired: true,
  });

  // Filter state
  const [selectedItemFilter, setSelectedItemFilter] = useState("all");

  useEffect(() => {
    setRequirements(initialRequirements);
  }, [initialRequirements]);

  const filteredRequirements =
    selectedItemFilter === "all"
      ? requirements
      : requirements.filter(
          (req) => req.serviceItemId.toString() === selectedItemFilter,
        );

  const openEdit = (requirement: any) => {
    setEditingRequirement(requirement);
    setFormData({
      serviceItemId: requirement.serviceItemId.toString(),
      documentName: requirement.documentName,
      description: requirement.description || "",
      allowedExtensions: requirement.allowedExtensions || "pdf,jpg,jpeg,png",
      maxFileSizeMb: requirement.maxFileSizeMb || 5,
      isRequired: requirement.isRequired,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceItemId) {
      toast.error("Pilih Item Layanan terlebih dahulu.");
      return;
    }

    const data = new FormData();
    data.append("serviceItemId", formData.serviceItemId);
    data.append("documentName", formData.documentName);
    data.append("description", formData.description);
    data.append("allowedExtensions", formData.allowedExtensions);
    data.append("maxFileSizeMb", formData.maxFileSizeMb.toString());
    if (formData.isRequired) data.append("isRequired", "on");

    startTransition(async () => {
      try {
        if (editingRequirement) {
          data.append("id", editingRequirement.id.toString());
          await updateRequirementAction(data);
          toast.success("Berhasil Memperbarui", {
            description: "Persyaratan telah diperbarui.",
          });
        } else {
          await createRequirementAction(data);
          toast.success("Berhasil Menambahkan", {
            description: "Persyaratan baru telah ditambahkan.",
          });
        }
        setIsAddOpen(false);
        setEditingRequirement(null);
        setFormData({
          serviceItemId: "",
          documentName: "",
          description: "",
          allowedExtensions: "pdf,jpg,jpeg,png",
          maxFileSizeMb: 5,
          isRequired: true,
        });
      } catch (error) {
        toast.error("Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingRequirement) return;
    const data = new FormData();
    data.append("id", deletingRequirement.id.toString());
    startTransition(async () => {
      try {
        await deleteRequirementAction(data);
        toast.success("Persyaratan Dihapus", {
          description: "Persyaratan berhasil dihapus secara permanen.",
        });
        setDeletingRequirement(null);
      } catch (error) {
        toast.error("Gagal menghapus persyaratan.");
      }
    });
  };

  const handleExtensionChange = (ext: string, checked: boolean) => {
    setFormData((prev) => {
      const exts = prev.allowedExtensions
        ? prev.allowedExtensions.split(",").map((e) => e.trim())
        : [];
      if (checked) {
        if (!exts.includes(ext)) exts.push(ext);
      } else {
        const index = exts.indexOf(ext);
        if (index > -1) exts.splice(index, 1);
      }
      return { ...prev, allowedExtensions: exts.join(",") };
    });
  };

  const handleReorder = (newReqs: any[]) => {
    // Optimistic UI update
    setRequirements((prev) => {
      const newFullList = [...prev];
      newReqs.forEach((newReq, index) => {
        const fullIndex = newFullList.findIndex((r) => r.id === newReq.id);
        if (fullIndex !== -1) {
          newFullList[fullIndex] = { ...newReq, sortOrder: index + 1 };
        }
      });
      return newFullList;
    });

    const ids = newReqs.map((r) => r.id.toString());

    // Debounce server action
    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await reorderRequirementsAction(ids);
          toast.success("Urutan Tersimpan", {
            description: "Urutan persyaratan telah diperbarui.",
          });
        } catch (error) {
          toast.error("Gagal menyimpan urutan.");
        }
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total
          </span>
          <span className="text-sm font-black text-slate-900">
            {requirements.length} Dokumen
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedItemFilter}
            onChange={(e) => setSelectedItemFilter(e.target.value)}
            className="w-full sm:w-[250px] font-medium border-slate-200/80 bg-slate-50"
          >
            <option value="all">Semua Item Layanan</option>
            {(items ?? []).map((item: any) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>

          <button
            onClick={() => {
              setFormData({
                serviceItemId:
                  selectedItemFilter !== "all" ? selectedItemFilter : "",
                documentName: "",
                description: "",
                allowedExtensions: "pdf,jpg,jpeg,png",
                maxFileSizeMb: 5,
                isRequired: true,
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Tambah Persyaratan
          </button>
        </div>
      </div>

      <RequirementTable
        filteredRequirements={filteredRequirements}
        items={items}
        onEdit={openEdit}
        onDelete={setDeletingRequirement}
        onReorder={handleReorder}
        isReorderable={selectedItemFilter !== "all"}
        isPending={isPending}
      />

      <AddEditRequirementModal
        isOpen={isAddOpen || !!editingRequirement}
        editingRequirement={editingRequirement}
        items={items}
        formData={formData}
        isPending={isPending}
        onClose={() => {
          setIsAddOpen(false);
          setEditingRequirement(null);
        }}
        onChangeFormData={setFormData}
        onExtensionChange={handleExtensionChange}
        onSubmit={handleSave}
      />

      <DeleteRequirementModal
        deletingRequirement={deletingRequirement}
        isPending={isPending}
        onClose={() => setDeletingRequirement(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
