import { requireAdmin } from "@/lib/auth";
import { SystemService } from "@/lib/services/system-service";

export async function getRequestsForExport(params: {
  q?: string;
  serviceId?: string;
  status?: string;
}) {
  await requireAdmin();
  return await SystemService.getRequestsForExport(params);
}

export async function getDocumentsForExport(params: {
  q?: string;
  serviceId?: string;
}) {
  await requireAdmin();
  return await SystemService.getDocumentsForExport(params);
}
