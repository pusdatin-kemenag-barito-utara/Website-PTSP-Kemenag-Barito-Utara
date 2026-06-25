"use client";

import { useState, useEffect } from "react";
import { X, Check, FileCheck2, Loader2, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SignaturePad } from "@/components/ui/signature-pad";
import { DraftCutiDocument } from "@/components/ui/draft-cuti-document";
import { verifikasiCutiAtasanAction } from "@/lib/actions/pegawai/cuti-approval";
import { getSisaCutiByNip } from "@/lib/actions/pegawai/cuti";
import { ModernSelect } from "@/components/ui/modern-select";

interface VerifikasiModalProps {
  request: any;
  onClose: () => void;
  onUpdate: (updated: any) => void;
  atasanProfile?: any;
  pejabatList?: any[];
}

export default function VerifikasiModal({
  request,
  onClose,
  onUpdate,
  atasanProfile,
  pejabatList = [],
}: VerifikasiModalProps) {
  const [status, setStatus] = useState<string>("approved");
  const [catatan, setCatatan] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sisaCuti, setSisaCuti] = useState({ n: "0", n1: "0", n2: "0" });

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
    keputusanAtasan: status,
    catatanAtasan: catatan,
    atasanSignature: signature,
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
    const res = await verifikasiCutiAtasanAction(request.id, status, catatan, signature);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Verifikasi berhasil disimpan!");
      onUpdate({ ...request, statusAtasan: status });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-2 sm:p-4 flex items-start justify-center overflow-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] xl:max-w-[1400px] shadow-2xl flex flex-col md:flex-row my-4 overflow-hidden items-start">
        {/* Left Side: Document Preview — independently scrollable with max-height */}
        <div className="flex-1 max-h-[50vh] md:max-h-[calc(100vh-6rem)] overflow-auto bg-slate-100 p-3 sm:p-6 md:p-8 flex justify-center min-w-0">
          <div className="shadow-lg rounded-xl overflow-hidden bg-white inline-block">
            <DraftCutiDocument data={draftData} pejabatList={pejabatList} />
          </div>
        </div>

        {/* Right Side: Verification Form — no scroll, height follows content */}
        <div className="w-full md:w-[400px] lg:w-[420px] bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col shrink-0">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Verifikasi</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-white hover:text-slate-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Info Pemohon */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Detail Pengajuan
              </p>
              <p className="font-semibold text-slate-800 text-sm">{nama}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{nip}</p>
              {jabatan && (
                <p className="text-xs text-slate-500 mt-0.5">{jabatan}</p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  {request.jenisCuti}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">
                Keputusan Atasan
              </label>
              <ModernSelect
                value={status}
                onChange={setStatus}
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
                placeholder="Tambahkan catatan verifikasi..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[90px] resize-none"
              />
            </div>

            {isApproved && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">
                  Tanda Tangan Elektronik (TTE) <span className="text-red-500">*</span>
                </label>
                {!signature ? (
                  <div className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 min-h-[140px]">
                    <p className="text-sm text-slate-500 text-center">
                      Klik tombol di bawah untuk membubuhkan TTE sebagai Atasan Langsung
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
                ) : (
                  <div className="border border-emerald-200 rounded-xl bg-emerald-50 relative overflow-hidden">
                    <SignaturePad
                      nip={atasanNip}
                      nama={atasanNama}
                      onSave={setSignature}
                    />
                    <div className="p-3 flex justify-end border-t border-emerald-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSignature("")}
                        className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
                      >
                        Hapus TTE
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  TTE ini akan dibubuhkan pada dokumen cuti sebagai persetujuan Atasan Langsung.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || (isApproved && !signature)}
              className={`flex-1 text-white ${
                isApproved
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
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
                  Ajukan ke Pejabat
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Kembalikan ke Pegawai
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
