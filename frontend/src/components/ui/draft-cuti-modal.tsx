import { X, ZoomIn, ZoomOut, Maximize, Printer, Download } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion as m, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

interface DraftCutiModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    nama: string;
    nip: string;
    jabatan: string;
    unitKerja: string;
    masaKerjaTahun: string;
    masaKerjaBulan: string;
    jenisCuti: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alamatCuti: string;
    noHp: string;
    jenisPegawai?: string;
    tanggalPilihan?: string;
    signature: string;
    atasanSignature?: string;
    kepalaSignature?: string;
    keputusanAtasan?: string;
    keputusanKepala?: string;
    catatanAtasan?: string;
    catatanKepala?: string;
    sisaCuti?: number;
    cutiTahun2?: number;
    cutiTahun1?: number;
    hakBerjalan?: number;
    jumlahCuti?: number;
    totalDiambil?: number;
    cutiAlasanPenting?: number;
    cutiBesar?: number;
    cutiBersalin?: number;
    cutiSakit?: number;
  };
  pejabatList?: any[];
  hideActions?: boolean;
}

export function DraftCutiModal({ isOpen, onClose, data, pejabatList = [], hideActions = false }: DraftCutiModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFit = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      if (containerWidth < 800) {
        setZoom((containerWidth - 32) / 800);
      } else {
        setZoom(1);
      }
    }
  };

  const formatNamaCapital = (fullName: string | null | undefined) => {
    if (!fullName) return "...............................";
    if (fullName.includes(",")) {
      const parts = fullName.split(",");
      const name = parts[0].toUpperCase();
      const title = parts.slice(1).join(",");
      return `${name},${title}`;
    }
    const words = fullName.split(" ");
    const formattedWords = words.map((word, index) => {
      if (
        word.includes(".") &&
        index > 0 &&
        !["H.", "Hj.", "Dr.", "Drs.", "Prof."].includes(word)
      ) {
        return word;
      }
      return word.toUpperCase();
    });
    return formattedWords.join(" ");
  };

  const executePrint = () => {
    const originalTitle = document.title;
    const safeName = data.nama || "Tanpa_Nama";
    const safeNip = data.nip || "Tanpa_NIP";
    const safeJenis = data.jenisCuti || "Draft_Cuti";
    document.title = `${safeJenis}_${safeName}_${safeNip}`;
    
    window.print();
    
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-draft");
    if (!element) {
      toast.error("Gagal menemukan dokumen untuk diunduh.");
      return;
    }

    try {
      setIsDownloading(true);
      toast.loading("Mempersiapkan dokumen PDF...", { id: "pdf-download" });

      const scrollHeight = element.scrollHeight;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: 800,
        height: scrollHeight,
        windowWidth: 800,
        windowHeight: scrollHeight,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const scrollArea = clonedDoc.getElementById("modal-scroll-area");
          if (scrollArea) {
            scrollArea.style.overflow = "visible";
            scrollArea.style.maxHeight = "none";
            scrollArea.style.height = "auto";
          }
          const scaleWrapper = clonedDoc.querySelector(".print-no-scale") as HTMLElement | null;
          if (scaleWrapper) {
            scaleWrapper.style.transform = "none";
            if (scaleWrapper.parentElement) {
              scaleWrapper.parentElement.style.height = "auto";
            }
          }
          const printable = clonedDoc.getElementById("printable-draft");
          if (printable) {
            printable.style.boxShadow = "none";
            printable.style.border = "none";
            printable.style.margin = "0";
          }
        }
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [215.9, 330.2], // F4/Folio
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      let finalWidth = pdfWidth;
      let finalHeight = (canvas.height * finalWidth) / canvas.width;

      if (finalHeight > pdfPageHeight) {
        finalHeight = pdfPageHeight;
        finalWidth = (canvas.width * finalHeight) / canvas.height;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;

      pdf.addImage(imgData, "PNG", xOffset, 0, finalWidth, finalHeight);
      
      const safeName = data.nama || "Tanpa_Nama";
      const safeJenis = data.jenisCuti || "Draft_Cuti";
      const safeNip = data.nip || "Tanpa_NIP";
      
      pdf.save(`${safeJenis}_${safeName}_${safeNip}.pdf`);

      toast.success("Berhasil mengunduh dokumen PDF!", { id: "pdf-download" });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Gagal membuat dokumen PDF.", { id: "pdf-download" });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
      // Allow modal to render before calculating
      setTimeout(handleFit, 50);
    } else {
      // Restore scrolling
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.25));

  // Helpers
  const renderCheck = (jenis: string) => {
    return data.jenisCuti === jenis ? "✓" : "";
  };

  const getAtasanInfo = (unitKerja: string) => {
    if (!unitKerja) return {
      nama: ".....................................................",
      nip: "...............................................",
    };

    const atasan = pejabatList.find((p: any) => {
      if (p.tipePejabat !== "Atasan Langsung") return false;

      let pUnit = p.unitKerja?.trim().toLowerCase() || "";
      let pJab = p.jabatan?.trim().toLowerCase() || "";
      let targetUnit = unitKerja.trim().toLowerCase();

      // Normalize 'kec.' to 'kecamatan'
      pUnit = pUnit.replace(/kec\./g, "kecamatan").trim();
      targetUnit = targetUnit.replace(/kec\./g, "kecamatan").trim();

      // Normalize common differences
      pJab = pJab.replace(/&/g, "dan");
      targetUnit = targetUnit.replace(/&/g, "dan");

      return pUnit === targetUnit || pJab.includes(targetUnit) || targetUnit.includes(pUnit);
    });

    return atasan
      ? { nama: atasan.nama, nip: atasan.nip }
      : {
          nama: ".....................................................",
          nip: "...............................................",
        };
  };

  const getPejabatBerwenang = () => {
    const pejabat = pejabatList.find(
      (p: any) => p.tipePejabat === "Pejabat Berwenang"
    );
    return pejabat
      ? { nama: pejabat.nama, nip: pejabat.nip }
      : {
          nama: ".....................................................",
          nip: "...............................................",
        };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "....................";
    try {
      const d = new Date(dateStr);
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const hitungLama = () => {
    if (data.tanggalPilihan) {
      return `${data.tanggalPilihan.split(",").length} Hari`;
    }
    if (!data.tanggalMulai || !data.tanggalSelesai) return ".....";
    const start = new Date(data.tanggalMulai);
    const end = new Date(data.tanggalSelesai);
    if (start > end) return ".....";

    let current = new Date(start);
    let diffDays = 0;
    while (current <= end) {
      if (current.getDay() !== 0) {
        diffDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    return `${diffDays} Hari`;
  };

  const getRincianTanggal = () => {
    if (!data.tanggalPilihan) return "";
    const dates = data.tanggalPilihan.split(",");
    if (dates.length <= 2) return ""; // if only 2 days, start & end are enough
    const formatted = dates
      .map((d) => {
        const dateObj = new Date(d);
        return `${dateObj.getDate()}`;
      })
      .join(", ");
    return ` (Rincian tanggal terpilih: ${formatted})`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
          />
          <div
            id="modal-overlay"
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
          >
            <m.div
              id="modal-content-wrapper"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-slate-100 shrink-0 relative z-10">
                <h2 className="text-lg font-bold text-slate-800">
                  Draft Permohonan Cuti
                </h2>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-lg p-1 mr-2">
                    {!hideActions && (
                      <>
                        <button
                          onClick={executePrint}
                          className="flex items-center gap-1.5 p-1.5 px-2 md:px-3 bg-emerald-600 text-white rounded shadow-sm transition-all hover:bg-emerald-700 font-medium text-xs"
                          title="Cetak Dokumen"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden md:inline">Cetak</span>
                        </button>
                        <button
                          onClick={handleDownloadPDF}
                          disabled={isDownloading}
                          className="flex items-center gap-1.5 p-1.5 px-2 md:px-3 bg-blue-600 text-white rounded shadow-sm transition-all hover:bg-blue-700 font-medium text-xs disabled:opacity-50"
                          title="Unduh sebagai PDF"
                        >
                          <Download className="w-4 h-4" />
                          <span className="hidden md:inline">{isDownloading ? "Mengunduh..." : "Unduh PDF"}</span>
                        </button>
                        <div className="w-px h-5 bg-slate-300 mx-1"></div>
                      </>
                    )}
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-slate-600 hover:text-slate-900"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 w-12 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-slate-600 hover:text-slate-900"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFit}
                      className="p-1.5 hover:bg-white rounded shadow-sm transition-all text-slate-600 hover:text-slate-900 ml-1"
                      title="Sesuaikan Layar"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Mobile Zoom Controls */}
              <div className="sm:hidden flex items-center justify-center gap-2 py-3 bg-slate-50 border-b border-slate-100 shrink-0 z-10">
                <button
                  onClick={handleZoomOut}
                  className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 active:scale-95"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-700 w-14 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 active:scale-95"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFit}
                  className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 active:scale-95 ml-2"
                >
                  <Maximize className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <div className="flex gap-2">
                  {!hideActions && (
                    <>
                      <button
                        onClick={executePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="hidden sm:inline">Cetak</span>
                      </button>
                      
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDownloading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">PDF</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div
                id="modal-scroll-area"
                ref={containerRef}
                className="p-4 sm:p-6 overflow-auto custom-scrollbar flex-1 bg-slate-100/50"
              >
                <div
                  className="mx-auto"
                  style={{
                    width: `${800 * zoom}px`,
                    height: `${1131 * zoom}px`,
                    flexShrink: 0,
                    transition: "width 0.2s, height 0.2s",
                  }}
                >
                  <div
                    className="origin-top-left transition-transform duration-200 print-no-scale"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Kertas F4/A4 */}
                    <div
                      id="printable-draft"
                      className="w-[800px] min-h-[1131px] bg-white p-8 sm:p-12 text-black text-sm font-['Arial'] leading-snug shadow-md border border-slate-200"
                    >
                      <div className="flex justify-end mb-8">
                        <div className="w-1/2 text-xs leading-tight">
                          {data.jenisPegawai === "PPPK" ? (
                            <>
                              <p>LAMPIRAN II</p>
                              <p>
                                PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK
                                INDONESIA
                              </p>
                              <table className="mt-1">
                                <tbody>
                                  <tr>
                                    <td className="w-16">NOMOR</td>
                                    <td>: 7 TAHUN 2022</td>
                                  </tr>
                                  <tr>
                                    <td className="align-top">TENTANG</td>
                                    <td>
                                      : TATA CARA PEMBERIAN CUTI PEGAWAI
                                      PEMERINTAH DENGAN PERJANJIAN KERJA
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </>
                          ) : (
                            <>
                              <p>Anak Lampiran 1.b</p>
                              <p>
                                PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK
                                INDONESIA
                              </p>
                              <table className="mt-1">
                                <tbody>
                                  <tr>
                                    <td className="w-16">NOMOR</td>
                                    <td>: 24 TAHUN 2017</td>
                                  </tr>
                                  <tr>
                                    <td className="align-top">TENTANG</td>
                                    <td>
                                      : TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI
                                      SIPIL
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end mb-6">
                        <div className="w-[45%] text-xs">
                          <p>
                            Muara Teweh, {formatDate(new Date().toISOString())}
                          </p>
                          <p className="mt-2">Kepada</p>
                          <p>Yth. Kepala Kantor Kementerian Agama</p>
                          <p className="pl-6">Kabupaten Barito Utara</p>
                          <p>di-</p>
                          <p className="pl-6">Muara Teweh</p>
                        </div>
                      </div>

                      <h3 className="text-center font-bold underline mb-6">
                        {data.jenisPegawai === "PPPK"
                          ? "FORMULIR PERMINTAAN DAN PEMBERIAN CUTI"
                          : "FORMULIR PERMINTAAN DAN PEMBERIAN CUTI"}
                      </h3>

                      {/* I. DATA PEGAWAI */}
                      <table className="w-full border-collapse border border-black mb-4">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="border border-black p-1 font-bold"
                            >
                              I. DATA PEGAWAI
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 w-[15%]">
                              Nama
                            </td>
                            <td className="border border-black p-1 w-[45%]">
                              {formatNamaCapital(data.nama)}
                            </td>
                            <td className="border border-black p-1 w-[15%]">
                              NIP
                            </td>
                            <td className="border border-black p-1 w-[25%]">
                              {data.nip}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1">Jabatan</td>
                            <td className="border border-black p-1">
                              {data.jabatan}
                            </td>
                            <td className="border border-black p-1">
                              Masa Kerja
                            </td>
                            <td className="border border-black p-1">
                              {data.masaKerjaTahun
                                ? `${data.masaKerjaTahun} Tahun `
                                : ""}
                              {data.masaKerjaBulan
                                ? `${data.masaKerjaBulan} Bulan`
                                : ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1">
                              Unit Kerja
                            </td>
                            <td colSpan={3} className="border border-black p-1">
                              {data.unitKerja}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* II. JENIS CUTI */}
                      <table className="w-full border-collapse border border-black mb-4">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="border border-black p-1 font-bold"
                            >
                              II. JENIS CUTI YANG DIAMBIL **
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 w-[40%]">
                              1. Cuti Tahunan
                            </td>
                            <td className="border border-black p-1 w-[10%] text-center">
                              {renderCheck("Cuti Tahunan")}
                            </td>
                            <td className="border border-black p-1 w-[40%]">
                              2. Cuti Besar
                            </td>
                            <td className="border border-black p-1 w-[10%] text-center">
                              {renderCheck("Cuti Besar")}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1">
                              3. Cuti Sakit
                            </td>
                            <td className="border border-black p-1 text-center">
                              {renderCheck("Cuti Sakit")}
                            </td>
                            <td className="border border-black p-1">
                              4. Cuti Melahirkan
                            </td>
                            <td className="border border-black p-1 text-center">
                              {renderCheck("Cuti Bersalin")}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1">
                              5. Cuti Karena Alasan Penting
                            </td>
                            <td className="border border-black p-1 text-center">
                              {renderCheck("Cuti Alasan Penting")}
                            </td>
                            <td className="border border-black p-1">
                              6. Cuti di Luar Tanggungan Negara
                            </td>
                            <td className="border border-black p-1 text-center">
                              {renderCheck("Cuti Di Luar Tanggungan Negara")}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* III. ALASAN CUTI */}
                      <table className="w-full border-collapse border border-black mb-4">
                        <tbody>
                          <tr>
                            <td className="border border-black p-1 font-bold">
                              III. ALASAN CUTI
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 min-h-[60px] align-top">
                              {data.alasan}{" "}
                              {data.tanggalPilihan ? (
                                <span className="text-xs italic text-gray-700 block mt-1">
                                  {getRincianTanggal()}
                                </span>
                              ) : (
                                ""
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* IV. LAMANYA CUTI */}
                      <table className="w-full border-collapse border border-black mb-4">
                        <tbody>
                          <tr>
                            <td
                              colSpan={6}
                              className="border border-black p-1 font-bold"
                            >
                              IV. LAMANYA CUTI
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 w-[10%] text-center">
                              Selama
                            </td>
                            <td className="border border-black p-1 w-[15%] text-center">
                              {hitungLama()}
                            </td>
                            <td className="border border-black p-1 w-[15%] text-center">
                              Mulai Tanggal
                            </td>
                            <td className="border border-black p-1 w-[25%] text-center">
                              {formatDate(data.tanggalMulai)}
                            </td>
                            <td className="border border-black p-1 w-[5%] text-center">
                              s/d
                            </td>
                            <td className="border border-black p-1 w-[30%] text-center">
                              {formatDate(data.tanggalSelesai)}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* V. CATATAN CUTI */}
                      <table className="w-full border-collapse border border-black mb-4">
                        <tbody>
                          <tr>
                            <td
                              colSpan={5}
                              className="border border-black p-1 font-bold"
                            >
                              V. CATATAN CUTI ***
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={3}
                              className="border border-black p-1 w-[50%]"
                            >
                              1. CUTI TAHUNAN
                            </td>
                            <td className="border border-black p-1 w-[40%] text-[13px]">
                              2. CUTI BESAR
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiBesar ? `${data.cutiBesar} Hari` : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 w-[15%] text-center">
                              Tahun
                            </td>
                            <td className="border border-black p-1 w-[15%] text-center">
                              Sisa
                            </td>
                            <td className="border border-black p-1 w-[20%] text-center">
                              Keterangan
                            </td>
                            <td className="border border-black p-1 text-[13px]">
                              3. CUTI SAKIT
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiSakit ? `${data.cutiSakit} Hari` : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N-2
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiTahun2 ?? ""}
                            </td>
                            <td className="border border-black p-1 text-xs text-center">
                              Sisa Cuti {new Date().getFullYear() - 2}
                            </td>
                            <td className="border border-black p-1 text-[13px]">
                              4. CUTI MELAHIRKAN
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiBersalin
                                ? `${data.cutiBersalin} Hari`
                                : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N-1
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiTahun1 ?? ""}
                            </td>
                            <td className="border border-black p-1 text-xs text-center">
                              Sisa Cuti {new Date().getFullYear() - 1}
                            </td>
                            <td className="border border-black p-1 text-[13px]">
                              5. CUTI KARENA ALASAN PENTING
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.cutiAlasanPenting
                                ? `${data.cutiAlasanPenting} Hari`
                                : "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N
                            </td>
                            <td className="border border-black p-1 text-center">
                              {data.hakBerjalan ?? ""}
                            </td>
                            <td className="border border-black p-1 text-xs text-center">
                              Sisa Cuti {new Date().getFullYear()}
                            </td>
                            <td className="border border-black p-1 text-[13px]">
                              6. CUTI DI LUAR TANGGUNGAN NEGARA
                            </td>
                            <td className="border border-black p-1 text-center">
                              -
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
                      <table className="w-full border-collapse border border-black mb-6">
                        <tbody>
                          <tr>
                            <td
                              colSpan={3}
                              className="border border-black p-1 font-bold"
                            >
                              VI. ALAMAT SELAMA MENJALANKAN CUTI
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="border border-black p-1 w-[50%] align-middle text-center min-h-[80px]"
                              rowSpan={2}
                            >
                              {data.alamatCuti}
                            </td>
                            <td className="border border-black p-1 w-[15%] align-top">
                              TELP.
                            </td>
                            <td className="border border-black p-1 w-[35%] font-medium align-top">
                              {data.noHp}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              className="border border-black p-2 text-center"
                            >
                              <p className="mb-2">Hormat Saya,</p>
                              {data.signature?.startsWith("TTE_VERIFIED") ? (
                                <div className="flex justify-center my-2 relative w-16 h-16 mx-auto">
                                  <QRCode
                                    value={`TTE-KEMENAG-BARUT-${data.nama}-${data.nip}-${data.jenisCuti}-${formatDate(data.tanggalMulai)}`}
                                    size={64}
                                    level="H"
                                    className="w-16 h-16"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-0.5 rounded-full">
                                      <img
                                        src="/kemenag.svg"
                                        alt="Kemenag"
                                        className="w-3.5 h-3.5 object-contain"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : data.signature ? (
                                <img
                                  src={data.signature}
                                  alt="Tanda Tangan"
                                  className="h-16 mx-auto object-contain my-2"
                                />
                              ) : (
                                <div className="h-16"></div>
                              )}
                              <p className="mt-1">
                                ({" "}
                                {formatNamaCapital(data.nama)}{" "}
                                )
                              </p>
                              <p>
                                NIP.{" "}
                                {data.nip || "..............................."}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
                      {data.unitKerja !== "Pejabat Eselon IV" && (
                        <table className="w-full border-collapse border border-black mb-4">
                          <tbody>
                            <tr>
                              <td
                                colSpan={4}
                                className="border border-black p-1 font-bold"
                              >
                                VII. PERTIMBANGAN ATASAN LANGSUNG **
                              </td>
                            </tr>
                            <tr className="text-center text-xs">
                              <td className="border border-black p-1 w-[25%]">
                                DISETUJUI
                              </td>
                              <td className="border border-black p-1 w-[25%]">
                                PERUBAHAN ****
                              </td>
                              <td className="border border-black p-1 w-[25%]">
                                DITANGGUHKAN ****
                              </td>
                              <td className="border border-black p-1 w-[25%]">
                                TIDAK DISETUJUI ****
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                                {data.keputusanAtasan === "approved" ? "✓" : ""}
                              </td>
                              <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                                {data.keputusanAtasan === "changes" ? "✓" : ""}
                              </td>
                              <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                                {data.keputusanAtasan === "delayed" ? "✓" : ""}
                              </td>
                              <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                                {data.keputusanAtasan === "rejected" ? "✓" : ""}
                              </td>
                            </tr>
                            <tr>
                              <td
                                colSpan={2}
                                className="border border-black p-2 align-middle text-center"
                              >
                                {data.catatanAtasan && (
                                  <div className="text-xs">
                                    <span className="font-bold underline">
                                      Catatan:
                                    </span>
                                    <p className="mt-1 whitespace-pre-wrap">
                                      {data.catatanAtasan}
                                    </p>
                                  </div>
                                )}
                              </td>
                              <td
                                colSpan={2}
                                className="border border-black p-2 text-center relative"
                              >
                                {data.atasanSignature?.startsWith(
                                  "TTE_VERIFIED",
                                ) ? (
                                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                    <div className="flex justify-center relative w-20 h-20 mx-auto">
                                      <QRCode
                                        value={`TTE-KEMENAG-BARUT-${getAtasanInfo(data.unitKerja).nama}-${getAtasanInfo(data.unitKerja).nip}-${formatDate(new Date().toISOString())}`}
                                        size={80}
                                        level="H"
                                        className="w-20 h-20"
                                      />
                                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-white p-0.5 rounded-full">
                                          <img
                                            src="/kemenag.svg"
                                            alt="Kemenag"
                                            className="w-3.5 h-3.5 object-contain"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : data.atasanSignature ? (
                                  <img
                                    src={data.atasanSignature}
                                    alt="Tanda Tangan Atasan"
                                    className="h-16 mx-auto object-contain my-2"
                                  />
                                ) : null}
                                <div className="h-22"></div>
                                {(() => {
                                  const atasan = getAtasanInfo(data.unitKerja);
                                  return (
                                    <>
                                      <p
                                        className={
                                          atasan.nama.includes("...")
                                            ? ""
                                            : "relative z-10"
                                        }
                                      >
                                        {atasan.nama.includes("...")
                                          ? `( ${atasan.nama} )`
                                          : atasan.nama}
                                      </p>
                                      <p className="relative z-10">
                                        NIP. {atasan.nip}
                                      </p>
                                    </>
                                  );
                                })()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      )}

                      {/* VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERI CUTI */}
                      <table className="w-full border-collapse border border-black mb-6">
                        <tbody>
                          <tr>
                            <td
                              colSpan={4}
                              className="border border-black p-1 font-bold"
                            >
                              VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERI
                              CUTI **
                            </td>
                          </tr>
                          <tr className="text-center text-xs">
                            <td className="border border-black p-1 w-[25%]">
                              DISETUJUI
                            </td>
                            <td className="border border-black p-1 w-[25%]">
                              PERUBAHAN ****
                            </td>
                            <td className="border border-black p-1 w-[25%]">
                              DITANGGUHKAN ****
                            </td>
                            <td className="border border-black p-1 w-[25%]">
                              TIDAK DISETUJUI ****
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                              {data.keputusanKepala === "approved" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                              {data.keputusanKepala === "changes" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                              {data.keputusanKepala === "delayed" ? "✓" : ""}
                            </td>
                            <td className="border border-black p-1 h-8 text-center text-lg font-bold">
                              {data.keputusanKepala === "rejected" ? "✓" : ""}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              className="border border-black p-2 align-middle text-center"
                            >
                              {data.catatanKepala && (
                                <div className="text-xs">
                                  <span className="font-bold underline">
                                    Catatan:
                                  </span>
                                  <p className="mt-1 whitespace-pre-wrap">
                                    {data.catatanKepala}
                                  </p>
                                </div>
                              )}
                            </td>
                            <td
                              colSpan={2}
                              className="border border-black p-2 text-center relative"
                            >
                              {data.kepalaSignature?.startsWith(
                                "TTE_VERIFIED",
                              ) ? (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                                  <div className="flex justify-center relative w-20 h-20 mx-auto">
                                    <QRCode
                                      value={`TTE-KEMENAG-BARUT-${getPejabatBerwenang().nama}-${getPejabatBerwenang().nip}-KEPALA KANTOR-${formatDate(new Date().toISOString())}`}
                                      size={80}
                                      level="H"
                                      className="w-20 h-20"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <div className="bg-white p-0.5 rounded-full">
                                        <img
                                          src="/kemenag.svg"
                                          alt="Kemenag"
                                          className="w-3.5 h-3.5 object-contain"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : data.kepalaSignature ? (
                                <img
                                  src={data.kepalaSignature}
                                  alt="Tanda Tangan Kepala Kantor"
                                  className="h-16 mx-auto object-contain my-2"
                                />
                              ) : null}
                              <div className="h-22"></div>
                              <p className="relative z-10">
                                {getPejabatBerwenang().nama}
                              </p>
                              <p className="relative z-10">
                                NIP. {getPejabatBerwenang().nip}
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Catatan / Keterangan Kaki */}
                      <div className="text-[10px] leading-tight mt-4">
                        <p className="font-bold mb-1">Catatan :</p>
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="w-8">*</td>
                              <td>Coret yang tidak perlu.</td>
                            </tr>
                            <tr>
                              <td>**</td>
                              <td>
                                Pilih salah satu dengan memberi tanda centang
                                (✓)
                              </td>
                            </tr>
                            <tr>
                              <td className="align-top">***</td>
                              <td>
                                Diisi oleh pejabat yang menangani bidang
                                kepegawaian sebelum{" "}
                                {data.jenisPegawai === "PPPK" ? "PPPK" : "PNS"}{" "}
                                mengajukan cuti.
                              </td>
                            </tr>
                            <tr>
                              <td>****</td>
                              <td>Diberi tanda centang (✓) dan alasannya.</td>
                            </tr>
                            <tr>
                              <td>N</td>
                              <td>= Cuti Tahunan.</td>
                            </tr>
                            <tr>
                              <td>N-1</td>
                              <td>= Sisa cuti 1 tahun sebelumnya.</td>
                            </tr>
                            <tr>
                              <td>N-2</td>
                              <td>= Sisa cuti 2 tahun sebelumnya.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </m.div>
          </div>
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* HIDE EVERYTHING EXCEPT THE DRAFT AND ITS ANCESTORS/DESCENDANTS */
              body *:not(:has(#printable-draft)):not(#printable-draft):not(#printable-draft *) {
                display: none !important;
              }
              
              /* RESET ANCESTORS TO PURE STATIC WRAPPERS */
              body, html,
              #modal-overlay,
              #modal-content-wrapper,
              #modal-scroll-area {
                position: static !important;
                display: block !important;
                transform: none !important;
                max-height: none !important;
                overflow: visible !important;
                height: auto !important;
                padding: 0 !important;
                margin: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                border: none !important;
                max-width: none !important;
                width: auto !important;
              }

              /* FORMAT THE DRAFT ITSELF */
              #printable-draft {
                position: relative !important;
                width: 215.9mm !important;
                min-height: 0 !important; /* VERY IMPORTANT: Override Tailwind min-h-[1131px] */
                margin: 0 auto !important;
                padding: 2mm 15mm !important; /* Ditarik ke atas */
                box-sizing: border-box !important;
                box-shadow: none !important;
                border: none !important;
                transform: none !important;
                font-family: Arial, Helvetica, sans-serif !important;
              }
              /* Squeeze all elements to perfectly fit 1 page F4 */
              #printable-draft .text-sm { font-size: 11px !important; line-height: 1.2 !important; }
              #printable-draft .text-xs { font-size: 9.5px !important; line-height: 1.15 !important; }
              #printable-draft .text-\\[10px\\] { font-size: 8px !important; line-height: 1.0 !important; }
              #printable-draft .text-lg { font-size: 12px !important; }
              #printable-draft .p-1 { padding: 1px !important; }
              #printable-draft .p-2 { padding: 2px !important; }
              #printable-draft .p-8 { padding: 0 !important; }
              #printable-draft .sm\\:p-12 { padding: 0 !important; }
              #printable-draft .mb-8 { margin-bottom: 6px !important; }
              #printable-draft .mb-6 { margin-bottom: 4px !important; }
              #printable-draft .mb-4 { margin-bottom: 2px !important; }
              #printable-draft .mt-4 { margin-top: 2px !important; }
              #printable-draft .mt-2 { margin-top: 1px !important; }
              #printable-draft .mt-1 { margin-top: 0px !important; }
              #printable-draft .h-22 { height: 35px !important; }
              #printable-draft .h-16 { height: 50px !important; }
              #printable-draft img.h-16 { height: 50px !important; }
              #printable-draft .w-20 { width: 65px !important; height: 65px !important; }
              #printable-draft .h-20 { height: 65px !important; }
              
              @page {
                size: 215.9mm 330.2mm; /* F4 / Folio Size */
                margin: 0;
              }
              .print-no-scale {
                transform: none !important;
              }
              ::-webkit-scrollbar {
                display: none;
              }
            }
          ` }} />
        </>
      )}
    </AnimatePresence>
  );
}
