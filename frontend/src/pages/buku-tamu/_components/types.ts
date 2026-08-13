export interface GuestEntry {
  id: string;
  guestName: string;
  whatsapp: string;
  institutionType: string;
  institutionName: string | null;
  intendedOfficer: string;
  purpose: string;
  visitDate: string;
}

export interface GuestBookClientProps {
  initialEntries: GuestEntry[];
  isManualMode?: boolean;
}
