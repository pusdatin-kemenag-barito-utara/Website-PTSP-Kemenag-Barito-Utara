"use server";

import { db } from "@/lib/db";
import { pengajuanCuti } from "@/lib/db/schema/kepegawaian";
import { profiles } from "@/lib/db/schema/auth";
import { requireAdmin } from "@/lib/auth";
import { eq, desc, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function getAdminPengajuanCuti(params: {
  page?: number;
  pageSize?: number;
  q?: string;
}) {
  const profile = await requireAdmin();
  if (!profile) throw new Error("Unauthorized");

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;

  let query = db
    .select({
      id: pengajuanCuti.id,
      jenisCuti: pengajuanCuti.jenisCuti,
      tanggalMulai: pengajuanCuti.tanggalMulai,
      tanggalSelesai: pengajuanCuti.tanggalSelesai,
      status: pengajuanCuti.status,
      statusAtasan: pengajuanCuti.statusAtasan,
      statusKepala: pengajuanCuti.statusKepala,
      dokumenUrl: pengajuanCuti.dokumenUrl,
      createdAt: pengajuanCuti.createdAt,
      noHp: pengajuanCuti.noHp,
      jenisPegawai: pengajuanCuti.jenisPegawai,
      unitKerja: pengajuanCuti.unitKerja,
      userId: pengajuanCuti.userId,
      alasan: pengajuanCuti.alasan,
      pemohon: {
        nama: profiles.fullName,
        nip: profiles.nip,
        email: profiles.email,
      },
    })
    .from(pengajuanCuti)
    .leftJoin(profiles, eq(pengajuanCuti.userId, profiles.id));

  // Note: filtering by search query could be done here.
  // For simplicity we just return ordered list.

  const allData = await query.orderBy(desc(pengajuanCuti.createdAt));

  // Client side pagination for now due to simpler query
  const totalCount = allData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const pagedData = allData.slice(offset, offset + pageSize);

  return {
    data: pagedData,
    totalCount,
    totalPages,
  };
}

export async function uploadSuratCutiSelesai(id: string, formData: FormData) {
  try {
    const profile = await requireAdmin();
    if (!profile) return { error: "Unauthorized" };

    const cuti = await db.query.pengajuanCuti.findFirst({
      where: eq(pengajuanCuti.id, id),
      with: {
        profiles: true,
      },
    });

    if (!cuti) return { error: "Data pengajuan cuti tidak ditemukan." };

    const dokumen = formData.get("dokumen") as File | null;
    let dokumenUrl = cuti.dokumenUrl;

    if (dokumen && dokumen.size > 0) {
      if (dokumen.size > 5 * 1024 * 1024) {
        return { error: "Ukuran dokumen maksimal 5MB." };
      }
      if (dokumen.type !== "application/pdf") {
        return { error: "Format dokumen harus PDF." };
      }

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const ext = dokumen.name.split(".").pop();
      const fileName = `${cuti.userId}-${Date.now()}-selesai.${ext}`;

      const arrayBuffer = await dokumen.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await admin.storage
        .from("request-documents")
        .upload(`cuti/${fileName}`, buffer, {
          contentType: dokumen.type,
          upsert: true,
        });

      if (uploadError)
        throw new Error("Gagal mengupload dokumen: " + uploadError.message);

      const { data: urlData } = admin.storage
        .from("request-documents")
        .getPublicUrl(`cuti/${fileName}`);
      dokumenUrl = urlData.publicUrl;
    }

    if (!dokumenUrl) {
      return { error: "Dokumen PDF harus diunggah." };
    }

    // Update status to approved/selesai
    await db
      .update(pengajuanCuti)
      .set({
        dokumenUrl,
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(pengajuanCuti.id, id));

    // Send WhatsApp Notification
    if (cuti.noHp) {
      const waMessage = `*PTSP Kemenag Barito Utara*\n✅ *Surat Cuti Telah Selesai*\n\nYth. Bapak/Ibu,\nSurat Cuti Anda telah selesai diproses dan disetujui.\n\nSilakan unduh dokumen PDF surat cuti resmi Anda yang terlampir pada pesan ini.\nTerima kasih 🙏\n\n_Pesan otomatis, mohon tidak dibalas._`;

      const safeName = (cuti.profiles?.fullName || "Pegawai").replace(
        /[^a-zA-Z0-9]/g,
        "_",
      );
      const pdfFileName = `Surat_Cuti_${safeName}.pdf`;

      sendWhatsAppNotification(
        cuti.noHp,
        waMessage,
        dokumenUrl,
        pdfFileName,
      ).catch(() => {});
    }

    revalidatePath("/admin/pengajuan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memproses surat cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function deleteAdminPengajuanCuti(id: string) {
  try {
    const profile = await requireAdmin();
    if (!profile) return { error: "Unauthorized" };

    await db.delete(pengajuanCuti).where(eq(pengajuanCuti.id, id));

    revalidatePath("/admin/pengajuan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus pengajuan cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function updateAdminPengajuanCuti(
  id: string,
  data: {
    jenisCuti: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    alasan: string;
  },
) {
  try {
    const profile = await requireAdmin();
    if (!profile) return { error: "Unauthorized" };

    await db
      .update(pengajuanCuti)
      .set({
        jenisCuti: data.jenisCuti,
        tanggalMulai: data.tanggalMulai,
        tanggalSelesai: data.tanggalSelesai,
        alasan: data.alasan,
        updatedAt: new Date(),
      })
      .where(eq(pengajuanCuti.id, id));

    revalidatePath("/admin/pengajuan");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal memperbarui pengajuan cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}
