import Link from "@/lib/next-compat/link";
import { Eye, Inbox } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export function AdminRequestTable({
  requests,
  status,
  q,
}: {
  requests: any[];
  status: string;
  q: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      {requests?.length ? (
        <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-2.5 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-bold text-slate-700">
              {requests.length}
            </span>{" "}
            pengajuan
            {status ? ` • status "${status}"` : ""}
            {q ? ` • pencarian "${q}"` : ""}
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/70 bg-slate-50/80">
              <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Nomor Tiket
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Pemohon
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Layanan & Dokumen
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-3.5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tanggal Masuk
              </th>
              <th className="px-3.5 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tindakan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request: any) => (
              <tr
                key={request.id}
                className="group transition-colors duration-150 hover:bg-emerald-50/25"
              >
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span className="font-mono text-[11px] font-bold text-[#059669] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {request.requestNumber || request.request_number || request.id}
                  </span>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="max-w-[180px] sm:max-w-[220px]">
                    <p className="font-bold text-slate-900 text-xs truncate">
                      {request.applicant_name || request.applicantName || request.profiles?.fullName || request.profiles?.name || "-"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {request.applicant_email || request.applicantEmail || request.profiles?.email || ""}
                    </p>
                  </div>
                </td>
                <td className="px-3.5 py-2.5">
                  <div className="max-w-[200px] sm:max-w-[280px]">
                    <p className="text-slate-800 font-semibold text-xs leading-tight truncate">
                      {request.services?.name || request.service_name || "-"}
                    </p>
                    {(request.serviceItems?.name || request.item_name) && (
                      <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
                        {request.serviceItems?.name || request.item_name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  {(() => {
                    let displayStatus = request.status;
                    let customLabel: string | undefined = undefined;
                    let tone: string | undefined = undefined;

                    // Specific logic for ASN Cuti requests
                    const category = request.services?.category || request.category;
                    if (category === "asn" && request.pengajuanCuti) {
                      const cuti = request.pengajuanCuti;
                      if (cuti.status === "pending") {
                        if (cuti.statusAtasan === "pending") {
                          displayStatus = "pending";
                          customLabel = "Menunggu TTE Atasan";
                          tone = "warning";
                        } else if (
                          cuti.statusAtasan === "approved" &&
                          cuti.statusKepala === "pending"
                        ) {
                          displayStatus = "pending";
                          customLabel = "Menunggu TTE Pejabat";
                          tone = "warning";
                        }
                      } else if (cuti.status === "approved") {
                        displayStatus = "approved";
                      } else if (cuti.status === "rejected") {
                        displayStatus = "rejected";
                      }
                    }

                    if (customLabel) {
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide ${
                            tone === "warning"
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                              : ""
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {customLabel}
                        </span>
                      );
                    }

                    return <StatusBadge status={displayStatus} />;
                  })()}
                </td>
                <td className="px-3.5 py-2.5 text-slate-500 text-[11px] whitespace-nowrap font-medium">
                  {formatDate(request.createdAt || request.created_at)}
                </td>
                <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                  <Link
                    href={`/admin/pengajuan/${request.id}`}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-[#059669] bg-emerald-50 border border-emerald-200/70 transition-all duration-150 hover:bg-[#059669] hover:text-white hover:border-[#059669] shadow-2xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Tinjau
                  </Link>
                </td>
              </tr>
            ))}

            {!requests.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        Tidak ada data pengajuan
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Coba sesuaikan filter atau kata kunci pencarian.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
