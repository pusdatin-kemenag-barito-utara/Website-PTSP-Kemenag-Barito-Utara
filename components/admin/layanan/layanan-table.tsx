"use client";

import { m, AnimatePresence, Reorder } from "framer-motion";
import { Pencil, Trash2, Inbox, FolderOpen, GripVertical } from "lucide-react";
import Link from "next/link";

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
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden text-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* HEADER ROW */}
          <div className="flex items-center border-b border-slate-200/60 bg-slate-50/50 px-5 py-3.5">
            {isSuperAdmin && (
              <div className="w-16 shrink-0 text-center text-xs font-black uppercase tracking-wider text-slate-400">
                Urutan
              </div>
            )}
            <div className="flex-1 text-left text-xs font-black uppercase tracking-wider text-slate-400 pl-4">
              Nama Layanan & Slug
            </div>
            {showBidangColumn && (
              <div className="w-48 shrink-0 text-left text-xs font-black uppercase tracking-wider text-slate-400">
                Bidang Pengelola
              </div>
            )}
            <div className="w-32 shrink-0 text-left text-xs font-black uppercase tracking-wider text-slate-400">
              Status
            </div>
            <div className="w-56 shrink-0 text-right text-xs font-black uppercase tracking-wider text-slate-400 pr-4">
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

  return (
    <Reorder.Item
      value={service}
      dragListener={false}
      dragControls={dragControls}
      className="flex items-center px-5 py-4 group transition-colors duration-150 hover:bg-slate-50/50 bg-white relative select-none"
    >
      {isSuperAdmin && (
        <div className="w-16 shrink-0 flex items-center justify-center">
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-center cursor-grab active:cursor-grabbing text-slate-300 hover:text-emerald-500 transition-colors p-2"
          >
            <GripVertical className="h-5 w-5 pointer-events-none" />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1 pl-4">
        <span className="font-bold text-slate-900">
          {service.name}
        </span>
        <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
          <div className="w-3 border-t border-slate-300" />
          {service.slug}
        </span>
      </div>
      {showBidangColumn && (
        <div className="w-48 shrink-0 flex items-center">
          <BidangBadge roleOwner={service.roleOwner} />
        </div>
      )}
      <div className="w-32 shrink-0 flex items-center">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
            service.isActive
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60"
              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${service.isActive ? "bg-emerald-500" : "bg-rose-500"}`}
          />
          {service.isActive ? "AKTIF" : "NONAKTIF"}
        </span>
      </div>
      <div className="w-56 shrink-0 flex justify-end gap-2 pr-4">
        {service.id && category !== "asn" ? (
          <Link
            href={`/admin/layanan/${service.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:shadow-md hover:shadow-emerald-500/25 transition-all duration-200"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Kelola
          </Link>
        ) : null}
        <button
          onClick={() => onEdit(service)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-slate-700 bg-white border border-slate-200/80 hover:bg-emerald-50 hover:text-[#059669] hover:border-emerald-200 transition-all duration-200 shadow-sm"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(service)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-rose-600 bg-white border border-rose-200/60 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Hapus
        </button>
      </div>
    </Reorder.Item>
  );
}
