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
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-2xl rounded-3xl bg-white dark:bg-slate-900 transition-colors">
        <div className="p-6 sm:p-7">
          <div className="flex flex-col items-center text-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${iconStyles[variant]} border border-rose-200/60 dark:border-rose-900/40 shadow-lg shadow-rose-500/10`}
            >
              <AlertTriangle className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <DialogHeader>
                <DialogTitle className="text-lg font-black text-slate-900 dark:text-slate-100 text-center leading-snug">
                  {title}
                </DialogTitle>
              </DialogHeader>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 bg-slate-50/80 dark:bg-slate-950/60 px-6 py-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-xl border-slate-200/90 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`h-10 px-5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${variantStyles[variant]}`}
          >
            {loading ? "Memproses..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
