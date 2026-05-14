'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateUserPermissionsAction(userId: string, permissions: string[]) {
  // Only super_admin can do this
  const profile = await requireAdmin();
  if (profile.role !== 'super_admin') {
    return { error: 'Hanya Super Admin yang dapat mengubah hak akses.' };
  }

  try {
    await prisma.profiles.update({
      where: { id: userId },
      data: { permissions },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/pengguna');
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
