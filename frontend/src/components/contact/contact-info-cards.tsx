import { useEffect, useState } from "react";
import { Building2, MapPin, MessageCircle, Mail, Clock, CalendarDays } from "lucide-react";

function getOfficeScheduleByDay(weekday: string) {
  if (["Mon", "Tue", "Wed", "Thu"].includes(weekday)) {
    return {
      openMinutes: 7 * 60 + 30,
      closeMinutes: 16 * 60,
      nextOpenText: "07.30",
      closeText: "16.00",
    };
  }

  if (weekday === "Fri") {
    return {
      openMinutes: 7 * 60 + 30,
      closeMinutes: 16 * 60 + 30,
      nextOpenText: "07.30",
      closeText: "16.30",
    };
  }

  return null;
}

const WEEKDAYS_ID: Record<string, string> = {
  Sun: "Minggu",
  Mon: "Senin",
  Tue: "Selasa",
  Wed: "Rabu",
  Thu: "Kamis",
  Fri: "Jum'at",
  Sat: "Sabtu",
};

function getNextOpeningDetail(weekday: string) {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentIndex = dayOrder.indexOf(weekday);

  for (let i = 1; i <= 7; i += 1) {
    const nextDay = dayOrder[(currentIndex + i) % 7];
    const nextSchedule = getOfficeScheduleByDay(nextDay);

    if (nextSchedule) {
      return `Layanan akan dibuka pada hari ${WEEKDAYS_ID[nextDay]} pukul ${nextSchedule.nextOpenText} WIB.`;
    }
  }

  return "Jadwal layanan sedang diperbarui.";
}

function getOfficeStatus() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const weekday = parts.find((item) => item.type === "weekday")?.value || "Mon";
  const hour = Number(parts.find((item) => item.type === "hour")?.value || 0);
  const minute = Number(
    parts.find((item) => item.type === "minute")?.value || 0,
  );

  const currentMinutes = hour * 60 + minute;
  const schedule = getOfficeScheduleByDay(weekday);

  const isOpen =
    !!schedule &&
    currentMinutes >= schedule.openMinutes &&
    currentMinutes < schedule.closeMinutes;

  let detail = "";

  if (isOpen && schedule) {
    detail = `Layanan sedang berlangsung hingga pukul ${schedule.closeText} WIB.`;
  } else if (schedule && currentMinutes < schedule.openMinutes) {
    detail = `Layanan akan dibuka hari ini pukul ${schedule.nextOpenText} WIB.`;
  } else {
    detail = getNextOpeningDetail(weekday);
  }

  const timeString = `${String(hour).padStart(2, "0")}.${String(minute).padStart(2, "0")} WIB`;

  return {
    label: isOpen ? "Sedang Buka" : "Sedang Tutup",
    detail,
    nowText: `${WEEKDAYS_ID[weekday]}, ${timeString}`,
    isOpen,
  };
}

export function ContactInfoCards() {
  const [officeStatus, setOfficeStatus] = useState(() => getOfficeStatus());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Sync to start of the next minute for accuracy, then update every minute
    const now = new Date();
    const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

    let intervalId: NodeJS.Timeout;

    const timeoutId = setTimeout(() => {
      setOfficeStatus(getOfficeStatus());
      intervalId = setInterval(() => {
        setOfficeStatus(getOfficeStatus());
      }, 60000);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="grid gap-5 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Card 1: Status Layanan */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none flex flex-col relative overflow-hidden transition-colors duration-300">
        <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 mb-1.5">
              Status Layanan
            </p>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-tight">
              {mounted ? officeStatus.label : "Memuat..."}
            </h2>
          </div>
          {mounted && (
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-wide font-bold ${
                officeStatus.isOpen
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/20"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  officeStatus.isOpen
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-amber-500"
                }`}
              />
              {officeStatus.isOpen ? "Online" : "Offline"}
            </div>
          )}
        </div>

        <p className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-400 mb-5 relative z-10">
          {mounted ? officeStatus.detail : "Menghitung status jam kerja..."}
        </p>

        <div className="mt-auto grid gap-5 rounded-2xl bg-slate-50 dark:bg-slate-950 p-5 border border-slate-100 dark:border-slate-800 relative z-10 transition-colors duration-300">
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                Waktu kantor saat ini
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">
                {mounted ? officeStatus.nowText : "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-400">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Jam layanan</p>
              <div className="space-y-1 font-medium text-slate-700 dark:text-slate-300 text-[13px]">
                <p>Senin - Kamis, 07.30 - 16.00 WIB</p>
                <p>Jum'at, 07.30 - 16.30 WIB</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Kontak Utama */}
      <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none relative overflow-hidden transition-colors duration-300">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-emerald-400 mb-4">
          Kontak Utama
        </p>

        <div className="grid gap-4 mt-2">
          {/* Instansi */}
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-400">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">
                Nama Instansi
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-[13px]">
                PTSP Kementerian Agama Kabupaten Barito Utara
              </p>
            </div>
          </div>

          {/* Alamat */}
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Alamat</p>
              <a 
                href="https://www.google.com/maps/search/Kementerian+Agama+Kabupaten+Barito+Utara"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#059669] dark:hover:text-emerald-400 transition-colors text-[13px] leading-snug"
              >
                Jl. Ahmad Yani No.126 Muara Teweh 73811
              </a>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-[#059669]/10 dark:bg-emerald-950/60 flex items-center justify-center text-[#059669] dark:text-emerald-400">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">WhatsApp Admin PTSP</p>
              <a
                href="https://wa.me/6285117491212?text=Halo%20Admin%20PTSP%2C%20saya%20butuh%20bantuan%2Finformasi%20terkait%20layanan%20di%20Kemenag%20Barito%20Utara."
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#059669] dark:text-emerald-400 hover:text-[#047857] dark:hover:text-emerald-300 transition-colors text-[13px] inline-block"
              >
                +62 851-1749-1212
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0 h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-0.5">Email</p>
              <a
                href="mailto:ptspkemenagbaritoutara@gmail.com"
                className="font-bold text-[#059669] dark:text-emerald-400 hover:text-[#047857] dark:hover:text-emerald-300 transition-colors text-[13px] inline-block break-all"
              >
                ptspkemenagbaritoutara@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
