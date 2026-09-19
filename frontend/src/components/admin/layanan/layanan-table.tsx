import { motion as m, AnimatePresence, Reorder } from "framer-motion";
import { Pencil, Trash2, Inbox, FolderOpen, GripVertical } from "lucide-react";
import Link from "@/lib/next-compat/link";

// Helper untuk format label bidang dari role string
function formatBidangLabel(roleOwner?: string | null): string {
  if (!roleOwner) return "Semua Bidang";
  return roleOwner
    .replace("admin_", "")
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Badge warna bidang
function BidangBadge({ roleOwner }: { roleOwner?: string | null }) {
  if (!roleOwner) {
    return (
      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-500 ring-1 ring-slate-200/60">
        Umum
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60">
      {formatBidangLabel(roleOwner)}
    </span>
  );
}

export function LayananTable({
  services,
  isPending,
  onReorder,
  onEdit,
  onDelete,
  showBidangColumn = false,
  isSuperAdmin = false,
  category = "public",
}: {
  services: any[];
  isPending: boolean;
  onReorder: (newOrder: any[]) => void;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
  showBidangColumn?: boolean;
  isSuperAdmin?: boolean;
  category?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden text-xs">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* HEADER ROW */}
          <div className="flex items-center border-b border-slate-200/60 bg-slate-50/50 px-4 py-2.5">
            {isSuperAdmin && (
              <div className="w-14 shrink-0 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                Urutan
              </div>
            )}
            <div className="flex-1 text-left text-[10px] font-black uppercase tracking-wider text-slate-400 pl-3">
              Nama Layanan & Slug
            </div>
            {showBidangColumn && (
              <div className="w-40 shrink-0 text-left text-[10px] font-black uppercase tracking-wider text-slate-400">
                Bidang Pengelola
              </div>
            )}
            {category !== "asn" && (
              <div className="w-24 shrink-0 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
                Jumlah Item
              </div>
            )}
            <div className="w-24 shrink-0 text-center text-[10px] font-black uppercase tracking-wider text-slate-400">
              Status
            </div>
            <div className="w-28 shrink-0 text-right text-[10px] font-black uppercase tracking-wider text-slate-400 pr-3">
              Aksi
            </div>
          </div>

          {/* BODY */}
          {services?.length > 0 ? (
            <Reorder.Group
              axis="y"
              values={services}
              onReorder={onReorder}
              className="divide-y divide-slate-100 flex flex-col"
            >
              {services.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  isSuperAdmin={isSuperAdmin}
                  showBidangColumn={showBidangColumn}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  category={category}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-5 text-center bg-white">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
                  <Inbox className="h-8 w-8 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500">
                    Belum ada layanan
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Klik tombol "Tambah Layanan" untuk memulai.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useDragControls } from "framer-motion";

function ServiceRow({
  service,
  isSuperAdmin,
  showBidangColumn,
  onEdit,
  onDelete,
  category,
}: {
  service: any;
  isSuperAdmin: boolean;
  showBidangColumn: boolean;
  onEdit: (service: any) => void;
  onDelete: (service: any) => void;
  category?: string;
}) {
  const dragControls = useDragControls();

  const roleOwner = service.role_owner !== undefined ? service.role_owner : service.roleOwner;
  const items = service.serviceItems || service.items || [];
  const itemCounts = items.length;
  const isActive = service.is_active !== undefined ? Boolean(service.is_active) : (service.isActive !== undefined ? Boolean(service.isActive) : true);

  return (
    <Reorder.Item
      value={service}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center px-4 py-2.5 group transition-colors duration-150 hover:bg-slate-50/50 bg-white relative select-none"
    >
      {isSuperAdmin && (
        <div className="w-14 shrink-0 flex items-center justify-center">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-1"
          >
            <GripVertical className="h-4 w-4 pointer-events-none" />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-0.5 pl-3">
        <span className="font-bold text-slate-900 text-xs">
          {service.name}
        </span>
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <div className="w-2.5 border-t border-slate-300" />
          {service.slug}
        </span>
      </div>
      {showBidangColumn && (
        <div className="w-40 shrink-0 flex items-center">
          <BidangBadge roleOwner={roleOwner} />
        </div>
      )}
      {category !== "asn" && (
        <div className="w-24 shrink-0 flex items-center justify-center">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            {itemCounts} Layanan
          </span>
        </div>
      )}
      <div className="w-24 shrink-0 flex items-center justify-center">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
            isActive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60"
          }`}
        >
          <span
            className={`h-1 w-1 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          {isActive ? "AKTIF" : "NONAKTIF"}
        </span>
      </div>
      <div className="w-28 shrink-0 flex justify-end items-center gap-1 pr-3">
        {service.id && category !== "asn" ? (
          <Link
            href={`/admin/layanan/${service.id}`}
            title="Kelola Sub-Layanan"
            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 transition-all duration-200 shadow-2xs"
          >
            <FolderOpen className="h-3.5 w-3.5" />
          </Link>
        ) : null}
        <button
          onClick={() => onEdit(service)}
          title="Edit Layanan"
          className="p-1.5 rounded-lg text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 transition-all duration-200 shadow-2xs"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(service)}
          title="Hapus Layanan"
          className="p-1.5 rounded-lg text-rose-600 bg-rose-50/60 hover:bg-rose-600 hover:text-white border border-rose-200/60 hover:border-rose-600 transition-all duration-200 shadow-2xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Reorder.Item>
  );
}
