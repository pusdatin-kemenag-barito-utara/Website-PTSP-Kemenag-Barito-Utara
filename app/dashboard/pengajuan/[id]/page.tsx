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

// Local Components
import { RequestHeader } from "./_components/request-header";
import { RequestDetailsCard } from "./_components/request-details-card";
import { RequestAnswersCard } from "./_components/request-answers-card";
import { RequestDocumentsCard } from "./_components/request-documents-card";
import { OutputDocumentCard } from "./_components/output-document-card";
import { RevisionSection } from "./_components/revision-section";
import { ActivityLogsCard } from "./_components/activity-logs-card";

async function getSignedUrl(bucket: string, path?: string | null) {
  if (!path) return null;
  if (isR2Path(path)) return getR2SignedUrl(path);
  const admin = createAdminClient();
  const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

export default async function RequestDetailPage({
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
  if (requestData.userId !== profile.id) redirect("/dashboard");

  const request = serializeBigInt(requestData);
  const docUrls = (await Promise.allSettled(
    (request.serviceRequestDocuments ?? []).map(async (doc: any) => ({
      id: doc.id,
      url: await getSignedUrl("request-documents", doc.filePath),
    })),
  )).filter((r) => r.status === "fulfilled").map((r: any) => r.value);

  const generatedDoc = Array.isArray(request.generatedDocuments) && request.generatedDocuments.length > 0
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
      
      <RequestHeader request={request} />

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
