"use client";

import { useState, useEffect } from "react";
import { X, Check, FileCheck2, Loader2, Send, RotateCcw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SignaturePad } from "@/components/ui/signature-pad";
import { DraftCutiDocument } from "@/components/ui/draft-cuti-document";
import { DraftCutiModal } from "@/components/ui/draft-cuti-modal";
import { verifikasiCutiAtasanAction } from "@/lib/actions/pegawai/cuti-approval";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import { ModernSelect } from "@/components/ui/modern-select";

interface VerifikasiModalProps {
  request: any;
  onClose: () => void;
  onUpdate: (updated: any) => void;
  atasanProfile?: any;
  pejabatList?: any[];
  viewerRole?: string;
}

export default function VerifikasiModal({
  request,
  onClose,
  onUpdate,
  atasanProfile,
  pejabatList = [],
  viewerRole = "Atasan Langsung",
}: VerifikasiModalProps) {
  const isPejabat = viewerRole === "Pejabat Berwenang";
  const isReadOnly = isPejabat ? request.statusKepala !== "pending" : request.statusAtasan !== "pending";

  const [status, setStatus] = useState<string>(
    isReadOnly ? (isPejabat ? request.statusKepala : request.statusAtasan) : "approved"
  );
  const [catatan, setCatatan] = useState<string>(
    isReadOnly ? (isPejabat ? (request.catatanKepala || "") : (request.catatanAtasan || "")) : ""
  );
  const [signature, setSignature] = useState<string>(
    isReadOnly ? (isPejabat ? (request.ttdKepala || "") : (request.ttdAtasan || "")) : ""
  );
  const [loading, setLoading] = useState(false);
  const [sisaCuti, setSisaCuti] = useState({ n: "0", n1: "0", n2: "0" });
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const nip = request.user?.nip || "";
  const nama = request.user?.fullName || "";
  const jabatan = request.jabatan || request.user?.jabatan || "";

  const atasanNip = atasanProfile?.nip || (atasanProfile?.email || "").split("@")[0] || "";
  const atasanNama = atasanProfile?.fullName || "";

  useEffect(() => {
    if (nip) {
      getSisaCutiByNip(nip).then(setSisaCuti);
    }
  }, [nip]);

  const isApproved = status === "approved";

  const pemohonSignature = nip ? `TTE_VERIFIED:${nip}:${nama}` : "";

  const draftData = {
    ...request,
    user: request.user || {
      fullName: nama,
      nip,
      jabatan,
    },
    nama,
    nip,
    jabatan,
    unitKerja: request.unitKerja || "",
    masaKerjaTahun: request.masaKerjaTahun || "",
    masaKerjaBulan: request.masaKerjaBulan || "",
    jenisCuti: request.jenisCuti,
    alasan: request.alasan,
    tanggalMulai: request.tanggalMulai,
    tanggalSelesai: request.tanggalSelesai,
    tanggalPilihan: request.tanggalPilihan || "",
    alamatCuti: request.alamatCuti || "",
    noHp: request.noHp || "",
    jenisPegawai: request.jenisPegawai || "",
    signature: pemohonSignature,
    hakBerjalan: Number(sisaCuti.n),
    cutiTahun1: Number(sisaCuti.n1),
    cutiTahun2: Number(sisaCuti.n2),
    keputusanAtasan: isPejabat ? request.statusAtasan : status,
    catatanAtasan: isPejabat ? request.catatanAtasan : catatan,
    atasanSignature: isPejabat ? request.ttdAtasan : signature,
    keputusanKepala: isPejabat ? status : request.statusKepala,
    catatanKepala: isPejabat ? catatan : request.catatanKepala,
    kepalaSignature: isPejabat ? signature : request.ttdKepala,
  };

  const handleSubmit = async () => {
    if (isApproved && !signature) {
      toast.error("Tanda tangan wajib dilampirkan jika menyetujui.");
      return;
    }
    if (!isApproved && !catatan.trim()) {
      toast.error("Catatan wajib diisi jika tidak menyetujui.");
      return;
    }

    setLoading(true);
    let res;
    if (isPejabat) {
      const { processCutiAction } = await import("@/lib/actions/pegawai/cuti-approval");
      res = await processCutiAction(request.id, status === "approved" ? "approved_kepala" : "rejected", catatan, signature);
    } else {
      res = await verifikasiCutiAtasanAction(request.id, status === "approved", catatan, signature);
    }

    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Verifikasi berhasil disimpan!");
      onUpdate({
        ...request,
        ...(isPejabat 
          ? { statusKepala: status, catatanKepala: catatan, ttdKepala: signature }
          : { statusAtasan: status, catatanAtasan: catatan, ttdAtasan: signature })
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-0 sm:p-4 flex items-start sm:items-center justify-center overflow-hidden">
      <div className="bg-white w-full h-full sm:h-[90vh] sm:rounded-3xl xl:max-w-[1400px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Side: Document Preview */}
        <div className="hidden md:block h-full md:h-full md:flex-1 overflow-y-auto bg-slate-100 p-2 sm:p-6 md:p-8 text-center min-w-0 min-h-0 border-b border-slate-200 md:border-b-0 relative z-0">

          <div className="shadow-lg rounded-xl overflow-hidden bg-white inline-block text-left mx-auto transform origin-top md:scale-100 scale-[0.85] sm:scale-90 mb-20 md:mb-10 shrink-0">
            <DraftCutiDocument data={draftData} pejabatList={pejabatList} />
          </div>
        </div>

        {/* Right Side: Verification Form */}
        <div className="flex h-full w-full md:w-[400px] lg:w-[420px] bg-white md:border-l border-slate-200 flex-col shrink-0 z-10 relative">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white md:bg-gradient-to-r md:from-emerald-50 md:to-teal-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Verifikasi</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-white hover:text-slate-600 transition-all bg-slate-50 md:bg-transparent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

            {/* Mobile View Document Button */}
            <div className="md:hidden">
              <Button 
                onClick={() => setShowMobilePreview(true)}
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
              >
                <FileText className="w-4 h-4" />
                Lihat Dokumen Pengajuan
              </Button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100 space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {isPejabat ? "Keputusan Pejabat Berwenang" : "Keputusan Atasan Langsung"}
              </p>
              <ModernSelect
                value={status}
                onChange={setStatus}
                disabled={isReadOnly}
                options={[
                  { value: "approved", label: "✅ Disetujui" },
                  { value: "changes", label: "🔄 Perubahan" },
                  { value: "delayed", label: "⏸️ Ditangguhkan" },
                  { value: "rejected", label: "❌ Tidak Disetujui" },
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Catatan{" "}
                {!isApproved && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                readOnly={isReadOnly}
                placeholder={isReadOnly ? "Tidak ada catatan." : "Tambahkan catatan verifikasi..."}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[90px] resize-none disabled:opacity-70 disabled:cursor-not-allowed"
              />
            </div>

            {isApproved && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Tanda Tangan Elektronik (TTE) {!isReadOnly && <span className="text-red-500">*</span>}
                </label>
                {!signature ? (
                  !isReadOnly && (
                    <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 min-h-[140px]">
                      <p className="text-sm text-slate-500 text-center">
                        Klik tombol di bawah untuk membubuhkan TTE sebagai {isPejabat ? "Pejabat Berwenang" : "Atasan Langsung"}
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSignature(`TTE_VERIFIED:${atasanNip}:${atasanNama}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                        Bubuhkan TTE Saya
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center pt-2 gap-3 w-full max-w-[240px] mx-auto">
                    <SignaturePad
                      nip={atasanNip}
                      nama={atasanNama}
                      onSave={setSignature}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => setSignature("")}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline transition-all"
                      >
                        Batalkan TTE
                      </button>
                    )}
                  </div>
                )}
                {!isReadOnly && (
                  <p className="text-xs text-slate-500">
                    TTE ini akan dibubuhkan pada dokumen cuti sebagai persetujuan {isPejabat ? "Pejabat Berwenang" : "Atasan Langsung"}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer (Fixed at Bottom) */}
          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <Button variant="outline" onClick={onClose} className={isReadOnly ? "w-full" : "flex-1"}>
              {isReadOnly ? "Tutup" : "Batal"}
            </Button>
            {!isReadOnly && (
              <Button
                onClick={handleSubmit}
                disabled={loading || (isApproved && !signature)}
                className={`flex-1 text-white ${
                  isApproved
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : isApproved ? (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isPejabat ? "Simpan Persetujuan" : "Ajukan ke Pejabat"}
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Kembalikan ke Pegawai
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Document Modal */}
      <DraftCutiModal 
        isOpen={showMobilePreview} 
        onClose={() => setShowMobilePreview(false)} 
        data={draftData} 
        pejabatList={pejabatList} 
        hideActions={true} 
      />
    </div>
  );
}
