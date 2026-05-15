"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export async function getRequestsForExport(where: any) {
  await requireAdmin();

  // Convert string IDs back to BigInt for Prisma if necessary
  if (where.service_id) {
    where.service_id = BigInt(where.service_id);
  }

  const rawRequests = await prisma.service_requests.findMany({
    where,
    include: {
      profiles: {
        select: { full_name: true, email: true },
      },
      services: {
        select: { name: true },
      },
      service_items: {
        select: { name: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  // Format data for Excel
  return rawRequests.map((r: any) => ({
    "No. Permohonan": r.request_number,
    Tanggal: format(new Date(r.created_at), "dd MMMM yyyy", { locale: id }),
    "Nama Pemohon": r.profiles?.full_name || "-",
    Email: r.profiles?.email || "-",
    Layanan: r.services?.name || "-",
    "Sub Layanan": r.service_items?.name || "-",
    Status: r.status.toUpperCase(),
  }));
}

export async function getDocumentsForExport(where: any) {
  await requireAdmin();

  if (where.service_id) {
    where.service_id = BigInt(where.service_id);
  }

  const rawRequests = await prisma.service_requests.findMany({
    where: {
      ...where,
      generated_documents: { isNot: null },
    },
    include: {
      profiles: {
        select: { full_name: true },
      },
      services: {
        select: { name: true },
      },
      service_items: {
        select: { name: true },
      },
      generated_documents: true,
    },
    orderBy: { created_at: "desc" },
  });

  return rawRequests.map((r: any) => ({
    "No. Permohonan": r.request_number,
    "Nama Pemohon": r.profiles?.full_name || "-",
    Layanan: r.services?.name || "-",
    "Sub Layanan": r.service_items?.name || "-",
    "Tanggal Selesai": r.completed_at
      ? format(new Date(r.completed_at), "dd MMMM yyyy", { locale: id })
      : "-",
    "Nama File": r.generated_documents?.file_name || "-",
  }));
}
