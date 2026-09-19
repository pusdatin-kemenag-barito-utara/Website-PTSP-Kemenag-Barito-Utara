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
} from "@/lib/actions/admin/admin-master";
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
  const router = { refresh: () => window.location.reload() };
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
      name: service.name || "",
      slug: service.slug || "",
      isActive: Boolean(service.isActive ?? service.is_active ?? true),
      roleOwner: service.roleOwner || service.role_owner || "",
      requirementsText: service.requirementsText || service.requirements_text || "",
      sopUrl: service.sopUrl || service.sop_url || "",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const bannerFile = (formElement.elements.namedItem("banner") as HTMLInputElement)?.files?.[0];

    const data = new FormData();
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("isActive", formData.isActive ? "on" : "off");
    if (formData.roleOwner) data.append("roleOwner", formData.roleOwner);
    if (formData.requirementsText) data.append("requirementsText", formData.requirementsText);
    if (formData.sopUrl) data.append("sopUrl", formData.sopUrl);
    if (category) data.append("category", category);
    if (bannerFile) data.append("banner", bannerFile);

    startTransition(async () => {
      let result;
      if (editingService) {
        data.append("id", editingService.id.toString());
        if (editingService.slug) data.append("oldSlug", editingService.slug);
        result = await updateServiceAction(data);
      } else {
        result = await createServiceAction(data);
      }

      if (result.success) {
        toast.success(editingService ? "Berhasil Memperbarui" : "Berhasil Menambahkan", {
          description: result.message || (editingService ? "Layanan telah diperbarui." : "Layanan baru telah ditambahkan."),
        });

        // Update local state immediately for instant UI reactivity
        if (editingService) {
          setServices((prev) =>
            prev.map((s) =>
              s.id === editingService.id
                ? {
                    ...s,
                    name: formData.name,
                    slug: formData.slug,
                    isActive: formData.isActive,
                    is_active: formData.isActive,
                    roleOwner: formData.roleOwner,
                    role_owner: formData.roleOwner,
                  }
                : s,
            ),
          );
        }

        setIsAddOpen(false);
        setEditingService(null);
        setFormData({ name: "", slug: "", isActive: true, roleOwner: "", requirementsText: "", sopUrl: "" });
        router.refresh();
      } else {
        toast.error(result.error || "Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    const target = deletingService;
    setDeletingService(null);
    const toastId = toast.loading(`Sedang menghapus layanan "${target.name}"...`);

    const data = new FormData();
    data.append("id", target.id.toString());
    try {
      const result = await deleteServiceAction(data);
      toast.dismiss(toastId);
      if (result.success) {
        toast.success("Layanan Dihapus", {
          description: result.message || "Layanan berhasil dihapus secara permanen.",
        });
      } else {
        toast.error("Gagal menghapus layanan", {
          description: result.error || "Terjadi kesalahan",
        });
      }
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error("Kesalahan jaringan", {
        description: err.message,
      });
    }
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

  const checkActive = (s: any) => s.is_active !== undefined ? Boolean(s.is_active) : (s.isActive !== undefined ? Boolean(s.isActive) : true);

  const totalMainServices = services.length;
  const activeMainServices = services.filter((s: any) => checkActive(s) === true).length;
  const inactiveMainServices = totalMainServices - activeMainServices;

  // Hitung total sub-layanan turunan (serviceItems / items)
  const getItems = (s: any) => s.serviceItems || s.items || [];
  const totalSubItems = services.reduce((acc: number, s: any) => acc + getItems(s).length, 0);
  const activeSubItems = services.reduce((acc: number, s: any) => {
    const isParentActive = checkActive(s);
    if (!isParentActive) return acc; // Jika layanan utama nonaktif, seluruh sub-item didalamnya dianggap nonaktif
    return acc + getItems(s).filter((item: any) => checkActive(item) === true).length;
  }, 0);
  const inactiveSubItems = totalSubItems - activeSubItems;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {/* Summary Stats Cards - Ringkas & Jelas */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Card 1: TOTAL */}
          <div className="px-3 py-1.5 rounded-xl border border-slate-200/80 bg-white shadow-2xs flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-black text-slate-800">{totalMainServices}</span>
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                Total Layanan
              </p>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {category === "asn" ? `${totalMainServices} Layanan Katalog` : <><span className="text-emerald-700 font-black">{totalSubItems}</span> Item Layanan</>}
              </p>
            </div>
          </div>

          {/* Card 2: AKTIF */}
          <div className="px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 shadow-2xs flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-[11px] font-black">{activeMainServices}</span>
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 leading-none mb-0.5">
                Layanan Aktif
              </p>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {category === "asn" ? `${activeMainServices} Layanan Aktif` : <><span className="text-emerald-700 font-black">{activeSubItems}</span> Item Aktif</>}
              </p>
            </div>
          </div>

          {/* Card 3: NONAKTIF */}
          <div className="px-3 py-1.5 rounded-xl border border-rose-200/80 bg-rose-50/50 shadow-2xs flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-[11px] font-black">{inactiveMainServices}</span>
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-wider text-rose-700 leading-none mb-0.5">
                Layanan Nonaktif
              </p>
              <p className="text-xs font-bold text-slate-700 leading-tight">
                {category === "asn" ? `${inactiveMainServices} Layanan Nonaktif` : <><span className="text-rose-700 font-black">{inactiveSubItems}</span> Item Nonaktif</>}
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#059669] to-[#047857] px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-all duration-200 hover:shadow-xs hover:-translate-y-0.5 active:scale-95 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
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
