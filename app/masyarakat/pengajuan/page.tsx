import { requireAuth } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import { serviceRequests as serviceRequestsTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card } from "@/components/ui/card";

// Local Components
import { RequestsHeader } from "./_components/requests-header";
import { RequestsMobileList } from "./_components/requests-mobile-list";
import { RequestsDesktopTable } from "./_components/requests-desktop-table";
import { RequestsInfoFooter } from "./_components/requests-info-footer";

export default async function UserRequestsPage() {
  const profile = await requireAuth();

  const data = await db.query.serviceRequests.findMany({
    where: eq(serviceRequestsTable.userId, profile.id),
    with: {
      services: { columns: { name: true } },
      serviceItems: { columns: { name: true } },
      serviceRequestAnswers: true,
      serviceRequestDocuments: {
        with: {
          serviceRequirements: { columns: { documentName: true } },
        },
      },
    },
    orderBy: [desc(serviceRequestsTable.createdAt)],
  });

  const requests = serializeBigInt(data);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <RequestsHeader />

      <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/60 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900">
        {/* Mobile View - Card List */}
        <div className="block md:hidden">
          <RequestsMobileList requests={requests} />
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <RequestsDesktopTable requests={requests} />
        </div>
      </Card>
    </div>
  );
}
