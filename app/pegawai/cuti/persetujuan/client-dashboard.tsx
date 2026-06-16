"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, FileText, User } from "lucide-react";
import { toast } from "sonner";
import { ModernSelect } from "@/components/ui/modern-select";
import { processCutiAction } from "@/lib/actions/pegawai/cuti-approval";
import { SignaturePad } from "@/components/ui/signature-pad";
import { DraftCutiDocument } from "@/components/ui/draft-cuti-document";
import { AlertDialog } from "@/components/ui/alert-dialog";

export function CutiApprovalDashboard({
  pendingAtasan,
  pendingKepala,
  riwayat,
  currentProfile,
  pejabatList = [],
}: {
  pendingAtasan: any[];
  pendingKepala: any[];
  riwayat: any[];
  currentProfile: { nama: string; nip: string; role: string; isKepalaKantor?: boolean };
  pejabatList?: any[];
}) {
  const [activeTab, setActiveTab] = useState<"atasan" | "kepala" | "riwayat">("atasan");
  
  // For Modal
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [keputusan, setKeputusan] = useState<"approved" | "changes" | "delayed" | "rejected" | null>(null);
  const [signature, setSignature] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const getActiveData = () => {
    if (activeTab === "atasan") return pendingAtasan;
    if (activeTab === "kepala") return pendingKepala;
    return riwayat;
  };

  const handlePreSubmit = () => {
    if (!selectedRequest || !keputusan) return;
    
    if (keputusan === "approved" && !signature) {
      toast.error("Tanda tangan wajib dilampirkan untuk persetujuan.");
      return;
    }

    if (keputusan !== "approved" && !catatan) {
      toast.error("Catatan wajib diisi untuk penolakan/perubahan/penangguhan.");
      return;
    }

    setConfirmOpen(true);
  };

  const handleAction = async () => {
    if (!selectedRequest || !keputusan) return;
    
    if (keputusan === "approved" && !signature) {
      toast.error("Tanda tangan wajib dilampirkan untuk persetujuan.");
      return;
    }

    if (keputusan !== "approved" && !catatan) {
      toast.error("Catatan wajib diisi untuk penolakan/perubahan/penangguhan.");
      return;
    }

    setLoading(true);

    try {
      const roleLevel = activeTab === "kepala" ? "kepala" : "atasan";
      const res = await processCutiAction(
        selectedRequest.id,
        roleLevel,
        keputusan,
        keputusan === "approved" ? signature : null,
        catatan
      );

      if (res.error) throw new Error(res.error);
      toast.success("Keputusan berhasil diproses.");

      // Reset
      setSelectedRequest(null);
      setKeputusan(null);
      setSignature("");
      setCatatan("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const activeData = getActiveData();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("atasan")}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "atasan"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Antrean Atasan Langsung
          {pendingAtasan.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
              {pendingAtasan.length}
            </span>
          )}
          {activeTab === "atasan" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>
          )}
        </button>
        {currentProfile.isKepalaKantor && (
          <button
            onClick={() => setActiveTab("kepala")}
            className={`px-4 py-3 font-medium text-sm transition-colors relative ${
              activeTab === "kepala"
                ? "text-emerald-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Antrean Kepala Kantor
            {pendingKepala.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                {pendingKepala.length}
              </span>
            )}
            {activeTab === "kepala" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab("riwayat")}
          className={`px-4 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "riwayat"
              ? "text-emerald-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Riwayat Persetujuan
          {activeTab === "riwayat" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>
          )}
        </button>
      </div>

      {/* Table / List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {activeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak Ada Antrean</h3>
            <p className="text-slate-500 max-w-sm">
              Belum ada pengajuan cuti yang perlu diproses pada antrean ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold border-b border-slate-200">Pemohon</th>
                  <th className="p-4 font-semibold border-b border-slate-200">Jenis Cuti</th>
                  <th className="p-4 font-semibold border-b border-slate-200">Tanggal</th>
                  <th className="p-4 font-semibold border-b border-slate-200">Status</th>
                  <th className="p-4 font-semibold border-b border-slate-200 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeData.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{req.namaPemohon || "Tanpa Nama"}</div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {req.unitKerja || "Pegawai"}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{req.jenisCuti}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]" title={req.alasan}>
                        {req.alasan}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      <div>
                        Mulai: <span className="font-medium text-slate-800">{format(new Date(req.tanggalMulai), "dd MMM yyyy", { locale: idLocale })}</span>
                      </div>
                      <div className="mt-1">
                        Selesai: <span className="font-medium text-slate-800">{format(new Date(req.tanggalSelesai), "dd MMM yyyy", { locale: idLocale })}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {req.statusAkhir === "rejected" ? (
                        <Badge variant="danger" className="bg-red-100 text-red-700 hover:bg-red-200">Ditolak</Badge>
                      ) : req.statusAkhir === "approved" ? (
                        <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Selesai</Badge>
                      ) : activeTab === "atasan" ? (
                        <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-200">Menunggu Atasan</Badge>
                      ) : (
                        <Badge variant="info" className="bg-blue-100 text-blue-700 hover:bg-blue-200">Menunggu Kepala</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {activeTab !== "riwayat" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(req);
                            setKeputusan("approved");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                        >
                          Proses
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(req);
                            setKeputusan(null); // Just view
                          }}
                          className="rounded-lg border-slate-200 text-slate-600"
                        >
                          Detail
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {selectedRequest && keputusan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-[95vw] h-[95vh] overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b text-white flex justify-between items-center ${
              keputusan === "approved" ? "bg-emerald-600" :
              keputusan === "rejected" ? "bg-red-600" :
              "bg-amber-600"
            } shrink-0`}>
              <h2 className="font-bold text-lg flex items-center gap-2">
                {keputusan === "approved" ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                Persetujuan Cuti
              </h2>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setKeputusan(null);
                  setSignature("");
                  setCatatan("");
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-slate-100 flex flex-col lg:flex-row">
              {/* Kiri: Draft Cuti Document */}
              <div className="flex-1 p-4 lg:p-8 overflow-y-auto border-r border-slate-200 custom-scrollbar flex justify-center bg-slate-200/50">
                <div className="scale-[0.85] sm:scale-[0.95] md:scale-100 origin-top">
                    <DraftCutiDocument 
                    data={{
                      nama: selectedRequest.namaPemohon,
                      nip: selectedRequest.nipPemohon,
                      jabatan: selectedRequest.jabatanPemohon,
                      unitKerja: selectedRequest.unitKerja,
                      jenisPegawai: selectedRequest.jenisPegawai,
                      masaKerjaTahun: selectedRequest.masaKerjaTahun,
                      masaKerjaBulan: selectedRequest.masaKerjaBulan,
                      noHp: selectedRequest.noHp,
                      alamatCuti: selectedRequest.alamatCuti,
                      jenisCuti: selectedRequest.jenisCuti,
                      alasan: selectedRequest.alasan,
                      tanggalMulai: selectedRequest.tanggalMulai,
                      tanggalSelesai: selectedRequest.tanggalSelesai,
                      tanggalPilihan: selectedRequest.tanggalPilihan,
                      signature: selectedRequest.ttdPemohon || "",
                      atasanSignature: activeTab === "kepala" ? selectedRequest.ttdAtasan : (keputusan === "approved" && signature ? currentProfile.nip : undefined),
                      kepalaSignature: activeTab === "kepala" ? (keputusan === "approved" && signature ? currentProfile.nip : undefined) : undefined,
                      keputusanAtasan: activeTab === "kepala" ? selectedRequest.statusAtasan : keputusan || undefined,
                      keputusanKepala: activeTab === "kepala" ? keputusan || undefined : undefined,
                      catatanAtasan: activeTab === "kepala" ? selectedRequest.catatanAtasan : (catatan || selectedRequest.catatanAtasan || undefined),
                      catatanKepala: activeTab === "kepala" ? catatan || undefined : undefined,
                      sisaCuti: selectedRequest.sisaCuti,
                      cutiTahun1: selectedRequest.cutiTahun1,
                      cutiTahun2: selectedRequest.cutiTahun2,
                      hakBerjalan: selectedRequest.hakBerjalan,
                    }}
                    pejabatList={pejabatList}
                  />
                </div>
              </div>

              {/* Kanan: Form Persetujuan / Penolakan */}
              <div className="w-full lg:w-[400px] p-6 bg-white shrink-0 space-y-6 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Keputusan Atasan</label>
                  <ModernSelect
                    value={keputusan || ""}
                    onChange={(val) => setKeputusan(val as any)}
                    options={[
                      { value: "approved", label: "Disetujui" },
                      { value: "changes", label: "Perubahan (Kembalikan ke Pegawai)" },
                      { value: "delayed", label: "Ditangguhkan" },
                      { value: "rejected", label: "Tidak Disetujui (Tolak)" },
                    ]}
                    placeholder="Pilih Keputusan..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Catatan {keputusan !== "approved" && <span className="text-red-500 text-xs">*Wajib</span>}</label>
                  <textarea
                    value={catatan}
                    onChange={(e) => {
                      const val = e.target.value;
                      const capitalized = val
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ");
                      setCatatan(capitalized);
                    }}
                    placeholder={keputusan === "approved" ? "Catatan tambahan persetujuan..." : "Alasan / catatan revisi..."}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>

                {keputusan === "approved" && (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                      <span>Tanda Tangan Elektronik</span>
                      <span className="text-red-500 text-xs">*Wajib</span>
                    </label>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
                      <p className="text-xs text-slate-500 mb-4 text-center">
                        Silakan bubuhkan tanda tangan Anda di bawah ini sebagai bukti persetujuan sah. Tanda tangan akan otomatis ditambahkan ke draft di samping.
                      </p>
                      <SignaturePad 
                        onSave={setSignature} 
                        nip={currentProfile.nip} 
                        nama={currentProfile.nama}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3 mt-auto">
                  <Button
                    onClick={handlePreSubmit}
                    disabled={loading}
                    className={`h-12 w-full rounded-xl font-bold shadow-lg transition-all ${
                      keputusan === "approved" 
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20" 
                        : keputusan === "rejected"
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
                        : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                    }`}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
                    ) : (
                      "Simpan Keputusan"
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedRequest(null);
                      setKeputusan(null);
                      setSignature("");
                      setCatatan("");
                    }}
                    disabled={loading}
                    className="h-12 w-full rounded-xl border-slate-200"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal (Riwayat) */}
      {selectedRequest && !keputusan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b text-slate-800 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-lg">Detail Riwayat Cuti</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-y-4">
                <div>
                  <p className="text-slate-500">Pemohon</p>
                  <p className="font-bold text-slate-800">{selectedRequest.namaPemohon}</p>
                </div>
                <div>
                  <p className="text-slate-500">Status Atasan</p>
                  <Badge variant={
                    selectedRequest.statusAtasan === "approved" ? "success" :
                    selectedRequest.statusAtasan === "rejected" ? "danger" :
                    selectedRequest.statusAtasan === "changes" ? "warning" :
                    selectedRequest.statusAtasan === "delayed" ? "warning" : "info"
                  }>
                    {selectedRequest.statusAtasan === "approved" ? "Disetujui Atasan" :
                     selectedRequest.statusAtasan === "rejected" ? "Ditolak Atasan" :
                     selectedRequest.statusAtasan === "changes" ? "Dikembalikan" :
                     selectedRequest.statusAtasan === "delayed" ? "Ditangguhkan" : "Menunggu Atasan"}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500">Status Akhir</p>
                  <Badge variant={
                    selectedRequest.statusAkhir === "approved" ? "success" :
                    selectedRequest.statusAkhir === "rejected" ? "danger" :
                    "info"
                  }>
                    {selectedRequest.statusAkhir === "approved" ? "Disetujui Penuh" :
                     selectedRequest.statusAkhir === "rejected" ? "Ditolak" :
                     selectedRequest.statusKepala === "pending" && selectedRequest.statusAtasan === "approved"
                       ? "Menunggu Kepala Kantor"
                       : "Sedang Diproses"}
                  </Badge>
                </div>
                <div>
                  <p className="text-slate-500">Jenis Cuti</p>
                  <p className="font-semibold text-slate-700">{selectedRequest.jenisCuti}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
              <Button onClick={() => setSelectedRequest(null)} className="rounded-xl">Tutup</Button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={activeTab === "kepala" ? "Konfirmasi Keputusan Kepala Kantor" : "Konfirmasi Keputusan Atasan"}
        description={`Apakah Anda yakin ingin menyimpan keputusan ini? ${
          keputusan === "approved" 
            ? "Tanda tangan Anda akan dibubuhkan secara permanen pada dokumen cuti." 
            : "Keputusan beserta catatan Anda akan disimpan."
        }`}
        onConfirm={() => {
          setConfirmOpen(false);
          handleAction();
        }}
        confirmText="Ya, Simpan Keputusan"
        cancelText="Batal"
        variant={keputusan === "rejected" ? "danger" : keputusan === "approved" ? "info" : "warning"}
      />
    </div>
  );
}
