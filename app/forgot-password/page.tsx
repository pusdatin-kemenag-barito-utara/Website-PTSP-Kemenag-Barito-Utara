import { ForgotPasswordClient } from "@/components/auth/forgot-password-client";
import Image from "next/image";
import { AuthCardMotion, AuthBgMotionPetugas } from "@/components/auth/auth-motion-wrapper";

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-[calc(100dvh-72px)] md:min-h-[calc(100dvh-80px)] items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Background with pattern/image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/kantor-kemenag.jpg"
          alt="Kantor Kemenag Barito Utara"
          fill
          priority
          className="object-cover object-center opacity-20 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f8a54]/95 via-[#0b7446]/95 to-[#054125]/95" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <AuthBgMotionPetugas />
      </div>

      {/* Card container */}
      <AuthCardMotion className="relative z-10 w-full max-w-[480px]">
        <ForgotPasswordClient />
      </AuthCardMotion>
    </div>
  );
}
