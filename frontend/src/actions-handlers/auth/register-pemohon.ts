import { z } from "zod";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import { stripHtml } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAPI } from "@/lib/api";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const RegisterSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/[0-9]/, "Password harus mengandung angka"),
});

function formatPhone(phone: string): string {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    cleanPhone = "62" + cleanPhone;
  }
  return cleanPhone;
}

export async function requestRegistrationOtpAction(
  rawPhone: string,
  token: string,
) {
  if (!rawPhone) return { error: "Nomor WhatsApp wajib diisi." };

  const phone = formatPhone(rawPhone);

  const verifyRes = await verifyTurnstileAction(token);
  if (!verifyRes.success) {
    return { error: "Verifikasi keamanan gagal. Silakan coba lagi." };
  }

  // TODO: Kirim OTP via API gateway / SMS / WA Service jika diaktifkan.
  return { success: true, message: `Kode OTP dikirimkan ke nomor ${phone}` };
}

export async function registerPemohonAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return {
        success: false,
        error: "Verifikasi keamanan gagal. Silakan coba lagi.",
      };
    }

    const rawPhone = String(formData.get("phone") || "");
    const phone = formatPhone(rawPhone);

    const validated = RegisterSchema.safeParse({
      fullName: stripHtml(String(formData.get("full_name") || "")),
      phone: rawPhone,
      address: stripHtml(String(formData.get("address") || "")),
      password: formData.get("password"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    // 1. Daftarkan langsung ke backend Golang (Clean Architecture)
    // Backend akan menghash password dengan bcrypt dan menyimpannya ke kemenag_ptsp.profiles_pemohon
    const registerRes = await fetchAPI<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        nama: validated.data.fullName,
        phone: phone,
        alamat: validated.data.address,
        password: validated.data.password,
        metode_login: "WhatsApp (PTSP)",
        mode: "pemohon",
      }),
    });

    if (!registerRes || registerRes.error || !registerRes.success) {
      return {
        success: false,
        error: registerRes?.error || "Gagal melakukan pendaftaran akun.",
      };
    }

    // 2. Sinkronisasi ke Supabase Auth (jika dibutuhkan oleh modul auth terintegrasi)
    try {
      const admin = createAdminClient();
      const internalEmail = `p${phone.replace(/\D/g, "")}@ptsp.id`;
      await admin.auth.admin.createUser({
        email: internalEmail,
        password: validated.data.password,
        email_confirm: true,
        user_metadata: {
          full_name: validated.data.fullName,
          phone,
          address: validated.data.address,
          role: "user",
        },
      });
    } catch (syncErr) {
      // Abaikan jika Supabase Auth sudah ada akun dengan email tersebut
      console.warn("Supabase Auth sync info:", syncErr);
    }

    return {
      success: true,
      message: "Pendaftaran berhasil! Akun Anda siap digunakan.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      error: error.message || "Gagal melakukan pendaftaran",
    };
  }
}
