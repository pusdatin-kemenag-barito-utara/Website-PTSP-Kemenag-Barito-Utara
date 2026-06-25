import { requireAuth, getCurrentProfile } from "@/lib/auth";
import { ProfileClient } from "./profile-client";
import PageBanner from "@/components/common/PageBanner";

export const metadata = {
  title: "Profil Pegawai | PTSP Kemenag Barito Utara",
};

export default async function PegawaiProfilePage() {
  await requireAuth();
  const profile = await getCurrentProfile();

  return (
    <div className="w-full">
      <PageBanner
        title="Profil Pegawai"
        description="Kelola informasi data diri, avatar, dan keamanan akun Anda."
      />
      
      <div className="mt-6">
        <ProfileClient profile={profile} />
      </div>
    </div>
  );
}
