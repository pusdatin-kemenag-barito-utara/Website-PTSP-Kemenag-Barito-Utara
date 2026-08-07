import Link from 'next/link';
import { MotionDiv, springPopVariants } from "@/components/common/MotionDiv";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-84px)] flex items-center justify-center p-6 bg-slate-50/50">
      <MotionDiv 
        variants={springPopVariants}
        initial="hidden"
        animate="show"
        className="rounded-3xl border border-slate-200/60 bg-white p-12 text-center shadow-xl shadow-slate-200/50 max-w-md w-full"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-800">404</h1>
        <h2 className="mt-2 text-xl font-bold text-slate-700">Halaman tidak ditemukan</h2>
        <p className="mt-3 text-slate-500 leading-relaxed">
          Maaf, halaman yang Anda cari mungkin telah dihapus, pindah nama, atau tidak tersedia untuk saat ini.
        </p>
        <Link 
          href="/" 
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-[#059669] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#047857] hover:scale-105 active:scale-95 w-full"
        >
          Kembali ke Beranda
        </Link>
      </MotionDiv>
    </div>
  );
}
