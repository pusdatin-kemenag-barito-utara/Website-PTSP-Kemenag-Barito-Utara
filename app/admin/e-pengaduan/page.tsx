import { MessageSquare } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { EPengaduanClient } from "@/components/admin/e-pengaduan/e-pengaduan-client";

export default async function AdminEPengaduanPage() {
  await requirePermission("saran_pengaduan");

  // Fetch feedbacks using Drizzle ORM
  const result = await db.query.feedbacks.findMany({
    orderBy: [desc(feedbacks.createdAt)],
  });

  const serialized = serializeBigInt(result) || [];
  const entries = serialized.map((entry: any) => ({
    id: entry.id.toString(),
    name: entry.name || "",
    phone: entry.phone || "",
    category: entry.category || "Saran",
    serviceType: entry.serviceType || "Lainnya",
    isAnonymous: !!entry.isAnonymous,
    content: entry.content || "",
    status: entry.status || "pending",
    adminReply: entry.adminReply || null,
    createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Saran & Pengaduan"
        description="Pantau dan tindak lanjuti saran, masukan, dan pengaduan dari masyarakat pengguna layanan PTSP."
        icon={MessageSquare}
      />
      <EPengaduanClient initialEntries={entries} />
    </div>
  );
}
