import { AlertCircle } from "lucide-react";
import { UploadRevisionForm } from "@/components/forms/upload-revision-form";

interface RevisionSectionProps {
  request: any;
  requirements: any[];
}

export function RevisionSection({
  request,
  requirements,
}: RevisionSectionProps) {
  if (request.status !== "revision_required") return null;

  return (
    <div className="rounded-2xl bg-rose-50 border-2 border-rose-100 p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <AlertCircle className="h-6 w-6 text-rose-500" />
        <h3 className="text-lg font-black text-rose-900 tracking-tight">
          Upload Revisi
        </h3>
      </div>
      <p className="text-xs font-medium text-rose-700 leading-relaxed mb-8">
        Harap perbaiki dokumen Anda sesuai dengan catatan revisi dari petugas di
        atas.
      </p>
      <div className="space-y-6">
        {(requirements ?? []).map((requirement: any) => (
          <UploadRevisionForm
            key={requirement.id}
            requestId={request.id}
            requirement={requirement}
          />
        ))}
      </div>
    </div>
  );
}
