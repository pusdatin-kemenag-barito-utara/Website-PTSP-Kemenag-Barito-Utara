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
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  group?: string;
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
  { label: "Profil", href: "/dashboard/profil", icon: UserCircle2 },
];

export const GROUP_ICONS: Record<string, React.ElementType> = {
  Utama: LayoutDashboard,
  "Master Data": Database,
  Sistem: Settings2,
};
