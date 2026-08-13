import { fetchAPI } from "@/lib/api";
import { getCurrentProfile } from "@/lib/auth";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { headers } from "@/lib/next-compat/headers";

export async function getPublicRequestStatus(query: string, turnstileToken?: string) {
  if (!query) return { error: "Nomor permohonan tidak boleh kosong." };

  // Get client IP address if available
  const headersList = await headers();
  const clientIp = headersList.get("x-forwarded-for")?.split(",")[0] || 
                   headersList.get("x-real-ip") || 
                   undefined;

  // Verify Turnstile token (hanya jika token diisi atau di mode produksi)
  if (turnstileToken && process.env.NODE_ENV === "production") {
    const isHuman = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!isHuman) {
      return {
        error: "Verifikasi keamanan (Turnstile) gagal atau kedaluwarsa. Silakan selesaikan tantangan bot terlebih dahulu.",
      };
    }
  }

  const profile = await getCurrentProfile();
  let requestNumber = query.trim().toUpperCase();

  try {
    const res = await fetchAPI<any>(`/requests/track/${encodeURIComponent(requestNumber)}`);
    if (!res || !res.success || !res.data) {
      return {
        error: res?.error || "Nomor permohonan tidak ditemukan. Pastikan nomor yang Anda masukkan benar.",
      };
    }

    const request = res.data;
    const isOwner = profile?.id === request.userId;

    const statusMap: Record<
      string,
      { label: string; color: string; description: string }
    > = {
      submitted: {
        label: "Diterima",
        color: "blue",
        description: "Berkas Anda telah kami terima dan menunggu antrian verifikasi.",
      },
      under_review: {
        label: "Sedang Diverifikasi",
        color: "amber",
        description: "Petugas sedang memeriksa kelengkapan dan keabsahan dokumen Anda.",
      },
      revision_required: {
        label: "Perlu Revisi",
        color: "rose",
        description: "Ada dokumen yang kurang atau tidak sesuai. Silakan login ke akun Anda untuk melihat detail revisi.",
      },
      approved: {
        label: "Disetujui",
        color: "emerald",
        description: "Permohonan Anda telah disetujui dan sedang dalam proses penyelesaian dokumen.",
      },
      completed: {
        label: "Selesai",
        color: "emerald",
        description: "Permohonan Anda telah selesai diproses. Anda bisa melihat/unduh dokumen hasil di dashboard.",
      },
      rejected: {
        label: "Ditolak",
        color: "slate",
        description: "Mohon maaf, permohonan Anda tidak dapat kami proses. Silakan login untuk melihat alasan penolakan.",
      },
    };

    const statusInfo = statusMap[request.status] || {
      label: request.status ? request.status.toUpperCase() : "PROSES",
      color: "slate",
      description: "Status permohonan sedang dalam pembaruan.",
    };

    return {
      success: true,
      data: {
        id: request.id,
        requestNumber: request.requestNumber || request.request_number,
        requestType: (request.requestNumber || "").startsWith("ASN-") ? "asn" : "public",
        serviceName: request.serviceName || request.service_name || "-",
        itemName: request.itemName || request.item_name || "-",
        applicantName: request.applicantName || request.applicant_name || "-",
        status: statusInfo.label,
        statusColor: statusInfo.color,
        statusDescription: statusInfo.description,
        createdAt: request.createdAt || request.created_at || request.submittedAt || request.submitted_at || new Date().toISOString(),
        updatedAt: request.updatedAt || request.updated_at || request.createdAt || request.created_at || new Date().toISOString(),
        isOwner: isOwner,
      },
    };
  } catch (error) {
    console.error("Public tracking error:", error);
    return { error: "Terjadi kesalahan sistem saat melacak data." };
  }
}
