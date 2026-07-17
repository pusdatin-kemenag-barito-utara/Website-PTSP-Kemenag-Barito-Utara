"use server";

import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function trackAduanAction(ticketNumber: string, phone: string, turnstileToken: string) {
  try {
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return { success: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
    }

    if (!ticketNumber || !phone) {
      return { success: false, error: "Nomor Tiket dan Nomor Handphone wajib diisi." };
    }

    const data = await db.query.feedbacks.findFirst({
      where: and(
        eq(feedbacks.ticketNumber, ticketNumber),
        eq(feedbacks.phone, phone)
      ),
    });

    if (!data) {
      return { success: false, error: "Data pengaduan tidak ditemukan atau nomor handphone tidak cocok." };
    }

    return { 
      success: true, 
      data: {
        ticketNumber: data.ticketNumber,
        category: data.category,
        serviceType: data.serviceType,
        status: data.status,
        createdAt: data.createdAt,
        content: data.content,
        adminReply: data.adminReply,
        updatedAt: data.updatedAt,
      } 
    };
  } catch (err: any) {
    console.error("Tracking Error:", err);
    return { success: false, error: "Terjadi kesalahan saat melacak aduan." };
  }
}
