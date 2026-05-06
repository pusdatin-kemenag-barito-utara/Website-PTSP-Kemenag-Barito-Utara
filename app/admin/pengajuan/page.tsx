import { FolderKanban } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/admin/page-header";
import { AdminRequestFilter } from "@/components/admin/pengajuan/request-filter";
import { AdminRequestTable } from "@/components/admin/pengajuan/request-table";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; service_id?: string }>;
}) {
  await requireAdmin();
  const { status = "", q = "", service_id = "" } = await searchParams;
  const admin = createAdminClient();

  // Fetch list of services for the filter dropdown
  const { data: services } = await admin
    .from("services")
    .select("id, name")
    .order("name");

  let query = admin
    .from("service_requests")
    .select(
      `
      *,
      profiles!service_requests_user_id_fkey (full_name, email),
      services (name),
      service_items (name)
    `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  if (service_id) {
    query = query.eq("service_id", service_id);
  }

  const { data: rawRequests } = await query;

  const requests = (rawRequests ?? []).filter((request: any) => {
    if (!q) return true;
    const keyword = q.toLowerCase();
    return (
      String(request.request_number || "")
        .toLowerCase()
        .includes(keyword) ||
      String(request.profiles?.full_name || "")
        .toLowerCase()
        .includes(keyword)
    );
  });

  const totalCount = rawRequests?.length ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kelola Pengajuan"
        description={`Tinjau dan proses pengajuan dari pemohon. Total: ${totalCount} pengajuan.`}
        icon={FolderKanban}
      />

      <AdminRequestFilter
        q={q}
        status={status}
        service_id={service_id}
        services={services}
      />

      <AdminRequestTable requests={requests} status={status} q={q} />
    </div>
  );
}
