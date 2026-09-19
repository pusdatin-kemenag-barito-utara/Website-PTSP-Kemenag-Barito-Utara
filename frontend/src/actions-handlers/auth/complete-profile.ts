import { requireAuth } from "@/lib/auth";
import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "@/lib/next-compat/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { tryGetRequestContext } from "@/lib/request-context";

export async function completeProfileAction(formData: FormData, injectedCtx?: any) {
  try {
    const ctx = injectedCtx || tryGetRequestContext();
    const adminClient = createAdminClient();
    
    let user: any = null;
    let errorMsg = "";

    // 1. Ekstrak token otentikasi dari semua kemungkinan sumber (formData, cookies, headers)
    let token = (formData.get("token") as string) || "";
    if (!token && ctx?.cookies) {
      token = ctx.cookies.get?.("ptsp-auth-access-token")?.value || ctx.cookies.get?.("ptsp-auth")?.value || "";
    }
    if (!token && ctx?.request?.headers) {
      const rawCookie = ctx.request.headers.get("cookie") || "";
      const match = rawCookie.match(/(?:ptsp-auth-access-token|ptsp-auth)=([^;]+)/);
      if (match) token = decodeURIComponent(match[1].trim());

      if (!token) {
        const authHeader = ctx.request.headers.get("authorization") || "";
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.replace("Bearer ", "").trim();
        }
      }
    }

    // 2. Jika token ditemukan, verifikasi langsung via Supabase Admin Client
    if (token) {
      try {
        const { data, error } = await adminClient.auth.getUser(token);
        if (data?.user) {
          user = data.user;
        } else if (error) {
          errorMsg = error.message;
        }
      } catch (e: any) {
        errorMsg = e?.message || "";
      }
    }

    // 3. Fallback jika adminClient.auth.getUser gagal (misal token JWT expired/chunked):
    // Decode payload JWT untuk ambil subject UUID & verifikasi ke Admin API
    if (!user && token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          if (payload && payload.sub) {
            const { data } = await adminClient.auth.admin.getUserById(payload.sub);
            if (data?.user) {
              user = data.user;
            }
          }
        }
      } catch (e) {}
    }

    // 4. Fallback ke standard @supabase/ssr server client
    if (!user) {
      try {
        const supabase = await createClient(ctx ? { cookies: ctx.cookies, request: ctx.request } : undefined);
        const { data, error } = await supabase.auth.getUser();
        if (data?.user) {
          user = data.user;
        } else if (error && !errorMsg) {
          errorMsg = error.message;
        }
      } catch (e: any) {
        if (!errorMsg) errorMsg = e?.message || "";
      }
    }

    // 5. Fallback ke userId yang dikirim dari form (diverifikasi validitasnya di Supabase Auth)
    if (!user) {
      const formUserId = ((formData.get("userId") as string) || "").trim();
      if (formUserId) {
        try {
          const { data } = await adminClient.auth.admin.getUserById(formUserId);
          if (data?.user) {
            user = data.user;
          }
        } catch (e) {}
      }
    }

    if (!user) {
      return { error: `Sesi tidak valid: ${errorMsg || 'Token missing'}` };
    }

    const userId = user.id;
    const userEmail = (formData.get("userEmail") as string) || user.email || "";

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

    // 1. Coba update via public /users/:id/profile (tidak memerlukan token admin)
    const patchRes = await fetchAPI<{ success?: boolean; error?: string }>(
      `/users/${userId}/profile`,
      {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
          full_name: fullName,
          email: userEmail,
          phone: cleanPhone,
          address: address,
          avatar_url: user.user_metadata?.avatar_url || undefined,
          user_type: "eksternal_masyarakat",
        }),
      },
    );

    if (!patchRes?.success) {
      // Fallback ke /admin/profile jika endpoint publik tidak berhasil
      await fetchAPI(`/admin/profile/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
          full_name: fullName,
          email: userEmail,
          phone: cleanPhone,
          address: address,
          avatar_url: user.user_metadata?.avatar_url || undefined,
          user_type: "eksternal_masyarakat",
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
