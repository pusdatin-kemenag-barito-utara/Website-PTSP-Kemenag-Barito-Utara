import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { ArchiveClient } from "./_components/archive-client";

export default async function UserArchivePage() {
  const profile = await requireAuth();

  let initialDocuments: any[] = [];
  try {
    const res = await fetchAPI<any>(`/requests?userId=${profile.id}`);
    const requests = res?.data || [];

    // Normalize documents from requests into ArchiveDocument format
    initialDocuments = requests.flatMap((req: any) => {
      const docs = req.documents || [];
      return docs.map((doc: any) => ({
        id: doc.id,
        fileName: doc.fileName || doc.file_name || "Dokumen",
        filePath: doc.filePath || doc.file_path || "",
        fileType: doc.fileType || doc.file_type || "application/pdf",
        fileSize: String(doc.fileSize || doc.file_size || "0"),
        createdAt: doc.createdAt || doc.created_at || new Date().toISOString(),
        source: doc.source || "uploaded",
        requestNumber: req.requestNumber || req.request_number || "-",
        serviceName: req.serviceName || req.service_name || "Layanan",
      }));
    });
  } catch {
    initialDocuments = [];
  }

  return <ArchiveClient initialDocuments={initialDocuments} />;
}
