"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteServiceModal } from "./delete-service-modal";
import { AddEditServiceModal } from "./add-edit-service-modal";
import dynamic from "next/dynamic";
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  reorderServicesAction,
} from "@/lib/actions/admin/admin-master";

const LayananTable = dynamic(() => import("./layanan-table").then((mod) => mod.LayananTable), {
  ssr: false,
});

import { slugify } from "@/lib/utils";

export function LayananClient({
  initialServices,
  currentUserRole = "",
  isSuperAdmin = false,
  category = "public",
}: {
  initialServices: any[];
  currentUserRole?: string;
  isSuperAdmin?: boolean;
  category?: string;
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
    isActive: true,
    roleOwner: "",
    requirementsText: "",
    sopUrl: "",
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
      isActive: service.isActive,
      roleOwner: service.roleOwner || "",
      requirementsText: service.requirementsText || "",
      sopUrl: service.sopUrl || "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const bannerFile = (formElement.elements.namedItem("banner") as HTMLInputElement)?.files?.[0];

    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    if (formData.isActive) data.append("isActive", "on");
    if (formData.roleOwner) data.append("roleOwner", formData.roleOwner);
    if (formData.requirementsText) data.append("requirementsText", formData.requirementsText);
    if (formData.sopUrl) data.append("sopUrl", formData.sopUrl);
    if (category) data.append("category", category);
    if (bannerFile) data.append("banner", bannerFile);

    startTransition(async () => {
      let result;
      if (editingService) {
        data.append("id", editingService.id.toString());
        result = await updateServiceAction(data);
      } else {
        result = await createServiceAction(data);
      }

      if (result.success) {
        toast.success(editingService ? "Berhasil Memperbarui" : "Berhasil Menambahkan", {
          description: result.message || (editingService ? "Layanan telah diperbarui." : "Layanan baru telah ditambahkan."),
        });
        setIsAddOpen(false);
        setEditingService(null);
        setFormData({ name: "", slug: "", isActive: true, roleOwner: "", requirementsText: "", sopUrl: "" });
      } else {
        toast.error(result.error || "Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    const data = new FormData();
    data.append("id", deletingService.id.toString());
    startTransition(async () => {
      const result = await deleteServiceAction(data);
      if (result.success) {
        toast.success("Layanan Dihapus", {
          description: result.message || "Layanan berhasil dihapus secara permanen.",
        });
        setDeletingService(null);
      } else {
        toast.error(result.error || "Gagal menghapus layanan.");
      }
    });
  };

  const handleReorder = (newOrder: any[]) => {
    setServices(newOrder);
    saveOrder(newOrder);
  };

  const saveOrder = (orderedServices: any[]) => {
    const ids = orderedServices.map((s: any) => s.id);
    startTransition(async () => {
      const result = await reorderServicesAction(ids);
      if (result.success) {
        toast.success("Urutan Tersimpan", {
          description: result.message || "Urutan layanan telah disesuaikan.",
        });
      } else {
        toast.error(result.error || "Gagal menyimpan urutan.");
      }
    });
  };

  const totalMainServices = initialServices.length;
  const activeMainServices = initialServices.filter((s: any) => s.isActive).length;
  const inactiveMainServices = totalMainServices - activeMainServices;

  // Hitung total sub-layanan turunan (serviceItems)
  const totalSubItems = initialServices.reduce((acc: number, s: any) => acc + (s.serviceItems?.length || 0), 0);
  const activeSubItems = initialServices.reduce((acc: number, s: any) => {
    return acc + (s.serviceItems?.filter((item: any) => item.isActive !== false)?.length || 0);
  }, 0);
  const inactiveSubItems = totalSubItems - activeSubItems;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Summary Stats Cards - Ringkas & Jelas */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Card 1: TOTAL */}
          <div className="px-4 py-2.5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-slate-800">{totalMainServices}</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Total Layanan
              </p>
              <p className="text-xs font-bold text-slate-700">
                <span className="text-emerald-700 font-black">{totalSubItems}</span> Item Layanan
              </p>
            </div>
          </div>

          {/* Card 2: AKTIF */}
          <div className="px-4 py-2.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-xs font-black">{activeMainServices}</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Layanan Aktif
              </p>
              <p className="text-xs font-bold text-slate-700">
                <span className="text-emerald-700 font-black">{activeSubItems}</span> Item Aktif
              </p>
            </div>
          </div>

          {/* Card 3: NONAKTIF */}
          <div className="px-4 py-2.5 rounded-2xl border border-rose-200/80 bg-rose-50/50 shadow-2xs flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-xs font-black">{inactiveMainServices}</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                Layanan Nonaktif
              </p>
              <p className="text-xs font-bold text-slate-700">
                <span className="text-rose-700 font-black">{inactiveSubItems}</span> Item Nonaktif
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: "",
              slug: "",
              isActive: true,
              roleOwner: isSuperAdmin ? "" : currentUserRole,
              requirementsText: "",
              sopUrl: "",
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
        onReorder={handleReorder}
        onEdit={openEdit}
        onDelete={setDeletingService}
        showBidangColumn={isSuperAdmin}
        isSuperAdmin={isSuperAdmin}
        category={category}
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
