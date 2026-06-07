"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoginTurnstileProps {
  mounted: boolean;
  onTokenChange: (token: string | null) => void;
  label?: string;
}

export interface TurnstileRef {
  reset: () => void;
}

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export const LoginTurnstile = forwardRef<TurnstileRef, LoginTurnstileProps>(
  ({ mounted, onTokenChange, label }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [verified, setVerified] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // Expose reset method to parent component
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setVerified(false);
          onTokenChange(null);
        }
      },
    }));

    useEffect(() => {
      if (!mounted) return;

      // Check if script is already present
      const existingScript = document.querySelector(
        'script[src*="challenges.cloudflare.com"]'
      );

      const initializeTurnstile = () => {
        setScriptLoaded(true);
        if (containerRef.current && window.turnstile && !widgetIdRef.current) {
          try {
            const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
            const widgetId = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              theme: "light",
              callback: (token: string) => {
                setVerified(true);
                onTokenChange(token);
              },
              "expired-callback": () => {
                setVerified(false);
                onTokenChange(null);
              },
              "error-callback": () => {
                setVerified(false);
                onTokenChange(null);
              },
            });
            widgetIdRef.current = widgetId;
          } catch (err) {
            console.error("Failed to render Turnstile:", err);
          }
        }
      };

      if (existingScript) {
        if (window.turnstile) {
          initializeTurnstile();
        } else {
          // Script is loading, wait for it
          const interval = setInterval(() => {
            if (window.turnstile) {
              clearInterval(interval);
              initializeTurnstile();
            }
          }, 100);
          return () => clearInterval(interval);
        }
      } else {
        // Load the script
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = initializeTurnstile;
        document.head.appendChild(script);
      }

      return () => {
        // Clean up widget when unmounting
        if (window.turnstile && widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch (e) {
            // Ignore clean up errors if element is already gone
          }
        }
      };
    }, [mounted, onTokenChange]);

    return (
      <div className="mx-auto w-full max-w-md">
        <div className="relative flex min-h-[65px] items-center justify-center">
          {mounted ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div
                ref={containerRef}
                className="origin-center scale-[0.85] sm:scale-95 drop-shadow-sm"
              />
              {!scriptLoaded && (
                <div className="flex items-center gap-2 text-xs text-slate-400 animate-pulse">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-emerald-500" />
                  <span>Memuat verifikasi keamanan...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[65px] w-full animate-pulse rounded-xl bg-slate-100" />
          )}
        </div>
      </div>
    );
  }
);

LoginTurnstile.displayName = "LoginTurnstile";
