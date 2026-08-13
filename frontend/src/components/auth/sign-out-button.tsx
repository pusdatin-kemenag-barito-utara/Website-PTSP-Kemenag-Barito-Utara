import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Loader2, LogOut } from 'lucide-react';

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      
      // Hapus cookie sesi manual agar bersih total di client
      document.cookie = "ptsp-auth-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie = "ptsp-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

      window.location.href = "/";
    } catch (err) {
      console.error("Sign out error:", err);
      window.location.href = "/";
    }
  };

  return (
    <Button 
      type="button" 
      variant="danger" 
      disabled={loading}
      onClick={handleSignOut}
      className="gap-2 font-bold"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      <span>Logout</span>
    </Button>
  );
}
