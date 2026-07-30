"use client";

import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import html2canvas from 'html2canvas-pro';

type BarcodeDisplayProps = {
  qrUrl: string;
  title: string;
  subtitle: string;
  backHref: string;
  backLabel: string;
  scanText: string;
  description: string;
  downloadFilename: string;
  footerTitle: string;
  footerSubtitle: string;
  footerUrl: string;
};

export function BarcodeDisplay({
  qrUrl,
  title,
  subtitle,
  backHref,
  backLabel,
  scanText,
  description,
  downloadFilename,
  footerTitle,
  footerSubtitle,
  footerUrl,
}: BarcodeDisplayProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!qrContainerRef.current) return;
    try {
      const canvas = await html2canvas(qrContainerRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Gagal mengunduh barcode', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 print:bg-white print:p-0 relative">
      {/* Navigation Buttons (Hidden when printing) */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6 print:hidden">
        <Link href={backHref}>
          <Button variant="outline" size="sm" className="gap-2 shadow-sm bg-white">
            <ArrowLeft className="w-4 h-4" /> {backLabel}
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2 shadow-sm bg-white">
            <Printer className="w-4 h-4" /> Cetak
          </Button>
          <Button onClick={handleDownload} size="sm" className="gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="w-4 h-4" /> Unduh PNG
          </Button>
        </div>
      </div>

      {/* Main Printable Card */}
      <div ref={printRef} className="flex flex-col items-center space-y-6 text-center max-w-md w-full bg-white print:bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl print:border-none print:shadow-none print:max-w-none print:p-4">
        {/* Header Header & Logo */}
        <div className="space-y-3 flex flex-col items-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
            <Image
              src="/kemenag.svg"
              alt="Logo Kemenag"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight print:text-black">{title}</h1>
            <p className="text-slate-600 font-semibold text-base sm:text-lg print:text-slate-800 mt-1">{subtitle}</p>
          </div>
        </div>

        {/* QR Code Container */}
        <div ref={qrContainerRef} className="relative p-5 sm:p-6 border border-slate-200 rounded-2xl bg-white shadow-inner flex items-center justify-center print:border-2 print:border-slate-300">
          <QRCode
            value={qrUrl}
            size={240}
            level="M"
            bgColor="#ffffff"
            fgColor="#000000"
            className="w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] print:w-[320px] print:h-[320px]"
          />
          {/* Small Center Logo Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-1 rounded-full shadow-sm flex items-center justify-center">
              <Image
                src="/kemenag.svg"
                alt="Logo Kemenag Center"
                width={36}
                height={36}
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain"
              />
            </div>
          </div>
        </div>

        {/* Footer text inside card */}
        <div className="space-y-1.5 max-w-xs mx-auto">
          <p className="text-base sm:text-lg font-bold text-slate-800 print:text-black">{scanText}</p>
          <p className="text-xs sm:text-sm text-slate-500 print:text-slate-700 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:block fixed bottom-6 text-center w-full text-xs text-slate-500">
        <p className="font-semibold text-slate-700">{footerTitle}</p>
        <p>{footerSubtitle}</p>
        <p className="mt-1 font-mono text-[10px] text-slate-400">{footerUrl}</p>
      </div>
    </div>
  );
}

