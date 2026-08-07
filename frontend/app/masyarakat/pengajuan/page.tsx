import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { Card } from "@/components/ui/card";

// Local Components
import { RequestsHeader } from "./_components/requests-header";
import { RequestsMobileList } from "./_components/requests-mobile-list";
import { RequestsDesktopTable } from "./_components/requests-desktop-table";

export default async function UserRequestsPage() {
  const profile = await requireAuth();

  let requests: any[] = [];
  try {
    const res = await fetchAPI<any>(`/requests?userId=${encodeURIComponent(profile.id)}`);
    if (res && res.data && Array.isArray(res.data)) {
      requests = res.data;
    }
  } catch (err) {
    console.error("Failed to fetch requests from Golang API:", err);
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <RequestsHeader />

      <Card className="overflow-hidden border-none shadow-2xl shadow-slate-200/60 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-slate-900">
        {/* Mobile View - Card List */}
        <div className="block md:hidden">
          <RequestsMobileList requests={requests} />
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <RequestsDesktopTable requests={requests} />
        </div>
      </Card>
    </div>
  );
}
