import { useState, useMemo } from "react";
import { 
  Folder, 
  Database, 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Files, 
  Calendar,
  Layers,
  Inbox,
  FileSpreadsheet,
  Image as ImageIcon
} from "lucide-react";
import { DocumentPreviewModal } from "@/components/ui/document-preview-modal";
import { getFileUrl } from "@/lib/utils";

interface ArchiveDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: string;
  createdAt: string;
  source: "uploaded" | "generated";
  requestNumber: string;
  serviceName: string;
}

interface ArchiveClientProps {
  initialDocuments: ArchiveDocument[];
}

export function ArchiveClient({ initialDocuments }: ArchiveClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "uploaded" | "generated">("all");
  
  // State untuk Preview Modal
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    fileType: string;
  }>({
    isOpen: false,
    url: "",
    title: "",
    fileType: "",
  });

  // Format ukuran byte berkas
  const formatBytes = (bytesStr: string) => {
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes) || bytes === 0) return "-";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Jumlahkan total ukuran berkas yang diunggah
  const totalUploadedSize = useMemo(() => {
    let total = 0;
    initialDocuments.forEach((doc) => {
      if (doc.source === "uploaded") {
        total += parseInt(doc.fileSize, 10) || 0;
      }
    });
    return total;
  }, [initialDocuments]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const totalCount = initialDocuments.length;
    const uploadedCount = initialDocuments.filter((d) => d.source === "uploaded").length;
    const generatedCount = initialDocuments.filter((d) => d.source === "generated").length;
    return {
      totalCount,
      uploadedCount,
      generatedCount,
      formattedSize: totalUploadedSize > 0 ? formatBytes(String(totalUploadedSize)) : "0 KB",
    };
  }, [initialDocuments, totalUploadedSize]);

  // Saring dokumen berdasarkan pencarian dan tab aktif
  const filteredDocuments = useMemo(() => {
    return initialDocuments.filter((doc) => {
      const matchesSearch = 
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = 
        activeTab === "all" || 
        (activeTab === "uploaded" && doc.source === "uploaded") ||
        (activeTab === "generated" && doc.source === "generated");
      
      return matchesSearch && matchesTab;
    });
  }, [initialDocuments, searchTerm, activeTab]);

  const handleOpenPreview = (doc: ArchiveDocument) => {
    setPreviewModal({
      isOpen: true,
      url: getFileUrl(doc.filePath),
      title: doc.fileName,
      fileType: doc.fileType,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
      
      {/* ── 1. Banner Header Standard PTSP ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.25rem] bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/80 p-6 sm:p-8 md:p-10 text-white shadow-xl dark:shadow-none border border-emerald-800/50 dark:border-slate-800 transition-colors duration-300">
        {/* Subtle Background Radial Glow */}
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-500/15 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-emerald-950/80 border border-white/20 dark:border-emerald-800/60 px-3.5 py-1 backdrop-blur-md">
              <Files className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 dark:text-emerald-300">
                Repositori Pribadi
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Arsip Dokumen Saya
            </h1>

            <p className="text-xs sm:text-sm font-medium text-emerald-100/80 dark:text-slate-300 leading-relaxed">
              Semua berkas persyaratan yang Anda unggah dan dokumen resmi (tanda terima / sertifikat) yang diterbitkan oleh Kemenag tersimpan rapi dan aman di sini.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Panel Statistik (Stats Panel) ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        
        {/* Total Berkas */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex items-center gap-2.5 sm:gap-4 transition-all hover:shadow-md">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[#059669]">
            <Folder className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
              Total Berkas
            </p>
            <p className="text-sm sm:text-2xl font-black text-slate-900 leading-none truncate">
              {stats.totalCount} <span className="text-[10px] sm:text-sm font-bold text-slate-400">file</span>
            </p>
          </div>
        </div>

        {/* Ukuran Penyimpanan */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex items-center gap-2.5 sm:gap-4 transition-all hover:shadow-md">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Database className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
              Ukuran Berkas
            </p>
            <p className="text-sm sm:text-2xl font-black text-slate-900 leading-none truncate">
              {stats.formattedSize}
            </p>
          </div>
        </div>

        {/* Berkas Persyaratan */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex items-center gap-2.5 sm:gap-4 transition-all hover:shadow-md">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Layers className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
              Persyaratan
            </p>
            <p className="text-sm sm:text-2xl font-black text-slate-900 leading-none truncate">
              {stats.uploadedCount} <span className="text-[10px] sm:text-sm font-bold text-slate-400">berkas</span>
            </p>
          </div>
        </div>

        {/* Dokumen Hasil */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 sm:p-5 shadow-sm flex items-center gap-2.5 sm:gap-4 transition-all hover:shadow-md">
          <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 truncate">
              Hasil Kemenag
            </p>
            <p className="text-sm sm:text-2xl font-black text-slate-900 leading-none truncate">
              {stats.generatedCount} <span className="text-[10px] sm:text-sm font-bold text-slate-400">berkas</span>
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Toolbar Pencarian & Filter Kategori ────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Saringan Kategori (Tabs) */}
        <div className="flex rounded-xl bg-slate-100 p-1 self-start w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua ({stats.totalCount})
          </button>
          <button
            onClick={() => setActiveTab("uploaded")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === "uploaded"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Persyaratan ({stats.uploadedCount})
          </button>
          <button
            onClick={() => setActiveTab("generated")}
            className={`flex-1 md:flex-initial px-4 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === "generated"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Hasil Layanan ({stats.generatedCount})
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berkas..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-[#059669] transition-all"
          />
        </div>
      </div>

      {/* ── 4. Daftar Kartu Berkas (Grid) ────────────────────────────── */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const isPdf = doc.fileType === "application/pdf" || doc.filePath.match(/\.pdf$/i);
            const isImage = doc.fileType.startsWith("image/") || doc.filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            
            return (
              <div 
                key={doc.id}
                className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Bagian Atas Kartu: Tipe Ikon & Badge Kategori */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm border ${
                      isPdf 
                        ? "bg-rose-50 text-rose-600 border-rose-100" 
                        : isImage 
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-slate-50 text-slate-500 border-slate-100"
                    }`}>
                      {isPdf ? (
                        <FileText className="h-5 w-5" />
                      ) : isImage ? (
                        <ImageIcon className="h-5 w-5" />
                      ) : (
                        <Folder className="h-5 w-5" />
                      )}
                    </div>
                    
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      doc.source === "generated"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        : "bg-blue-50 text-blue-700 border border-blue-100"
                    }`}>
                      {doc.source === "generated" ? "Hasil Layanan" : "Persyaratan"}
                    </span>
                  </div>

                  {/* Informasi Utama */}
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" title={doc.fileName}>
                    {(() => {
                      const fname = doc.fileName || "";
                      if (fname.length > 32) {
                        const ext = fname.includes(".") ? `.${fname.split(".").pop()}` : "";
                        return `${fname.substring(0, 22)}...${ext}`;
                      }
                      return fname;
                    })()}
                  </h3>

                  <div className="mt-3 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none truncate" title={doc.serviceName}>
                      {doc.serviceName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider leading-none">
                      No: <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{doc.requestNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Tanggal & Aksi */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3.5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none mb-1">
                      Tanggal
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                      <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>

                  {/* Ukuran Berkas / Keterangan Tipe */}
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none block mb-1">
                      Ukuran
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                      {doc.source === "generated" ? "PDF Resmi" : formatBytes(doc.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Modern & Berwarna */}
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(doc)}
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:border-slate-300 active:scale-95 transition-all text-xs font-bold shadow-2xs cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Pratinjau</span>
                  </button>
                  <a
                    href={getFileUrl(doc.filePath)}
                    download={doc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="group/btn relative inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/35 transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 ease-out pointer-events-none" />
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Tampilan Empty State ───────────────────────────────────── */
        <div className="rounded-[2rem] border border-slate-200/80 bg-white p-12 text-center max-w-xl mx-auto shadow-sm animate-in fade-in duration-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#059669] mx-auto mb-6">
            <Inbox className="h-8 w-8" />
          </div>
          <h3 className="text-base font-black text-slate-900">
            {searchTerm ? "Berkas tidak ditemukan" : "Belum ada dokumen"}
          </h3>
          <p className="mt-2 text-xs font-medium text-slate-500 leading-relaxed">
            {searchTerm 
              ? "Tidak ada berkas arsip yang cocok dengan kata kunci pencarian Anda. Silakan coba kata kunci lain." 
              : "Semua berkas persyaratan yang Anda unggah dan dokumen hasil dari Kemenag akan muncul secara otomatis di repositori aman ini."}
          </p>
        </div>
      )}

      {/* ── 5. Modal Pratinjau Dokumen ───────────────────────────────── */}
      <DocumentPreviewModal
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
        url={previewModal.url}
        title={previewModal.title}
        fileType={previewModal.fileType}
      />

    </div>
  );
}
