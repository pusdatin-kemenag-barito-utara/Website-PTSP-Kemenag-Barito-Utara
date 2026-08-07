import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
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

  let request: any = null;
  try {
    const res = await fetchAPI<any>(`/requests/${id}`);

    if (res && res.data) {
      request = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch request detail from Golang API:", err);
  }

  if (!request) notFound();
  if (request.userId !== profile.id && request.user_id !== profile.id) redirect("/dashboard");

  const docUrls = (await Promise.allSettled(
    (request.serviceRequestDocuments ?? request.documents ?? []).map(async (doc: any) => ({
      id: doc.id,
      url: await getSignedUrl("request-documents", doc.filePath || doc.file_path),
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
  const requirements = request.requirements || [];

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
