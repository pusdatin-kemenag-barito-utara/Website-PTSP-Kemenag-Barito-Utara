import { BookOpen } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { guestBook } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/admin/page-header";
import { BukuTamuClient } from "@/components/admin/buku-tamu/buku-tamu-client";

export default async function AdminBukuTamuPage() {
  await requirePermission("buku_tamu");

  const data = await db.query.guestBook.findMany({
    orderBy: [desc(guestBook.visitDate)],
  });

  const serialized = serializeBigInt(data) || [];
  const entries = serialized.map((entry: any) => ({
    ...entry,
    id: entry.id.toString(), // ensure string representation for React keys
    visitDate: entry.visitDate ? new Date(entry.visitDate).toISOString() : null,
    createdAt: entry.createdAt ? new Date(entry.createdAt).toISOString() : null,
    updatedAt: entry.updatedAt ? new Date(entry.updatedAt).toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Buku Tamu"
        description="Pantau dan kelola riwayat kunjungan tamu digital di PTSP Kemenag Barito Utara."
        icon={BookOpen}
      />
      <BukuTamuClient initialEntries={entries} />
    </div>
  );
}
