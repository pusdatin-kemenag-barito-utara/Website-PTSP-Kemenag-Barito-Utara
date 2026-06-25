import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { db, serializeBigInt } from "@/lib/db";
import {
  serviceRequests as serviceRequestsTable,
  serviceRequirements as serviceRequirementsTable,
} from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";
import { getR2SignedUrl, isR2Path } from "@/lib/r2";
import { RealtimeSync } from "@/components/ui/realtime-sync";

// Reuse same detail components as the pemohon dashboard
import { RequestHeader } from "@/app/dashboard/pengajuan/[id]/_components/request-header";
import { RequestDetailsCard } from "@/app/dashboard/pengajuan/[id]/_components/request-details-card";
import { RequestAnswersCard } from "@/app/dashboard/pengajuan/[id]/_components/request-answers-card";
import { RequestDocumentsCard } from "@/app/dashboard/pengajuan/[id]/_components/request-documents-card";
import { OutputDocumentCard } from "@/app/dashboard/pengajuan/[id]/_components/output-document-card";
import { RevisionSection } from "@/app/dashboard/pengajuan/[id]/_components/revision-section";
import { ActivityLogsCard } from "@/app/dashboard/pengajuan/[id]/_components/activity-logs-card";

async function getSignedUrl(bucket: string, path?: string | null) {
  if (!path) return null;
  if (isR2Path(path)) return getR2SignedUrl(path);
  const admin = createAdminClient();
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

export default async function PegawaiRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireAuth();
  const { id } = await params;

  const requestData = await db.query.serviceRequests.findFirst({
    where: eq(serviceRequestsTable.id, id),
    with: {
      services: { columns: { name: true } },
      serviceItems: { columns: { name: true } },
      serviceRequestAnswers: {
        orderBy: (answers, { asc }) => [asc(answers.createdAt)],
      },
      serviceRequestDocuments: { with: { serviceRequirements: true } },
      generatedDocuments: true,
      activityLogs: { orderBy: (logs, { desc }) => [desc(logs.createdAt)] },
    },
  });

  if (!requestData) notFound();
  // Hanya pemilik yang boleh melihat detail pengajuannya
  if (requestData.userId !== profile.id) redirect("/pegawai/layanan/riwayat");

  const request = serializeBigInt(requestData);
  const docUrls = (
    await Promise.allSettled(
      (request.serviceRequestDocuments ?? []).map(async (doc: any) => ({
        id: doc.id,
        url: await getSignedUrl("request-documents", doc.filePath),
      })),
    )
  )
    .filter((r) => r.status === "fulfilled")
    .map((r: any) => r.value);

  const generatedDoc =
    Array.isArray(request.generatedDocuments) &&
    request.generatedDocuments.length > 0
      ? request.generatedDocuments[0]
      : request.generatedDocuments;

  const generatedUrl =
    generatedDoc?.filePath && request.status === "completed"
      ? await getSignedUrl("generated-documents", generatedDoc.filePath)
      : null;

  const signedUrlMap = new Map(docUrls.map((item: any) => [item.id, item.url]));

  const rawRequirements = await db.query.serviceRequirements.findMany({
    where: eq(
      serviceRequirementsTable.serviceItemId,
      BigInt(request.serviceItemId),
    ),
    orderBy: [asc(serviceRequirementsTable.id)],
  });

  const requirements = serializeBigInt(rawRequirements);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <RealtimeSync />

      <RequestHeader request={request} backUrl="/pegawai/layanan/riwayat" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          <RequestDetailsCard
            revisionNote={request.revisionNote}
            rejectionReason={request.rejectionReason}
          />

          <RequestAnswersCard
            requestId={request.id}
            answers={request.serviceRequestAnswers ?? []}
            documents={request.serviceRequestDocuments ?? []}
            status={request.status}
          />

          <RequestDocumentsCard
            documents={request.serviceRequestDocuments ?? []}
            signedUrlMap={signedUrlMap}
          />
        </div>

        <div className="space-y-6 md:space-y-8">
          <OutputDocumentCard generatedUrl={generatedUrl} />

          <RevisionSection
            request={request}
            requirements={requirements}
          />

          <ActivityLogsCard activityLogs={request.activityLogs ?? []} />
        </div>
      </div>
    </div>
  );
}
