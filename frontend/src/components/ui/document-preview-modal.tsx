import { FloatingDocViewerModal } from "@/components/ui/floating-doc-viewer-modal";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  fileType?: string;
  fileName?: string;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  url,
  title,
  fileType,
  fileName,
}: DocumentPreviewModalProps) {
  return (
    <FloatingDocViewerModal
      isOpen={isOpen}
      onClose={onClose}
      url={url}
      title={title}
      fileName={fileName}
      fileType={fileType}
    />
  );
}
