'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function updateProfileAction(formData: FormData) {
  const profile = await requireAuth();

  await prisma.profiles.update({
    where: { id: profile.id },
    data: {
      full_name: String(formData.get('full_name') || ''),
      phone: String(formData.get('phone') || ''),
      address: String(formData.get('address') || '')
    }
  });

  revalidatePath('/dashboard/profil');
  revalidatePath('/dashboard');
}
