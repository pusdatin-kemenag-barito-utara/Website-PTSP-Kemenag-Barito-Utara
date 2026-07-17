"use server";

import { db } from "@/lib/db";
import { dataCutiPegawai, rekapCutiTahunan } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function checkLeaveAction(nip: string) {
  try {
    const currentYear = new Date().getFullYear();

    // 1. Cari pegawai berdasarkan NIP
    const pegawai = await db.query.dataCutiPegawai.findFirst({
      where: eq(dataCutiPegawai.nip, nip),
    });

    if (!pegawai) {
      return { error: "Data Tidak Ditemukan" };
    }

    // 2. Ambil rekap cuti tahun berjalan
    const rekap = await db.query.rekapCutiTahunan.findFirst({
      where: and(
        eq(rekapCutiTahunan.pegawaiId, pegawai.id),
        eq(rekapCutiTahunan.tahunTarget, currentYear)
      ),
    });

    if (!rekap) {
      return { error: `Data rekap cuti untuk tahun ${currentYear} belum tersedia. Silakan hubungi bagian kepegawaian.` };
    }

    // 3. Hitung Cuti Tahunan Terpakai
    let cutiTahunanTerpakai = 0;
    if (rekap?.cutiTahunan && Array.isArray(rekap.cutiTahunan)) {
      cutiTahunanTerpakai = rekap.cutiTahunan.reduce((a, b) => a + (Number(b) || 0), 0);
    }

    // 4. Format hasil
    const data = {
      name: pegawai.nama || "-",
      nip: pegawai.nip || "-",
      jabatan: pegawai.jabatan || "-",
      totalCuti: rekap?.jumlahCuti || 0,
      cutiTahun1: rekap?.cutiTahun1 || 0,
      cutiTahun2: rekap?.cutiTahun2 || 0,
      cutiTahunan: cutiTahunanTerpakai,
      cutiPenting: rekap?.cutiAlasanPenting || 0,
      cutiBesar: rekap?.cutiBesar || 0,
      cutiBersalin: rekap?.cutiBersalin || 0,
      cutiSakit: rekap?.cutiSakit || 0,
      sisaCuti: rekap?.sisaCuti || 0,
      tahun: currentYear,
      status: "Aktif",
    };

    return { data };
  } catch (error: any) {
    console.error("Error in checkLeaveAction:", error);
    return {
      error: error.message || "Terjadi kesalahan internal saat memproses data.",
    };
  }
}
