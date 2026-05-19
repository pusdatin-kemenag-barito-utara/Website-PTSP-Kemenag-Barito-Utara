"use server";

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
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
    // Self-healing table creation in PostgreSQL if it does not exist yet
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feedbacks (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Insert record safely
    await db.execute(sql`
      INSERT INTO feedbacks (name, email, phone, content)
      VALUES (${name}, ${email}, ${phone}, ${content});
    `);

    return { success: true };
  } catch (error) {
    console.error("Feedback submission error:", error);
    return { error: "Terjadi kesalahan sistem saat mengirim saran & pengaduan Anda." };
  }
}
