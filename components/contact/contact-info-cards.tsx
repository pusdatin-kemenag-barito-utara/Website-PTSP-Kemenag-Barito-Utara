import { MapPin, Phone, Mail, Clock3 } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: "Jl. Yetro Singseng, Muara Teweh, Barito Utara, Kalimantan Tengah",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Phone,
    label: "Telepon",
    value: "(0519) 000000",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Mail,
    label: "Email",
    value: "ptsp@kemenag.go.id",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: Clock3,
    label: "Jam Operasional",
    value: "Senin – Jumat, 08.00 – 16.00 WITA",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function ContactInfoCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {contactInfo.map((item) => (
        <div
          key={item.label}
          className="rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.bg}`}
          >
            <item.icon className={`h-6 w-6 ${item.color}`} />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {item.label}
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900 leading-relaxed">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
