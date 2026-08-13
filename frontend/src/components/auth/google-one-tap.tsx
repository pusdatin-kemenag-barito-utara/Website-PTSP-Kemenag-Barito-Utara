import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/lib/next-compat/navigation";

declare global {
  interface Window {
    google?: any;
  }
}

export function GoogleOneTap({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Dynamically inject Google Identity Services script
    if (document.getElementById("google-gis-script")) {
      setGoogleLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleLoaded || typeof window === "undefined" || !window.google) return;

    const clientId = import.meta.env.PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn("PUBLIC_GOOGLE_CLIENT_ID is not configured.");
      return;
    }

    const supabase = createClient();

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          if (!response.credential) return;

          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: "google",
            token: response.credential,
          });

          if (!error && data?.user) {
            const targetUrl = `/auth/callback${callbackUrl ? `?next=${encodeURIComponent(callbackUrl)}` : ""}`;
            window.location.href = targetUrl;
          }
        },
        auto_select: false,
        cancel_on_tap_outside: false,
        prompt_parent_id: "google-onetap-container",
      });

      // Clear any previous dismissal cooldown for testing
      document.cookie = "g_state=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // Prompt the floating Google One Tap UI
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("Google One Tap prompt not displayed reason:", notification.getNotDisplayedReason());
        }
      });
    } catch (e) {
      console.error("Google One Tap initialization error:", e);
    }
  }, [googleLoaded, callbackUrl]);

  return (
    <div
      id="google-onetap-container"
      className="fixed top-5 right-5 z-50 pointer-events-auto"
    />
  );
}
