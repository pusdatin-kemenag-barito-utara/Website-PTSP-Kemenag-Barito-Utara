import { ArrowRight, FileText, Briefcase, TrendingUp, Award, UserMinus, FileText as DefaultIcon } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { services as servicesTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function AjukanLayananPage() {
  const user = await getCurrentUser();
  
  const data = await db.query.services.findMany({
    where: eq(servicesTable.category, "asn"),
    orderBy: [asc(servicesTable.sortOrder)],
  });

  // Map data to the required format
  const layananASN = data.map((item, index) => {
    // Array of predefined colors to cycle through
    const colors = [
      { color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600", icon: Briefcase },
      { color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600", icon: TrendingUp },
      { color: "bg-purple-500", lightColor: "bg-purple-50", textColor: "text-purple-600", icon: Award },
      { color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600", icon: UserMinus },
    ];
    const theme = colors[index % colors.length];
    
    return {
      id: item.id,
      title: item.name,
      description: item.description || "Pengajuan layanan kepegawaian.",
      icon: theme.icon,
      color: theme.color,
      lightColor: theme.lightColor,
      textColor: theme.textColor,
      href: item.slug === "cuti" ? "/pegawai/cuti" : `/pegawai/layanan/ajukan/${item.slug}`,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Ajukan Layanan ASN</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Pilih jenis layanan kepegawaian yang ingin Anda ajukan.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {layananASN.map((item) => {
          const Icon = item.icon || DefaultIcon;
          return (
            <Link key={item.id} href={item.href} className="group relative bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/30 transition-all overflow-hidden flex items-center gap-4">
              <div className={`p-2.5 sm:p-3 rounded-xl ${item.lightColor} ${item.textColor} group-hover:scale-110 transition-transform shrink-0`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg group-hover:text-emerald-700 transition-colors truncate">{item.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 line-clamp-1">{item.description}</p>
              </div>

              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0 ml-2">
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
