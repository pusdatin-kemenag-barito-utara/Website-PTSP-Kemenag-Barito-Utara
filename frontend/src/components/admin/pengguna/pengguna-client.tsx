import { useState, useEffect } from "react";
import { isSuperAdmin } from "@/lib/constants";
import { UserPermissionsModal } from "./user-permissions-manager";
import { PetugasTable } from "./petugas-table";
import { PegawaiTable } from "./pegawai-table";
import { PemohonTable } from "./pemohon-table";
export type PenggunaTab = "petugas" | "pegawai" | "pemohon";

interface PenggunaClientProps {
  initialTab?: PenggunaTab;
  initialPetugas?: any[];
  initialPegawai?: any[];
  initialPemohon?: any[];
  initialStats?: any;
  initialUsers?: any[];
  currentEmail?: string;
}

export function PenggunaClient({
  initialTab = "petugas",
  initialPetugas = [],
  initialPegawai = [],
  initialPemohon = [],
  initialUsers = [],
  currentEmail,
}: PenggunaClientProps) {
  // Determine initial state from props or fallback from initialUsers
  const fallbackPetugas = initialPetugas.length > 0
    ? initialPetugas
    : initialUsers.filter((u) => u.user_type === "internal_admin" || (u.role !== "user" && u.role !== "pegawai"));

  const fallbackPegawai = initialPegawai.length > 0
    ? initialPegawai
    : initialUsers.filter((u) => u.user_type === "internal_pegawai" || u.role === "pegawai");

  const fallbackPemohon = initialPemohon.length > 0
    ? initialPemohon
    : initialUsers.filter((u) => u.user_type === "eksternal_masyarakat" || u.role === "user");

  const [petugasList, setPetugasList] = useState<any[]>(fallbackPetugas);
  const [pegawaiList, setPegawaiList] = useState<any[]>(fallbackPegawai);
  const [pemohonList, setPemohonList] = useState<any[]>(fallbackPemohon);

  // Active Tab state — reads URL search parameter ?tab= if available
  const [activeTab, setActiveTab] = useState<PenggunaTab>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab") as PenggunaTab;
      if (p === "petugas" || p === "pegawai" || p === "pemohon") return p;
    }
    return initialTab;
  });

  useEffect(() => {
    const onPopState = () => {
      const p = new URLSearchParams(window.location.search).get("tab") as PenggunaTab;
      if (p === "petugas" || p === "pegawai" || p === "pemohon") {
        setActiveTab(p);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const viewerIsSuperAdmin = isSuperAdmin(currentEmail);

  // Permissions modal state
  const [permissionsUser, setPermissionsUser] = useState<any | null>(null);

  const handleSavePermissions = (userId: string, perms: string[]) => {
    setPetugasList((prev) =>
      prev.map((u) => (u.id === userId || u.user_id === userId ? { ...u, permissions: perms } : u))
    );
  };

  return (
    <div className="space-y-3">
      {/* Modal Kelola Hak Akses */}
      <UserPermissionsModal
        user={permissionsUser}
        isOpen={!!permissionsUser}
        onClose={() => setPermissionsUser(null)}
        onSave={handleSavePermissions}
      />

      {/* CONTENT (LANGSUNG TAMPILKAN TABEL SESUAI MENU AKTIF) */}
      <div>
        {activeTab === "petugas" && (
          <PetugasTable
            petugasList={petugasList}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
            onPetugasCreated={(newPetugas) => {
              setPetugasList((prev) => [newPetugas, ...prev]);
            }}
            onPetugasUpdated={(id, data) => {
              setPetugasList((prev) =>
                prev.map((u) => (u.id === id || u.user_id === id ? { ...u, ...data } : u))
              );
            }}
            onPetugasDeleted={(id) => {
              setPetugasList((prev) => prev.filter((u) => u.id !== id && u.user_id !== id));
            }}
            onOpenPermissions={(user) => setPermissionsUser(user)}
          />
        )}

        {activeTab === "pegawai" && (
          <PegawaiTable
            pegawaiList={pegawaiList}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
            onPegawaiCreated={(newPegawai) => {
              setPegawaiList((prev) => [newPegawai, ...prev]);
            }}
            onPegawaiUpdated={(id, data) => {
              setPegawaiList((prev) =>
                prev.map((u) => (u.id === id || u.user_id === id ? { ...u, ...data } : u))
              );
            }}
            onPegawaiDeleted={(id) => {
              setPegawaiList((prev) => prev.filter((u) => u.id !== id && u.user_id !== id));
            }}
          />
        )}

        {activeTab === "pemohon" && (
          <PemohonTable
            users={pemohonList}
            viewerIsSuperAdmin={viewerIsSuperAdmin}
            onUserDeleted={(id) => {
              setPemohonList((prev) => prev.filter((u) => u.id !== id && u.user_id !== id));
            }}
            onUserUpdated={(id, data) => {
              setPemohonList((prev) =>
                prev.map((u) => (u.id === id || u.user_id === id ? { ...u, ...data } : u))
              );
            }}
          />
        )}
      </div>
    </div>
  );
}
