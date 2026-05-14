"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { EditRequestForm } from "../forms/edit-request-form";

export function EditAnswersDialog({
  requestId,
  answers,
  documents,
  disabled,
}: {
  requestId: string;
  answers: any[];
  documents: any[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <Edit className="h-3.5 w-3.5" />
          <span>Edit Pengajuan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-emerald-600" />
            <span>Edit Data &amp; Dokumen Pengajuan</span>
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1">
            Perbarui informasi atau dokumen yang keliru di bawah ini.
          </p>
        </DialogHeader>
        <div className="py-4">
          <EditRequestForm
            requestId={requestId}
            answers={answers}
            documents={documents}
            onSuccess={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
