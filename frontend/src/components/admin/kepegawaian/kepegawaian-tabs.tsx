import { useState } from "react";
import { Users, CalendarCheck, UserCog } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PegawaiManager } from "@/components/admin/kepegawaian/pegawai-manager";
import { DataCutiClient } from "@/components/admin/data-cuti/data-cuti-client";
import PejabatPage from "@/views/admin/pejabat";

interface Props {
  pegawaiData: any[];
  pegawaiError: string | null;
  dataCuti: any[];
  pejabatList: any[];
}

export function KepegawaianTabs({
  pegawaiData,
  pegawaiError,
  dataCuti,
  pejabatList,
}: Props) {
  const [activeTab, setActiveTab] = useState<"pegawai" | "cuti" | "pejabat">(
    "pegawai",
  );

  const tabs = [
    {
      id: "pegawai" as const,
      label: "Data Pegawai",
      icon: Users,
    },
    {
      id: "pejabat" as const,
      label: "Data Pejabat",
      icon: UserCog,
    },
    {
      id: "cuti" as const,
      label: "Data Cuti",
      icon: CalendarCheck,
    },
  ];

  return (
    <div className="space-y-6 w-full mx-auto pb-10 px-2 sm:px-4">
      <PageHeader
        title="Manajemen Kepegawaian"
        description="Kelola data dan akun pegawai Kantor Kemenag Barito Utara"
        icon={Users}
      />

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        <div className={activeTab === "pegawai" ? "block" : "hidden"}>
          {pegawaiError ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
              {pegawaiError}
            </div>
          ) : (
            <PegawaiManager initialData={pegawaiData} pejabatList={pejabatList} />
          )}
        </div>

        <div className={activeTab === "cuti" ? "block" : "hidden"}>
          <DataCutiClient initialData={dataCuti} />
        </div>

        <div className={activeTab === "pejabat" ? "block" : "hidden"}>
          <PejabatPage initialData={pejabatList} />
        </div>
      </div>
    </div>
  );
}
