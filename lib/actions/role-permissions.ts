'use server';

import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getRolePermissions() {
  try {
    const data = await prisma.role_permissions.findMany();
    return data || [];
  } catch (error: any) {
    console.error('Error fetching role permissions:', error.message);
    return [];
  }
}

export async function updateRolePermissionsAction(role: string, permissions: string[]) {
  // Only super_admin can do this
  const profile = await requireAdmin();
  if (profile.role !== 'super_admin') {
    return { error: 'Hanya Super Admin yang dapat mengubah hak akses.' };
  }

  try {
    await prisma.role_permissions.upsert({
      where: { role },
      update: { 
        permissions, 
        updated_at: new Date() 
      },
      create: { 
        role, 
        permissions, 
        updated_at: new Date() 
      },
    });

    revalidatePath('/admin');
    revalidatePath('/admin/pengguna');
    
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
