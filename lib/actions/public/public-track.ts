"use server";

import { db } from "@/lib/db";
import { serviceRequests as serviceRequestsTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentProfile } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { headers } from "next/headers";

export async function getPublicRequestStatus(query: string, turnstileToken?: string) {
  if (!query) return { error: "Nomor permohonan tidak boleh kosong." };

  // Get client IP address if available
  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for")?.split(",")[0] || 
                   headersList.get("x-real-ip") || 
                   undefined;

  // Verify Turnstile token
  const isHuman = await verifyTurnstileToken(turnstileToken || "", clientIp);
  if (!isHuman) {
    return {
      error: "Verifikasi keamanan (Turnstile) gagal atau kedaluwarsa. Silakan selesaikan tantangan bot terlebih dahulu.",
    };
  }

  const profile = await getCurrentProfile();
  const currentYear = new Date().getFullYear();
  let requestNumber = query.trim().toUpperCase();

  // Format baru: ASN-CUT-2026-000001 atau PUB-MDR-2026-000001 → sudah lengkap
  if (/^(ASN|PUB)-[A-Z]{2,4}-\d{4}-\d+$/.test(requestNumber)) {
    // Sudah format lengkap, tidak perlu normalisasi
  }
  // Format lama: PTSP-2026-000001 → biarkan apa adanya
  else if (/^PTSP-\d{4}-\d+$/.test(requestNumber)) {
    // Tidak perlu normalisasi
  }
  // Input hanya angka urut (misal: 000123) → asumsikan layanan publik tahun ini
  else if (/^\d+$/.test(requestNumber)) {
    // Tidak bisa tahu kode layanannya — cukup beri saran
    return {
      error: "Masukkan nomor pengajuan lengkap. Contoh: PUB-MDR-2026-000001 atau ASN-CUT-2026-000001",
    };
  }
  // Format lama TEMP- (data lama sebelum sistem baru)
  // Biarkan apa adanya agar data lama tetap bisa dilacak

  try {
    const request = await db.query.serviceRequests.findFirst({
      where: eq(serviceRequestsTable.requestNumber, requestNumber),
      with: {
        profiles: {
          columns: { fullName: true },
        },
        services: {
          columns: { name: true },
        },
        serviceItems: {
          columns: { name: true },
        },
      },
    });

    if (!request) {
      return {
        error:
          "Nomor permohonan tidak ditemukan. Pastikan nomor yang Anda masukkan benar.",
      };
    }

    const isOwner = profile?.id === request.userId;

    // Map status to Indonesian labels
    const statusMap: Record<
      string,
      { label: string; color: string; description: string }
    > = {
      submitted: {
        label: "Diterima",
        color: "blue",
        description:
          "Berkas Anda telah kami terima dan menunggu antrian verifikasi.",
      },
      under_review: {
        label: "Sedang Diverifikasi",
        color: "amber",
        description:
          "Petugas sedang memeriksa kelengkapan dan keabsahan dokumen Anda.",
      },
      revision_required: {
        label: "Perlu Revisi",
        color: "rose",
        description:
          "Ada dokumen yang kurang atau tidak sesuai. Silakan login ke akun Anda untuk melihat detail revisi.",
      },
      approved: {
        label: "Disetujui",
        color: "emerald",
        description:
          "Permohonan Anda telah disetujui dan sedang dalam proses penyelesaian dokumen.",
      },
      completed: {
        label: "Selesai",
        color: "emerald",
        description:
          "Permohonan Anda telah selesai diproses. Anda bisa melihat/unduh dokumen hasil di dashboard.",
      },
      rejected: {
        label: "Ditolak",
        color: "slate",
        description:
          "Mohon maaf, permohonan Anda tidak dapat kami proses. Silakan login untuk melihat alasan penolakan.",
      },
    };

    const statusInfo = statusMap[request.status] || {
      label: request.status.toUpperCase(),
      color: "slate",
      description: "Status permohonan sedang dalam pembaruan.",
    };

    return {
      success: true,
      data: {
        id: request.id,
        requestNumber: request.requestNumber,
        requestType: request.requestNumber?.startsWith("ASN-") ? "asn" : "public",
        serviceName: request.services?.name || "-",
        itemName: request.serviceItems?.name || "-",
        applicantName: request.profiles?.fullName || "-",
        status: statusInfo.label,
        statusColor: statusInfo.color,
        statusDescription: statusInfo.description,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
        isOwner: isOwner,
      },
    };
  } catch (error) {
    console.error("Public tracking error:", error);
    return { error: "Terjadi kesalahan sistem saat melacak data." };
  }
}
