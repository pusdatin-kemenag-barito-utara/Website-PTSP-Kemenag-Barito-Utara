"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  variant = "danger",
}: AlertDialogProps) {
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    info: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
  };

  const iconStyles = {
    danger: "text-red-600 bg-red-50",
    warning: "text-amber-600 bg-amber-50",
    info: "text-emerald-600 bg-emerald-50",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconStyles[variant]}`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-900 leading-tight">
                  {title}
                </DialogTitle>
              </DialogHeader>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 bg-slate-50/80 px-6 py-4 backdrop-blur-sm border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 px-6 rounded-xl text-white shadow-lg transition-all ${variantStyles[variant]}`}
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
