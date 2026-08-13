import { useState } from "react";
import { Eye } from "lucide-react";
import { DocumentPreviewModal } from "@/components/ui/document-preview-modal";

export function PreviewButton({
  url,
  title,
  className,
  label = "Preview",
}: {
  url: string;
  title: string;
  className?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={className}>
        {label} <Eye className="ml-2 h-3 w-3" />
      </button>

      <DocumentPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        url={url}
        title={title}
      />
    </>
  );
}
