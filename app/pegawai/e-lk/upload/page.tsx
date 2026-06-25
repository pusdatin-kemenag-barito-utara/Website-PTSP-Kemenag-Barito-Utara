import { getCurrentUser } from "@/lib/auth";
import { getLaporanKinerjaBulananAction } from "@/lib/actions/pegawai/e-lk";
import { UploadFinalForm } from "@/components/pegawai/e-lk/upload-form";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { RekapFilter } from "@/components/pegawai/e-lk/rekap-filter";

export default async function UploadLkhPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { month, year } = await searchParams;
  
  const currentDate = new Date();
  const selectedMonth = month ? parseInt(month as string) : currentDate.getMonth() + 1;
  const selectedYear = year ? parseInt(year as string) : currentDate.getFullYear();

  const { data: existingData } = await getLaporanKinerjaBulananAction(user.id, selectedMonth, selectedYear);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Upload Final LKH</h1>
          <p className="text-slate-500 mt-1">Unggah dokumen rekap laporan kinerja bulanan yang telah ditandatangani.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <RekapFilter initialMonth={selectedMonth} initialYear={selectedYear} />
        </div>
      </div>

      <UploadFinalForm 
        currentMonth={selectedMonth} 
        currentYear={selectedYear} 
        existingData={existingData} 
      />
    </div>
  );
}
