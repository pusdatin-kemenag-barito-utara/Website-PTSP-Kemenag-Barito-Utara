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
  
  // Ambil data draft cuti (jika ini layanan cuti)
  const isCutiService = request.services?.name?.toLowerCase().includes("cuti") || false;
  let cutiData = null;
  let pejabatList: any[] = [];
  
  if (isCutiService) {
    const { pengajuanCuti } = await import("@/lib/db/schema/kepegawaian");
    const cutiRecords = await db.query.pengajuanCuti.findMany({
      where: eq(pengajuanCuti.userId, profile.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
      limit: 10
    });
    
    // Cocokkan data pengajuan cuti dengan serviceRequest berdasarkan timestamp
    const reqDate = new Date(request.submittedAt || request.createdAt).getTime();
    
    cutiData = cutiRecords.find(c => {
      const cDate = new Date(c.createdAt).getTime();
      const diff = Math.abs(cDate - reqDate);
      return diff < 60000; // toleransi 60 detik
    });
    
    // Fallback: Jika gagal mencocokkan waktu (mungkin karena isu zona waktu), ambil yang paling terbaru
    if (!cutiData && cutiRecords.length > 0) {
      cutiData = cutiRecords[0];
    }

    if (cutiData) {
      const { profiles, profilesPegawai } = await import("@/lib/db/schema/auth");
      
      const pegawaiRecords = await db
        .select({
          nama: profiles.fullName,
          nip: profilesPegawai.nip,
          tipePejabat: profilesPegawai.tipePejabat,
          unitKerja: profilesPegawai.unitKerja,
        })
        .from(profilesPegawai)
        .innerJoin(profiles, eq(profilesPegawai.profileId, profiles.id));
        
      pejabatList = pegawaiRecords;

      // Ambil data rekap cuti tahunan
      const profileWithNip = profile as any;
      if (profileWithNip.nip) {
        const { dataCutiPegawai, rekapCutiTahunan } = await import("@/lib/db/schema/kepegawaian");
        const cutiPegawai = await db.query.dataCutiPegawai.findFirst({
          where: eq(dataCutiPegawai.nip, profileWithNip.nip)
        });
        
        if (cutiPegawai) {
          const rekap = await db.query.rekapCutiTahunan.findFirst({
            where: eq(rekapCutiTahunan.pegawaiId, cutiPegawai.id),
            orderBy: (table, { desc }) => [desc(table.tahunTarget)]
          });
          
          if (rekap) {
            cutiData = {
              ...cutiData,
              cutiTahun2: rekap.cutiTahun2,
              cutiTahun1: rekap.cutiTahun1,
              hakBerjalan: rekap.jumlahCuti,
              jumlahCuti: rekap.sisaCuti,
              cutiAlasanPenting: rekap.cutiAlasanPenting,
              cutiBesar: rekap.cutiBesar,
              cutiBersalin: rekap.cutiBersalin,
              cutiSakit: rekap.cutiSakit,
            };
          }
        }
      }

      // Sinkronkan data cutiData dengan jawaban form aktual (Formulir Isian)
      // agar draf surat persis sama dengan yang diisi pemohon.
      const findAnswer = (keywords: string[], matchAll = false) => {
        const answer = request.serviceRequestAnswers?.find((a: any) => {
          const label = (a.fieldName || "").toLowerCase();
          return matchAll 
            ? keywords.every((k) => label.includes(k.toLowerCase()))
            : keywords.some((k) => label.includes(k.toLowerCase()));
        });
        return answer?.fieldValue || "";
      };

      cutiData = {
        ...cutiData,
        alasan: findAnswer(["alasan"]) || cutiData.alasan,
        alamatCuti: findAnswer(["alamat"]) || cutiData.alamatCuti,
        noHp: findAnswer(["whatsapp", "hp"]) || cutiData.noHp,
        masaKerjaTahun: findAnswer(["masa kerja", "tahun"], true) || cutiData.masaKerjaTahun,
        masaKerjaBulan: findAnswer(["masa kerja", "bulan"], true) || cutiData.masaKerjaBulan,
      };
    }
  }
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

      <RequestHeader 
        request={request} 
        backUrl="/pegawai/layanan/riwayat" 
        cutiData={cutiData}
        profile={profile}
        pejabatList={pejabatList}
      />

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
