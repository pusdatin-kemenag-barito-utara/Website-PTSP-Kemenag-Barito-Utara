"use server";

import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { headers } from "next/headers";

interface FeedbackInput {
  name: string;
  email?: string;
  phone: string;
  content: string;
  turnstileToken?: string;
}

export async function submitFeedbackAction(input: FeedbackInput) {
  const { name, email = "-", phone, content, turnstileToken } = input;

  if (!name || !phone || !content) {
    return { error: "Semua kolom formulir harus diisi." };
  }

  // Get client IP address if available
  const headersList = await headers();
  const clientIp =
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    undefined;

  // Verify Turnstile token
  const isHuman = await verifyTurnstileToken(turnstileToken || "", clientIp);
  if (!isHuman) {
    return {
      error: "Verifikasi keamanan (Turnstile) gagal atau kedaluwarsa. Silakan selesaikan tantangan bot terlebih dahulu.",
    };
  }

  try {
    // Insert record safely using Drizzle ORM
    await db.insert(feedbacks).values({
      name,
      email,
      phone,
      content,
    });

    return { success: true };
  } catch (error) {
    console.error("Feedback submission error:", error);
    return { error: "Terjadi kesalahan sistem saat mengirim saran & pengaduan Anda." };
  }
}
