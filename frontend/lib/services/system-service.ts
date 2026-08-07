import { fetchAPI } from "@/lib/api";

export class SystemService {
  /**
   * Cleanup requirement files older than 3 months for COMPLETED requests
   */
  static async cleanupOldStorage(_adminId: string) {
    const res = await fetchAPI<any>("/cron/cleanup-documents");
    return { count: res.expired_requests_processed || 0, affectedRequests: res.expired_requests_processed || 0 };
  }

  /**
   * Get requests data for Excel export
   */
  static async getRequestsForExport(_params: { q?: string; serviceId?: string; status?: string }) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/admin/requests");
    return (res.data || []).map((r: any) => ({
      "No. Permohonan": r.request_number || r.requestNumber,
      Tanggal: r.created_at || r.createdAt,
      "Nama Pemohon": r.applicant_name || r.applicantName || "-",
      Email: r.applicant_email || r.applicantEmail || "-",
      Layanan: r.service_name || r.serviceName || "-",
      "Sub Layanan": r.item_name || r.itemName || "-",
      Status: (r.status || "").toUpperCase(),
    }));
  }

  /**
   * Get documents data for Excel export
   */
  static async getDocumentsForExport(_params: { q?: string; serviceId?: string }) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/admin/requests");
    return (res.data || []).map((r: any) => ({
      "No. Permohonan": r.request_number || r.requestNumber,
      "Nama Pemohon": r.applicant_name || r.applicantName || "-",
      Layanan: r.service_name || r.serviceName || "-",
      "Sub Layanan": r.item_name || r.itemName || "-",
      "Tanggal Selesai": r.completed_at || r.completedAt || "-",
      "Nama File": "-",
    }));
  }

  /**
   * Get paginated audit logs for Admin view
   */
  static async getPaginatedAuditLogs(params: { page: number; pageSize: number; q?: string }) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/admin/audit-logs");
    const logs = res.data || [];
    return {
      data: logs,
      totalCount: logs.length,
      totalPages: Math.ceil(logs.length / (params.pageSize || 10)),
    };
  }

  /**
   * Export all audit logs matching filters
   */
  static async exportAuditLogs(_params: any) {
    const res = await fetchAPI<{ success: boolean; data: any[] }>("/admin/audit-logs");
    return (res.data || []).map((log: any) => ({
      Waktu: log.created_at || log.createdAt,
      Petugas: log.admin_name || log.adminName || "-",
      Aksi: log.action,
      TipeObjek: log.entity_type || "-",
      IDObjek: log.entity_id || "-",
    }));
  }

  /**
   * Get real-time storage stats
   */
  static async getStorageStats() {
    return {
      cloudflareR2: {
        usage: 0,
        fileCount: 0,
      }
    };
  }
}
