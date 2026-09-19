import { JanjiTemuClient } from "@/components/admin/janji-temu/janji-temu-client";

export function JanjiTemuView({ entries }: { entries: any[] }) {
  return (
    <div className="space-y-4 pb-6">
      <JanjiTemuClient initialEntries={entries} />
    </div>
  );
}

export default JanjiTemuView;
