import { History } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { serializeBigInt } from "@/lib/db";
import { PageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { LogAuditFilter } from "@/components/admin/log-audit/log-filter";
import { LogAuditTable } from "./_components/log-audit-table";
import { SystemService } from "@/lib/services/system-service";

export default async function AdminLogAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; action?: string; from?: string; to?: string; entityType?: string; pageSize?: string }>;
}) {
  await requirePermission("log_audit");

  const sp = await searchParams;
  const page = sp.page ?? "1";
  const q = sp.q ?? "";
  const action = sp.action ?? "";
  const from = sp.from ?? "";
  const to = sp.to ?? "";
  const entityType = sp.entityType ?? "";
  const pageSizeParam = sp.pageSize ?? "50";

  const currentPage = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(10, parseInt(pageSizeParam) || 50));

  const { data: rawLogs, totalCount, totalPages } = await SystemService.getPaginatedAuditLogs({
    page: currentPage,
    pageSize,
    q,
    action,
    from: from || undefined,
    to: to || undefined,
    entityType: entityType || undefined,
  });

  const logs = serializeBigInt(rawLogs);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sistem Audit Log"
        description="Rekam jejak aktivitas administratif untuk transparansi dan keamanan sistem."
        icon={History}
      />

      <LogAuditFilter initialQ={q} initialAction={action} />

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-none shadow-sm bg-white rounded-2xl">
          <LogAuditTable
            logs={logs}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={Number(totalCount)}
          />
        </Card>
      </div>
    </div>
  );
}
