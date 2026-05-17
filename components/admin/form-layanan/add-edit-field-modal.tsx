import { m, AnimatePresence } from "framer-motion";
import { X, Loader2, Check } from "lucide-react";
import { FieldFormContent } from "./_components/field-form-content";

export function AddEditFieldModal({
  isOpen,
  editingField,
  items,
  formData,
  isPending,
  onClose,
  onChangeLabel,
  onChangeFormData,
  onSubmit,
}: {
  isOpen: boolean;
  editingField: any | null;
  items: any[];
  formData: any;
  isPending: boolean;
  onClose: () => void;
  onChangeLabel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeFormData: (updates: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <AnimatePresence>
      {(isOpen || editingField) && (
        <>
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-50 border border-slate-200/60"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10">
              <h3 className="text-lg font-black text-slate-800">
                {editingField ? "Edit Field Layanan" : "Tambah Field Baru"}
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-slate-200/50 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <FieldFormContent 
              items={items}
              formData={formData}
              isPending={isPending}
              onChangeLabel={onChangeLabel}
              onChangeFormData={onChangeFormData}
              onSubmit={onSubmit}
              onClose={onClose}
            />
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}
