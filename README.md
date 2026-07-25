# PTSP Kemenag Barito Utara — Dokumen Arsitektur & Struktur Modularitas Kompleks (Root-to-Leaf)

Dokumen ini berisi pemetaan arsitektur modular lengkap proyek **PTSP Kemenag Barito Utara** sampai ke akar-akar file terkecil, beserta nama fungsi, kegunaan, dan tanggung jawab masing-masing file secara eksplisit.

---

## 🌳 Pohon Arsitektur Proyek Kompleks & Keterangan Fungsi File

```text
ptsp-kemenag/
│
├── 📁 app/                                                # NEXT.JS 16 APP ROUTER (Page Routes & Server Entrypoints)
│   ├── 📄 layout.tsx                                      # RootLayout: Provider Theme, Fonts, & Toaster sonner
│   ├── 📄 globals.css                                     # Tailwind CSS v4 Styles, HSL Variables, Custom Scrollbar
│   ├── 📄 page.tsx                                        # HomePage: Landing Page Utama Publik (Hero, Catalog, Video)
│   ├── 📄 not-found.tsx                                   # NotFound: Tampilan Kustom 404 Halaman Tidak Ditemukan
│   ├── 📄 manifest.ts                                     # Manifest Generator: PWA Web App Manifest Configuration
│   ├── 📄 robots.ts                                       # Robots Generator: Pengaturan Crawling Search Engine SEO
│   ├── 📄 sitemap.ts                                      # Sitemap Generator: Generasi XML Sitemap Otomatis
│   │
│   ├── 📁 admin/                                          # PANEL DASHBOARD ADMINISTRATOR & PETUGAS PTSP
│   │   ├── 📄 layout.tsx                                  # AdminLayout: Guard Role Admin & AdminShell Wrapper
│   │   ├── 📄 loading.tsx                                 # AdminLoading: Skeleton Loading Panel Admin
│   │   ├── 📄 page.tsx                                    # AdminDashboardPage: Ringkasan Statistik, Chart & Trend PTSP
│   │   ├── 📁 _lib/
│   │   │   └── 📄 dashboard-data.ts                       # getAdminDashboardData: Aggregator Data Statistik Dashboard
│   │   ├── 📁 buku-tamu/
│   │   │   ├── 📄 page.tsx                                # AdminGuestBookPage: Monitoring & Filter Rekapitulasi Buku Tamu
│   │   │   └── 📄 error.tsx                               # GuestBookError: Error Boundary Modul Buku Tamu
│   │   ├── 📁 dokumen-hasil/
│   │   │   └── 📄 page.tsx                                # AdminOutputDocsPage: Kelola & Unggah Berkas Hasil Terbitan
│   │   ├── 📁 e-pengaduan/
│   │   │   ├── 📄 page.tsx                                # AdminComplaintsPage: Kelola Laporan Pengaduan Masyarakat
│   │   │   └── 📄 error.tsx                               # ComplaintsError: Error Boundary Modul Pengaduan
│   │   ├── 📁 form-layanan/
│   │   │   └── 📄 page.tsx                                # AdminFormFieldsPage: Form Builder Kolom Isian Dinamis
│   │   ├── 📁 item-layanan/
│   │   │   └── 📄 page.tsx                                # AdminServiceItemsPage: Kelola Jenis Permohonan Layanan
│   │   ├── 📁 janji-temu/
│   │   │   └── 📄 page.tsx                                # AdminAppointmentsPage: Verifikasi & Jadwal Konsultasi Tatap Muka
│   │   ├── 📁 kepegawaian/
│   │   │   ├── 📁 laporan/
│   │   │   │   └── 📄 page.tsx                            # AdminCutiReportsPage: Laporan Rekapitulasi Cuti Tahunan ASN
│   │   │   └── 📁 pegawai/
│   │   │       └── 📄 page.tsx                            # AdminPegawaiMasterPage: Kelola Master Data Pegawai ASN
│   │   ├── 📁 layanan/
│   │   │   ├── 📄 page.tsx                                # AdminServicesPage: Master Seksi & Unit Penyelenggara Layanan
│   │   │   ├── 📄 error.tsx                               # ServicesError: Error Boundary Katalog Layanan Admin
│   │   │   ├── 📁 tambah/
│   │   │   │   └── 📄 page.tsx                            # AdminAddServicePage: Wizard Tambah Unit Layanan Baru
│   │   │   └── 📁 [id]/
│   │   │       ├── 📄 page.tsx                            # AdminServiceDetailPage: Detail Hierarchy Service Items & Fields
│   │   │       └── 📁 edit/
│   │   │           └── 📄 page.tsx                        # AdminEditServicePage: Form Edit Informasi Seksi Layanan
│   │   ├── 📁 layanan-asn/
│   │   │   ├── 📄 page.tsx                                # AdminAsnServicesPage: Kelola Katalog Khusus Layanan ASN
│   │   │   └── 📁 [id]/
│   │   │       └── 📄 page.tsx                            # AdminAsnServiceDetailPage: Detail Konfigurasi Layanan ASN
│   │   ├── 📁 manajemen-pegawai/
│   │   │   └── 📁 pejabat/
│   │   │       ├── 📄 page.tsx                            # AdminPejabatPage: Master Pejabat Penandatangan / Verifikator
│   │   │       └── 📄 form.tsx                            # PejabatFormModal: Form Input/Edit Pejabat Penandatangan
│   │   ├── 📁 pemeliharaan-storage/
│   │   │   └── 📄 page.tsx                                # AdminStorageMaintenancePage: Cleanup & Stat Quota R2 Storage
│   │   ├── 📁 pengajuan/
│   │   │   ├── 📄 page.tsx                                # AdminRequestsPage: Tabel Master Seluruh Permohonan Masuk
│   │   │   └── 📁 [id]/
│   │   │       ├── 📄 page.tsx                            # AdminRequestDetailPage: Lembar Kerja Verifikasi & TTE Berkas
│   │   │       └── 📁 _components/
│   │   │           ├── 📄 admin-detail-header.tsx         # AdminDetailHeader: Sticky Action Bar Status & Disposisi
│   │   │           └── 📄 admin-detail-info-grid.tsx      # AdminDetailInfoGrid: Grid Identitas Pemohon & Ringkasan
│   │   ├── 📁 pengguna/
│   │   │   └── 📄 page.tsx                                # AdminUsersPage: Manajemen User, Verifikasi Role & Permission
│   │   ├── 📁 persyaratan/
│   │   │   └── 📄 page.tsx                                # AdminRequirementsPage: Master Syarat Dokumen Permohonan
│   │   └── 📁 saran-pengaduan/
│   │       └── 📄 page.tsx                                # AdminFeedbacksPage: Rekapitulasi Kritik, Saran & Rating PTSP
│   │
│   ├── 📁 api/                                            # REST API ROUTE HANDLERS (Serverless Backend Endpoints)
│   │   ├── 📁 admin/
│   │   │   ├── 📁 impersonate/
│   │   │   │   └── 📄 route.ts                            # POST ImpersonateUser: Switch Sesi Login Sebagai User Lain
│   │   │   ├── 📁 notifications/
│   │   │   │   └── 📄 route.ts                            # GET/PATCH AdminNotifications: Fetch & Read Status Notifikasi
│   │   │   ├── 📁 search/
│   │   │   │   └── 📄 route.ts                            # GET GlobalAdminSearch: Search Cepat Berkas, User & Layanan
│   │   │   └── 📁 system/
│   │   │       └── 📁 storage-stats/
│   │   │           └── 📄 route.ts                        # GET StorageStats: Penggunaan Quota R2 Storage Realtime
│   │   ├── 📁 buku-tamu/
│   │   │   └── 📄 route.ts                                # POST SubmitGuestBook: Simpan Registrasi Buku Tamu Digital
│   │   ├── 📁 chat/
│   │   │   └── 📄 route.ts                                # POST LiveChatEndpoint: Engine Live Chat & Assistant Bot
│   │   ├── 📁 cron/
│   │   │   ├── 📁 cleanup-documents/
│   │   │   │   └── 📄 route.ts                            # GET CronCleanup: Purge File Temp & Berkas Kadaluarsa
│   │   │   └── 📁 keep-alive/
│   │   │       └── 📄 route.ts                            # GET CronKeepAlive: Ping Serverless Endpoint Agar Tetap Warm
│   │   ├── 📁 e-pengaduan/
│   │   │   └── 📄 route.ts                                # POST SubmitComplaint: Simpan Laporan Pengaduan Masyarakat
│   │   ├── 📁 files/
│   │   │   └── 📄 route.ts                                # GET ServeProtectedFile: Proxy Secure Stream File dari R2
│   │   ├── 📁 health/
│   │   │   └── 📄 route.ts                                # GET HealthCheck: Indicator Server Status & Database Health
│   │   ├── 📁 janji-temu/
│   │   │   └── 📄 route.ts                                # POST SubmitAppointment: Simpan Reservasi Janji Temu
│   │   ├── 📁 requests/
│   │   │   ├── 📄 route.ts                                # POST CreateRequest / GET FilterRequests: Submit & Query Permohonan
│   │   │   ├── 📁 _lib/
│   │   │   │   └── 📄 upload-utils.ts                     # handleRequestUploads: Utility Handler Batch Upload Berkas
│   │   │   └── 📁 [id]/
│   │   │       ├── 📁 answers/
│   │   │       │   └── 📄 route.ts                        # PATCH UpdateAnswers: Update Jawaban Form Permohonan
│   │   │       ├── 📁 delete/
│   │   │       │   └── 📄 route.ts                        # DELETE DeleteRequest: Hapus Permohonan & Berkas Terkait
│   │   │       ├── 📁 documents/
│   │   │       │   └── 📄 route.ts                        # POST AddDocument: Upload Berkas Tambahan/Susulan
│   │   │       └── 📁 update/
│   │   │           └── 📄 route.ts                        # PATCH UpdateStatus: Update Status Disposisi Permohonan
│   │   ├── 📁 revalidate-cuti/
│   │   │   └── 📄 route.ts                                # POST RevalidateCuti: Hitung Ulang Rekapitulasi Sisa Cuti ASN
│   │   └── 📁 seed-pegawai/
│   │       └── 📄 route.ts                                # POST SeedPegawaiData: Seeding Batch Data Profil ASN
│   │
│   ├── 📁 auth/                                           # HANDLER AUTENTIKASI UTAMA
│   │   ├── 📁 callback/
│   │   │   └── 📄 route.ts                                # AuthCallback: Supabase OAuth / MagicLink Callback Handler
│   │   ├── 📁 reset-password/
│   │   │   └── 📄 page.tsx                                # ResetPasswordPage: Form Update Sandi Baru dari Link Email
│   │   └── 📁 verify/
│   │       └── 📄 page.tsx                                # VerifyPage: Halaman Konfirmasi Email Registrasi
│   │
│   ├── 📁 barcode/
│   │   └── 📄 page.tsx                                    # BarcodeScanPage: Portal Pemindai Qr/Barcode Publik
│   │
│   ├── 📁 buku-tamu/                                      # BUKU TAMU DIGITAL PUBLIK
│   │   ├── 📄 page.tsx                                    # GuestBookPage: Form Utama Isian Tamu Kemenag
│   │   ├── 📄 error.tsx                                   # GuestBookPageError: Boundary Error Halaman Buku Tamu
│   │   ├── 📁 barcode/
│   │   │   └── 📄 page.tsx                                # GuestBookBarcodePage: QR Code Buku Tamu untuk Meja Resepsionis
│   │   └── 📁 _components/
│   │       ├── 📄 guest-book-client.tsx                   # GuestBookClient: Wrapper Main Component Buku Tamu
│   │       ├── 📄 guest-book-form.tsx                     # GuestBookForm: Form Registrasi Tamu & Selfie Capture
│   │       ├── 📄 guest-book-list.tsx                     # GuestBookList: List Tamu Hari Ini
│   │       ├── 📄 guest-book-stats.tsx                    # GuestBookStats: Widget Counter Tamu Instansi/Perorangan
│   │       ├── 📄 guest-book-charts.tsx                  # GuestBookCharts: Visualisasi Diagram Kunjungan
│   │       ├── 📄 guest-book-success-modal.tsx            # GuestBookSuccessModal: Popup Konfirmasi Berhasil Isi Tamu
│   │       ├── 📄 types.ts                                # Types Buku Tamu Interface
│   │       └── 📄 utils.ts                                # Format Utility Buku Tamu
│   │
│   ├── 📁 cek-cuti/
│   │   └── 📄 page.tsx                                    # CekCutiPage: Portal Publik Cek Sisa Cuti ASN via NIP
│   │
│   ├── 📁 e-pengaduan/                                    # HALAMAN E-PENGADUAN PUBLIK
│   │   ├── 📄 page.tsx                                    # ComplaintsPage: Form Layanan Pengaduan Masyarakat
│   │   ├── 📄 error.tsx                                   # ComplaintsError: Boundary Error Modul Pengaduan
│   │   ├── 📄 loading.tsx                                 # ComplaintsLoading: Skeleton Loader Pengaduan
│   │   └── 📁 barcode/
│   │       └── 📄 page.tsx                                # ComplaintsBarcodePage: QR Code Pengaduan Publik
│   │
│   ├── 📁 forgot-password/                                # LUPA PASSWORD MULTI-ROLE
│   │   ├── 📄 page.tsx                                    # ForgotPasswordPage: Selector Lupa Password Role
│   │   ├── 📁 pegawai/
│   │   │   └── 📄 page.tsx                                # PegawaiForgotPasswordPage: Form Lupa Sandi Pegawai ASN
│   │   ├── 📁 pemohon/
│   │   │   └── 📄 page.tsx                                # PemohonForgotPasswordPage: Form Lupa Sandi Masyarakat
│   │   └── 📁 petugas/
│   │       └── 📄 page.tsx                                # PetugasForgotPasswordPage: Form Lupa Sandi Petugas/Admin
│   │
│   ├── 📁 janji-temu/                                     # RESERVASI JANJI TEMU PUBLIK
│   │   ├── 📄 page.tsx                                    # AppointmentPage: Form Reservasi Konsultasi Tatap Muka
│   │   └── 📁 _components/
│   │       ├── 📄 appointment-client.tsx                  # AppointmentClient: Wrapper Main Component Janji Temu
│   │       ├── 📄 appointment-form.tsx                    # AppointmentForm: Form Picker Tanggal & Jam Konsultasi
│   │       └── 📄 appointment-success-modal.tsx           # AppointmentSuccessModal: Popup Tiket Booking Janji Temu
│   │
│   ├── 📁 kebijakan-privasi/
│   │   └── 📄 page.tsx                                    # PrivacyPolicyPage: Halaman Dokumen Kebijakan Privasi
│   │
│   ├── 📁 kontak/
│   │   └── 📄 page.tsx                                    # ContactPage: Halaman Kontak, Alamat & Maps Kantor Kemenag
│   │
│   ├── 📁 layanan/                                        # KATALOG LAYANAN PUBLIK
│   │   ├── 📄 page.tsx                                    # PublicServicesPage: Grid Seksi & Layanan Publik
│   │   ├── 📁 barcode/
│   │   │   └── 📄 page.tsx                                # ServiceBarcodePage: QR Code Katalog Layanan
│   │   └── 📁 [slug]/
│   │       ├── 📄 page.tsx                                # ServiceDetailPage: Detail SOP, Syarat & Estimasi Layanan
│   │       └── 📁 barcode/
│   │           └── 📄 page.tsx                            # ServiceItemBarcodePage: QR Code Detail Spesifik Layanan
│   │
│   ├── 📁 layanan-pegawai/                                # KATALOG LAYANAN INTERNAL ASN
│   │   ├── 📄 page.tsx                                    # AsnServicesPage: Grid Katalog Layanan Khusus ASN
│   │   ├── 📁 barcode/
│   │   │   └── 📄 page.tsx                                # AsnServicesBarcodePage: QR Code Layanan ASN
│   │   └── 📁 [slug]/
│   │       ├── 📄 page.tsx                                # AsnServiceDetailPage: Detail Syarat Usulan Kepegawaian
│   │       └── 📁 barcode/
│   │           └── 📄 page.tsx                            # AsnServiceItemBarcodePage: QR Code Detail Layanan ASN
│   │
│   ├── 📁 lengkapi-profil/
│   │   └── 📄 page.tsx                                    # CompleteProfilePage: Form Kelengkapan NIK & Alamat Pengguna
│   │
│   ├── 📁 lengkapi-wa-pegawai/
│   │   └── 📄 page.tsx                                    # CompleteWaPegawaiPage: Form Verifikasi Nomor WA Pegawai ASN
│   │
│   ├── 📁 login/                                          # LOGIN MULTI-ROLE
│   │   ├── 📄 layout.tsx                                  # LoginLayout: Shell Layout Auth Card
│   │   ├── 📄 page.tsx                                    # LoginPage: Halaman Selector Mode Login
│   │   ├── 📁 masyarakat/
│   │   │   ├── 📄 page.tsx                                # MasyarakatLoginPage: Portal Login Pemohon Masyarakat
│   │   │   └── 📁 lengkapi-profil/
│   │   │       └── 📄 page.tsx                            # MasyarakatCompleteProfilePage: Form WA Pemohon Baru
│   │   ├── 📁 pegawai/
│   │   │   ├── 📄 page.tsx                                # PegawaiLoginPage: Portal Login NIP Pegawai ASN
│   │   │   └── 📁 barcode/
│   │   │       └── 📄 page.tsx                            # PegawaiBarcodeLoginPage: Scan Barcode Login Pegawai
│   │   ├── 📁 pemohon/
│   │   │   └── 📁 barcode/
│   │   │       └── 📄 page.tsx                            # PemohonBarcodeLoginPage: Scan Barcode Login Masyarakat
│   │   └── 📁 petugas/
│   │       └── 📄 page.tsx                                # PetugasLoginPage: Portal Login Verifikator & Administrator
│   │
│   ├── 📁 maintenance/
│   │   └── 📄 page.tsx                                    # MaintenancePage: Tampilan Mode Perawatan Sistem
│   │
│   ├── 📁 masyarakat/                                     # PORTAL DASHBOARD MASYARAKAT (DATA-DRIVEN)
│   │   ├── 📄 layout.tsx                                  # MasyarakatLayout: Shell Guard Pemohon Publik
│   │   ├── 📄 loading.tsx                                 # MasyarakatLoading: Skeleton Loader Dashboard
│   │   ├── 📄 page.tsx                                    # MasyarakatDashboardPage: Overview Statistics & Quick Links
│   │   ├── 📁 arsip/
│   │   │   ├── 📄 page.tsx                                # MasyarakatArchivePage: Kelola Berkas Terbitan Pemohon
│   │   │   └── 📁 _components/
│   │   │       └── 📄 archive-client.tsx                  # ArchiveClient: Tabel Download Dokumen Pemohon
│   │   ├── 📁 pengajuan/
│   │   │   ├── 📄 page.tsx                                # MasyarakatRequestsPage: Tabel Riwayat Permohonan Pemohon
│   │   │   ├── 📁 baru/
│   │   │   │   └── 📄 page.tsx                            # MasyarakatNewRequestPage: Form Buat Pengajuan Dinamis
│   │   │   ├── 📁 [id]/
│   │   │   │   ├── 📄 page.tsx                            # MasyarakatRequestDetailPage: Lembar Kerja Permohonan
│   │   │   │   └── 📁 _components/
│   │   │   │       ├── 📄 request-header.tsx              # RequestHeader: Header Ringkasan No. Tiket
│   │   │   │       ├── 📄 request-details-card.tsx        # RequestDetailsCard: Card Detail Layanan
│   │   │   │       ├── 📄 request-answers-card.tsx        # RequestAnswersCard: Tabel Jawaban Isian Form
│   │   │   │       ├── 📄 request-documents-card.tsx      # RequestDocumentsCard: Grid Dokumen Lampiran
│   │   │   │       ├── 📄 output-document-card.tsx        # OutputDocumentCard: Card Download Berkas PTSP
│   │   │   │       ├── 📄 activity-logs-card.tsx          # ActivityLogsCard: Timeline Histori Disposisi
│   │   │   │       └── 📄 revision-section.tsx            # RevisionSection: Form Upload Revisi Dokumen
│   │   │   └── 📁 _components/
│   │   │       ├── 📄 requests-header.tsx                 # RequestsHeader: Filter Status & Search Bar
│   │   │       ├── 📄 requests-desktop-table.tsx          # RequestsDesktopTable: Tabel Pengajuan Desktop View
│   │   │       ├── 📄 requests-mobile-list.tsx            # RequestsMobileList: Card List Pengajuan Mobile View
│   │   │       └── 📄 requests-info-footer.tsx            # RequestsInfoFooter: Informasi Pagination Table
│   │   └── 📁 profil/
│   │       └── 📄 page.tsx                                # MasyarakatProfilePage: Kelola Data Profil Masyarakat
│   │
│   ├── 📁 pegawai/                                        # PORTAL DASHBOARD PEGAWAI / ASN
│   │   ├── 📄 layout.tsx                                  # PegawaiLayout: Shell Guard Pegawai ASN
│   │   ├── 📄 loading.tsx                                 # PegawaiLoading: Skeleton Loader Dashboard ASN
│   │   ├── 📄 page.tsx                                    # PegawaiDashboardPage: Overview Sisa Cuti & Quick Action ASN
│   │   ├── 📁 _lib/
│   │   │   └── 📄 dashboard-data.ts                       # getPegawaiDashboardData: Fetcher Data Sisa Cuti & Status ASN
│   │   ├── 📁 e-lk/                                       # ELEKTRONIK LAPORAN KERJA (E-LK) PEGAWAI
│   │   │   ├── 📁 harian/
│   │   │   │   └── 📄 page.tsx                            # ElkhHarianPage: Form Input Laporan Kerja Harian ASN
│   │   │   ├── 📁 isi/
│   │   │   │   └── 📄 page.tsx                            # ElkhIsiPage: Form Batch Isian Laporan Kegiatan
│   │   │   ├── 📁 rekap/
│   │   │   │   └── 📄 page.tsx                            # ElkhRekapPage: Rekapitulasi Laporan Kerja Bulanan
│   │   │   ├── 📁 upload/
│   │   │   │   └── 📄 page.tsx                            # ElkhUploadPage: Upload Lampiran Berkas Laporan Kerja
│   │   │   └── 📁 riwayat/
│   │   │       ├── 📄 page.tsx                            # ElkhRiwayatPage: Tabel Histori Laporan Kerja ASN
│   │   │       └── 📁 components/
│   │   │           └── 📄 delete-button.tsx               # DeleteElkhButton: Button Hapus Baris Laporan Kerja
│   │   ├── 📁 layanan/                                    # PORTAL AJUKAN LAYANAN INTERNAL ASN
│   │   │   ├── 📁 ajukan/
│   │   │   │   ├── 📄 page.tsx                            # PegawaiServicesPage: Grid 8 Layanan Khusus Kepegawaian
│   │   │   │   ├── 📁 baru/
│   │   │   │   │   └── 📄 page.tsx                        # PegawaiNewRequestRouter: Form Request Router Pegawai
│   │   │   │   └── 📁 [slug]/
│   │   │   │       └── 📄 page.tsx                        # PegawaiServiceHandlerPage: Handler Cuti & Usul Pensiun
│   │   │   ├── 📁 riwayat/
│   │   │   │   ├── 📄 page.tsx                            # PegawaiHistoryPage: Tabel Riwayat Permohonan Usulan ASN
│   │   │   │   ├── 📁 [id]/
│   │   │   │   │   └── 📄 page.tsx                        # PegawaiHistoryDetailPage: Detail Progress Usulan ASN
│   │   │   │   └── 📁 _components/
│   │   │   │       └── 📄 riwayat-table.tsx               # RiwayatTable: Tabel Render Status Usulan Cuti/ASN
│   │   │   └── 📁 verifikasi/
│   │   │       ├── 📄 page.tsx                            # PegawaiVerifikasiPage: Inbox Verifikasi Atasan Langsung
│   │   │       └── 📁 components/
│   │   │           ├── 📄 verifikasi-client.tsx           # VerifikasiClient: Wrapper Client Inbox Disposisi Atasan
│   │   │           └── 📄 verifikasi-modal.tsx            # VerifikasiModal: Modal Approve/Reject Usulan Cuti Bawahan
│   │   └── 📁 profil/
│   │       ├── 📄 page.tsx                                # PegawaiProfilePage: Detail Biodata NIP & Jabatan ASN
│   │       └── 📄 profile-client.tsx                      # ProfileClient: Client Form Update Profil & Password ASN
│   │
│   ├── 📁 register/
│   │   ├── 📄 page.tsx                                    # RegisterPage: Form Pendaftaran Akun Pemohon Publik
│   │   └── 📁 petugas/
│   │       └── 📄 page.tsx                                # RegisterPetugasPage: Form Registrasi Petugas/Verifikator Baru
│   │
│   ├── 📁 styles/                                         # TAILWIND CSS STYLES MODULAR
│   │   ├── 📄 animations.css                              # Keyframes & Class Animasi Framer Motion / CSS
│   │   ├── 📄 base.css                                    # Base HTML Element Styling Reset
│   │   ├── 📄 components.css                              # Custom Class Reusable Component Styles
│   │   ├── 📄 theme.css                                   # Variable Tema HSL Light & Dark Mode
│   │   └── 📄 utilities.css                               # Utility Custom Classes (Glassmorphism, Scrollbar)
│   │
│   ├── 📁 syarat-ketentuan/
│   │   └── 📄 page.tsx                                    # TermsPage: Halaman Legalitas Syarat & Ketentuan PTSP
│   │
│   └── 📁 track/                                          # FITUR LACAK PERMOHONAN PUBLIK
│       ├── 📄 page.tsx                                    # TrackPage: Form Pencarian Status via No. Tiket / No. WA
│       ├── 📁 barcode/
│       │   └── 📄 page.tsx                                # TrackBarcodePage: Scan Barcode Lembar Bukti Pengajuan
│       └── 📁 _components/
│           ├── 📄 track-header.tsx                        # TrackHeader: Header Title Fitur Lacak Status
│           ├── 📄 track-search-form.tsx                   # TrackSearchForm: Form Input No Tiket & No WA
│           ├── 📄 track-result-card.tsx                   # TrackResultCard: Card Informasi Detail Status Permohonan
│           ├── 📄 track-empty-state.tsx                   # TrackEmptyState: Tampilan Kosong Belum Mencari
│           └── 📄 track-error-state.tsx                   # TrackErrorState: Tampilan Not Found Tiket Tidak Ada
│
├── 📁 components/                                         # MODULAR FRONTEND UI COMPONENTS LAYER
│   ├── 📄 site-header-client.tsx                          # SiteHeaderClient: Responsive Topbar Navigation Bar Utama
│   ├── 📄 global-search-modal.tsx                         # GlobalSearchModal: Search Modal Cepat (Ctrl+K / Cmd+K)
│   │
│   ├── 📁 admin/                                          # KOMPONEN INTEGRASI PANEL ADMINISTRATOR
│   │   ├── 📄 admin-shell.tsx                             # AdminShell: Layout Container Dashboard Admin
│   │   ├── 📄 admin-sidebar.tsx                           # AdminSidebar: Sidebar Drawer Panel Admin
│   │   ├── 📄 admin-topbar.tsx                            # AdminTopbar: Header Ringkasan Profile Admin & Notifikasi
│   │   ├── 📄 delete-request-button.tsx                   # DeleteRequestButton: Trigger Modal Hapus Permohonan Admin
│   │   ├── 📄 export-button.tsx                           # ExportButton: Trigger Export Excel/PDF Master Table
│   │   ├── 📄 report-export-button.tsx                    # ReportExportButton: Trigger Export Laporan Bulanan PTSP
│   │   ├── 📄 page-header.tsx                             # PageHeader: Header Standar Halaman Admin
│   │   ├── 📄 system-health-badge.tsx                     # SystemHealthBadge: Indikator Koneksi DB & Storage R2
│   │   ├── 📄 upload-result-button.tsx                    # UploadResultButton: Modal Upload Berkas Hasil Terbitan PTSP
│   │   ├── 📁 buku-tamu/
│   │   │   └── 📄 buku-tamu-client.tsx                    # BukuTamuClient: Tabel Client Data Pengunjung Admin
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 admin-alert-banner.tsx                  # AdminAlertBanner: Banner Peringatan Verifikasi Pending
│   │   │   ├── 📄 admin-analytics-wrapper.tsx             # AdminAnalyticsWrapper: Wrapper Chart Visualisasi Analytics
│   │   │   ├── 📄 admin-dashboard-metrics.tsx             # AdminDashboardMetrics: Card Metric Totals & Counter
│   │   │   ├── 📄 admin-quick-links.tsx                   # AdminQuickLinks: Button Pintasan Aksi Cepat Admin
│   │   │   ├── 📄 admin-service-analytics.tsx             # AdminServiceAnalytics: Ranking Layanan Paling Populer
│   │   │   ├── 📄 admin-status-progress.tsx               # AdminStatusProgress: Progress Bar Ratio Disposisi Berkas
│   │   │   ├── 📄 admin-trend-analytics.tsx               # AdminTrendAnalytics: Chart Trend Permohonan per Bulan
│   │   │   ├── 📄 ai-chat-toggle.tsx                      # AiChatToggle: Trigger Widget Assistant AI Admin
│   │   │   ├── 📄 dashboard-realtime-sync.tsx             # DashboardRealtimeSync: Tracker WebSocket Signal Realtime
│   │   │   ├── 📄 maintenance-toggle.tsx                  # MaintenanceToggle: Switch On/Off Mode Maintenance Website
│   │   │   ├── 📄 storage-cleanup-card.tsx                # StorageCleanupCard: Card Trigger Purge Storage Temp R2
│   │   │   └── 📄 storage-quota-grid.tsx                  # StorageQuotaGrid: Bar Gauge Kapasitas Cloudflare R2
│   │   ├── 📁 data-cuti/
│   │   │   ├── 📄 data-cuti-client.tsx                    # DataCutiClient: Tabel Master Sisa Cuti Pegawai ASN
│   │   │   ├── 📄 data-cuti-form.tsx                      # DataCutiForm: Form Input Manual Kuota Cuti ASN
│   │   │   ├── 📄 data-cuti-pagination.tsx                # DataCutiPagination: Pagination Controls Data Cuti
│   │   │   └── 📄 import-cuti-modal.tsx                   # ImportCutiModal: Import Excel/CSV Kuota Cuti ASN Batch
│   │   ├── 📁 dokumen-hasil/
│   │   │   ├── 📄 dokumen-hasil-client.tsx                # DokumenHasilClient: Tabel Master File Terbitan PTSP
│   │   │   ├── 📄 dokumen-hasil-filter.tsx                # DokumenHasilFilter: Filter Seksi & Tanggal Terbit
│   │   │   └── 📄 dokumen-hasil-table.tsx                 # DokumenHasilTable: Table Render Berkas Terbitan
│   │   ├── 📁 e-pengaduan/
│   │   │   └── 📄 e-pengaduan-client.tsx                  # EPengaduanClient: Tabel Pengaduan Masyarakat Admin
│   │   ├── 📁 form-layanan/
│   │   │   ├── 📄 form-layanan-client.tsx                 # FormLayananClient: Tabel Field Isian Dinamis Layanan
│   │   │   ├── 📄 add-edit-field-modal.tsx                # AddEditFieldModal: Modal Tambah/Edit Field Form Isian
│   │   │   ├── 📄 delete-field-modal.tsx                  # DeleteFieldModal: Modal Konfirmasi Hapus Field Form Isian
│   │   │   ├── 📄 form-field-table.tsx                    # FormFieldTable: Table Display Field List Per-Item Layanan
│   │   │   └── 📁 _components/
│   │   │       └── 📄 field-form-content.tsx              # FieldFormContent: Inputs Dynamic Type Option Controls
│   │   ├── 📁 item-layanan/
│   │   │   ├── 📄 item-layanan-client.tsx                 # ItemLayananClient: Tabel Master Jenis Permohonan Layanan
│   │   │   ├── 📄 add-edit-item-modal.tsx                 # AddEditItemModal: Modal Tambah/Edit Item Layanan
│   │   │   ├── 📄 delete-item-modal.tsx                   # DeleteItemModal: Modal Konfirmasi Hapus Item Layanan
│   │   │   └── 📄 item-layanan-table.tsx                  # ItemLayananTable: Table View Item Layanan & Estimasi Waktu
│   │   ├── 📁 janji-temu/
│   │   │   └── 📄 janji-temu-client.tsx                   # JanjiTemuClient: Tabel Verification & Disposisi Janji Temu
│   │   ├── 📁 kepegawaian/
│   │   │   ├── 📄 kepegawaian-tabs.tsx                    # KepegawaianTabs: Navigation Tabs Data Pegawai & Laporan
│   │   │   ├── 📄 laporan-manager.tsx                     # LaporanManager: Manager Laporan Cuti Tahunan ASN
│   │   │   └── 📄 pegawai-manager.tsx                     # PegawaiManager: Manager Data Master Profil ASN Kemenag
│   │   ├── 📁 layanan/
│   │   │   ├── 📄 layanan-client.tsx                      # LayananClient: Master Seksi / Unit Penyelenggara Layanan
│   │   │   ├── 📄 layanan-table.tsx                       # LayananTable: Table View Seksi & Jumlah Layanan
│   │   │   ├── 📄 add-service-form.tsx                    # AddServiceForm: Form Tambah Seksi Layanan Baru
│   │   │   ├── 📄 edit-service-form.tsx                   # EditServiceForm: Form Edit Informasi Seksi Layanan
│   │   │   ├── 📄 add-edit-service-modal.tsx              # AddEditServiceModal: Modal Popup Editor Seksi Layanan
│   │   │   ├── 📄 delete-service-modal.tsx                # DeleteServiceModal: Modal Konfirmasi Hapus Seksi Layanan
│   │   │   ├── 📄 service-wizard-client.tsx               # ServiceWizardClient: Step Wizard Builder Katalog Layanan
│   │   │   └── 📁 wizard/
│   │   │       ├── 📄 floating-manage-fields-modal.tsx    # FloatingManageFieldsModal: Modal Floating Field Editor
│   │   │       ├── 📄 wizard-field-section.tsx            # WizardFieldSection: Step 2 Wizard Editor Field Isian
│   │   │       ├── 📄 wizard-item-list.tsx                # WizardItemList: List Renderer Items di Step Wizard
│   │   │       ├── 📄 wizard-item-row.tsx                 # WizardItemRow: Draggable Row Element Item Layanan
│   │   │       └── 📄 wizard-requirement-section.tsx     # WizardRequirementSection: Step 3 Wizard Editor Syarat Dokumen
│   │   ├── 📁 master-cuti/
│   │   │   ├── 📄 master-cuti-client.tsx                  # MasterCutiClient: Master Pengaturan Jenis Cuti ASN
│   │   │   └── 📄 form-modal.tsx                          # FormModal: Modal Input Jenis Cuti & Kuota Maksimal
│   │   ├── 📁 pengajuan/
│   │   │   ├── 📄 request-table.tsx                       # RequestTable: Tabel Permohonan Berkas Admin dengan Filter Status
│   │   │   ├── 📄 request-filter.tsx                      # RequestFilter: Bar Filter Seksi, Tanggal & Keyword Search
│   │   │   ├── 📄 admin-pagination.tsx                    # AdminPagination: Table Pagination Controls Dashboard
│   │   │   ├── 📄 form-answers-card.tsx                   # FormAnswersCard: Card Tampilan Isian Formulir Pemohon
│   │   │   ├── 📄 request-documents-card.tsx              # RequestDocumentsCard: Grid File Lampiran Pemohon & Viewer
│   │   │   ├── 📄 result-document-card.tsx                # ResultDocumentCard: Card File Berkas Terbitan PTSP (Surat/SK)
│   │   │   ├── 📄 history-timeline-card.tsx               # HistoryTimelineCard: Timeline Disposisi & Track Log Admin
│   │   │   ├── 📄 review-action-card.tsx                  # ReviewActionCard: Sheet Form Verifikasi, Disposisi & TTE
│   │   │   ├── 📄 activity-log-actions.tsx                # ActivityLogActions: Log Histori Aktivitas Petugas
│   │   │   ├── 📄 surat-pelaksanaan-cuti-modal.tsx        # SuratPelaksanaanCutiModal: Generator PDF Surat Cuti ASN
│   │   │   └── 📄 surat-pelaksanaan-cuti-document.tsx     # SuratPelaksanaanCutiDocument: Template PDF Surat Cuti
│   │   ├── 📁 pengguna/
│   │   │   ├── 📄 pengguna-client.tsx                     # PenggunaClient: Tabel Master Pengguna System & Role Access
│   │   │   ├── 📄 pengguna-table.tsx                      # PenggunaTable: Table Render Data User Pemohon & Petugas
│   │   │   ├── 📄 user-table-header.tsx                   # UserTableHeader: Filter Role & Search User
│   │   │   ├── 📄 user-table-content.tsx                  # UserTableContent: Row Elements Table Pengguna
│   │   │   ├── 📄 user-table-pagination.tsx               # UserTablePagination: Pagination Control Table User
│   │   │   ├── 📄 pemohon-table.tsx                       # PemohonTable: Tabel Khusus Akun Masyarakat Pemohon
│   │   │   ├── 📄 pending-verification-section.tsx        # PendingVerificationSection: List Petugas Baru Perlu Approval
│   │   │   ├── 📄 pending-user-card.tsx                   # PendingUserCard: Card Petugas Baru Menunggu Verifikasi
│   │   │   ├── 📄 super-admin-card.tsx                    # SuperAdminCard: Card Informasi Super Admin Email
│   │   │   ├── 📄 user-stat-cards.tsx                     # UserStatCards: Metric Total Masyarakat, Petugas & ASN
│   │   │   ├── 📄 edit-user-modal.tsx                     # EditUserModal: Modal Edit Profile & Role Pengguna
│   │   │   ├── 📄 delete-user-modal.tsx                   # DeleteUserModal: Modal Konfirmasi Hapus Akun User
│   │   │   ├── 📄 user-permissions-manager.tsx            # UserPermissionsManager: Custom Permission Granular Manager
│   │   │   ├── 📄 role-badge.tsx                          # RoleBadge: Badge Warna Label Role App (`super_admin`, dll)
│   │   │   └── 📄 password-cell.tsx                       # PasswordCell: Masking Cell Password Display
│   │   ├── 📁 persyaratan/
│   │   │   ├── 📄 persyaratan-client.tsx                  # PersyaratanClient: Tabel Master Persyaratan Dokumen
│   │   │   ├── 📄 requirement-table.tsx                   # RequirementTable: Table View Dokumen Wajib Per-Item Layanan
│   │   │   ├── 📄 add-edit-requirement-modal.tsx          # AddEditRequirementModal: Modal Tambah/Edit Syarat Dokumen
│   │   │   └── 📄 delete-requirement-modal.tsx            # DeleteRequirementModal: Modal Konfirmasi Hapus Syarat Dokumen
│   │   ├── 📁 profile/
│   │   │   ├── 📄 admin-user-dropdown.tsx                 # AdminUserDropdown: Menu Dropdown Profile Topbar Admin
│   │   │   ├── 📄 edit-profile-modal.tsx                  # EditProfileModal: Modal Edit Data Diri Administrator
│   │   │   ├── 📄 change-password-modal.tsx               # ChangePasswordModal: Modal Ubah Password Akun Admin
│   │   │   ├── 📄 impersonate-modal.tsx                   # ImpersonateModal: Modal Fitur Login Sebagai User Lain
│   │   │   └── 📄 password-strength.tsx                   # PasswordStrength: Indicator Kekuatan Kata Sandi
│   │   └── 📁 saran-pengaduan/
│   │       └── 📄 saran-pengaduan-client.tsx              # SaranPengaduanClient: Tabel Feedback & Pengaduan Publik
│   │
│   ├── 📁 auth/                                           # KOMPONEN FRONTEND AUTENTIKASI
│   │   ├── 📄 login-form-by-role.tsx                      # LoginFormByRole: Tabbed Form Login (Masyarakat, Pegawai, Petugas)
│   │   ├── 📄 register-form.tsx                           # RegisterForm: Form Pendaftaran Akun Pemohon Publik
│   │   ├── 📄 register-petugas-form.tsx                   # RegisterPetugasForm: Form Registrasi Petugas PTSP Baru
│   │   ├── 📄 complete-profile-form.tsx                   # CompleteProfileForm: Form Wajib Lengkapi Data Pengguna Baru
│   │   ├── 📄 pemohon-lengkapi-wa-form.tsx                # PemohonLengkapiWaForm: Form Verifikasi Nomor WA Pemohon
│   │   ├── 📄 pegawai-lengkapi-wa-form.tsx                # PegawaiLengkapiWaForm: Form Verifikasi Nomor WA Pegawai ASN
│   │   ├── 📄 pemohon-reset-form.tsx                      # PemohonResetForm: Form Minta Reset Sandi Pemohon
│   │   ├── 📄 pegawai-reset-form.tsx                      # PegawaiResetForm: Form Minta Reset Sandi Pegawai ASN
│   │   ├── 📄 petugas-reset-form.tsx                      # PetugasResetForm: Form Minta Reset Sandi Petugas/Admin
│   │   ├── 📄 reset-password-form.tsx                     # ResetPasswordForm: Form Setel Password Baru dari Link Email
│   │   ├── 📄 sign-out-button.tsx                         # SignOutButton: Trigger Keluar Sesi Akun
│   │   ├── 📄 auth-motion-wrapper.tsx                     # AuthMotionWrapper: Animated Wrapper Container Card Auth
│   │   ├── 📄 auth-redirect-listener.tsx                  # AuthRedirectListener: Router Listener Redirect Pasca Login
│   │   └── 📁 _components/
│   │       └── 📄 login-turnstile.tsx                     # LoginTurnstile: Captcha Cloudflare Turnstile Bot Guard
│   │
│   ├── 📁 barcode/
│   │   └── 📄 barcode-display.tsx                         # BarcodeDisplay: Canvas Renderer Generator QR Code & Barcode
│   │
│   ├── 📁 common/
│   │   ├── 📄 PageBanner.tsx                              # PageBanner: Banner Header Halaman PTSP (Mandatory standard)
│   │   └── 📄 MotionDiv.tsx                               # MotionDiv: Framer Motion Animation Container Wrapper
│   │
│   ├── 📁 contact/
│   │   ├── 📄 contact-header.tsx                          # ContactHeader: Header Section Halaman Kontak Kantor
│   │   ├── 📄 contact-info-cards.tsx                      # ContactInfoCards: Card Informasi Alamat, Jam Buka & Telepon
│   │   ├── 📄 contact-channels.tsx                        # ContactChannels: Button Link WA Center & Media Sosial
│   │   └── 📄 contact-faq.tsx                             # ContactFaq: Accordion Pertanyaan Sering Diajukan Publik
│   │
│   ├── 📁 dashboard/                                      # KOMPONEN SHELL PORTAL USER
│   │   ├── 📄 sidebar.tsx                                 # Sidebar: Navigation Drawer (Desktop & Mobile Responsive)
│   │   ├── 📄 dashboard-faq.tsx                           # DashboardFaq: Accordion Bantuan & Pertanyaan Pemohon
│   │   ├── 📄 edit-answers-dialog.tsx                     # EditAnswersDialog: Modal Edit Isian Permohonan Pemohon
│   │   ├── 📄 delete-request-button.tsx                   # DeleteRequestButton: Trigger Hapus Permohonan Pemohon
│   │   └── 📁 _components/
│   │       ├── 📄 nav-link.tsx                            # NavLink: Button Link Menu Sidebar Active Indicator
│   │       └── 📄 sidebar-footer.tsx                      # SidebarFooter: Profile Card User & Trigger Sign Out
│   │
│   ├── 📁 features/
│   │   └── 📁 chat/
│   │       ├── 📄 ChatWidget.tsx                          # ChatWidget: Floating Button Widget Live Chat CS
│   │       └── 📄 chat-widget-client.tsx                  # ChatWidgetClient: Interface Chat Box & Message Stream
│   │
│   ├── 📁 forms/                                          # MODUL FORMULIR APLIKASI UTAMA
│   │   ├── 📄 new-request-form.tsx                        # NewRequestForm: Form Pengajuan Utama Masyarakat (Data-Driven)
│   │   ├── 📁 pegawai/                                    # Layanan & Formulir Khusus Pegawai ASN
│   │   │   ├── 📄 pegawai-usul-cuti-form.tsx                  # PegawaiUsulCutiForm: Form Usulan Cuti & Layanan Internal ASN
│   │   │   └── 📄 pegawai-usul-pensiun-form.tsx               # PegawaiUsulPensiunForm: Form Usulan Pensiun Pegawai ASN
│   │   ├── 📄 request-service-selection.tsx               # RequestServiceSelection: Component Selector Unit & Jenis Layanan
│   │   ├── 📄 request-form-fields.tsx                     # RequestFormFields: Dynamic Field Renderer Isian Form
│   │   ├── 📄 request-requirement-upload.tsx               # RequestRequirementUpload: Upload Zone & 90vw Preview Modal
│   │   ├── 📄 edit-request-form.tsx                       # EditRequestForm: Form Perbaikan/Revisi Pengajuan Pemohon
│   │   ├── 📄 upload-revision-form.tsx                    # UploadRevisionForm: Form Upload Berkas Susulan/Revisi
│   │   └── 📁 _components/
│   │       ├── 📄 masyarakat-request-confirmation.tsx     # MasyarakatRequestConfirmation: Submit Box Khusus Masyarakat
│   │       ├── 📄 pegawai-request-confirmation.tsx        # PegawaiRequestConfirmation: Submit Box Khusus Pegawai ASN
│   │       ├── 📄 edit-form-fields.tsx                    # EditFormFields: Sub-Form Edit Isian Data Pengajuan
│   │       └── 📄 edit-form-documents.tsx                 # EditFormDocuments: Sub-Form Edit Re-upload Dokumen Revisi
│   │
│   ├── 📁 header/
│   │   ├── 📄 header-controls.tsx                         # HeaderControls: Button Switch Dark Mode & Language Selector
│   │   ├── 📄 login-dropdown.tsx                          # LoginDropdown: Menu Dropdown Selector Role Login Topbar
│   │   └── 📄 mobile-nav.tsx                              # MobileNav: Mobile Drawer Menu Navigasi Header
│   │
│   ├── 📁 home/                                           # KOMPONEN SEKSI LANDING PAGE PUBLIK
│   │   ├── 📄 hero.tsx                                    # Hero: Section Hero Banner Utama PTSP Barito Utara
│   │   ├── 📄 sambutan.tsx                                # Sambutan: Section Sambutan Kepala Kantor (Jargon HAPAKAT)
│   │   ├── 📄 service-catalog.tsx                         # ServiceCatalog: Grid Katalog Layanan Populer Publik
│   │   ├── 📄 video-profile.tsx                           # VideoProfile: Embed Player Video Youtube Profil PTSP
│   │   ├── 📄 saran-pengaduan.tsx                         # SaranPengaduan: Widget Pengaduan Layanan & Rating PTSP
│   │   ├── 📄 alur-pengajuan-mobile.tsx                   # AlurPengajuanMobile: Step Diagram Alur Layanan Mobile View
│   │   ├── 📄 banner-modal.tsx                            # BannerModal: Modal Popup Pengumuman / Info Penting
│   │   ├── 📄 faq.tsx                                     # Faq: Accordion FAQ Publik Landing Page
│   │   ├── 📄 how-it-works.tsx                            # HowItWorks: Seksi Cara Pengajuan Layanan PTSP
│   │   ├── 📄 quick-access.tsx                            # QuickAccess: Shortcut Button Layanan Cepat
│   │   └── 📄 track-section.tsx                           # TrackSection: Seksi Form Cepat Lacak Status Permohonan
│   │
│   ├── 📁 layout/
│   │   ├── 📄 conditional-shell.tsx                       # ConditionalShell: Gatekeeper Hide Header/Footer di Dashboard
│   │   ├── 📄 header.tsx                                  # Header: Topbar Navigation Bar Desktop & Mobile
│   │   ├── 📄 footer.tsx                                  # Footer: Footer Informasi Kantor & Copyright HAPAKAT
│   │   └── 📄 framer-wrapper.tsx                          # FramerWrapper: Animation Motion Transition Page Wrapper
│   │
│   ├── 📁 pegawai/                                        # KOMPONEN DASHBOARD PEGAWAI ASN
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 pegawai-approval-alert.tsx              # PegawaiApprovalAlert: Alert Peringatan Usulan Cuti Perlu Disposisi
│   │   │   ├── 📄 pegawai-dashboard-metrics.tsx           # PegawaiDashboardMetrics: Card Metric Sisa Cuti N, N-1, N-2
│   │   │   ├── 📄 pegawai-quick-access.tsx                # PegawaiQuickAccess: Button Shortcut Layanan Internal ASN
│   │   │   └── 📄 pegawai-recent-activity.tsx             # PegawaiRecentActivity: List Pengajuan Cuti & Usulan Terakhir
│   │   └── 📁 e-lk/
│   │       ├── 📄 lkh-form.tsx                            # LkhForm: Form Isian Laporan Kerja Harian ASN
│   │       ├── 📄 rekap-filter.tsx                        # RekapFilter: Filter Bulan & Tahun Laporan Kerja
│   │       ├── 📄 upload-form.tsx                         # UploadForm: Form Upload Lampiran Berkas E-LK
│   │       └── 📄 cetak-draf-button.tsx                   # CetakDrafButton: Button Cetak PDF Laporan Kerja Harian
│   │
│   ├── 📁 services/
│   │   ├── 📄 services-grid.tsx                           # ServicesGrid: Grid Katalog Layanan Publik Halaman Depan
│   │   ├── 📄 services-grid-pegawai.tsx                   # ServicesGridPegawai: Grid Katalog Layanan Khusus ASN
│   │   ├── 📄 service-items-accordion.tsx                 # ServiceItemsAccordion: Accordion List Jenis Permohonan Layanan
│   │   └── 📄 services-filter.tsx                         # ServicesFilter: Search Bar & Filter Seksi Layanan
│   │
│   ├── 📁 track/
│   │   ├── 📄 track-hero.tsx                              # TrackHero: Hero Section Halaman Lacak Permohonan
│   │   ├── 📄 track-status-card.tsx                       # TrackStatusCard: Card Status Tracking Progress Permohonan
│   │   ├── 📄 track-activity-logs.tsx                     # TrackActivityLogs: Timeline Histori Disposisi Permohonan
│   │   ├── 📄 track-realtime-sync.tsx                     # TrackRealtimeSync: Tracker Signal Realtime Progress
│   │   ├── 📄 track-features.tsx                          # TrackFeatures: Info Fitur Keunggulan Tracking System
│   │   └── 📄 track-not-found.tsx                         # TrackNotFound: State Berkas Tidak Ditemukan
│   │
│   ├── 📁 ui/                                             # DESIGN SYSTEM COMPONENT PRIMITIVES
│   │   ├── 📄 alert-dialog.tsx                            # AlertDialog: Modal Konfirmasi Bahaya / Action Modal
│   │   ├── 📄 auto-refresh.tsx                            # AutoRefresh: Polling Tracker Interval Data Update
│   │   ├── 📄 avatar-cropper.tsx                          # AvatarCropper: Modal Crop Foto Profil User (easy-crop)
│   │   ├── 📄 badge.tsx                                   # Badge: Badge Element Indicator Color Variants
│   │   ├── 📄 button.tsx                                  # Button: Custom Button Element with Loading State
│   │   ├── 📄 card.tsx                                    # Card: Flexible Card Container Element
│   │   ├── 📄 copy-button.tsx                             # CopyButton: Button Copy Text to Clipboard with Toast
│   │   ├── 📄 cuti-draft-button.tsx                       # CutiDraftButton: Button Preview Draft Surat Cuti ASN
│   │   ├── 📄 dialog.tsx                                  # Dialog: Modal Dialog Base Overlay Container
│   │   ├── 📄 document-preview-modal.tsx                  # DocumentPreviewModal: Modal Viewer Document Fullscreen
│   │   ├── 📄 draft-cuti-document.tsx                     # DraftCutiDocument: Printable PDF Template Surat Cuti
│   │   ├── 📄 draft-cuti-modal.tsx                        # DraftCutiModal: Modal Viewer Generator Draft Surat Cuti
│   │   ├── 📄 field.tsx                                   # Field: Label Wrapper Element with Required Indicator
│   │   ├── 📄 input.tsx                                   # Input: Custom Text Input Element with Dark Mode
│   │   ├── 📄 modern-date-picker.tsx                      # ModernDatePicker: Single Datepicker Selector
│   │   ├── 📄 modern-month-picker.tsx                     # ModernMonthPicker: Month & Year Selector for Reports
│   │   ├── 📄 modern-multi-date-picker.tsx                # ModernMultiDatePicker: Datepicker Range Bahasa Indonesia
│   │   ├── 📄 modern-select.tsx                           # ModernSelect: Custom Searchable Dropdown Select
│   │   ├── 📄 modern-time-picker.tsx                      # ModernTimePicker: Hour & Minute Time Selector
│   │   ├── 📄 page-transition.tsx                         # PageTransition: Framer Motion Page Fade Transition Wrapper
│   │   ├── 📄 password-input.tsx                          # PasswordInput: Input Password with Eye Toggle Visibility
│   │   ├── 📄 password-strength.tsx                       # PasswordStrength: Indicator Kekuatan Sandi Realtime
│   │   ├── 📄 preview-button.tsx                          # PreviewButton: Button Trigger Document Viewer
│   │   ├── 📄 realtime-sync.tsx                           # RealtimeSync: Tracker Signal Client Websocket
│   │   ├── 📄 select.tsx                                  # Select: Base Dropdown Element Primitive
│   │   ├── 📄 signature-pad.tsx                           # SignaturePad: Canvas Element Gambar Tanda Tangan Digital
│   │   ├── 📄 Skeleton.tsx                                # Skeleton: Animated Loader Placeholder Element
│   │   └── 📄 textarea.tsx                                # Textarea: Custom Multi-line Input Element
│   │
│   └── 📁 user/
│       └── 📄 profile-form.tsx                            # ProfileForm: Form Pengaturan Profile & Upload Avatar User
│
├── 📁 lib/                                                # BACKEND CORE ENGINE & DATA ACCESS LAYER (Authoritative Core)
│   ├── 📄 queries.ts                                      # getPublicServiceCatalog, getServiceBySlug, getServiceCatalog
│   ├── 📄 auth.ts                                         # requireAuth, requireAdmin, isSuperAdmin, getCurrentProfile
│   ├── 📄 r2.ts                                           # uploadToR2, deleteFromR2, getR2SignedUrl (Bucket: data-ptsp)
│   ├── 📄 google-drive.ts                                 # uploadToGoogleDrive: Backup Engine Google Drive Storage
│   ├── 📄 whatsapp.ts                                     # sendWhatsAppNotification: Webhook Engine Notifikasi WA
│   ├── 📄 constants.ts                                    # SUPER_ADMIN_EMAIL, ADMIN_ROLES, getRoleLabel, isAdminRole
│   ├── 📄 rate-limiter.ts                                 # checkRateLimit: Memory Rate Limiter Anti-Spam Guard
│   ├── 📄 turnstile.ts                                    # verifyTurnstileToken: Server Validation Turnstile Captcha
│   ├── 📄 image-compression.ts                            # compressImageIfNeeded: Utility Auto Compress Gambar > 800KB
│   ├── 📄 pdf-compression.ts                              # processPdfFile: Utility Compress & Optimization File PDF
│   ├── 📄 request-number.ts                               # generateRequestNumber: Auto Tiket (MDR, CUT, ASN, PUB)
│   ├── 📄 audit.ts                                        # createAuditLog: Utility Recording Log Aktivitas Sistem
│   ├── 📄 navigation.ts                                   # getSidebarNavItems: Builder List Menu Sidebar per Role User
│   ├── 📄 utils.ts                                        # sanitizeFilename, formatRupiah, formatDateID, cn Utility
│   ├── 📄 env.ts                                          # Environment Variable Schema Validator
│   │
│   ├── 📁 actions/                                        # NEXT.JS SERVER ACTIONS LAYER (Mutations Engine)
│   │   ├── 📁 admin/
│   │   │   ├── 📄 admin-feedbacks.ts                      # deleteFeedbackAction: Hapus Feedback Pengaduan
│   │   │   ├── 📄 admin-fields.ts                         # createFieldAction, updateFieldAction, deleteFieldAction
│   │   │   ├── 📄 admin-items.ts                          # createItemAction, updateItemAction, deleteItemAction
│   │   │   ├── 📄 admin-master.ts                         # updateMasterOptionAction: Kelola Master Option
│   │   │   ├── 📄 admin-profile.ts                        # updateAdminProfileAction: Update Profile Admin
│   │   │   ├── 📄 admin-requests.ts                       # updateRequestStatusAction: Approve/Reject/Disposisi Berkas
│   │   │   ├── 📄 admin-requirements.ts                   # createRequirementAction, updateRequirementAction, deleteRequirementAction
│   │   │   ├── 📄 admin-users.ts                          # verifyUserAction, deleteUserAction, updateUserRoleAction
│   │   │   ├── 📄 admin-visitations.ts                    # updateVisitationStatusAction: Disposisi Janji Temu
│   │   │   └── 📄 data-cuti.ts                            # upsertDataCutiAction, importDataCutiBatchAction
│   │   ├── 📁 auth/
│   │   │   ├── 📄 login.ts                                # loginAction: Authenticate User via Supabase Auth
│   │   │   ├── 📄 register-pemohon.ts                     # registerPemohonAction: Registrasi Akun Masyarakat Baru
│   │   │   ├── 📄 register-petugas.ts                     # registerPetugasAction: Registrasi Petugas Perlu Approval
│   │   │   ├── 📄 sign-out.ts                             # signOutAction: Server-side Terminate Supabase Session
│   │   │   ├── 📄 reset-password.ts                       # resetPasswordAction: Trigger Send Reset Password Email
│   │   │   └── 📄 complete-profile.ts                     # completeProfileAction: Simpan NIK, Alamat & No WA Baru
│   │   ├── 📁 pegawai/
│   │   │   ├── 📄 submit-cuti.ts                          # submitCutiAction: Submit Usulan Cuti Pegawai ASN
│   │   │   ├── 📄 submit-pensiun.ts                       # submitPensiunAction: Submit Usulan Pensiun Pegawai ASN
│   │   │   ├── 📄 submit-elkh.ts                          # submitElkhAction: Simpan Laporan Kerja Harian ASN
│   │   │   ├── 📄 delete-elkh.ts                          # deleteElkhAction: Hapus Baris Laporan Kerja Harian
│   │   │   └── 📄 verifikasi-cuti.ts                      # verifikasiCutiAction: Approve/Reject Cuti oleh Atasan
│   │   ├── 📁 public/
│   │   │   ├── 📄 submit-buku-tamu.ts                     # submitBukuTamuAction: Simpan Kunjungan Tamu Digital
│   │   │   ├── 📄 submit-janji-temu.ts                    # submitJanjiTemuAction: Simpan Booking Janji Temu
│   │   │   └── 📄 submit-pengaduan.ts                     # submitPengaduanAction: Simpan Laporan Pengaduan Publik
│   │   ├── 📁 system/
│   │   │   ├── 📄 storage-maintenance.ts                  # purgeTempStorageAction: Clean Temp Files R2 Storage
│   │   │   └── 📄 toggle-maintenance.ts                   # toggleMaintenanceModeAction: Switch Mode Maintenance
│   │   └── 📁 user/
│   │       ├── 📄 update-profile.ts                       # updateProfileAction: Update Data Profil User
│   │       └── 📄 upload-avatar.ts                        # uploadAvatarAction: Upload & Crop Foto Profil ke R2/Supabase
│   │
│   ├── 📁 db/                                             # DRIZZLE ORM & POSTGRESQL DATABASE ENGINE
│   │   ├── 📄 index.ts                                    # db: Instance Drizzle ORM Pool Connection
│   │   └── 📁 schema/                                     # 18 FILE SKEMA TABEL POSTGRESQL (Authoritative Database Schema)
│   │       ├── 📄 auth.ts                                 # profiles, profilesPegawai (Identity Users & ASN Data)
│   │       ├── 📄 services.ts                             # ptspServices, serviceItems, serviceFormFields, serviceRequirements
│   │       ├── 📄 requests.ts                             # ptspServiceRequests, serviceRequestAnswers, serviceRequestDocuments
│   │       ├── 📄 kepegawaian.ts                          # dataCutiPegawai, pengajuanCuti, rekapCutiTahunan, masterJenisCuti
│   │       ├── 📄 persuratan.ts                           # usulPensiun, penomoranSurat, tteDocuments
│   │       ├── 📄 guest-book.ts                           # bukuTamu (Digital Visitor Records)
│   │       ├── 📄 appointments.ts                         # janjiTemu (Consultation Appointments)
│   │       ├── 📄 feedbacks.ts                            # feedbacksPengaduan (Public Feedback & Ratings)
│   │       ├── 📄 communications.ts                      # whatsappLogs, chatMessages (Notification Logs)
│   │       ├── 📄 logs.ts                                 # activityLogs, auditTrail (Security Audit Logs)
│   │       ├── 📄 notifications.ts                        # notifications (System & In-App Alerts)
│   │       ├── 📄 master-options.ts                       # masterOptions (System Dynamic Dropdown Options)
│   │       ├── 📄 pejabat.ts                              # dataPejabat (Verificator & Signer Officials Data)
│   │       ├── 📄 enums.ts                                # appRoleEnum, requestStatusEnum, serviceCategoryEnum
│   │       ├── 📄 sequences.ts                            # requestNumberSeq (Auto Increment Ticket Sequences)
│   │       ├── 📄 relations.ts                            # Drizzle Relations Mapping (One-to-Many & Many-to-One)
│   │       └── 📄 index.ts                                # Schema Exporter Aggregator
│   │
│   ├── 📁 services/                                       # REPOSITORY DOMAIN SERVICE ENGINE
│   │   ├── 📁 request/
│   │   │   ├── 📄 request-applicant.ts                    # RequestApplicantService: Processing Submit, File Upload & DB Save
│   │   │   ├── 📄 request-admin.ts                        # RequestAdminService: Processing Verification, Disposisi & TTE
│   │   │   └── 📄 request-number.ts                       # RequestNumberService: Generator Number Ticket Formatter
│   │   └── 📄 notification-service.ts                     # NotificationService: Dispatcher In-App & WA Webhook Alerts
│   │
│   ├── 📁 supabase/                                       # SUPABASE SDK CLIENT CONTEXT HANDLERS
│   │   ├── 📄 client.ts                                   # createClientComponentClient: Supabase Browser Client
│   │   ├── 📄 server.ts                                   # createServerComponentClient: Supabase Server Client
│   │   ├── 📄 admin.ts                                    # createAdminClient: Supabase Service Role (Bypass RLS)
│   │   └── 📄 middleware.ts                               # updateSession: Middleware Session Refresh Helper
│   │
│   └── 📁 validations/                                    # ZOD VALIDATION SCHEMAS
│       ├── 📄 auth.ts                                     # loginSchema, registerSchema, resetPasswordSchema
│       ├── 📄 request.ts                                  # createRequestSchema, updateRequestSchema
│       └── 📄 admin.ts                                    # serviceSchema, itemSchema, fieldSchema
│
├── 📁 docs/                                               # DOKUMENTASI PROYEK & ANALSIS
│   ├── 📄 PRD.md                                          # Product Requirement Document Utama
│   ├── 📄 ERD.md                                          # Entity Relationship Diagram Skema Database
│   ├── 📄 PROJECT_MEMORY.md                               # Catatan Memori & Decision Log Pengembangan
│   └── 📄 AI_DEVELOPMENT_PROTOCOL.md                      # Standar Aturan Pengembangan Agen AI
│
├── 📁 drizzle/                                            # DRIZZLE KIT MIGRATIONS ENGINE
│   ├── 📁 meta/                                           # Drizzle Migration Metadata Snapshots
│   └── 📄 0000_majestic_nomad.sql, 0001_overconfident.sql # Berkas Script SQL Migration History
│
├── 📁 public/                                             # ASSET STATIS PUBLIK
│   ├── 📁 images/                                         # Logo Kemenag, Avatar Default, Banner Hero
│   └── 📄 manifest.json                                   # PWA Manifest Configuration
│
├── 📄 proxy.ts                                            # Edge Middleware Handler (CSRF, Rate Limit, Session Gatekeeper)
├── 📄 next.config.ts                                      # Konfigurasi Next.js Engine (CSP Headers, 50MB Body Limit)
├── 📄 drizzle.config.ts                                   # Konfigurasi Drizzle Kit Engine Path & DB URL
├── 📄 tsconfig.json                                       # Konfigurasi TypeScript Engine Strict Compiler Options
├── 📄 package.json                                        # Manifest Package Dependencies & Command Scripts
└── 📄 README.md                                           # Dokumentasi Utama Sistem PTSP Kemenag Barito Utara
```

---

## 🛠️ Perintah Utama Sistem (Scripts)

| Perintah Terminal     | Nama Fungsi & Kegunaan                                                       |
| --------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`         | Menjalankan server lokal Next.js dengan Turbopack Engine                     |
| `npm run build`       | Kompilasi bundle produksi Next.js & pengecekan optimasi                      |
| `npm run typecheck`   | Validasi tipe TypeScript secara menyeluruh tanpa emisi file (`tsc --noEmit`) |
| `npm run db:push`     | Eksekusi skema Drizzle ORM langsung ke database PostgreSQL Supabase          |
| `npm run db:generate` | Membuat berkas migrasi SQL baru dari perubahan skema Drizzle                 |

---

## 🔒 Aturan Keamanan, Akses & Storage R2

1. **Super Admin Access**: Super Admin ditentukan secara eksklusif via pencocokan email `SUPER_ADMIN_EMAIL` di `lib/constants.ts` dengan hak bypass penuh.
2. **Penyimpanan Berkas Cloudflare R2**: Semua dokumen terunggah tersimpan secara rapi di Bucket `data-ptsp` dengan format path:
   `requests/[Nama_User]_[ID]/[Nomor_Tiket]/[Nama_Persyaratan]_[File_Original]`
