import { MapPin, Phone, Mail, Clock3 } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    label: "Alamat Kantor",
    value: "Jl. Ahmad Yani No.126 Muara Teweh 73811",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Phone,
    label: "Telepon / Fax",
    value: "(0519) 21269",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Mail,
    label: "Email Resmi",
    value: "ptspkemenagbaritoutara@gmail.com",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: Clock3,
    label: "Jam Operasional",
    value: "Senin - Jumat | 07.30 - 16.00 WIB",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function ContactInfoCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {contactInfo.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.06)] border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-100"
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div
              className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}
            >
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                {item.label}
              </p>
              <p className="text-sm font-black text-slate-800 leading-relaxed">
                {item.value}
              </p>
            </div>
            
            {/* Subtle Decorative Pattern */}
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 ${item.color}`}>
               <Icon className="h-24 w-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
