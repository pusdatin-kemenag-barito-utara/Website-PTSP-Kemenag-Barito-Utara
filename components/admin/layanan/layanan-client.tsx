"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteServiceModal } from "./delete-service-modal";
import { AddEditServiceModal } from "./add-edit-service-modal";
import { LayananTable } from "./layanan-table";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  reorderServicesAction,
} from "@/lib/actions/admin-master";

import { slugify } from "@/lib/utils";

export function LayananClient({
  initialServices,
  currentUserRole = "",
  isSuperAdmin = false,
}: {
  initialServices: any[];
  currentUserRole?: string;
  isSuperAdmin?: boolean;
}) {
  const [services, setServices] = useState(initialServices);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [deletingService, setDeletingService] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    is_active: true,
    role_owner: "",
  });

  useEffect(() => {
    setServices(initialServices);
  }, [initialServices]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: slugify(newName),
    }));
  };

  const openEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      is_active: service.is_active,
      role_owner: service.role_owner || "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    if (formData.is_active) data.append("is_active", "on");
    if (formData.role_owner) data.append("role_owner", formData.role_owner);

    startTransition(async () => {
      try {
        if (editingService) {
          data.append("id", editingService.id.toString());
          await updateServiceAction(data);
          toast.success("Berhasil Memperbarui", {
            description: "Layanan telah diperbarui.",
          });
        } else {
          await createServiceAction(data);
          toast.success("Berhasil Menambahkan", {
            description: "Layanan baru telah ditambahkan.",
          });
        }
        setIsAddOpen(false);
        setEditingService(null);
        setFormData({ name: "", slug: "", is_active: true, role_owner: "" });
      } catch (error) {
        toast.error("Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    const data = new FormData();
    data.append("id", deletingService.id.toString());
    startTransition(async () => {
      try {
        await deleteServiceAction(data);
        toast.success("Layanan Dihapus", {
          description: "Layanan berhasil dihapus secara permanen.",
        });
        setDeletingService(null);
      } catch (error) {
        toast.error("Gagal menghapus layanan.");
      }
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newArr = [...services];
    [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    setServices(newArr);
    saveOrder(newArr);
  };

  const moveDown = (index: number) => {
    if (index === services.length - 1) return;
    const newArr = [...services];
    [newArr[index + 1], newArr[index]] = [newArr[index], newArr[index + 1]];
    setServices(newArr);
    saveOrder(newArr);
  };

  const saveOrder = (orderedServices: any[]) => {
    const ids = orderedServices.map((s: any) => s.id);
    startTransition(async () => {
      try {
        await reorderServicesAction(ids);
        toast.success("Urutan Tersimpan", {
          description: "Urutan layanan telah disesuaikan.",
        });
      } catch (error) {
        toast.error("Gagal menyimpan urutan.");
      }
    });
  };

  const total = initialServices.length;
  const active = initialServices.filter((s: any) => s.is_active).length;
  const inactive = total - active;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Summary Stats inline */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl border border-slate-200/80 bg-white shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total
            </span>
            <span className="text-sm font-black text-slate-900">{total}</span>
          </div>
          <div className="px-4 py-2 rounded-xl border border-emerald-200/80 bg-emerald-50/50 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Aktif
            </span>
            <span className="text-sm font-black text-emerald-700">
              {active}
            </span>
          </div>
          <div className="px-4 py-2 rounded-xl border border-rose-200/80 bg-rose-50/50 shadow-sm flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
              Nonaktif
            </span>
            <span className="text-sm font-black text-rose-700">{inactive}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              slug: "",
              is_active: true,
              // Jika bukan super admin, pre-fill role_owner dengan role bidang yang sedang login
              role_owner: isSuperAdmin ? "" : currentUserRole,
            });
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Tambah Layanan Baru
        </button>
      </div>

      <LayananTable
        services={services}
        isPending={isPending}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onEdit={openEdit}
        onDelete={setDeletingService}
        showBidangColumn={isSuperAdmin}
        isSuperAdmin={isSuperAdmin}
      />

      {/* FLOATING MODAL: ADD / EDIT */}
      <AddEditServiceModal
        isOpen={isAddOpen}
        editingService={editingService}
        formData={formData}
        isPending={isPending}
        onClose={() => {
          setIsAddOpen(false);
          setEditingService(null);
        }}
        onChangeName={handleNameChange}
        onChangeFormData={(updates) =>
          setFormData((prev) => ({ ...prev, ...updates }))
        }
        onSubmit={handleSave}
      />

      <DeleteServiceModal
        deletingService={deletingService}
        isPending={isPending}
        onClose={() => setDeletingService(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
