"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitLaporanKinerjaAction, updateLaporanStatusAction } from "@/lib/actions/admin/kepegawaian";
import { Plus, Check, X, FileText, Calendar as CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";

export function LaporanKinerjaManager({
  initialData,
  isPemimpin,
}: {
  initialData: any[];
  isPemimpin: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kegiatan, setKegiatan] = useState("");
  const [hasil, setHasil] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !kegiatan || !hasil) return toast.error("Mohon lengkapi semua data wajib");

    setLoading(true);
    const res = await submitLaporanKinerjaAction({
      tanggal,
      kegiatanTugasJabatan: kegiatan,
      hasil,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Laporan berhasil dikirim!");
      setIsFormOpen(false);
      setKegiatan("");
      setHasil("");
      // Idealnya fetch ulang data, di sini kita reload saja sementara
      window.location.reload();
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const res = await updateLaporanStatusAction(id, status);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Status berhasil diperbarui!");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-sm text-slate-500">
          Menampilkan {data.length} laporan kinerja
        </div>
        {!isPemimpin && (
          <Button onClick={() => setIsFormOpen(true)} className="bg-[#0f8a54] hover:bg-[#0b7446] text-white">
            <Plus className="h-4 w-4 mr-2" />
            Buat Laporan Baru
          </Button>
        )}
      </div>

      {isFormOpen && !isPemimpin && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Buat Laporan Kinerja Harian</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kegiatan Tugas Jabatan</label>
              <textarea
                required
                rows={3}
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Deskripsikan kegiatan..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hasil</label>
              <textarea
                required
                rows={2}
                value={hasil}
                onChange={(e) => setHasil(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                placeholder="Hasil yang dicapai..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Batal</Button>
              <Button type="submit" disabled={loading} className="bg-[#0f8a54] hover:bg-[#0b7446] text-white">
                {loading ? "Menyimpan..." : "Kirim Laporan"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
            <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">Belum ada laporan kinerja harian.</p>
          </div>
        ) : (
          data.map((laporan) => (
            <div key={laporan.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    laporan.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    laporan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {laporan.status === 'pending' ? 'Menunggu Review' : 
                     laporan.status === 'approved' ? 'Disetujui' : laporan.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {new Date(laporan.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                
                {isPemimpin && (
                  <div className="mb-3">
                    <p className="text-sm font-bold text-emerald-700">{laporan.pegawaiName}</p>
                    <p className="text-xs text-slate-500">{laporan.pegawaiEmail}</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kegiatan</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{laporan.kegiatanTugasJabatan}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hasil</h4>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl">{laporan.hasil}</p>
                  </div>
                </div>
              </div>

              {isPemimpin && laporan.status === 'pending' && (
                <div className="flex md:flex-col gap-2 justify-center items-center md:items-end min-w-[120px] border-t md:border-t-0 pt-4 md:pt-0 md:border-l border-slate-100 md:pl-5">
                  <Button 
                    onClick={() => handleUpdateStatus(laporan.id, 'approved')}
                    className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 shadow-none border-none"
                  >
                    <Check className="h-4 w-4 mr-2" /> Setujui
                  </Button>
                  <Button 
                    onClick={() => handleUpdateStatus(laporan.id, 'revision')}
                    className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 shadow-none border-none"
                  >
                    <X className="h-4 w-4 mr-2" /> Revisi
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
