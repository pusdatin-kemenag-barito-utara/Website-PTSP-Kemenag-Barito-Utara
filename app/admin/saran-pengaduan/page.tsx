import { MessageSquare } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { sql } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { SaranPengaduanClient } from "@/components/admin/saran-pengaduan/saran-pengaduan-client";

export default async function AdminSaranPengaduanPage() {
  await requirePermission("saran_pengaduan");

  // Self-healing database schema check
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Fetch feedbacks
  const result = await db.execute(sql`
    SELECT id, name, email, phone, content, created_at as "createdAt"
    FROM feedbacks
    ORDER BY created_at DESC;
  `);

  const serialized = serializeBigInt(result.rows) || [];
  const entries = serialized.map((entry: any) => ({
    id: entry.id.toString(),
    name: entry.name || "",
    email: entry.email || "-",
    phone: entry.phone || "",
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
