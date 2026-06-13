"use client";

import { X, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import QRCode from "react-qr-code";

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
  };
}

export function DraftCutiModal({ isOpen, onClose, data }: DraftCutiModalProps) {
  const [zoom, setZoom] = useState(1);
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
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <m.div
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
                  <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1 mr-2">
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
              </div>

              <div
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
                    className="origin-top-left transition-transform duration-200"
                    style={{ transform: `scale(${zoom})` }}
                  >
                    {/* Kertas F4/A4 */}
                    <div className="w-[800px] min-h-[1131px] bg-white p-8 sm:p-12 text-black text-sm font-serif leading-snug shadow-md border border-slate-200">
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
                        <div className="w-[45%]">
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
                            <td className="border border-black p-1 w-[35%]">
                              {data.nama}
                            </td>
                            <td className="border border-black p-1 w-[15%]">
                              NIP
                            </td>
                            <td className="border border-black p-1 w-[35%]">
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
                            <td className="border border-black p-1 w-[10%]">
                              Selama
                            </td>
                            <td className="border border-black p-1 w-[20%] text-center">
                              {hitungLama()}
                            </td>
                            <td className="border border-black p-1 w-[10%]">
                              Mulai Tanggal
                            </td>
                            <td className="border border-black p-1 w-[25%] text-center">
                              {formatDate(data.tanggalMulai)}
                            </td>
                            <td className="border border-black p-1 w-[10%] text-center">
                              s/d
                            </td>
                            <td className="border border-black p-1 w-[25%] text-center">
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
                            <td className="border border-black p-1 w-[40%]">
                              2. CUTI BESAR
                            </td>
                            <td className="border border-black p-1 w-[10%]"></td>
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
                            <td className="border border-black p-1">
                              3. CUTI SAKIT
                            </td>
                            <td className="border border-black p-1"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N-2
                            </td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1">
                              4. CUTI MELAHIRKAN
                            </td>
                            <td className="border border-black p-1"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N-1
                            </td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1">
                              5. CUTI KARENA ALASAN PENTING
                            </td>
                            <td className="border border-black p-1"></td>
                          </tr>
                          <tr>
                            <td className="border border-black p-1 text-center">
                              N
                            </td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1"></td>
                            <td className="border border-black p-1 text-xs leading-tight">
                              6. CUTI DI LUAR TANGGUNGAN NEGARA
                            </td>
                            <td className="border border-black p-1"></td>
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
                                    value={`TTE-KEMENAG-BARUT-${data.nip}-${data.nama}`}
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
                                {data.nama || "..............................."}{" "}
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
                              <td className="border border-black p-1 h-8"></td>
                              <td className="border border-black p-1 h-8"></td>
                              <td className="border border-black p-1 h-8"></td>
                              <td className="border border-black p-1 h-8"></td>
                            </tr>
                            <tr>
                              <td
                                colSpan={2}
                                className="border border-black p-1 border-r-0"
                              ></td>
                              <td
                                colSpan={2}
                                className="border border-black p-2 text-center border-l-0"
                              >
                                <div className="h-16"></div>
                                {(() => {
                                  let atasan = {
                                    nama: ".....................................................",
                                    nip: "...............................................",
                                  };

                                  switch (data.unitKerja) {
                                    case "Kasubag Tata Usaha":
                                      atasan = {
                                        nama: "Sony Anwari Husni, S.Pd.I",
                                        nip: "197809042007101005",
                                      };
                                      break;
                                    case "Kasi Pendidikan Madrasah (Penmad)":
                                      atasan = {
                                        nama: "Handayani, S.Pd.I",
                                        nip: "198110082005011002",
                                      };
                                      break;
                                    case "Kasi Pendidikan Agama Islam (PAI)":
                                      atasan = {
                                        nama: "H. Bakti Tawaddin, S.Ag",
                                        nip: "197101231998031004",
                                      };
                                      break;
                                    case "Kasi Pendidikan Diniyah & Pondok Pesantren (PD Pontren)":
                                      atasan = {
                                        nama: "Supian, SE",
                                        nip: "197304062005011008",
                                      };
                                      break;
                                    case "Kasi Bimbingan Masyarakat Islam":
                                      atasan = {
                                        nama: "Almubasir, S.Pd.I",
                                        nip: "198002022005011008",
                                      };
                                      break;
                                    case "Penyelenggara Zakat dan Wakaf":
                                      atasan = {
                                        nama: "Hasan Fauzi, S.Ag",
                                        nip: "197011032003121002",
                                      };
                                      break;
                                    case "Penyelenggara Hindu":
                                      atasan = {
                                        nama: "Wandi, SH.AH",
                                        nip: "198210022009011011",
                                      };
                                      break;
                                  }

                                  return (
                                    <>
                                      <p
                                        className={
                                          atasan.nama.includes("...")
                                            ? ""
                                            : "font-bold underline"
                                        }
                                      >
                                        {atasan.nama.includes("...")
                                          ? `( ${atasan.nama} )`
                                          : atasan.nama}
                                      </p>
                                      <p>NIP. {atasan.nip}</p>
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
                            <td className="border border-black p-1 h-8"></td>
                            <td className="border border-black p-1 h-8"></td>
                            <td className="border border-black p-1 h-8"></td>
                            <td className="border border-black p-1 h-8"></td>
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              className="border border-black p-1 border-r-0"
                            ></td>
                            <td
                              colSpan={2}
                              className="border border-black p-2 text-center border-l-0"
                            >
                              <div className="h-16"></div>
                              <p className="font-bold underline">
                                H. Arbaja, S.Ag., M.A.P.
                              </p>
                              <p>NIP. 197311212001121001</p>
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
        </>
      )}
    </AnimatePresence>
  );
}
