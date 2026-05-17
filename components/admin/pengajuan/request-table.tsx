import Link from "next/link";
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
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {requests?.length ? (
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Menampilkan{" "}
            <span className="font-semibold text-slate-700">
              {requests.length}
            </span>{" "}
            pengajuan
            {status ? ` — status "${status}"` : ""}
            {q ? ` — pencarian "${q}"` : ""}
          </p>
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/60 bg-gradient-to-r from-slate-50 to-slate-50/50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nomor
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pemohon
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Layanan
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tanggal
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request: any) => (
              <tr
                key={request.id}
                className="group transition-colors duration-150 hover:bg-emerald-50/30"
              >
                <td className="px-5 py-3.5">
                  <span className="font-mono text-xs font-semibold text-[#059669] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                    {request.requestNumber}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      {request.profiles?.fullName || "-"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {request.profiles?.email}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div>
                    <p className="text-slate-700 font-medium text-sm">
                      {request.services?.name}
                    </p>
                    {request.serviceItems?.name && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {request.serviceItems?.name}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={request.status} />
                </td>
                <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                  {formatDate(request.createdAt)}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={`/admin/pengajuan/${request.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#059669] bg-emerald-50 border border-emerald-100 transition-all duration-200 hover:bg-[#059669] hover:text-white hover:border-[#059669] hover:shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Tinjau
                  </Link>
                </td>
              </tr>
            ))}

            {!requests.length && (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                      <Inbox className="h-7 w-7 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600">
                        Tidak ada data pengajuan
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Coba ubah filter atau kata kunci pencarian.
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
