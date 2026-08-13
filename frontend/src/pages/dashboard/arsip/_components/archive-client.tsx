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
      
      {/* ── 1. Banner Header Premium ─────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#059669] to-[#047857] p-6 sm:p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(4,120,87,0.4)]">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 backdrop-blur-md">
              <Files className="h-3.5 w-3.5 text-emerald-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Repositori Pribadi
              </span>
            </div>
            <h1 className="mt-6 text-3xl sm:text-4xl font-black text-white md:text-5xl tracking-tighter">
              Arsip Dokumen Saya
            </h1>
            <p className="mt-4 text-sm font-medium text-emerald-50/70 max-w-xl leading-relaxed">
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
                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[#059669] transition-colors" title={doc.fileName}>
                    {doc.fileName}
                  </h3>

                  <div className="mt-3 space-y-1.5 border-t border-slate-50 pt-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none truncate" title={doc.serviceName}>
                      {doc.serviceName}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 tracking-wider leading-none">
                      No: <span className="font-extrabold text-[#059669]">{doc.requestNumber}</span>
                    </p>
                  </div>
                </div>

                {/* Bagian Bawah: Tanggal & Aksi */}
                <div className="mt-5 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none mb-1">
                      Tanggal
                    </span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </div>
                  </div>

                  {/* Ukuran Berkas / Keterangan Tipe */}
                  <div className="text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider leading-none block mb-1">
                      Ukuran
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-700 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {doc.source === "generated" ? "PDF Resmi" : formatBytes(doc.fileSize)}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleOpenPreview(doc)}
                    className="flex items-center justify-center gap-2 h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all text-xs font-black shadow-sm"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pratinjau
                  </button>
                  <a
                    href={getFileUrl(doc.filePath)}
                    download={doc.fileName}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 h-9 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all text-xs font-black shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Unduh
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
