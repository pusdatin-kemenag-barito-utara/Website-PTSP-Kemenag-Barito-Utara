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
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {contactInfo.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="group relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-[0_15px_35px_rgba(15,23,42,0.04)] border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-emerald-100 flex items-start gap-4 sm:flex-col sm:items-start sm:gap-0"
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div
              className={`flex h-11 w-11 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500 sm:mb-6`}
            >
              <Icon className="h-5.5 w-5.5 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0 flex-1 sm:flex-none">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">
                {item.label}
              </p>
              <p className="text-xs sm:text-sm font-black text-slate-800 leading-relaxed break-words sm:break-normal">
                {item.value}
              </p>
            </div>
            
            {/* Subtle Decorative Pattern */}
            <div className={`absolute -right-2 -bottom-2 sm:-right-4 sm:-bottom-4 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-700 ${item.color}`}>
               <Icon className="h-16 w-16 sm:h-24 sm:w-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
