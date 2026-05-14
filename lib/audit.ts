import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function createAuditLog({
  adminId,
  action,
  entityType,
  entityId,
  details,
}: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
}) {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "unknown";

    await prisma.audit_logs.create({
      data: {
        admin_id: adminId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details: details || {},
        ip_address: ip,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid breaking the main action
  }
}
