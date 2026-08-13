import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { JanjiTemuClient } from "@/components/admin/janji-temu/janji-temu-client";

export function JanjiTemuView({ entries }: { entries: any[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring Janji Temu"
        description="Pantau dan kelola jadwal janji temu serta pertemuan tatap muka di PTSP Kemenag Barito Utara."
        icon={CalendarCheck}
      />
      <JanjiTemuClient initialEntries={entries} />
    </div>
  );
}

export default JanjiTemuView;
