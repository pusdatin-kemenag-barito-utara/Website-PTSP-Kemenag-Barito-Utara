import {
  LayoutDashboard,
  FileText,
  Files,
  FormInput,
  ListChecks,
  FolderKanban,
  Users,
  FileOutput,
  PlusCircle,
  UserCircle2,
  Database,
  Settings2,
  Briefcase,
  CalendarDays,
  ClipboardList,
  UploadCloud,
  History,
  FileCheck2,
  UserCog,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group?: string;
  restrictedToPejabat?: boolean;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/admin", icon: LayoutDashboard, group: "Utama" },
  {
    label: "Pengajuan",
    href: "/admin/pengajuan",
    icon: FolderKanban,
    group: "Utama",
  },
  {
    label: "Layanan",
    href: "/admin/layanan",
    icon: FileText,
    group: "Master Data",
  },
  {
    label: "Item Layanan",
    href: "/admin/item-layanan",
    icon: Files,
    group: "Master Data",
  },
  {
    label: "Form Layanan",
    href: "/admin/form-layanan",
    icon: FormInput,
    group: "Master Data",
  },
  {
    label: "Persyaratan",
    href: "/admin/persyaratan",
    icon: ListChecks,
    group: "Master Data",
  },
  { label: "Pengguna", href: "/admin/pengguna", icon: Users, group: "Sistem" },
  {
    label: "Data Pejabat",
    href: "/admin/manajemen-pegawai/pejabat",
    icon: UserCog,
    group: "Sistem",
  },
  {
    label: "Dokumen Hasil",
    href: "/admin/dokumen-hasil",
    icon: FileOutput,
    group: "Sistem",
  },
];

export const USER_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pengajuan Saya", href: "/dashboard/pengajuan", icon: FolderKanban },
  {
    label: "Buat Pengajuan",
    href: "/dashboard/pengajuan/baru",
    icon: PlusCircle,
  },
  { label: "Arsip Dokumen", href: "/dashboard/arsip", icon: Files },
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle2 },
];

export const PEGAWAI_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/pegawai", icon: LayoutDashboard, group: "Utama" },
  {
    label: "Ajukan Layanan",
    href: "/pegawai/layanan/ajukan",
    icon: PlusCircle,
    group: "Layanan ASN",
  },
  {
    label: "Riwayat Pengajuan",
    href: "/pegawai/layanan/riwayat",
    icon: History,
    group: "Layanan ASN",
  },
  {
    label: "Verifikasi Pengajuan Cuti",
    href: "/pegawai/layanan/verifikasi",
    icon: FileCheck2,
    group: "Layanan ASN",
    restrictedToPejabat: true,
  },
  {
    label: "E-LK Harian Saya",
    href: "/pegawai/e-lk/harian",
    icon: ClipboardList,
    group: "E-LK Harian",
  },
  {
    label: "Isi LKH Harian",
    href: "/pegawai/e-lk/isi",
    icon: FormInput,
    group: "E-LK Harian",
  },
  {
    label: "Rekap Bulan",
    href: "/pegawai/e-lk/rekap",
    icon: CalendarDays,
    group: "E-LK Harian",
  },
  {
    label: "Upload Final",
    href: "/pegawai/e-lk/upload",
    icon: UploadCloud,
    group: "E-LK Harian",
  },
  {
    label: "Riwayat & Bukti",
    href: "/pegawai/e-lk/riwayat",
    icon: FileCheck2,
    group: "E-LK Harian",
  },
  { label: "Profil", href: "/pegawai/profil", icon: UserCog, group: "Pengaturan" },
];

export const GROUP_ICONS: Record<string, React.ElementType> = {
  Utama: LayoutDashboard,
  "Master Data": Database,
  Sistem: Settings2,
  "Layanan ASN": Briefcase,
  "E-LK Harian": ClipboardList,
  "Pengaturan": Settings2,
};
