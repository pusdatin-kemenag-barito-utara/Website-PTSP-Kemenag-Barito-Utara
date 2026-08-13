import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";
import { createClient } from "@/lib/supabase/server";
import { tryGetRequestContext } from "@/lib/request-context";

export async function completeProfileAction(formData: FormData, injectedCtx?: any) {
  try {
    const ctx = injectedCtx || tryGetRequestContext();
    const supabase = await createClient(ctx ? { cookies: ctx.cookies, request: ctx.request } : undefined);
    
    let user: any = null;
    let errorMsg = "";
    
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) errorMsg = error.message;
      user = data?.user ?? null;
    } catch (e: any) {
      errorMsg = e?.message || "Error di getUser";
    }

    // Fallback 1: Cek cookie ptsp-auth-access-token
    if (!user && ctx) {
      const accessToken = ctx.cookies.get("ptsp-auth-access-token")?.value;
      if (accessToken) {
        try {
          const { data, error } = await supabase.auth.getUser(accessToken);
          if (error) errorMsg = error.message;
          user = data?.user ?? null;
        } catch (e: any) {
          errorMsg = e?.message || "Error fallback cookie";
        }
      }
    }

    // Fallback 2: Cek Authorization header
    if (!user && ctx) {
      const authHeader = ctx.request.headers.get("authorization") || "";
      if (authHeader.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "").trim();
        if (token) {
          try {
            const { data, error } = await supabase.auth.getUser(token);
            if (error) errorMsg = error.message;
            user = data?.user ?? null;
          } catch (e: any) {
             errorMsg = e?.message || "Error fallback header";
          }
        }
      }
    }

    if (!user) {
      return { error: `Sesi tidak valid: ${errorMsg || 'Token missing'}` };
    }

    const userId = user.id;
    const userEmail = user.email ?? "";

    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!fullName || !phone || !address) {
      return { error: "Semua kolom (Nama, WhatsApp, Alamat) wajib diisi." };
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    const patchRes = await fetchAPI<{ success?: boolean; error?: string }>(
      `/admin/profile/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
          full_name: fullName,
          phone: cleanPhone,
          address: address,
          avatar_url: user.user_metadata?.avatar_url || undefined,
        }),
      },
    );

    if (!patchRes?.success) {
      // Fallback ke public profile update endpoint jika token admin tidak terdeteksi
      await fetchAPI(`/users/${userId}/profile`, {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
          full_name: fullName,
          phone: cleanPhone,
          address: address,
          avatar_url: user.user_metadata?.avatar_url || undefined,
        }),
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/masyarakat", "layout");

    return { success: true };
  } catch (err: any) {
    console.error("Complete profile error:", err);
    return { error: "Terjadi kesalahan saat menyimpan profil: " + err.message };
  }
}

export async function updatePegawaiPhoneAction(formData: FormData, injectedCtx?: any) {
  try {
    const ctx = injectedCtx || tryGetRequestContext();
    const profile = await requireAuth(true, ctx);

    if (!profile) {
      return { error: "Sesi tidak valid. Silakan login kembali." };
    }

    const phone = formData.get("phone") as string;

    if (!phone) {
      return { error: "Nomor WhatsApp wajib diisi." };
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return { error: "Format nomor WhatsApp tidak valid." };
    }

    const tokenFallback = ctx?.cookies?.get("ptsp-auth-access-token")?.value || "";
    await fetchAPI(`/admin/profile/${profile.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        phone: cleanPhone,
      }),
      headers: tokenFallback ? { Authorization: `Bearer ${tokenFallback}` } : {},
    });

    return { success: true };
  } catch (err: any) {
    console.error("Update pegawai phone error:", err);
    return { error: err.message || "Gagal memperbarui nomor telepon" };
  }
}

export async function updatePemohonWhatsappAction(formData: FormData, injectedCtx?: any) {
  return completeProfileAction(formData, injectedCtx);
}
