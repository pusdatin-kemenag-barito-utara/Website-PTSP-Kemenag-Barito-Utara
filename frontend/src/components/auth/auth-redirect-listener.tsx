import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "@/lib/next-compat/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthRedirectListener() {
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const initialHash = useRef(typeof window !== "undefined" ? window.location.hash : "");

  useEffect(() => {
    const supabase = createClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Kita periksa apakah ada indikasi login dari magiclink di hash awal
      const isFromMagicLink = initialHash.current && initialHash.current.includes("access_token");
      
      // Jika event SIGNED_IN atau INITIAL_SESSION (karena session baru di-set dari URL),
      // dan user berada di homepage, dan belum diredirect
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session && pathname === "/" && !hasRedirected.current) {
        
        if (isFromMagicLink) {
          hasRedirected.current = true;
          
          // Ambil role user dari metadata atau endpoint /api/v1/users/:id
          let role = session.user.user_metadata?.role;
          if (!role) {
            try {
              const res = await fetch(`/api/v1/users/${session.user.id}`).then((r) => r.json());
              if (res?.data?.role) {
                role = res.data.role;
              }
            } catch (e) {}
          }

          if (role === "pegawai") {
            router.push("/pegawai");
          } else if (role === "user") {
            router.push("/dashboard");
          } else if (role) {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
