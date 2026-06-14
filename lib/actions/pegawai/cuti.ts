"use server";

import { db } from "@/lib/db";
import { pengajuanCuti, dataCutiPegawai } from "@/lib/db/schema/kepegawaian";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendWhatsAppNotification } from "@/lib/whatsapp";
import { eq, and } from "drizzle-orm";
import { isSuperAdmin } from "@/lib/constants";

export async function getPegawaiProfileAction() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const superAdmin = isSuperAdmin(profile.email);
  const nip = profile.nip || (profile.email ? profile.email.split("@")[0] : "");

  let dataPegawai = null;
  
  // Jika dia BUKAN super admin, barulah sinkron dengan data pegawai
  if (!superAdmin) {
    dataPegawai = await db.query.dataCutiPegawai.findFirst({
      where: eq(dataCutiPegawai.nip, nip),
    });
  }

  return {
    nama: superAdmin ? (profile.fullName || "Super Admin") : (dataPegawai?.nama || profile.fullName || ""),
    nip: superAdmin ? "" : nip,
    unitKerja: superAdmin ? "Kantor Kementerian Agama" : (dataPegawai?.unitKerja || profile.unitKerja || ""),
    jabatan: superAdmin ? "Super Administrator" : (dataPegawai?.jabatan || profile.jabatan || ""),
    isSuperAdmin: superAdmin,
  };
}

export async function createPengajuanCutiAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { error: "Anda belum login." };
    }

    const jenisCuti = formData.get("jenisCuti") as string;
    const tanggalPilihanStr = formData.get("tanggalPilihan") as string;
    let tanggalMulai = formData.get("tanggalMulai") as string;
    let tanggalSelesai = formData.get("tanggalSelesai") as string;

    if (tanggalPilihanStr) {
      const dates = tanggalPilihanStr.split(",").sort();
      tanggalMulai = dates[0];
      tanggalSelesai = dates[dates.length - 1];
    }

    const alasan = formData.get("alasan") as string;
    const tandaTangan = formData.get("tandaTangan") as string;
    const unitKerja = formData.get("unitKerja") as string;
    const jenisPegawai = formData.get("jenisPegawai") as string;
    const noHp = formData.get("noHp") as string;
    const masaKerjaTahun = formData.get("masaKerjaTahun") as string;
    const masaKerjaBulan = formData.get("masaKerjaBulan") as string;
    const alamatCuti = formData.get("alamatCuti") as string;

    if (
      !jenisCuti ||
      !jenisPegawai ||
      !tanggalMulai ||
      !tanggalSelesai ||
      !alasan ||
      !tandaTangan ||
      !noHp
    ) {
      return {
        error:
          "Semua kolom wajib diisi, termasuk tanda tangan dan Nomor WhatsApp.",
      };
    }

    const cleanPhone = noHp.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      return { error: "Nomor WhatsApp tidak valid (minimal 9 angka)." };
    }

    // Logika bypass Atasan Langsung untuk Pejabat Eselon IV
    const isEselonIV = unitKerja === "Pejabat Eselon IV";

    // Handle file upload
    const dokumen = formData.get("dokumen") as File | null;
    let dokumenUrl = null;

    if (dokumen && dokumen.size > 0) {
      if (dokumen.size > 5 * 1024 * 1024) {
        return { error: "Ukuran dokumen maksimal 5MB." };
      }
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(dokumen.type)) {
        return { error: "Format dokumen harus PDF, JPG, atau PNG." };
      }

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const ext = dokumen.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;

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

    await db.insert(pengajuanCuti).values({
      userId: user.id,
      jenisCuti,
      tanggalMulai,
      tanggalSelesai,
      tanggalPilihan: tanggalPilihanStr || null,
      alasan,
      status: "pending",
      ttdPemohon: tandaTangan,
      jenisPegawai,
      unitKerja,
      noHp,
      masaKerjaTahun,
      masaKerjaBulan,
      alamatCuti,
      statusAtasan: isEselonIV ? "approved" : "pending",
      catatanAtasan: isEselonIV
        ? "Otomatis disetujui (Pejabat Eselon IV)"
        : null,
      statusKepala: "pending",
      dokumenUrl,
    });

    if (noHp) {
      const formatDate = (dateStr: string) => {
        try {
          return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(dateStr));
        } catch {
          return dateStr;
        }
      };

      const waMessage = `*PTSP Kemenag Barito Utara*
✅ *Pengajuan Cuti Berhasil*

Yth. Bapak/Ibu,
Pengajuan cuti Anda telah kami terima dengan rincian:

▪️ *Jenis:* ${jenisCuti}
▪️ *Tanggal:* ${formatDate(tanggalMulai)} s/d ${formatDate(tanggalSelesai)}
▪️ *Alasan:* ${alasan}

Status saat ini: *Menunggu Persetujuan*. 
Silakan cek status berkala di Riwayat Cuti pada portal PTSP. Terima kasih 🙏

_Pesan otomatis, mohon tidak dibalas._`;

      // Kirim notifikasi WA secara asynchronous agar tidak memblokir respon ke client
      sendWhatsAppNotification(noHp, waMessage).catch(() => {});
    }

    revalidatePath("/pegawai/cuti");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menyimpan pengajuan cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}


export async function deletePengajuanCutiAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const cuti = await db.query.pengajuanCuti.findFirst({
      where: and(eq(pengajuanCuti.id, id), eq(pengajuanCuti.userId, user.id)),
    });

    if (!cuti) return { error: "Data pengajuan tidak ditemukan." };
    if (cuti.status !== "pending")
      return {
        error: "Hanya pengajuan dengan status pending yang dapat dihapus.",
      };

    await db.delete(pengajuanCuti).where(eq(pengajuanCuti.id, id));
    revalidatePath("/pegawai/cuti");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal menghapus pengajuan cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}

export async function updatePengajuanCutiAction(
  id: string,
  formData: FormData,
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const cuti = await db.query.pengajuanCuti.findFirst({
      where: and(eq(pengajuanCuti.id, id), eq(pengajuanCuti.userId, user.id)),
    });

    if (!cuti) return { error: "Data pengajuan tidak ditemukan." };
    if (cuti.status !== "pending")
      return {
        error: "Hanya pengajuan dengan status pending yang dapat diubah.",
      };

    const jenisCuti = formData.get("jenisCuti") as string;
    const tanggalPilihanStr = formData.get("tanggalPilihan") as string;
    let tanggalMulai = formData.get("tanggalMulai") as string;
    let tanggalSelesai = formData.get("tanggalSelesai") as string;

    if (tanggalPilihanStr) {
      const dates = tanggalPilihanStr.split(",").sort();
      tanggalMulai = dates[0];
      tanggalSelesai = dates[dates.length - 1];
    }

    const alasan = formData.get("alasan") as string;
    const tandaTangan = formData.get("tandaTangan") as string;
    const unitKerja = formData.get("unitKerja") as string;
    const jenisPegawai = formData.get("jenisPegawai") as string;
    const noHp = formData.get("noHp") as string;
    const masaKerjaTahun = formData.get("masaKerjaTahun") as string;
    const masaKerjaBulan = formData.get("masaKerjaBulan") as string;
    const alamatCuti = formData.get("alamatCuti") as string;

    if (
      !jenisCuti ||
      !jenisPegawai ||
      !tanggalMulai ||
      !tanggalSelesai ||
      !alasan ||
      !tandaTangan ||
      !noHp
    ) {
      return {
        error:
          "Semua kolom wajib diisi, termasuk tanda tangan dan Nomor WhatsApp.",
      };
    }

    const cleanPhone = noHp.replace(/\D/g, "");
    if (cleanPhone.length < 9) {
      return { error: "Nomor WhatsApp tidak valid (minimal 9 angka)." };
    }

    const isEselonIV = unitKerja === "Pejabat Eselon IV";

    // Handle file upload
    const dokumen = formData.get("dokumen") as File | null;
    let dokumenUrl = cuti.dokumenUrl;

    if (dokumen && dokumen.size > 0) {
      if (dokumen.size > 5 * 1024 * 1024) {
        return { error: "Ukuran dokumen maksimal 5MB." };
      }
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(dokumen.type)) {
        return { error: "Format dokumen harus PDF, JPG, atau PNG." };
      }

      const { createAdminClient } = await import("@/lib/supabase/admin");
      const admin = createAdminClient();
      const ext = dokumen.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${ext}`;

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

    await db
      .update(pengajuanCuti)
      .set({
        jenisCuti,
        tanggalMulai,
        tanggalSelesai,
        tanggalPilihan: tanggalPilihanStr || null,
        alasan,
        ttdPemohon: tandaTangan,
        jenisPegawai,
        unitKerja,
        noHp,
        masaKerjaTahun,
        masaKerjaBulan,
        alamatCuti,
        statusAtasan: isEselonIV ? "approved" : "pending",
        catatanAtasan: isEselonIV
          ? "Otomatis disetujui (Pejabat Eselon IV)"
          : null,
        statusKepala: "pending",
        dokumenUrl,
        updatedAt: new Date(),
      })
      .where(eq(pengajuanCuti.id, id));

    if (noHp) {
      const formatDate = (dateStr: string) => {
        try {
          return new Intl.DateTimeFormat("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(dateStr));
        } catch {
          return dateStr;
        }
      };

      const waMessage = `*PTSP Kemenag Barito Utara*
✅ *Pembaruan Pengajuan Cuti Berhasil*

Yth. Bapak/Ibu,
Data pengajuan cuti Anda telah berhasil diperbarui dengan rincian terbaru:

▪️ *Jenis:* ${jenisCuti}
▪️ *Tanggal:* ${formatDate(tanggalMulai)} s/d ${formatDate(tanggalSelesai)}
▪️ *Alasan:* ${alasan}

Status saat ini: *Menunggu Persetujuan*. 
Silakan cek status berkala di Riwayat Cuti pada portal PTSP. Terima kasih 🙏

_Pesan otomatis, mohon tidak dibalas._`;

      // Kirim notifikasi WA secara asynchronous agar tidak memblokir respon ke client
      sendWhatsAppNotification(noHp, waMessage).catch(() => {});
    }

    revalidatePath("/pegawai/cuti");
    return { success: true };
  } catch (error: any) {
    console.error("Gagal mengubah pengajuan cuti:", error);
    return { error: error.message || "Terjadi kesalahan sistem." };
  }
}
