import { useEffect } from "react";
import { useRouter } from "@/lib/next-compat/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimeSync() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Listen for broadcast signals to refresh the page
    const channel = supabase.channel('app-sync')
      .on(
        'broadcast',
        { event: 'refresh' },
        () => {
          console.log('RealtimeSync: Refresh signal received');
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null;
}
