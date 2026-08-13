import { z } from "zod";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";
import { stripHtml } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const admin = createAdminClient();
    const internalEmail = `p${phone.replace(/\D/g, "")}@ptsp.id`;

    const { data: newAuthUser, error: authError } = await admin.auth.admin.createUser({
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

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (newAuthUser?.user) {
      try {
        await (admin as any).schema("kemenag_pusdatin").from("profiles").upsert({
          id: newAuthUser.user.id,
          email: internalEmail,
          name: validated.data.fullName,
          phone: phone,
          address: validated.data.address,
          role: "user",
          user_type: "eksternal_masyarakat",
          status: "aktif",
          is_verified: true,
          updated_at: new Date().toISOString(),
        });
      } catch (profileErr) {
        console.error("Gagal provisi profil ke kemenag_pusdatin.profiles:", profileErr);
      }
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
