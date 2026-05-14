"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import {
  createRequirementAction,
  updateRequirementAction,
  deleteRequirementAction,
} from "@/lib/actions/admin-master";
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
  const [requirements, setRequirements] = useState(initialRequirements);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<any | null>(
    null,
  );
  const [deletingRequirement, setDeletingRequirement] = useState<any | null>(
    null,
  );

  // Form states
  const [formData, setFormData] = useState({
    service_item_id: "",
    document_name: "",
    description: "",
    allowed_extensions: "pdf,jpg,jpeg,png",
    max_file_size_mb: 5,
    is_required: true,
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
          (req) => req.service_item_id.toString() === selectedItemFilter,
        );

  const openEdit = (requirement: any) => {
    setEditingRequirement(requirement);
    setFormData({
      service_item_id: requirement.service_item_id.toString(),
      document_name: requirement.document_name,
      description: requirement.description || "",
      allowed_extensions: requirement.allowed_extensions || "pdf,jpg,jpeg,png",
      max_file_size_mb: requirement.max_file_size_mb || 5,
      is_required: requirement.is_required,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_item_id) {
      toast.error("Pilih Item Layanan terlebih dahulu.");
      return;
    }

    const data = new FormData();
    data.append("service_item_id", formData.service_item_id);
    data.append("document_name", formData.document_name);
    data.append("description", formData.description);
    data.append("allowed_extensions", formData.allowed_extensions);
    data.append("max_file_size_mb", formData.max_file_size_mb.toString());
    if (formData.is_required) data.append("is_required", "on");

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
          service_item_id: "",
          document_name: "",
          description: "",
          allowed_extensions: "pdf,jpg,jpeg,png",
          max_file_size_mb: 5,
          is_required: true,
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
      const exts = prev.allowed_extensions
        ? prev.allowed_extensions.split(",").map((e) => e.trim())
        : [];
      if (checked) {
        if (!exts.includes(ext)) exts.push(ext);
      } else {
        const index = exts.indexOf(ext);
        if (index > -1) exts.splice(index, 1);
      }
      return { ...prev, allowed_extensions: exts.join(",") };
    });
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
                service_item_id:
                  selectedItemFilter !== "all" ? selectedItemFilter : "",
                document_name: "",
                description: "",
                allowed_extensions: "pdf,jpg,jpeg,png",
                max_file_size_mb: 5,
                is_required: true,
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
