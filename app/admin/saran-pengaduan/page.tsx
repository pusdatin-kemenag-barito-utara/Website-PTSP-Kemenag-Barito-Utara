import { MessageSquare } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { SaranPengaduanClient } from "@/components/admin/saran-pengaduan/saran-pengaduan-client";

export default async function AdminSaranPengaduanPage() {
  await requirePermission("saran_pengaduan");

  // Fetch feedbacks using Drizzle ORM
  const result = await db.query.feedbacks.findMany({
    orderBy: [desc(feedbacks.createdAt)],
  });

  const serialized = serializeBigInt(result) || [];
  const entries = serialized.map((entry: any) => ({
    id: entry.id.toString(),
    name: entry.name || "",
    email: entry.email || "-",
    phone: entry.phone || "",
    category: entry.category || "Saran",
    serviceType: entry.serviceType || "Lainnya",
    isAnonymous: !!entry.isAnonymous,
    content: entry.content || "",
    createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Saran & Pengaduan"
        description="Pantau dan tindak lanjuti saran, masukan, dan pengaduan dari masyarakat pengguna layanan PTSP."
        icon={MessageSquare}
      />
      <SaranPengaduanClient initialEntries={entries} />
    </div>
  );
}
