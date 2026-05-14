import { Layers } from 'lucide-react';
import { requireAdmin } from '@/lib/auth';
import prisma, { serializeBigInt } from '@/lib/prisma';
import { PageHeader } from '@/components/admin/page-header';
import { ItemLayananClient } from '@/components/admin/item-layanan/item-layanan-client';

export default async function AdminServiceItemsPage() {
  await requireAdmin();

  const [servicesData, itemsData] = await Promise.all([
    prisma.services.findMany({
      orderBy: { name: 'asc' },
    }),
    prisma.service_items.findMany({
      include: {
        services: {
          select: { name: true },
        },
      },
      orderBy: { id: 'asc' },
    }),
  ]);

  const services = serializeBigInt(servicesData);
  const items = serializeBigInt(itemsData);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Item Layanan"
        description="Kelola daftar sub-layanan, formulir, dan persyaratan untuk setiap induk layanan."
        icon={Layers}
      />
      <ItemLayananClient initialItems={items ?? []} services={services ?? []} />
    </div>
  );
}
