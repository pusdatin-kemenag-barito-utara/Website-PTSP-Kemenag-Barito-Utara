import { useState, useTransition, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "@/lib/next-compat/navigation";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import {
  createServiceItemAction,
  updateServiceItemAction,
  deleteServiceItemAction,
  reorderServiceItemsAction,
} from "@/lib/actions/admin/admin-items";
import { DeleteItemModal } from "./delete-item-modal";
import { AddEditItemModal } from "./add-edit-item-modal";
import { ItemLayananTable } from "./item-layanan-table";

import { slugify } from "@/lib/utils";

export function ItemLayananClient({
  initialItems,
  services,
  isSuperAdmin = false,
}: {
  initialItems: any[];
  services: any[];
  isSuperAdmin?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(
    [...initialItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
  );
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  // Debounce ref
  const reorderTimeout = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    serviceId: "",
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  // Filter state
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("all");

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems =
    selectedServiceFilter === "all"
      ? items
      : items.filter(
          (item: any) => item.serviceId.toString() === selectedServiceFilter,
        );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: slugify(newName),
    }));
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      serviceId: item.serviceId.toString(),
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      isActive: item.isActive,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceId) {
      toast.error("Pilih Induk Layanan terlebih dahulu.");
      return;
    }

    const data = new FormData();
    data.append("serviceId", formData.serviceId);
    data.append("name", formData.name);
    data.append("slug", formData.slug);
    data.append("description", formData.description);
    if (formData.isActive) data.append("isActive", "on");

    startTransition(async () => {
      try {
        if (editingItem) {
          data.append("id", editingItem.id.toString());
          await updateServiceItemAction(data);
          toast.success("Berhasil Memperbarui", {
            description: "Item layanan telah diperbarui.",
          });
        } else {
          await createServiceItemAction(data);
          toast.success("Berhasil Menambahkan", {
            description: "Item layanan baru telah ditambahkan.",
          });
        }
        setIsAddOpen(false);
        setEditingItem(null);
        setFormData({
          serviceId: "",
          name: "",
          slug: "",
          description: "",
          isActive: true,
        });
      } catch (error) {
        toast.error("Gagal menyimpan data.");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    const data = new FormData();
    data.append("id", deletingItem.id.toString());
    startTransition(async () => {
      try {
        await deleteServiceItemAction(data);
        toast.success("Item Dihapus", {
          description: "Item layanan berhasil dihapus secara permanen.",
        });
        setDeletingItem(null);
      } catch (error) {
        toast.error("Gagal menghapus item layanan.");
      }
    });
  };

  const handleReorder = (newItems: any[]) => {
    // Optimistic UI update
    setItems((prev) => {
      // We need to merge the new items (which might be a filtered subset) back into the full list
      const newFullList = [...prev];
      newItems.forEach((newItem, index) => {
        const fullIndex = newFullList.findIndex((p) => p.id === newItem.id);
        if (fullIndex !== -1) {
          newFullList[fullIndex] = { ...newItem, sortOrder: index };
        }
      });
      return newFullList;
    });

    const ids = newItems.map((item) => item.id);
    
    // Debounce server action
    if (reorderTimeout.current) clearTimeout(reorderTimeout.current);
    reorderTimeout.current = setTimeout(() => {
      startTransition(async () => {
        try {
          await reorderServiceItemsAction(ids);
          toast.success("Urutan Tersimpan", {
            description: "Urutan item layanan telah diperbarui.",
          });
          router.refresh();
        } catch (error) {
          toast.error("Gagal menyimpan urutan.");
        }
      });
    }, 500);
  };

  const total = initialItems.length;
  const active = initialItems.filter((s: any) => s.isActive).length;
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            className="w-full sm:w-[250px] font-medium border-slate-200/80 bg-slate-50"
          >
            <option value="all">Semua Induk Layanan</option>
            {(services ?? []).map((service: any) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </Select>

          <button
            onClick={() => {
              setFormData({
                serviceId:
                  selectedServiceFilter !== "all" ? selectedServiceFilter : "",
                name: "",
                slug: "",
                description: "",
                isActive: true,
              });
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            Tambah Item
          </button>
        </div>
      </div>

      <ItemLayananTable
        filteredItems={filteredItems}
        onEdit={openEdit}
        onDelete={setDeletingItem}
        onReorder={handleReorder}
        isSuperAdmin={isSuperAdmin}
      />

      {/* FLOATING MODAL: ADD / EDIT */}
      <AddEditItemModal
        isOpen={isAddOpen}
        editingItem={editingItem}
        services={services}
        formData={formData}
        isPending={isPending}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        onChangeName={handleNameChange}
        onChangeFormData={(updates) =>
          setFormData((prev) => ({ ...prev, ...updates }))
        }
        onSubmit={handleSave}
      />

      <DeleteItemModal
        deletingItem={deletingItem}
        isPending={isPending}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

