"use server";

import { db } from "@/lib/db";
import {
  pengajuanCuti,
  dataCutiPegawai,
  rekapCutiTahunan,
} from "@/lib/db/schema/kepegawaian";
import { profiles, profilesPegawai } from "@/lib/db/schema/auth";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { eq, and, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { createAuditLog } from "@/lib/audit";

export async function approveByAtasanAction(
  id: string,
  signature: string,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!signature) {
      return { error: "Tanda tangan wajib dilampirkan." };
    }

    await db
      .update(pengajuanCuti)
      .set({
        statusAtasan: "approved",
        ttdAtasan: signature,
        catatanAtasan: catatan || null,
        atasanNip: user.email?.split("@")[0],
      })
      .where(eq(pengajuanCuti.id, id));

    await createAuditLog({
      adminId: user.id,
      action: "SETUJUI_CUTI_ATASAN",
      entityType: "pengajuan_cuti",
      entityId: id,
      details: { role: "atasan", catatan },
    });

    revalidatePath("/pegawai/layanan/verifikasi");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyetujui cuti oleh atasan:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function approveByKepalaAction(
  id: string,
  signature: string,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!signature) {
      return { error: "Tanda tangan wajib dilampirkan." };
    }

    await db
      .update(pengajuanCuti)
      .set({
        statusKepala: "approved",
        ttdKepala: signature,
        catatanKepala: catatan || null,
        status: "approved",
      })
      .where(eq(pengajuanCuti.id, id));

    await createAuditLog({
      adminId: user.id,
      action: "SETUJUI_CUTI_KEPALA",
      entityType: "pengajuan_cuti",
      entityId: id,
      details: { role: "kepala", catatan },
    });

    // Auto-update rekap cuti tahunan
    await updateRekapAfterApproval(id);

    revalidatePath("/pegawai/layanan/verifikasi");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyetujui cuti oleh Kepala Kantor:", error);
    return { error: error.message || "Telah Terjadi kesalahan sistem." };
  }
}

export async function rejectPengajuanCutiAction(
  id: string,
  catatan: string,
  roleLevel: "atasan" | "kepala",
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (!catatan) {
      return { error: "Catatan wajib diisi jika menolak." };
    }

    const updates: any = { status: "rejected" };

    if (roleLevel === "atasan") {
      updates.statusAtasan = "rejected";
      updates.catatanAtasan = catatan;
    } else {
      updates.statusKepala = "rejected";
      updates.catatanKepala = catatan;
    }

    await db.update(pengajuanCuti).set(updates).where(eq(pengajuanCuti.id, id));

    await createAuditLog({
      adminId: user.id,
      action:
        roleLevel === "atasan" ? "TOLAK_CUTI_ATASAN" : "TOLAK_CUTI_KEPALA",
      entityType: "pengajuan_cuti",
      entityId: id,
      details: { role: roleLevel, catatan },
    });

    revalidatePath("/pegawai/layanan/verifikasi");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memproses cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

// ─── Helper: Update rekapCutiTahunan setelah cuti disetujui ──────

async function updateRekapAfterApproval(pengajuanCutiId: string) {
  try {
    const [cuti] = await db
      .select({
        userId: pengajuanCuti.userId,
        jenisCuti: pengajuanCuti.jenisCuti,
        tanggalMulai: pengajuanCuti.tanggalMulai,
        tanggalSelesai: pengajuanCuti.tanggalSelesai,
        tanggalPilihan: pengajuanCuti.tanggalPilihan,
      })
      .from(pengajuanCuti)
      .where(eq(pengajuanCuti.id, pengajuanCutiId));

    if (!cuti) return;

    // Cari profile pegawai yang mengajukan
    const [profilePegawai] = await db
      .select({ nip: profilesPegawai.nip })
      .from(profilesPegawai)
      .where(eq(profilesPegawai.profileId, cuti.userId));

    if (!profilePegawai?.nip) return;

    // Cari dataCutiPegawai via NIP
    const pegawai = await db.query.dataCutiPegawai.findFirst({
      where: eq(dataCutiPegawai.nip, profilePegawai.nip),
    });
    if (!pegawai) return;

    // Cari rekap tahun berjalan
    const currentYear = new Date().getFullYear();
    const rekap = await db.query.rekapCutiTahunan.findFirst({
      where: and(
        eq(rekapCutiTahunan.pegawaiId, pegawai.id),
        eq(rekapCutiTahunan.tahunTarget, currentYear),
      ),
    });
    if (!rekap) return;

    // Hitung total hari dari tanggalPilihan (array of selected dates)
    const parseDates = (): string[] => {
      if (cuti.tanggalPilihan) {
        return cuti.tanggalPilihan.split(",").filter(Boolean);
      }
      // Fallback: generate range dari tanggalMulai ke tanggalSelesai
      const start = new Date(cuti.tanggalMulai);
      const end = new Date(cuti.tanggalSelesai);
      const dates: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };

    const dates = parseDates();
    const totalDays = dates.length;
    if (totalDays === 0) return;

    const updateData: Record<string, unknown> = {};
    updateData.updatedAt = new Date();

    if (cuti.jenisCuti === "Cuti Tahunan") {
      // Hitung hari per bulan (0-11)
      const daysPerMonth = Array(12).fill(0);
      for (const dateStr of dates) {
        const month = new Date(dateStr).getMonth();
        daysPerMonth[month]++;
      }

      const existingMonths: number[] = Array.isArray(rekap.cutiTahunan)
        ? rekap.cutiTahunan
        : Array(12).fill(0);
      for (let i = 0; i < 12; i++) {
        existingMonths[i] = (existingMonths[i] || 0) + daysPerMonth[i];
      }
      updateData.cutiTahunan = existingMonths;

      // Hitung ulang sisaCuti
      const totalDiambil = existingMonths.reduce(
        (a: number, b: number) => a + b,
        0,
      );
      const jumlahCuti = rekap.jumlahCuti ?? 0;
      updateData.sisaCuti = Math.max(0, jumlahCuti - totalDiambil);
    } else if (cuti.jenisCuti === "Cuti Alasan Penting") {
      updateData.cutiAlasanPenting = (rekap.cutiAlasanPenting ?? 0) + totalDays;
    } else if (cuti.jenisCuti === "Cuti Besar") {
      updateData.cutiBesar = (rekap.cutiBesar ?? 0) + totalDays;
    } else if (cuti.jenisCuti === "Cuti Bersalin") {
      updateData.cutiBersalin = (rekap.cutiBersalin ?? 0) + totalDays;
    } else if (cuti.jenisCuti === "Cuti Sakit") {
      updateData.cutiSakit = (rekap.cutiSakit ?? 0) + totalDays;
    }

    if (Object.keys(updateData).length > 1) {
      await db
        .update(rekapCutiTahunan)
        .set(updateData)
        .where(eq(rekapCutiTahunan.id, rekap.id));

      revalidatePath("/admin/kepegawaian/pegawai");
    }
  } catch (err) {
    console.error("Gagal update rekap cuti:", err);
  }
}

export async function processCutiAction(
  id: string,
  roleLevel: "atasan" | "kepala",
  status: "approved" | "changes" | "delayed" | "rejected",
  signature: string | null,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAuth();

    if (status === "approved" && !signature) {
      return { error: "Tanda tangan wajib dilampirkan jika disetujui." };
    }
    if (status !== "approved" && !catatan) {
      return {
        error:
          "Catatan wajib diisi jika memberikan keputusan perubahan, ditangguhkan, atau ditolak.",
      };
    }

    // Ambil data pengajuan untuk notifikasi WA
    const [cutiData] = await db
      .select({
        noHp: pengajuanCuti.noHp,
        jenisCuti: pengajuanCuti.jenisCuti,
        tanggalMulai: pengajuanCuti.tanggalMulai,
        tanggalSelesai: pengajuanCuti.tanggalSelesai,
      })
      .from(pengajuanCuti)
      .where(eq(pengajuanCuti.id, id));

    const updates: any = {};

    if (roleLevel === "atasan") {
      updates.statusAtasan = status;
      updates.catatanAtasan = catatan || null;
      if (status === "approved" && signature) {
        updates.ttdAtasan = signature;
        updates.atasanNip = user.email?.split("@")[0];
      }
      if (status === "rejected") {
        updates.status = "rejected";
      }
    } else {
      updates.statusKepala = status;
      updates.catatanKepala = catatan || null;
      if (status === "approved" && signature) {
        updates.ttdKepala = signature;
        updates.status = "approved";
      }
      if (status === "rejected") {
        updates.status = "rejected";
      }
    }

    await db.update(pengajuanCuti).set(updates).where(eq(pengajuanCuti.id, id));

    await createAuditLog({
      adminId: user.id,
      action: `PROSES_CUTI_${roleLevel.toUpperCase()}_${status.toUpperCase()}`,
      entityType: "pengajuan_cuti",
      entityId: id,
      details: { role: roleLevel, status, catatan },
    });

    // Auto-update rekap cuti tahunan jika Kepala menyetujui
    if (roleLevel === "kepala" && status === "approved") {
      await updateRekapAfterApproval(id);
    }

    // Kirim notifikasi WA setelah Kepala Kantor memproses
    if (roleLevel === "kepala" && cutiData?.noHp) {
      const tglMulai = cutiData.tanggalMulai
        ? new Date(cutiData.tanggalMulai).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })
        : "-";
      const tglSelesai = cutiData.tanggalSelesai
        ? new Date(cutiData.tanggalSelesai).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })
        : "-";

      let pesanWA = "";

      if (status === "approved") {
        pesanWA = `🎉 *PENGAJUAN CUTI DISETUJUI*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh,\n\nPengajuan cuti Anda telah *disetujui* oleh Kepala Kantor Kementerian Agama Kab. Barito Utara.\n\n📋 *Detail Cuti:*\n• Jenis: ${cutiData.jenisCuti}\n• Mulai: ${tglMulai}\n• Selesai: ${tglSelesai}\n\n📌 Pengajuan Anda kini dalam proses pembuatan *Surat Cuti* oleh Admin PTSP. Anda akan dihubungi kembali setelah surat selesai dibuat.\n\nTerima kasih,\n_PTSP Kantor Kemenag Kab. Barito Utara_`;
      } else if (status === "rejected") {
        pesanWA = `❌ *PENGAJUAN CUTI TIDAK DISETUJUI*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh,\n\nPengajuan cuti Anda *tidak disetujui* oleh Kepala Kantor.\n\n📋 *Detail Cuti:*\n• Jenis: ${cutiData.jenisCuti}\n• Mulai: ${tglMulai}\n• Selesai: ${tglSelesai}\n\n📝 *Catatan:* ${catatan || "-"}\n\nSilakan hubungi atasan langsung Anda untuk informasi lebih lanjut.\n\n_PTSP Kantor Kemenag Kab. Barito Utara_`;
      } else if (status === "delayed") {
        pesanWA = `⏸️ *PENGAJUAN CUTI DITANGGUHKAN*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh,\n\nPengajuan cuti Anda *ditangguhkan* sementara oleh Kepala Kantor.\n\n📋 *Detail Cuti:*\n• Jenis: ${cutiData.jenisCuti}\n• Mulai: ${tglMulai}\n• Selesai: ${tglSelesai}\n\n📝 *Catatan:* ${catatan || "-"}\n\n_PTSP Kantor Kemenag Kab. Barito Utara_`;
      } else if (status === "changes") {
        pesanWA = `🔄 *PENGAJUAN CUTI PERLU PERBAIKAN*\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh,\n\nPengajuan cuti Anda *dikembalikan* untuk diperbaiki.\n\n📋 *Detail Cuti:*\n• Jenis: ${cutiData.jenisCuti}\n• Mulai: ${tglMulai}\n• Selesai: ${tglSelesai}\n\n📝 *Catatan:* ${catatan || "-"}\n\nSilakan perbaiki dan ajukan kembali melalui aplikasi.\n\n_PTSP Kantor Kemenag Kab. Barito Utara_`;
      }

      if (pesanWA) {
        sendWhatsAppNotification(cutiData.noHp, pesanWA).catch(() => {});
      }
    }

    revalidatePath("/pegawai/layanan/verifikasi");
    revalidatePath("/pegawai/layanan/riwayat");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memproses cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function getVerifikasiCutiAtasan() {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) return { error: "Anda belum login." };
    const nip = user.email.split("@")[0];

    // Check if the user is Atasan Langsung
    const [pejabat] = await db
      .select()
      .from(profilesPegawai)
      .where(and(eq(profilesPegawai.nip, nip), eq(profilesPegawai.tipePejabat, "Atasan Langsung")));

    if (!pejabat) {
      return { error: "Anda tidak memiliki akses sebagai Atasan Langsung." };
    }

    if (!pejabat.unitKerja) {
      return { error: "Unit kerja Atasan Langsung belum diatur." };
    }

    // Fetch cuti requests from this unitKerja
    const pengajuan = await db
      .select({
        id: pengajuanCuti.id,
        userId: pengajuanCuti.userId,
        jenisCuti: pengajuanCuti.jenisCuti,
        tanggalMulai: pengajuanCuti.tanggalMulai,
        tanggalSelesai: pengajuanCuti.tanggalSelesai,
        tanggalPilihan: pengajuanCuti.tanggalPilihan,
        alasan: pengajuanCuti.alasan,
        unitKerja: pengajuanCuti.unitKerja,
        statusAtasan: pengajuanCuti.statusAtasan,
        masaKerjaTahun: pengajuanCuti.masaKerjaTahun,
        masaKerjaBulan: pengajuanCuti.masaKerjaBulan,
        noHp: pengajuanCuti.noHp,
        alamatCuti: pengajuanCuti.alamatCuti,
        jenisPegawai: pengajuanCuti.jenisPegawai,
        ttdPemohon: pengajuanCuti.ttdPemohon,
        createdAt: pengajuanCuti.createdAt,
        user: {
          fullName: profiles.fullName,
          nip: profilesPegawai.nip,
          jabatan: profilesPegawai.jabatan,
        }
      })
      .from(pengajuanCuti)
      .leftJoin(profiles, eq(pengajuanCuti.userId, profiles.id))
      .leftJoin(profilesPegawai, eq(profiles.id, profilesPegawai.profileId))
      .where(
        eq(pengajuanCuti.unitKerja, pejabat.unitKerja)
      )
      .orderBy(desc(pengajuanCuti.createdAt));

    return { success: true, data: pengajuan };
  } catch (error: any) {
    console.error("Gagal mengambil data verifikasi cuti:", error);
    return { error: error.cause?.message || error.message || "Terjadi kesalahan sistem." };
  }
}
export async function verifikasiCutiAtasanAction(
  id: string,
  status: string,
  catatan: string,
  signature: string
) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) return { error: "Anda belum login." };

    await requireAuth();

    if (status === "approved" && !signature) {
      return { error: "Tanda tangan wajib dilampirkan jika menyetujui." };
    }
    
    if (status !== "approved" && !catatan) {
      return { error: "Catatan wajib diisi jika tidak menyetujui." };
    }

    const updates: any = {
      statusAtasan: status,
      catatanAtasan: catatan || null,
      atasanNip: user.email.split("@")[0],
    };

    if (status === "approved") {
      updates.ttdAtasan = signature;
    } else if (status === "rejected") {
      updates.status = "rejected"; // If rejected by atasan, the whole cuti is rejected
    }

    await db
      .update(pengajuanCuti)
      .set(updates)
      .where(eq(pengajuanCuti.id, id));

    await createAuditLog({
      adminId: user.id,
      action: `VERIFIKASI_CUTI_ATASAN_${status.toUpperCase()}`,
      entityType: "pengajuan_cuti",
      entityId: id,
      details: { role: "atasan", status, catatan },
    });

    revalidatePath("/pegawai/layanan/verifikasi");
    revalidatePath("/pegawai/layanan/riwayat");
    
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memproses verifikasi cuti oleh atasan:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}
