import QRCode from "react-qr-code";

interface DraftCutiDocumentProps {
  data: {
    nama: string;
    nip: string;
    jabatan?: string;
    unitKerja?: string;
    masaKerjaTahun?: string;
    masaKerjaBulan?: string;
    jenisCuti: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alamatCuti?: string;
    noHp?: string;
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
  };
  pejabatList?: { jabatan: string; nama: string; nip: string }[];
}

export function DraftCutiDocument({ data, pejabatList = [] }: DraftCutiDocumentProps) {
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

  const formatNamaCapital = (fullName: string | null | undefined) => {
    if (!fullName || fullName.includes("..."))
      return fullName ?? "...............................";
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

  const getAtasanInfo = (unitKerja: string) => {
    const atasan = pejabatList?.find(
      (p: any) => p.tipePejabat === "Atasan Langsung" && p.unitKerja === unitKerja?.trim()
    );
    return atasan
      ? { nama: atasan.nama, nip: atasan.nip }
      : {
          nama: ".....................................................",
          nip: "...............................................",
        };
  };

  const getPejabatBerwenang = () => {
    const pejabat = pejabatList?.find(
      (p: any) => p.tipePejabat === "Pejabat Berwenang"
    );
    return pejabat
      ? { nama: pejabat.nama, nip: pejabat.nip }
      : {
          nama: ".....................................................",
          nip: "...............................................",
        };
  };

  const getRincianTanggal = () => {
    if (!data.tanggalPilihan) return "";
    const dates = data.tanggalPilihan.split(",");
    const formatted = dates
      .map((d) => {
        const dateObj = new Date(d);
        return `${dateObj.getDate()}`;
      })
      .join(", ");
    return ` (Rincian tanggal terpilih: ${formatted})`;
  };

  return (
    <div className="bg-white mx-auto text-black p-8 sm:p-12 shadow-sm border border-slate-200" style={{ width: "800px", minHeight: "1131px", fontSize: "14px", fontFamily: "Arial, sans-serif" }}>
      {/* Header */}
      <div className="flex justify-end mb-8">
        <div className="w-1/2 text-xs leading-tight">
          {data.jenisPegawai === "PPPK" ? (
            <>
              <p>LAMPIRAN II</p>
              <p>PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK INDONESIA</p>
              <table className="mt-1">
                <tbody>
                  <tr>
                    <td className="w-16">NOMOR</td>
                    <td>: 7 TAHUN 2022</td>
                  </tr>
                  <tr>
                    <td className="align-top">TENTANG</td>
                    <td>
                      : TATA CARA PEMBERIAN CUTI PEGAWAI PEMERINTAH DENGAN
                      PERJANJIAN KERJA
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <p>Anak Lampiran 1.b</p>
              <p>PERATURAN BADAN KEPEGAWAIAN NEGARA REPUBLIK INDONESIA</p>
              <table className="mt-1">
                <tbody>
                  <tr>
                    <td className="w-16">NOMOR</td>
                    <td>: 24 TAHUN 2017</td>
                  </tr>
                  <tr>
                    <td className="align-top">TENTANG</td>
                    <td>: TATA CARA PEMBERIAN CUTI PEGAWAI NEGERI SIPIL</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <div className="w-[45%] text-xs">
          <p>Muara Teweh, {formatDate(new Date().toISOString())}</p>
          <p className="mt-2">Kepada</p>
          <p>Yth. Kepala Kantor Kementerian Agama</p>
          <p className="pl-6">Kabupaten Barito Utar</p>
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
            <td colSpan={4} className="border border-black p-1 font-bold">
              I. DATA PEGAWAI
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 w-[15%]">Nama</td>
            <td className="border border-black p-1 w-[45%]">
              {formatNamaCapital(data.nama)}
            </td>
            <td className="border border-black p-1 w-[15%]">NIP</td>
            <td className="border border-black p-1 w-[25%]">
              {data.nip || "..............................."}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">Jabatan</td>
            <td className="border border-black p-1">
              {data.jabatan || "..............................."}
            </td>
            <td className="border border-black p-1">Masa Kerja</td>
            <td className="border border-black p-1">
              {data.masaKerjaTahun
                ? `${data.masaKerjaTahun} Tahun `
                : "...... Tahun "}
              {data.masaKerjaBulan
                ? `${data.masaKerjaBulan} Bulan`
                : "...... Bulan"}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">Unit Kerja</td>
            <td colSpan={3} className="border border-black p-1">
              {data.unitKerja || "..............................."}
            </td>
          </tr>
        </tbody>
      </table>

      {/* II. JENIS CUTI */}
      <table className="w-full border-collapse border border-black mb-4">
        <tbody>
          <tr>
            <td colSpan={4} className="border border-black p-1 font-bold">
              II. JENIS CUTI YANG DIAMBIL **
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 w-[40%]">1. Cuti Tahunan</td>
            <td className="border border-black p-1 w-[10%] text-center">
              {renderCheck("Cuti Tahunan")}
            </td>
            <td className="border border-black p-1 w-[40%]">2. Cuti Besar</td>
            <td className="border border-black p-1 w-[10%] text-center">
              {renderCheck("Cuti Besar")}
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1">3. Cuti Sakit</td>
            <td className="border border-black p-1 text-center">
              {renderCheck("Cuti Sakit")}
            </td>
            <td className="border border-black p-1">4. Cuti Melahirkan</td>
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
              {data.alasan || "..............................."}
              {data.tanggalPilihan && (
                <span className="text-xs italic text-gray-700 block mt-1">
                  {getRincianTanggal()}
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* IV. LAMANYA CUTI */}
      <table className="w-full border-collapse border border-black mb-4">
        <tbody>
          <tr>
            <td colSpan={6} className="border border-black p-1 font-bold">
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
            <td className="border border-black p-1 w-[5%] text-center">s/d</td>
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
            <td colSpan={5} className="border border-black p-1 font-bold">
              V. CATATAN CUTI ***
            </td>
          </tr>
          <tr>
            <td colSpan={3} className="border border-black p-1 w-[50%]">
              1. CUTI TAHUNAN
            </td>
            <td className="border border-black p-1 w-[40%] text-[13px]">2. CUTI BESAR</td>
            <td className="border border-black p-1 w-[10%] text-center">-</td>
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
            <td className="border border-black p-1 text-[13px]">3. CUTI SAKIT</td>
            <td className="border border-black p-1 text-center">-</td>
          </tr>
          <tr>
            <td className="border border-black p-1 text-center">N-2</td>
            <td className="border border-black p-1 text-center">{data.cutiTahun2 ?? ""}</td>
            <td className="border border-black p-1 text-xs text-center">
              {data.cutiTahun2 !== undefined && data.cutiTahun2 !== null ? `Sisa Cuti ${new Date().getFullYear() - 2}` : ""}
            </td>
            <td className="border border-black p-1 text-[13px]">4. CUTI MELAHIRKAN</td>
            <td className="border border-black p-1 text-center">-</td>
          </tr>
          <tr>
            <td className="border border-black p-1 text-center">N-1</td>
            <td className="border border-black p-1 text-center">{data.cutiTahun1 ?? ""}</td>
            <td className="border border-black p-1 text-xs text-center">
              {data.cutiTahun1 !== undefined && data.cutiTahun1 !== null ? `Sisa Cuti ${new Date().getFullYear() - 1}` : ""}
            </td>
            <td className="border border-black p-1 text-[13px]">
              5. CUTI KARENA ALASAN PENTING
            </td>
            <td className="border border-black p-1 text-center">-</td>
          </tr>
          <tr>
            <td className="border border-black p-1 text-center">N</td>
            <td className="border border-black p-1 text-center">{data.hakBerjalan ?? ""}</td>
            <td className="border border-black p-1 text-xs text-center">
              {data.hakBerjalan !== undefined && data.hakBerjalan !== null ? `Sisa Cuti ${new Date().getFullYear()}` : ""}
            </td>
            <td className="border border-black p-1 text-[13px]">
              6. CUTI DI LUAR TANGGUNGAN NEGARA
            </td>
            <td className="border border-black p-1 text-center">-</td>
          </tr>
        </tbody>
      </table>

      {/* VI. ALAMAT SELAMA MENJALANKAN CUTI */}
      <table className="w-full border-collapse border border-black mb-6">
        <tbody>
          <tr>
            <td colSpan={3} className="border border-black p-1 font-bold">
              VI. ALAMAT SELAMA MENJALANKAN CUTI
            </td>
          </tr>
          <tr>
            <td
              className="border border-black p-1 w-[50%] align-middle text-center min-h-[80px]"
              rowSpan={2}
            >
              {data.alamatCuti || "..............................."}
            </td>
            <td className="border border-black p-1 w-[15%] align-top">TELP.</td>
            <td className="border border-black p-1 w-[35%] font-medium align-top">
              {data.noHp || "..............................."}
            </td>
          </tr>
          <tr>
            <td colSpan={2} className="border border-black p-2 text-center">
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
              <p className="mt-1">( {formatNamaCapital(data.nama)} )</p>
              <p>NIP. {data.nip || "..............................."}</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* VII. PERTIMBANGAN ATASAN LANGSUNG */}
      {data.unitKerja !== "Pejabat Eselon IV" && (
        <table className="w-full border-collapse border border-black mb-4 relative">
          <tbody>
            <tr>
              <td colSpan={4} className="border border-black p-1 font-bold">
                VII. PERTIMBANGAN ATASAN LANGSUNG **
              </td>
            </tr>
            <tr className="text-center text-xs">
              <td className="border border-black p-1 w-[25%]">DISETUJUI</td>
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
              <td className="border border-black p-1 h-8 text-center">
                {data.keputusanAtasan === "approved" ||
                (!data.keputusanAtasan && data.atasanSignature)
                  ? "✓"
                  : ""}
              </td>
              <td className="border border-black p-1 h-8 text-center">
                {data.keputusanAtasan === "changes" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 h-8 text-center">
                {data.keputusanAtasan === "delayed" ? "✓" : ""}
              </td>
              <td className="border border-black p-1 h-8 text-center">
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
                    <span className="font-bold underline">Catatan:</span>
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
                {data.atasanSignature && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2">
                    <div className="flex justify-center relative w-16 h-16 mx-auto">
                      <QRCode
                        value={`TTE-KEMENAG-BARUT-${getAtasanInfo(data.unitKerja ?? "").nama}-${getAtasanInfo(data.unitKerja ?? "").nip}-${formatDate(new Date().toISOString())}`}
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
                  </div>
                )}
                <div className="h-16"></div>
                {(() => {
                  const atasan = getAtasanInfo(data.unitKerja ?? "");
                  return (
                    <>
                      <p className="relative z-10">
                        {formatNamaCapital(atasan.nama)}
                      </p>
                      <p className="relative z-10">NIP. {atasan.nip}</p>
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
            <td colSpan={4} className="border border-black p-1 font-bold">
              VIII. KEPUTUSAN PEJABAT YANG BERWENANG MEMBERI CUTI **
            </td>
          </tr>
          <tr className="text-center text-xs">
            <td className="border border-black p-1 w-[25%]">DISETUJUI</td>
            <td className="border border-black p-1 w-[25%]">PERUBAHAN ****</td>
            <td className="border border-black p-1 w-[25%]">
              DITANGGUHKAN ****
            </td>
            <td className="border border-black p-1 w-[25%]">
              TIDAK DISETUJUI ****
            </td>
          </tr>
          <tr>
            <td className="border border-black p-1 h-8 text-center">
              {data.keputusanKepala === "approved" ||
              (!data.keputusanKepala && data.kepalaSignature)
                ? "✓"
                : ""}
            </td>
            <td className="border border-black p-1 h-8 text-center">
              {data.keputusanKepala === "changes" ? "✓" : ""}
            </td>
            <td className="border border-black p-1 h-8 text-center">
              {data.keputusanKepala === "delayed" ? "✓" : ""}
            </td>
            <td className="border border-black p-1 h-8 text-center">
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
                  <span className="font-bold underline">Catatan:</span>
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
              {data.kepalaSignature && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2">
                  <div className="flex justify-center relative w-16 h-16 mx-auto">
                    <QRCode
                      value={`TTE-KEMENAG-BARUT-${getPejabatBerwenang().nama}-${getPejabatBerwenang().nip}-KEPALA KANTOR-${formatDate(new Date().toISOString())}`}
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
                </div>
              )}
              <div className="h-16"></div>
              <p className="relative z-10">
                {getPejabatBerwenang().nama}
              </p>
              <p className="relative z-10">NIP. {getPejabatBerwenang().nip}</p>
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
              <td>Pilih salah satu dengan memberi tanda centang (✓)</td>
            </tr>
            <tr>
              <td className="align-top">***</td>
              <td>
                Diisi oleh pejabat yang menangani bidang kepegawaian sebelum{" "}
                {data.jenisPegawai === "PPPK" ? "PPPK" : "PNS"} mengajukan cuti.
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
  );
}
