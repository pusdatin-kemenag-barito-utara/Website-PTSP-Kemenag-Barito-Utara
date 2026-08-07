'use client';

import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/actions/auth/sign-out';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOutAction();
  };

  return (
    <Button type="button" variant="danger" onClick={handleSignOut}>
      Logout
    </Button>
  );
}
