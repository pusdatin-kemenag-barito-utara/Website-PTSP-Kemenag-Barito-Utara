"use server";

import { db } from "@/lib/db";
import { dataCutiPegawai, rekapCutiTahunan } from "@/lib/db/schema/kepegawaian";
import { and, eq } from "drizzle-orm";

export async function getSisaCutiByNip(nip: string) {
  if (!nip) return { n: "0", n1: "0", n2: "0" };

  try {
    const cutiPegawai = await db.query.dataCutiPegawai.findFirst({
      where: eq(dataCutiPegawai.nip, nip),
    });

    if (cutiPegawai) {
      const currentYear = new Date().getFullYear();
      
      // Data N-1 dan N-2 tersimpan sebagai kolom dalam baris tahun ini
      const rekapTahunIni = await db.query.rekapCutiTahunan.findFirst({
        where: and(
          eq(rekapCutiTahunan.pegawaiId, cutiPegawai.id),
          eq(rekapCutiTahunan.tahunTarget, currentYear)
        ),
      });

      if (rekapTahunIni) {
        const n = rekapTahunIni.sisaCuti ?? 0;
        const n1 = rekapTahunIni.cutiTahun1 ?? 0;
        const n2 = rekapTahunIni.cutiTahun2 ?? 0;
        return { n: String(n), n1: String(n1), n2: String(n2) };
      }
    }
  } catch (error) {
    console.error("Gagal mengambil data cuti:", error);
  }

  return { n: "0", n1: "0", n2: "0" };
}
