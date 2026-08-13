import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { deleteMasterOptionAction } from "@/lib/actions/admin/master-options-actions";
import { toast } from "sonner";
import MasterCutiFormModal from "@/components/admin/master-cuti/form-modal";
import { useRouter } from "@/lib/next-compat/navigation";

const CATEGORIES = [
  { id: "jenis_cuti", label: "Jenis Cuti" },
  { id: "jenis_pegawai", label: "Jenis Pegawai" },
];

export default function MasterCutiClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);

  const currentData = initialData.filter((item) => item.category === activeTab);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus opsi ini?")) return;
    const res = await deleteMasterOptionAction(id);
    if (res.success) {
      toast.success("Opsi berhasil dihapus!");
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingData(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingData(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === cat.id
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            {CATEGORIES.find((c) => c.id === activeTab)?.label}
          </h2>
          <p className="text-sm text-slate-500">Kelola daftar opsi untuk kategori ini.</p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Opsi
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
              <tr>
                <th className="px-6 py-4">Urutan</th>
                <th className="px-6 py-4">Label</th>
                <th className="px-6 py-4">Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Belum ada opsi untuk kategori ini. Silakan tambah baru.
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.sortOrder}</td>
                    <td className="px-6 py-4">{item.label}</td>
                    <td className="px-6 py-4 text-slate-500">{item.value}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MasterCutiFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            router.refresh();
          }}
          initialData={editingData}
          category={activeTab}
        />
      )}
    </div>
  );
}
