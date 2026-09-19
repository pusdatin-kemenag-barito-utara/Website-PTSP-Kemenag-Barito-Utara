import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, GripVertical } from "lucide-react";
import { getPejabatList, deletePejabat, reorderPejabat } from "@/lib/actions/admin/pejabat-actions";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import PejabatFormModal from "@/pages/admin/manajemen-pegawai/pejabat/_form";
import { ModernSelect } from "@/components/ui/modern-select";

export function PejabatView({ initialData }: { initialData?: any[] }) {
  const [data, setData] = useState<any[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<any | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(data.length / rowsPerPage) || 1;
  const currentData = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setIsLoading(false);
    }
  }, [initialData]);

  const loadData = async () => {
    setIsLoading(true);
    const res = await getPejabatList();
    if (res.success) {
      setData(res.data || []);
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!initialData) {
      loadData();
    }
  }, [initialData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pejabat ini?")) return;
    const res = await deletePejabat(id);
    if (res.success) {
      toast.success("Data pejabat berhasil dihapus!");
      loadData();
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

  const handleReorder = async (newOrder: any[]) => {
    // We update the data locally first for immediate feedback
    const newGlobalData = [...data];
    const startIndex = (currentPage - 1) * rowsPerPage;
    newGlobalData.splice(startIndex, newOrder.length, ...newOrder);
    setData(newGlobalData);

    // Save to DB
    const updates = newGlobalData.map((item, index) => ({
      id: item.id,
      orderIndex: index,
    }));
    await reorderPejabat(updates);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-4 py-3 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-sm font-black text-slate-900 leading-tight">
            Manajemen Atasan & Pejabat
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Kelola data Atasan Langsung dan Pejabat Berwenang untuk formulir Cuti.
          </p>
        </div>
        <Button
          onClick={handleAdd}
          className="h-8.5 px-3.5 text-xs font-bold bg-[#059669] hover:bg-[#047857] text-white rounded-lg shadow-2xs cursor-pointer inline-flex items-center self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tambah Data
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200 uppercase">
              <tr>
                <th className="px-6 py-4 w-12"></th>
                <th className="px-6 py-4">Tipe Pejabat</th>
                <th className="px-6 py-4">Unit Kerja / Jabatan Form</th>
                <th className="px-6 py-4">Nama Pejabat</th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              </tbody>
            ) : data.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data pejabat. Silakan tambah data baru.
                  </td>
                </tr>
              </tbody>
            ) : (
              <Reorder.Group as="tbody" axis="y" values={currentData} onReorder={handleReorder}>
                {currentData.map((item) => (
                  <Reorder.Item as="tr" key={item.id} value={item} className="border-b border-slate-100 hover:bg-slate-50 bg-white">
                    <td className="px-6 py-4 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                      <GripVertical className="w-5 h-5" />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.tipePejabat}
                    </td>
                    <td className="px-6 py-4">{item.unitKerja || "-"}</td>
                    <td className="px-6 py-4">{item.nama}</td>
                    <td className="px-6 py-4">{item.nip}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit pejabat"
                          className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-100 hover:border-blue-200 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Hapus pejabat"
                          className="flex items-center justify-center h-7 w-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-100 hover:border-red-200 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ModernSelect
                value={String(rowsPerPage === data.length && data.length > 0 ? "all" : rowsPerPage)}
                onChange={(val) => {
                  if (val === "all") {
                    setRowsPerPage(data.length > 0 ? data.length : 10);
                  } else {
                    setRowsPerPage(Number(val));
                  }
                  setCurrentPage(1);
                }}
                options={[
                  { value: "10", label: "10 Baris" },
                  { value: "25", label: "25 Baris" },
                  { value: "50", label: "50 Baris" },
                  { value: "100", label: "100 Baris" },
                  { value: "all", label: "Semua Baris" },
                ]}
              />
            </div>
            <div className="text-xs font-medium text-slate-500">
              Menampilkan {data.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, data.length)} dari {data.length} Pejabat
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center justify-center px-2 text-xs font-medium text-slate-600">
              Hal {currentPage} / {totalPages}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || totalPages === 0}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <PejabatFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
          initialData={editingData}
        />
      )}
    </div>
  );
}

export default PejabatView;
