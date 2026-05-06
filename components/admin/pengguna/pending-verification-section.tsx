import { Clock } from "lucide-react";
import { PendingUserCard } from "./pending-user-card";

export function PendingVerificationSection({
  pendingUsers,
  onVerify,
  onReject,
}: {
  pendingUsers: any[];
  onVerify: (userId: string) => void;
  onReject: (userId: string) => void;
}) {
  if (pendingUsers.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/80 to-amber-50/50 shadow-sm">
      <div className="border-b border-orange-200 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
            <Clock className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white shadow-sm animate-pulse">
              {pendingUsers.length}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-orange-800">
              Menunggu Verifikasi
            </h3>
            <p className="text-[11px] text-orange-600/70 mt-0.5">
              Petugas baru yang mendaftar dan menunggu persetujuan Anda.
            </p>
          </div>
        </div>
      </div>
      <div className="divide-y divide-orange-100">
        {pendingUsers.map((user) => (
          <PendingUserCard
            key={user.id}
            user={user}
            onVerify={onVerify}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  );
}
