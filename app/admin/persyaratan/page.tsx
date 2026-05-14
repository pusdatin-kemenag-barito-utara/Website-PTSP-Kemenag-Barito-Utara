import { FileText } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import prisma, { serializeBigInt } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/page-header';
import { PersyaratanClient } from '@/components/admin/persyaratan/persyaratan-client';

export default async function AdminRequirementsPage() {
  await requireAdmin();

  const [itemsData, requirementsData] = await Promise.all([
    prisma.service_items.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.service_requirements.findMany({
      include: {
        service_items: {
          select: { name: true },
        },
      },
      orderBy: [
        { service_item_id: 'asc' },
        { id: 'asc' },
      ],
    }),
  ]);

  const items = serializeBigInt(itemsData);
  const requirements = serializeBigInt(requirementsData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Persyaratan"
        description="Atur dokumen persyaratan yang harus diunggah untuk tiap item layanan."
        icon={FileText}
      />
      <PersyaratanClient initialRequirements={requirements ?? []} items={items ?? []} />
    </div>
  );
}
