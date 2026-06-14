"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Trash2, Edit, Save, X, RefreshCw, User, FileText, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createPegawaiAction, updatePegawaiAction, deletePegawaiAction } from "@/lib/actions/admin/kepegawaian";

export function PegawaiManager({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJabatan, setFilterJabatan] = useState("all");
  const [filterUnitKerja, setFilterUnitKerja] = useState("all");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Form States
  const [formName, setFormName] = useState("");
  const [formNip, setFormNip] = useState("");
  const [formJabatan, setFormJabatan] = useState("");
  const [formUnitKerja, setFormUnitKerja] = useState("");
  const [editId, setEditId] = useState("");

  const filteredData = data.filter((p) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = p.fullName?.toLowerCase().includes(query) || false;
    const nipMatch = p.email?.toLowerCase().includes(query) || false; // Karena email = nip@...
    const jabatanMatch = filterJabatan === "all" || p.jabatan === filterJabatan;
    const unitKerjaMatch = filterUnitKerja === "all" || p.unitKerja === filterUnitKerja;
    return (nameMatch || nipMatch) && jabatanMatch && unitKerjaMatch;
  });

  const uniqueJabatan = Array.from(new Set(data.map((p: any) => p.jabatan).filter(Boolean))).sort();
  const uniqueUnitKerja = Array.from(new Set(data.map((p: any) => p.unitKerja).filter(Boolean))).sort((a: any, b: any) => {
    const isAKemenag = a === "Kantor Kementerian Agama";
    const isBKemenag = b === "Kantor Kementerian Agama";
    if (isAKemenag && !isBKemenag) return -1;
    if (!isAKemenag && isBKemenag) return 1;

    const isAKua = a.startsWith("KUA");
    const isBKua = b.startsWith("KUA");
    if (isAKua && !isBKua) return -1;
    if (!isAKua && isBKua) return 1;

    return a.localeCompare(b);
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const extractNipFromEmail = (email: string) => {
    if (!email) return "-";
    return email.split("@")[0];
  };

  const resetForm = () => {
    setFormName("");
    setFormNip("");
    setFormJabatan("");
    setFormUnitKerja("");
    setEditId("");
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formNip || !formJabatan) return toast.error("Lengkapi semua form");
    
    setLoading(true);
    const res = await createPegawaiAction({
      fullName: formName,
      nip: formNip,
      jabatan: formJabatan,
      unitKerja: formUnitKerja
    });
    
    if (res.error) toast.error(res.error);
    else {
      toast.success("Pegawai berhasil ditambahkan!");
      resetForm();
      router.refresh();
    }
    setLoading(false);
  };

  const handleEdit = (p: any) => {
    setEditId(p.id);
    setFormName(p.fullName || "");
    setFormNip(extractNipFromEmail(p.email));
    setFormJabatan(p.jabatan || "");
    setFormUnitKerja(p.unitKerja || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formJabatan) return toast.error("Lengkapi semua form");

    setLoading(true);
    const res = await updatePegawaiAction(editId, {
      fullName: formName,
      jabatan: formJabatan,
      unitKerja: formUnitKerja
    });

    if (res.error) toast.error(res.error);
    else {
      toast.success("Pegawai berhasil diperbarui!");
      setData(prev => prev.map(p => p.id === editId ? { ...p, fullName: formName, jabatan: formJabatan, unitKerja: formUnitKerja } : p));
      resetForm();
      router.refresh();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus data pegawai ${name}?`)) return;
    
    setLoading(true);
    const res = await deletePegawaiAction(id);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Pegawai berhasil dihapus!");
      setData(prev => prev.filter(p => p.id !== id));
      router.refresh();
      
      const remainingOnPage = currentData.length - 1;
      if (remainingOnPage === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 w-full flex-1">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari NIP atau Nama..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>
          
          <select
            value={filterJabatan}
            onChange={(e) => {
              setFilterJabatan(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-700"
          >
            <option value="all">Semua Jabatan</option>
            {uniqueJabatan.map((jabatan: any) => (
              <option key={jabatan} value={jabatan}>{jabatan}</option>
            ))}
          </select>

          <select
            value={filterUnitKerja}
            onChange={(e) => {
              setFilterUnitKerja(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-64 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-700"
          >
            <option value="all">Semua Unit Kerja</option>
            {uniqueUnitKerja.map((unit: any) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 w-full xl:w-auto shrink-0 mt-2 xl:mt-0">
          <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 sm:flex-none bg-[#0f8a54] hover:bg-[#0b7446] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Manual
          </Button>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-2 px-4 pl-6 w-1/5">NIP</th>
                <th className="py-2 px-4 w-1/4">Nama Lengkap</th>
                <th className="py-2 px-4 w-1/4">Jabatan</th>
                <th className="py-2 px-4 w-1/4">Unit Kerja</th>
                <th className="py-2 px-4 text-right pr-6 w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Tidak ada data pegawai yang ditemukan.
                  </td>
                </tr>
              ) : (
                currentData.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-4 pl-6 font-mono text-xs text-slate-600">
                      {extractNipFromEmail(p.email)}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-xs text-slate-800">{p.fullName}</div>
                    </td>
                    <td className="py-2 px-4 text-xs text-slate-600">
                      {p.jabatan || "-"}
                    </td>
                    <td className="py-2 px-4 text-xs text-slate-600">
                      {p.unitKerja || "-"}
                    </td>
                    <td className="py-2 px-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => handleEdit(p)} size="sm" className="h-6 px-2 text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-md">
                          <Edit className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button onClick={() => handleDelete(p.id, p.fullName || "")} size="sm" className="h-6 px-2 text-[10px] bg-red-600 hover:bg-red-700 text-white shadow-sm rounded-md">
                          <Trash2 className="h-3 w-3 mr-1" /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              value={rowsPerPage === filteredData.length && filteredData.length > 0 ? "all" : rowsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setRowsPerPage(filteredData.length > 0 ? filteredData.length : 10);
                } else {
                  setRowsPerPage(Number(val));
                }
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-sm"
            >
              <option value={10}>10 Baris</option>
              <option value={25}>25 Baris</option>
              <option value={50}>50 Baris</option>
              <option value={100}>100 Baris</option>
              <option value={500}>500 Baris</option>
              <option value="all">Semua Baris</option>
            </select>
            <div className="text-xs font-medium text-slate-500">
              Menampilkan {filteredData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredData.length)} dari {filteredData.length} Pegawai
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
              Hal {currentPage} / {totalPages || 1}
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Tambah Pegawai</h2>
              <button onClick={resetForm} className="p-2 rounded-full text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">NIP <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formNip} onChange={e => setFormNip(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Masukkan 18 digit NIP..." />
                </div>
                <p className="text-xs font-medium text-emerald-600/80 bg-emerald-50 px-2 py-1.5 rounded-md mt-1.5 border border-emerald-100">
                  <span className="font-bold">Password default:</span> 12345barut
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Nama lengkap beserta gelar..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Jabatan <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formJabatan} onChange={e => setFormJabatan(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Contoh: Operator Layanan Operasional..." />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Unit Kerja <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formUnitKerja} onChange={e => setFormUnitKerja(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Contoh: MIN 2 Barito Utara..." />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={resetForm} className="hover:bg-slate-100">Batal</Button>
                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 px-6">
                  {loading ? "Menyimpan..." : "Simpan Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Edit Data Pegawai</h2>
              <button onClick={resetForm} className="p-2 rounded-full text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">NIP <span className="font-normal text-slate-400 text-xs ml-1">(Tidak bisa diubah)</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <input disabled type="text" value={formNip} className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formName} onChange={e => setFormName(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Jabatan <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Briefcase className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formJabatan} onChange={e => setFormJabatan(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700">Unit Kerja <span className="text-red-500">*</span></label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <input required type="text" value={formUnitKerja} onChange={e => setFormUnitKerja(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={resetForm} className="hover:bg-slate-100">Batal</Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 px-6">
                  {loading ? "Menyimpan..." : "Update Data"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
