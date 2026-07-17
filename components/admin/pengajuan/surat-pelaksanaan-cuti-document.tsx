import React from "react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { countDaysBetween, terbilang } from "@/lib/utils";

interface SuratPelaksanaanCutiProps {
  data: {
    nama: string;
    nip: string;
    pangkatGolongan?: string;
    jabatan: string;
    unitKerja: string;
    jenisCuti: string;
    jenisPegawai?: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alamatCuti: string;
    nomorNaskah?: string;
    tanggalNaskah?: string;
  };
  pejabatList?: any[];
}

export const SuratPelaksanaanCutiDocument = React.forwardRef<
  HTMLDivElement,
  SuratPelaksanaanCutiProps
>(({ data, pejabatList = [] }, ref) => {
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

  const getPejabatBerwenang = () => {
    const pejabat = pejabatList?.find(
      (p: any) =>
        p.tipePejabat === "Kepala Kantor" ||
        p.tipePejabat === "Pejabat Berwenang",
    );
    return (
      pejabat || {
        nama: "...............................",
        nip: "...............................",
      }
    );
  };

  const pejabat = getPejabatBerwenang();
  const lamaCuti = countDaysBetween(data.tanggalMulai, data.tanggalSelesai);
  const lamaTerbilang = toTitleCase(terbilang(lamaCuti));
  const tanggalNaskahStr = data.tanggalNaskah
    ? format(new Date(data.tanggalNaskah), "dd MMMM yyyy", { locale: localeId })
    : "...............................";

  function toTitleCase(str: string): string {
    return str.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
  }

  const formatTanggalStr = (tgl: string) => {
    try {
      return format(new Date(tgl), "dd MMMM yyyy", { locale: localeId });
    } catch (e) {
      return tgl;
    }
  };

  const titleCuti = `SURAT PELAKSANAAN CUTI ${data.jenisCuti ? data.jenisCuti.replace("Cuti ", "").toUpperCase() : "TAHUNAN"}`;

  return (
    <div
      ref={ref}
      className="bg-white text-black mx-auto"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm 20mm 20mm 20mm",
        lineHeight: "1.3",
        fontSize: "13px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      {/* KOP SURAT */}
      <div
        style={{
          borderBottom: "4px double black",
          paddingBottom: "10px",
          marginBottom: "12px",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div style={{ width: "85px", flexShrink: 0 }}>
            <img
              src="/kemenag.svg"
              alt="Logo Kemenag"
              style={{ width: "85px", height: "85px", objectFit: "contain" }}
            />
          </div>
          {/* Teks KOP */}
          <div className="flex-1 text-center">
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                lineHeight: "1.3",
                letterSpacing: "0.02em",
              }}
            >
              KEMENTERIAN AGAMA REPUBLIK INDONESIA
            </p>
            <p
              style={{
                fontSize: "14px",
                fontWeight: "bold",
                lineHeight: "1.3",
                letterSpacing: "0.01em",
              }}
            >
              KANTOR KEMENTERIAN AGAMA KABUPATEN BARITO UTARA
            </p>
            <p style={{ fontSize: "11px", marginTop: "4px" }}>
              Jalan Ahmad Yani Nomor 126 Muara Teweh 73811
            </p>
            <p style={{ fontSize: "11px" }}>
              Telepon/Faximili <em>(0519) 21269, 21047, 21772,21894</em>
            </p>
            <p style={{ fontSize: "11px" }}>
              e-mail:{" "}
              <span style={{ color: "#1a56db", textDecoration: "underline" }}>
                baritoutara@kemenag.go.id
              </span>{" "}
              website:{" "}
              <span style={{ color: "#1a56db", textDecoration: "underline" }}>
                https://baritoutara.kemenag.go.id
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* LAMPIRAN */}
      <div className="flex justify-end mb-3 text-[13px]">
        <div className="w-[300px]">
          {data.jenisPegawai === "PPPK" ? (
            <>
              <p>LAMPIRAN II</p>
              <p>PERATURAN BADAN KEPEGAWAIAN NEGARA</p>
              <p>REPUBLIK INDONESIA</p>
              <p>NOMOR 7 TAHUN 2022</p>
              <p>TATA CARA PEMBERIAN CUTI PEGAWAI</p>
              <p>PEMERINTAH DENGAN PERJANJIAN KERJA</p>
            </>
          ) : (
            <>
              <p>ANAK LAMPIRAN I.c</p>
              <p>PERATURAN BADAN KEPEGAWAIAN</p>
              <p>NEGARA REPUBLIK INDONESIA</p>
              <p>NOMOR 24 TAHUN 2017</p>
              <p>TATA CARA PEMBERIAN CUTI PEGAWAI</p>
              <p>NEGERI SIPIL</p>
            </>
          )}
          <br />
          <p>Muara Teweh, {tanggalNaskahStr}</p>
        </div>
      </div>

      {/* JUDUL SURAT */}
      <div className="text-center mb-4">
        <h3 className="text-[17px] font-bold underline mb-1">{titleCuti}</h3>
        <p className="text-[15px]">Nomor : {"${nomor_naskah}"}</p>
      </div>

      {/* BODY */}
      <div className="space-y-2">
        <div className="flex gap-4">
          <span className="w-4 shrink-0">1.</span>
          <p className="flex-1" style={{ textAlign: "justify" }}>
            Diberikan Izin sementara untuk melaksanakan Cuti{" "}
            {data.jenisCuti ? data.jenisCuti.replace("Cuti ", "") : "Tahunan"}{" "}
            Kepada Pegawai Negeri Sipil :
          </p>
        </div>

        <div className="pl-8 py-1 space-y-0.5">
          <div className="flex">
            <div className="w-[180px]">Nama</div>
            <div>: {formatNamaCapital(data.nama)}</div>
          </div>
          <div className="flex">
            <div className="w-[180px]">NIP</div>
            <div>: {data.nip || "..............................."}</div>
          </div>
          <div className="flex">
            <div className="w-[180px]">Pangkat, Gol.Ruang</div>
            <div>
              : {data.pangkatGolongan || "..............................."}
            </div>
          </div>
          <div className="flex">
            <div className="w-[180px]">Jabatan</div>
            <div>: {data.jabatan || "..............................."}</div>
          </div>
          <div className="flex">
            <div className="w-[180px]">Unit Kerja</div>
            <div>: {data.unitKerja || "..............................."}</div>
          </div>
          <div className="flex">
            <div className="w-[180px]"></div>
            <div> Lingkup Kantor Kementerian Agama Kab. Barito Utara</div>
          </div>
        </div>

        <div className="pl-8 py-1" style={{ textAlign: "justify" }}>
          Selama{" "}
          <span className="font-bold">
            {lamaCuti} ({lamaTerbilang}) hari kerja terhitung mulai Tanggal{" "}
            {formatTanggalStr(data.tanggalMulai)} s.d{" "}
            {formatTanggalStr(data.tanggalSelesai)}
          </span>
          , dengan ketentuan sebagai berikut :
        </div>

        <div className="pl-8">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-6 align-top">a.</td>
                <td className="align-top pb-1" style={{ textAlign: "justify" }}>
                  Sebelum menjalankan Cuti{" "}
                  {data.jenisCuti
                    ? data.jenisCuti.replace("Cuti ", "")
                    : "Tahunan"}
                  , wajib menyerahkan pekerjaannya kepada atasan langsungnya
                  atau pejabat lain yang ditunjuk;
                </td>
              </tr>
              <tr>
                <td className="w-6 align-top">b.</td>
                <td className="align-top" style={{ textAlign: "justify" }}>
                  Setelah selesai menjalankan Cuti{" "}
                  {data.jenisCuti
                    ? data.jenisCuti.replace("Cuti ", "")
                    : "Tahunan"}
                  , <span className="font-bold">Wajib</span> melaporkan diri
                  kepada atasan langsungnya dan bekerja kembali sebagaimana
                  mestinya.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex gap-4">
          <span className="w-4 shrink-0">2.</span>
          <p className="flex-1" style={{ textAlign: "justify" }}>
            Alasan melaksanakan cuti, {data.alasan};
          </p>
        </div>
        <div className="flex gap-4">
          <span className="w-4 shrink-0">3.</span>
          <p className="flex-1" style={{ textAlign: "justify" }}>
            Alamat selama cuti berlangsung, {data.alamatCuti};
          </p>
        </div>
        <div className="flex gap-4">
          <span className="w-4 shrink-0">4.</span>
          <p className="flex-1" style={{ textAlign: "justify" }}>
            Demikian surat pelaksanaan Cuti{" "}
            {data.jenisCuti ? data.jenisCuti.replace("Cuti ", "") : "Tahunan"}{" "}
            ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </div>
      </div>

      {/* TANDA TANGAN */}
      <div className="flex justify-end mt-12">
        <div className="w-[280px] text-left">
          <p>Kepala Kantor Kabupaten,</p>

          <div className="h-[60px]" />

          <p style={{ paddingLeft: "3em" }}>{"${ttd_pengirim}"}</p>
          <div className="h-[60px]" />
          <p>{"${nama_pengirim}"}</p>
        </div>
      </div>
    </div>
  );
});
SuratPelaksanaanCutiDocument.displayName = "SuratPelaksanaanCutiDocument";
