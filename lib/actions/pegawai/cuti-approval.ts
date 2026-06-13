"use server";

import { db } from "@/lib/db";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { getCurrentUser } from "@/lib/auth";
import { requireAdmin } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function approveByAtasanAction(
  id: string,
  signature: string,
  catatan?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await requireAdmin();

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

    revalidatePath("/pegawai/cuti/persetujuan");
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

    await requireAdmin();

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

    revalidatePath("/pegawai/cuti/persetujuan");
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

    await requireAdmin();

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

    revalidatePath("/pegawai/cuti/persetujuan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menolak cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
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

    await requireAdmin();

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

    // Kirim notifikasi WA setelah Kepala Kantor memproses
    if (roleLevel === "kepala" && cutiData?.noHp) {
      const tglMulai = cutiData.tanggalMulai
        ? new Date(cutiData.tanggalMulai).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "-";
      const tglSelesai = cutiData.tanggalSelesai
        ? new Date(cutiData.tanggalSelesai).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
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

    revalidatePath("/pegawai/cuti/persetujuan");
    revalidatePath("/pegawai/cuti");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memproses cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}
