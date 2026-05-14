'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';

export async function registerPetugasAction(formData: FormData) {
  const full_name = String(formData.get('full_name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const unit_kerja = String(formData.get('unit_kerja') || '').trim();
  const role = String(formData.get('role') || 'admin_ptsp') as any;
  const password = String(formData.get('password') || '');

  if (!full_name || !email || !phone || !unit_kerja || !password) {
    return { error: 'Semua field wajib diisi.' };
  }

  if (password.length < 8) {
    return { error: 'Password minimal 8 karakter.' };
  }

  const admin = createAdminClient();

  // Gunakan admin API: email_confirm=true agar tidak perlu verifikasi email Supabase
  // Verifikasi diganti manual oleh Super Admin via dashboard
  const { data, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      phone,
      unit_kerja,
      role,
      plain_password: password,
      is_petugas_registration: true,
    },
  });

  if (createError) {
    return { error: createError.message };
  }

  return { success: true, userId: data.user?.id };
}

/**
 * Verifikasi akun petugas (hanya Super Admin)
 */
export async function verifyPetugasAction(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.profiles.update({
      where: { id: userId },
      data: { is_verified: true },
    });

    revalidatePath('/admin/pengguna');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Tolak akun petugas — hapus akun dari sistem
 */
export async function rejectPetugasAction(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = createAdminClient();

    // Hapus profile dulu (Prisma)
    await prisma.profiles.delete({
      where: { id: userId },
    });

    // Hapus dari auth
    const { error } = await admin.auth.admin.deleteUser(userId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/pengguna');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Update data petugas (email, phone, unit_kerja, role, password)
 * Hanya Super Admin yang boleh mengakses
 * Update dilakukan di 2 tempat: profiles (data) dan auth.users (email & password)
 */
export async function updatePetugasAction(data: {
  userId: string;
  email?: string;
  originalEmail?: string;
  phone?: string;
  unit_kerja?: string;
  role?: string;
  newPassword?: string;
}) {
  const admin = createAdminClient();

  // ── Step 1: Perbaiki metadata (agar trigger punya role valid) ──
  const metadataPayload: Record<string, any> = {
    role: data.role,
    phone: data.phone,
    unit_kerja: data.unit_kerja,
  };

  const { error: metaError } = await admin.auth.admin.updateUserById(
    data.userId,
    { user_metadata: metadataPayload }
  );

  if (metaError) {
    console.error('Metadata update warning:', metaError.message);
  }

  // ── Step 2: Update email dan/atau password di auth.users ──
  const emailChanged = data.email && data.email !== data.originalEmail;
  const passwordChanged = !!data.newPassword;

  if (emailChanged || passwordChanged) {
    const authUpdate: Record<string, any> = {};
    if (emailChanged) {
      authUpdate.email = data.email;
      authUpdate.email_confirm = true;
    }
    if (passwordChanged) {
      authUpdate.password = data.newPassword;
    }

    const { error: authError } = await admin.auth.admin.updateUserById(
      data.userId,
      authUpdate
    );

    if (authError) {
      console.error('Auth update error:', authError.message);
      return { error: 'Gagal update sistem Auth: ' + authError.message };
    }
  }

  // ── Step 3: Update profiles TERAKHIR ──
  const profileUpdate: Record<string, any> = {};
  if (data.email !== undefined) profileUpdate.email = data.email;
  if (data.phone !== undefined) profileUpdate.phone = data.phone;
  if (data.unit_kerja !== undefined) profileUpdate.unit_kerja = data.unit_kerja;
  if (data.role !== undefined) profileUpdate.role = data.role as any;
  if (data.newPassword) profileUpdate.plain_password = data.newPassword;

  if (Object.keys(profileUpdate).length > 0) {
    await prisma.profiles.update({
      where: { id: data.userId },
      data: profileUpdate,
    });
  }

  revalidatePath('/admin/pengguna');
  return { success: true };
}
