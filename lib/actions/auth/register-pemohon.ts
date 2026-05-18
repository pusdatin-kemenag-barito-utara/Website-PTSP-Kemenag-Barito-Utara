"use server";

import { z } from "zod";
import { AuthService } from "@/lib/services/auth-service";
import { verifyTurnstileAction } from "@/lib/actions/auth/login-helper";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
};

const RegisterSchema = z.object({
  fullName: z.string().min(3, "Nama minimal 3 karakter"),
  phone: z.string().min(10, "Nomor WhatsApp tidak valid"),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function registerPemohonAction(formData: FormData): Promise<ActionResult> {
  try {
    const turnstileToken = String(formData.get("turnstile_token") || "");
    const verifyRes = await verifyTurnstileAction(turnstileToken);
    if (!verifyRes.success) {
      return { success: false, error: "Verifikasi keamanan gagal. Silakan coba lagi." };
    }

    const validated = RegisterSchema.safeParse({
      fullName: formData.get("full_name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      password: formData.get("password"),
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await AuthService.registerPemohon(validated.data);

    return { success: true, message: "Pendaftaran berhasil. Silakan login." };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Gagal melakukan pendaftaran" };
  }
}
