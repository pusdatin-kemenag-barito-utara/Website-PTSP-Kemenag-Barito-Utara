"use client";

import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import html2canvas from 'html2canvas-pro';

export default function BarcodePage() {
  const qrUrl = "https://ptsp.kemenag-baritoutara.com/buku-tamu";
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Higher resolution for better quality
        backgroundColor: '#ffffff', // Ensure white background
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'barcode-buku-tamu-kemenag.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Gagal mengunduh barcode', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 print:bg-white print:p-0">
      {/* Tombol Navigasi - Disembunyikan saat cetak */}
      <div className="absolute top-4 left-4 print:hidden flex gap-3">
        <Link href="/buku-tamu">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Buku Tamu
          </Button>
        </Link>
      </div>

      <div className="absolute top-4 right-4 print:hidden flex gap-3">
        <Button onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" /> Cetak Barcode
        </Button>
      </div>

      {/* Area yang akan dicetak / diunduh */}
      <div className="flex flex-col items-center space-y-6 text-center max-w-sm print:max-w-none print:mt-12 bg-slate-50 print:bg-white p-8 rounded-3xl">
        <div className="space-y-2">
          <div className="flex justify-center mb-4">
            <Image 
              src="/kemenag.svg" 
              alt="Logo Kemenag" 
              width={64} 
              height={64}
              className="w-16 h-16 print:w-20 print:h-20"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 print:text-black">Buku Tamu Elektronik</h1>
          <p className="text-slate-600 font-medium text-lg print:text-black">PTSP Kemenag Barito Utara</p>
        </div>

        <div ref={printRef} className="relative p-6 border-2 border-slate-200 rounded-3xl bg-white shadow-sm print:border-none print:shadow-none print:p-0 mt-4">
          <QRCode
            value={qrUrl}
            size={300}
            level="H" // High error correction, meminimalkan error saat logo ditengah menutupi barcode
            bgColor="#ffffff"
            fgColor="#000000"
            className="w-[300px] h-[300px] print:w-[400px] print:h-[400px]"
          />
          {/* Logo di tengah Barcode */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 print:border-none print:shadow-none print:p-4">
              <Image 
                src="/kemenag.svg" 
                alt="Logo Kemenag Center" 
                width={48} 
                height={48}
                className="w-12 h-12 print:w-16 print:h-16"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          <p className="text-lg font-semibold text-slate-800 print:text-black">
            Scan untuk Mengisi Buku Tamu
          </p>
          <p className="text-sm text-slate-500 print:text-gray-700 max-w-xs mx-auto">
            Arahkan kamera HP Anda ke QR Code di atas secara mandiri, aman, dan mudah.
          </p>
        </div>

        {/* Tombol Unduh dipindah ke bawah barcode */}
        <div className="pt-4 print:hidden">
          <Button onClick={handleDownload} variant="secondary" className="gap-2 px-8 py-3 rounded-2xl w-full">
            <Download className="w-5 h-5" /> Unduh Barcode (PNG)
          </Button>
        </div>
      </div>
      
      {/* Footer Info Cetak */}
      <div className="hidden print:block fixed bottom-8 text-center w-full text-sm text-gray-500">
        <p>Pelayanan Terpadu Satu Pintu (PTSP)</p>
        <p>Kementerian Agama Kabupaten Barito Utara</p>
        <p className="mt-2 text-xs">https://ptsp.kemenag-baritoutara.com/buku-tamu</p>
      </div>
    </div>
  );
}
