import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../layanan/providers/layanan_provider.dart';
import '../../tracking/providers/tracking_provider.dart';
import '../widgets/quick_menu_card.dart';

/// Halaman Dashboard Utama / Beranda PTSP Kemenag Barito Utara
/// Mengusung desain resmi, berwibawa, bebas dari ikon-ikon warna-warni bergaya AI generic template
class BerandaScreen extends ConsumerWidget {
  const BerandaScreen({super.key});

  bool _isLoketBuka() {
    final now = DateTime.now();
    // Tutup di akhir pekan (Sabtu & Minggu)
    if (now.weekday == DateTime.saturday || now.weekday == DateTime.sunday) {
      return false;
    }
    // Senin - Kamis: 07:30 - 16:00, Jumat: 07:30 - 16:30
    final hour = now.hour;
    final minute = now.minute;
    final currentMinutes = hour * 60 + minute;
    const startMinutes = 7 * 60 + 30; // 07:30
    final endMinutes = (now.weekday == DateTime.friday) ? (16 * 60 + 30) : (16 * 60);

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);
    final user = authState.asData?.value;
    final isOpen = _isLoketBuka();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          // ── SLIVER APP BAR: HERO GRADIENT RESMI KEMENAG (PAS & TANPA JARAK KOSONG) ──
          SliverAppBar(
            expandedHeight: 175,
            pinned: true,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            title: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Image.asset(
                    'assets/images/atak-portal.png',
                    fit: BoxFit.cover,
                    alignment: Alignment.topCenter,
                    errorBuilder: (context, error, stackTrace) =>
                        const Icon(LucideIcons.shieldCheck, color: Color(0xFFD4AF37), size: 18),
                  ),
                ),
                const SizedBox(width: 10),
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'PTSP SI ATAK',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16.5, letterSpacing: -0.2),
                    ),
                    Text(
                      'Kemenag Barito Utara',
                      style: TextStyle(fontSize: 10.5, color: Color(0xFFA7F3D0), fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              IconButton(
                tooltip: user != null ? 'Profil Akun' : 'Masuk Akun',
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                  ),
                  child: Icon(
                    user != null ? LucideIcons.circleUser : LucideIcons.logIn,
                    size: 18,
                    color: Colors.white,
                  ),
                ),
                onPressed: () => context.push('/login'),
              ),
              const SizedBox(width: 8),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF022C22), Color(0xFF064E3B), Color(0xFF0F766E)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Status Operasional Loket Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: isOpen
                                ? const Color(0xFF16A34A).withValues(alpha: 0.25)
                                : const Color(0xFFDC2626).withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isOpen ? const Color(0xFF4ADE80) : const Color(0xFFF87171),
                              width: 1,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                width: 7,
                                height: 7,
                                decoration: BoxDecoration(
                                  color: isOpen ? const Color(0xFF4ADE80) : const Color(0xFFF87171),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                isOpen ? 'Loket PTSP Buka (07:30 - 16:00)' : 'Loket PTSP Sedang Tutup',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          user != null ? 'Selamat Datang, ${user.nama}!' : 'Pelayanan Terpadu Satu Pintu',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user != null
                              ? 'Role: ${user.role.toUpperCase()} ${user.isPegawai ? "• ASN Kemenag Barito Utara" : "• Pemohon Layanan"}'
                              : 'Kantor Kementerian Agama Kabupaten Barito Utara',
                          style: TextStyle(
                            color: Colors.white.withValues(alpha: 0.88),
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── CONTENT BODY ──
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 36),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── 1. JAMINAN STANDAR PELAYANAN (BEBAS PUNGLI & GRATIS) ──
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Center(
                            child: Icon(LucideIcons.shieldCheck, color: Color(0xFF047857), size: 22),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Text(
                                    '100% Bebas Biaya (Rp 0) & Bebas Pungli',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12.5,
                                      color: AppColors.textPrimary,
                                      letterSpacing: -0.2,
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Seluruh layanan PTSP Kemenag Barito Utara transparan, akuntabel, dan bebas gratifikasi.',
                                style: TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.3),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // ── 3. PINTU PELAYANAN UTAMA (MASYARAKAT VS PEGAWAI) ──
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Pintu Pelayanan',
                        style: TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                      Text(
                        'Pilih Jalur Akses',
                        style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  Row(
                    children: [
                      // Kartu 1: Katalog Layanan Masyarakat (Publik)
                      Expanded(
                        child: _buildPortalCard(
                          title: 'Katalog Publik',
                          subtitle: '18+ Layanan Ijazah, Nikah, Haji & Rumah Ibadah',
                          tag: 'Masyarakat',
                          icon: LucideIcons.users,
                          gradientColors: const [Color(0xFF022C22), Color(0xFF064E3B)],
                          onTap: () {
                            ref.read(selectedLayananTabProvider.notifier).state = 0;
                            context.go('/layanan?tab=masyarakat');
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Kartu 2: Katalog Layanan Pegawai (ASN)
                      Expanded(
                        child: _buildPortalCard(
                          title: 'Portal Mandiri ASN',
                          subtitle: 'Pengajuan Cuti Online, LKH & Berkas Kepegawaian',
                          tag: 'Khusus ASN',
                          icon: LucideIcons.briefcase,
                          gradientColors: const [Color(0xFF0F172A), Color(0xFF1E293B)],
                          onTap: () {
                            ref.read(selectedLayananTabProvider.notifier).state = 1;
                            context.go('/layanan?tab=asn');
                          },
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // ── 4. AKSES CEPAT (MENU MANDIRI RESMI - ANTI AI LOOK) ──
                  const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Akses Cepat',
                        style: TextStyle(
                          fontSize: 15.5,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                      Text(
                        'Layanan Terpadu',
                        style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Daftar Menu Aksi Cepat Elegan & Seragam (Bebas dari kotak pastel warna-warni AI)
                  Column(
                    children: [
                      QuickMenuCard(
                        title: 'Lacak Status Berkas',
                        subtitle: 'Cek progres verifikasi dokumen via nomor tiket',
                        icon: LucideIcons.fileSearch,
                        badge: 'Realtime',
                        onTap: () {
                          ref.read(selectedTrackingTabProvider.notifier).state = 0;
                          context.go('/tracking?tab=berkas');
                        },
                      ),
                      const SizedBox(height: 9),
                      QuickMenuCard(
                        title: 'Buku Tamu & Janji Temu',
                        subtitle: 'Catat kunjungan loket atau jadwalkan audiensi pejabat',
                        icon: LucideIcons.bookOpen,
                        badge: 'Loket PTSP',
                        onTap: () => context.go('/buku-tamu'),
                      ),
                      const SizedBox(height: 9),
                      QuickMenuCard(
                        title: 'Cek Sisa Cuti Pegawai ASN',
                        subtitle: 'Pengecekan mandiri kuota hak cuti via NIP 18 digit',
                        icon: LucideIcons.calendarCheck,
                        badge: 'Portal ASN',
                        onTap: () {
                          ref.read(selectedTrackingTabProvider.notifier).state = 1;
                          context.go('/tracking?tab=cuti');
                        },
                      ),
                      const SizedBox(height: 9),
                      QuickMenuCard(
                        title: 'Katalog & SOP Persyaratan',
                        subtitle: 'Jelajahi seluruh perizinan dan standar dokumen',
                        icon: LucideIcons.layers,
                        badge: '18+ Layanan',
                        onTap: () {
                          ref.read(selectedLayananTabProvider.notifier).state = 0;
                          context.go('/layanan?tab=masyarakat');
                        },
                      ),
                    ],
                  ),

                  const SizedBox(height: 26),

                  // ── 5. ALUR PELAYANAN 4 LANGKAH (SESUAI WEB) ──
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Text(
                              'Alur Pelayanan Digital',
                              style: TextStyle(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Spacer(),
                            Text(
                              '4 Tahap Mudah',
                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryMedium),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Pengurusan administrasi keagamaan diproses mandiri, cepat, dan transparan.',
                          style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 14),

                        _buildStepRow(
                          step: '01',
                          title: 'Daftar Akun Pemohon',
                          desc: 'Registrasi mandiri atau masuk akun Google untuk akses portal.',
                        ),
                        const SizedBox(height: 10),
                        _buildStepRow(
                          step: '02',
                          title: 'Pilih Jenis Layanan',
                          desc: 'Tentukan perizinan atau rekomendasi dari katalog resmi PTSP.',
                        ),
                        const SizedBox(height: 10),
                        _buildStepRow(
                          step: '03',
                          title: 'Unggah Dokumen Syarat',
                          desc: 'Isi formulir pengajuan dan lampirkan berkas digital (PDF/JPG).',
                        ),
                        const SizedBox(height: 10),
                        _buildStepRow(
                          step: '04',
                          title: 'Unduh Hasil / Ambil di Loket',
                          desc: 'Pantau verifikasi dan unduh dokumen resmi bertanda tangan TTE.',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // ── 6. MAKLUMAT PELAYANAN RESMI KEMENAG BARITO UTARA ──
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(LucideIcons.landmark, color: Color(0xFF064E3B), size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Maklumat Pelayanan',
                              style: TextStyle(
                                fontWeight: FontWeight.w800,
                                fontSize: 13,
                                color: Color(0xFF064E3B),
                                letterSpacing: -0.2,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          '"Dengan ini kami menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan dan siap menerima sanksi apabila tidak menepati janji."',
                          style: TextStyle(
                            fontSize: 12,
                            fontStyle: FontStyle.italic,
                            color: Color(0xFF334155),
                            height: 1.45,
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Align(
                          alignment: Alignment.centerRight,
                          child: Text(
                            '— Kepala Kantor Kemenag Kab. Barito Utara',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF064E3B),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── 7. INFO OPERASIONAL & BANTUAN PTSP ──
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: const Center(
                            child: Icon(LucideIcons.clock, color: Color(0xFF475569), size: 18),
                          ),
                        ),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Jadwal Loket Pelayanan Langsung',
                                style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Senin - Kamis: 07.30 - 16.00 WIB | Jumat: 07.30 - 16.30 WIB',
                                style: TextStyle(fontSize: 10.5, color: AppColors.textSecondary),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortalCard({
    required String title,
    required String subtitle,
    required String tag,
    required IconData icon,
    required List<Color> gradientColors,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          height: 165,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: gradientColors,
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: gradientColors.first.withValues(alpha: 0.25),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
                    ),
                    child: Text(
                      tag,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ),
                  Icon(icon, color: Colors.white.withValues(alpha: 0.75), size: 20),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: 10.5,
                      height: 1.3,
                    ),
                  ),
                ],
              ),
              const Row(
                children: [
                  Text(
                    'Buka Menu',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  SizedBox(width: 4),
                  Icon(LucideIcons.arrowRight, color: Colors.white, size: 13),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepRow({
    required String step,
    required String title,
    required String desc,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFA7F3D0)),
          ),
          child: Center(
            child: Text(
              step,
              style: const TextStyle(
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: Color(0xFF047857),
                fontFamily: 'monospace',
              ),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                desc,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

