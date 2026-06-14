"use server";

import { requirePermission } from "@/lib/auth";
import { SystemService } from "@/lib/services/system-service";

export async function exportAuditLogsAction(params: {
  q?: string;
  action?: string;
  from?: string;
  to?: string;
  entityType?: string;
}) {
  await requirePermission("log_audit");

  const data = await SystemService.exportAuditLogs(params);

  const headers = ["Waktu", "Petugas", "Email", "Aksi", "TipeObjek", "IDObjek", "IPAddress", "Detail"];
  const csvRows = [headers.join(",")];
  for (const row of data) {
    csvRows.push(headers.map((h) => {
      const val = String((row as any)[h] ?? "");
      return `"${val.replace(/"/g, '""')}"`;
    }).join(","));
  }

  return {
    success: true as const,
    csv: csvRows.join("\n"),
    filename: `audit-log-${new Date().toISOString().split("T")[0]}.csv`,
  };
}
