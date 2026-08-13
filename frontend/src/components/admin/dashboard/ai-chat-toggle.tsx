import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Bot, Power, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleAIChatAction } from "@/lib/actions/system/maintenance";

export function AiChatToggle({ initialStatus }: { initialStatus: boolean }) {
  const [enabled, setEnabled] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    const newStatus = !enabled;
    const res = await toggleAIChatAction(newStatus);
    
    if (res.success) {
      setEnabled(newStatus);
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
    setIsLoading(false);
  };

  return (
    <Card className="p-6 border-none shadow-sm bg-white rounded-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-1 flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-500" />
            Asisten AI Chat
          </h3>
          <p className="text-[11px] text-slate-500 max-w-sm leading-relaxed mt-2">
            Matikan saklar ini jika API AI utama sedang gangguan. Jika dimatikan, tombol balon chat AI akan disembunyikan dari semua halaman publik dan dashboard.
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
            enabled ? "bg-emerald-500" : "bg-slate-300"
          } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span className="sr-only">Toggle AI Chat</span>
          <span
            className={`pointer-events-none flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
            ) : (
              <Power className={`h-3 w-3 ${enabled ? "text-emerald-500" : "text-slate-400"}`} />
            )}
          </span>
        </button>
      </div>
    </Card>
  );
}
