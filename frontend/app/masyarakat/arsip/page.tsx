import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { ArchiveClient } from "./_components/archive-client";

export default async function UserArchivePage() {
  const profile = await requireAuth();

  let data: any[] = [];
  try {
    const res = await fetchAPI<any>(`/requests?userId=${encodeURIComponent(profile.id)}`);
    if (res && res.data && Array.isArray(res.data)) {
      data = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch user archive from Golang API:", err);
  }

  // Proses & selaraskan data dokumen menjadi format terpadu
  const documents: any[] = [];

  data.forEach((req: any) => {
    const serviceName = req.services?.name || "Layanan Kemenag";
    const requestNumber = req.requestNumber;

    // 1. Dokumen Persyaratan yang diunggah Pemohon (Uploaded)
    if (req.serviceRequestDocuments) {
      req.serviceRequestDocuments.forEach((doc: any) => {
        documents.push({
          id: `uploaded-${doc.id}`,
          fileName: doc.fileName || doc.serviceRequirements?.documentName || "Berkas Persyaratan",
          filePath: doc.filePath,
          fileType: doc.fileType || "application/octet-stream",
          fileSize: doc.fileSize ? String(doc.fileSize) : "0",
          createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
          source: "uploaded",
          requestNumber,
          serviceName,
        });
      });
    }

    // 2. Dokumen Hasil yang diterbitkan Kemenag (Generated)
    if (req.generatedDocuments) {
      req.generatedDocuments.forEach((doc: any) => {
        documents.push({
          id: `generated-${doc.id}`,
          fileName: doc.fileName || `Hasil - ${serviceName}`,
          filePath: doc.filePath,
          fileType: "application/pdf", // Dokumen keluaran biasanya PDF
          fileSize: "0",
          createdAt: doc.generatedAt ? new Date(doc.generatedAt).toISOString() : (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
          source: "generated",
          requestNumber,
          serviceName,
        });
      });
    }
  });

  // Urutkan berdasarkan tanggal terbaru
  documents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <ArchiveClient initialDocuments={documents} />
    </div>
  );
}
