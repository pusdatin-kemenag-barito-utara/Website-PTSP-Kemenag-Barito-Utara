import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/providers/core_providers.dart';
import '../models/buku_tamu_model.dart';
import '../repositories/buku_tamu_repository.dart';

/// Provider repository Buku Tamu & Janji Temu
final bukuTamuRepositoryProvider = Provider<BukuTamuRepository>((ref) {
  final client = ref.watch(dioClientProvider);
  return BukuTamuRepository(client);
});

/// Provider daftar kunjungan buku tamu dari backend (limit 1000)
final guestBookListProvider =
    FutureProvider.autoDispose<List<GuestBookItem>>((ref) async {
  final repo = ref.watch(bukuTamuRepositoryProvider);
  return repo.getGuestBookList();
});

/// Provider daftar janji temu / audiensi dari backend
final appointmentListProvider =
    FutureProvider.autoDispose<List<AppointmentItem>>((ref) async {
  final repo = ref.watch(bukuTamuRepositoryProvider);
  return repo.getAppointments();
});

/// Opsi Pejabat / Seksi Tujuan resmi yang sinkron 100% dengan web
const List<String> kOfficerOptions = [
  'Kepala Kantor',
  'Kasubag Tata Usaha',
  'Kasi Pendidikan Madrasah (Penmad)',
  'Kasi Pendidikan Agama Islam (PAI)',
  'Kasi Pendidikan Diniyah & Pondok Pesantren (PD Pontren)',
  'Kasi Bimbingan Masyarakat Islam',
  'Kasi Bimbingan Masyarakat Kristen & Katolik',
  'Penyelenggara Zakat dan Wakaf',
  'Penyelenggara Hindu',
  'Humas / Petugas PTSP',
  'Unit Lainnya (Bisa Tulis Manual)',
];

/// Opsi Kategori / Tipe Instansi yang sinkron dengan web
const List<String> kInstitutionTypeOptions = [
  'Pribadi / Perorangan',
  'Lembaga Pemerintah',
  'Perusahaan Swasta',
  'Madrasah / Pondok Pesantren',
  'Ormas / Organisasi Keagamaan',
  'Lainnya',
];

/// Helper untuk menyamarkan nomor telepon demi privasi pengunjung
String maskPhoneNumber(String phone) {
  final clean = phone.replaceAll(RegExp(r'[^0-9+]'), '');
  if (clean.length < 8) return clean;
  final start = clean.substring(0, clean.length >= 4 ? 4 : 2);
  final end = clean.substring(clean.length >= 4 ? clean.length - 4 : clean.length - 2);
  return '$start-****-$end';
}

/// Helper format tanggal Indonesia dengan fallback aman
String formatIndonesianDate(DateTime dt, {String pattern = 'EEEE, dd MMMM yyyy'}) {
  try {
    return DateFormat(pattern, 'id_ID').format(dt);
  } catch (_) {
    return DateFormat(pattern).format(dt);
  }
}

/// Halaman Lengkap Buku Tamu & Janji Temu PTSP Kemenag Barito Utara
class BukuTamuScreen extends ConsumerStatefulWidget {
  const BukuTamuScreen({super.key});

  @override
  ConsumerState<BukuTamuScreen> createState() => _BukuTamuScreenState();
}

class _BukuTamuScreenState extends ConsumerState<BukuTamuScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // ── Form Buku Tamu State ──
  final _formKey = GlobalKey<FormState>();
  final _namaController = TextEditingController();
  final _instansiController = TextEditingController();
  final _teleponController = TextEditingController();
  final _keperluanController = TextEditingController();
  final _customOfficerController = TextEditingController();
  String _tipeInstansi = 'Pribadi / Perorangan';
  String _tujuanSeksi = 'Kepala Kantor';
  bool _isLoading = false;

  // ── Tab 2: Daftar Kunjungan State ──
  final _searchController = TextEditingController();
  String _searchQuery = '';
  String _filterInstansi = 'Semua';
  String _sortOrder = 'desc'; // 'desc' (Terbaru) atau 'asc' (Terlama)

  // ── Tab 3: Statistik State ──
  String _statsPeriod = 'semua'; // 'semua' atau 'hari_ini'
  String _statsMetric = 'seksi'; // 'seksi' atau 'instansi'

  // ── Tab 4: Janji Temu State ──
  int _appointmentSubTab = 0; // 0 = Ajukan Jadwal, 1 = Riwayat Janji Temu
  final _appointmentFormKey = GlobalKey<FormState>();
  final _appNamaController = TextEditingController();
  final _appTeleponController = TextEditingController();
  final _appInstansiController = TextEditingController();
  final _appKeperluanController = TextEditingController();
  final _appCustomOfficerController = TextEditingController();
  String _appTipeInstansi = 'Pribadi / Perorangan';
  String _appPejabat = 'Kepala Kantor';
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _selectedTime = const TimeOfDay(hour: 9, minute: 0);
  bool _isAppLoading = false;
  String _appStatusFilter = 'Semua';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _namaController.dispose();
    _instansiController.dispose();
    _teleponController.dispose();
    _keperluanController.dispose();
    _customOfficerController.dispose();

    _searchController.dispose();

    _appNamaController.dispose();
    _appTeleponController.dispose();
    _appInstansiController.dispose();
    _appKeperluanController.dispose();
    _appCustomOfficerController.dispose();
    super.dispose();
  }

  // ── Action: Submit Buku Tamu ──
  Future<void> _submitBukuTamu() async {
    if (!_formKey.currentState!.validate()) return;

    final intendedOfficer = _tujuanSeksi == 'Unit Lainnya (Bisa Tulis Manual)'
        ? _customOfficerController.text.trim()
        : _tujuanSeksi;

    if (intendedOfficer.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFFDC2626),
          content: Text('Silakan tuliskan nama unit tujuan yang ingin dikunjungi.'),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final repo = ref.read(bukuTamuRepositoryProvider);

    final cleanPhone = _teleponController.text.trim().replaceAll(RegExp(r'[^0-9+]'), '');
    final finalInstansi = _tipeInstansi == 'Pribadi / Perorangan'
        ? (_instansiController.text.trim().isEmpty ? 'Pribadi / Perorangan' : _instansiController.text.trim())
        : _instansiController.text.trim();

    final input = BukuTamuInput(
      namaLengkap: _namaController.text.trim(),
      instansi: finalInstansi,
      tipeInstansi: _tipeInstansi,
      telepon: cleanPhone,
      tujuanSeksi: intendedOfficer,
      keperluan: _keperluanController.text.trim(),
      tanggalKunjungan: DateTime.now(),
    );

    final success = await repo.submitBukuTamu(input);
    setState(() => _isLoading = false);

    if (!mounted) return;

    if (success) {
      final savedName = _namaController.text.trim();
      final savedOfficer = intendedOfficer;
      final savedPurpose = _keperluanController.text.trim();
      final savedInstansi = finalInstansi;
      final savedTime = DateFormat('dd MMMM yyyy, HH:mm').format(DateTime.now());

      _namaController.clear();
      _instansiController.clear();
      _teleponController.clear();
      _keperluanController.clear();
      _customOfficerController.clear();

      // Refresh list & stats
      ref.invalidate(guestBookListProvider);

      _showSuccessReceiptDialog(
        name: savedName,
        officer: savedOfficer,
        purpose: savedPurpose,
        instansi: savedInstansi,
        timeStr: savedTime,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFFDC2626),
          content: Text('Gagal menyimpan buku tamu. Periksa koneksi backend Anda.'),
        ),
      );
    }
  }

  // ── Modal Bukti Kunjungan Digital (Mirip Web) ──
  void _showSuccessReceiptDialog({
    required String name,
    required String officer,
    required String purpose,
    required String instansi,
    required String timeStr,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: const Color(0xFFDCFCE7),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFF86EFAC), width: 2),
                ),
                child: const Icon(LucideIcons.circleCheck, color: Color(0xFF16A34A), size: 34),
              ),
              const SizedBox(height: 16),
              const Text(
                'Kunjungan Berhasil Dicatat!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 6),
              const Text(
                'Terima kasih telah berkunjung ke PTSP Kemenag Barito Utara.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 18),

              // Digital Receipt Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildReceiptRow('Nama Tamu', name, LucideIcons.user),
                    const Divider(height: 14, thickness: 0.8),
                    _buildReceiptRow('Tujuan', officer, LucideIcons.userCheck),
                    const Divider(height: 14, thickness: 0.8),
                    _buildReceiptRow('Instansi', instansi, LucideIcons.building2),
                    const Divider(height: 14, thickness: 0.8),
                    _buildReceiptRow('Waktu', '$timeStr WIB', LucideIcons.clock),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        _tabController.animateTo(1); // Pindah ke Daftar Tamu
                      },
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        side: const BorderSide(color: AppColors.primaryMedium),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Lihat Daftar', style: TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(ctx),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        backgroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Selesai', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppColors.primaryMedium),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }

  // ── Action: Submit Janji Temu ──
  Future<void> _submitAppointment() async {
    if (!_appointmentFormKey.currentState!.validate()) return;

    final intendedOfficer = _appPejabat == 'Unit Lainnya (Bisa Tulis Manual)'
        ? _appCustomOfficerController.text.trim()
        : _appPejabat;

    if (intendedOfficer.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFFDC2626),
          content: Text('Silakan tentukan pejabat atau unit yang ingin ditemui.'),
        ),
      );
      return;
    }

    setState(() => _isAppLoading = true);
    final repo = ref.read(bukuTamuRepositoryProvider);

    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final timeStr =
        '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')}';

    final cleanPhone = _appTeleponController.text.trim().replaceAll(RegExp(r'[^0-9+]'), '');

    final success = await repo.submitAppointment(
      AppointmentInput(
        namaLengkap: _appNamaController.text.trim(),
        telepon: cleanPhone,
        tipeInstansi: _appTipeInstansi,
        instansi: _appInstansiController.text.trim(),
        pejabatTujuan: intendedOfficer,
        keperluan: _appKeperluanController.text.trim(),
        tanggal: dateStr,
        jam: timeStr,
      ),
    );

    setState(() => _isAppLoading = false);

    if (!mounted) return;

    if (success) {
      final savedOfficer = intendedOfficer;
      final savedDate = DateFormat('dd MMMM yyyy').format(_selectedDate);
      final savedTime = timeStr;

      _appNamaController.clear();
      _appTeleponController.clear();
      _appInstansiController.clear();
      _appKeperluanController.clear();
      _appCustomOfficerController.clear();

      // Invalidate appointment list
      ref.invalidate(appointmentListProvider);

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Row(
            children: [
              Icon(LucideIcons.calendarCheck, color: Color(0xFF0284C7)),
              SizedBox(width: 8),
              Expanded(
                child: Text('Janji Temu Diajukan', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
              ),
            ],
          ),
          content: Text(
            'Permohonan janji temu dengan $savedOfficer pada tanggal $savedDate pukul $savedTime WIB berhasil disimpan ke database.\n\nPetugas akan mengonfirmasi jadwal audiensi via WhatsApp.',
            style: const TextStyle(fontSize: 12.5, height: 1.4),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                setState(() => _appointmentSubTab = 1); // Pindah ke subtab riwayat
              },
              child: const Text('Lihat Riwayat Janji Temu'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Selesai', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFFDC2626),
          content: Text('Gagal mengajukan janji temu. Periksa isian form atau koneksi backend.'),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final listAsync = ref.watch(guestBookListProvider);
    final guestCount = listAsync.valueOrNull?.length ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        elevation: 0,
        centerTitle: true,
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Buku Tamu & Audiensi',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 16.5,
                color: Colors.white,
                letterSpacing: -0.2,
                height: 1.15,
              ),
            ),
            SizedBox(height: 3),
            Text(
              'PTSP SI ATAK KEMENAG BARITO UTARA',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 9.5,
                color: Color(0xFFA7F3D0),
                fontWeight: FontWeight.w700,
                letterSpacing: 0.5,
                height: 1.2,
              ),
            ),
          ],
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: Container(
            color: const Color(0xFF043E30),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: const Color(0xFFFDE68A), // Amber Gold
              unselectedLabelColor: Colors.white70,
              indicatorColor: const Color(0xFFF59E0B),
              indicatorWeight: 3,
              tabAlignment: TabAlignment.start,
              labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700),
              unselectedLabelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              tabs: [
                const Tab(
                  icon: Icon(LucideIcons.notebookPen, size: 15),
                  text: 'Isi Buku Tamu',
                ),
                Tab(
                  icon: const Icon(LucideIcons.users, size: 15),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Daftar Tamu'),
                      if (guestCount > 0) ...[
                        const SizedBox(width: 5),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$guestCount',
                            style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.w800),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                const Tab(
                  icon: Icon(LucideIcons.barChart3, size: 15),
                  text: 'Statistik',
                ),
                const Tab(
                  icon: Icon(LucideIcons.calendarClock, size: 15),
                  text: 'Janji Temu',
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFormBukuTamuTab(),
          _buildDaftarKunjunganTab(),
          _buildStatistikTab(),
          _buildJanjiTemuTab(),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 1: FORM ISI BUKU TAMU ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildFormBukuTamuTab() {
    final todayStr = formatIndonesianDate(DateTime.now());

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF065F46)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF064E3B).withValues(alpha: 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(LucideIcons.bookOpen, color: Color(0xFFFDE68A), size: 18),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'Buku Tamu Digital PTSP',
                        style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Silakan lengkapi identitas kunjungan Anda sebelum memasuki area loket pelayanan Kemenag Barito Utara.',
                    style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 11.5, height: 1.35),
                  ),
                  const SizedBox(height: 12),

                  // Today's Date Pill
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                    ),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.calendarDays, size: 14, color: Color(0xFF34D399)),
                        const SizedBox(width: 8),
                        Text(
                          todayStr,
                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF059669),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'Otomatis Hari Ini',
                            style: TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Form Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFormLabel('Nama Lengkap', isRequired: true),
                  _buildTextFormField(
                    controller: _namaController,
                    hint: 'Masukkan nama lengkap Anda...',
                    icon: LucideIcons.user,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Nama lengkap wajib diisi';
                      if (v.trim().length < 3) return 'Nama minimal terdiri dari 3 karakter';
                      if (RegExp(r'[0-9]').hasMatch(v)) return 'Nama tidak boleh mengandung angka';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Nomor WhatsApp / HP Aktif', isRequired: true),
                  _buildTextFormField(
                    controller: _teleponController,
                    hint: 'Contoh: 081234567890',
                    icon: LucideIcons.phone,
                    keyboard: TextInputType.phone,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Nomor WhatsApp wajib diisi';
                      final clean = v.replaceAll(RegExp(r'[^0-9]'), '');
                      if (clean.length < 9) return 'Nomor WhatsApp minimal 9 digit angka';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Kategori / Tipe Instansi', isRequired: true),
                  DropdownButtonFormField<String>(
                    initialValue: _tipeInstansi,
                    isExpanded: true,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.landmark, size: 18, color: AppColors.primaryMedium),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                    ),
                    items: kInstitutionTypeOptions.map((opt) {
                      return DropdownMenuItem<String>(
                        value: opt,
                        child: Text(opt, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _tipeInstansi = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  if (_tipeInstansi != 'Pribadi / Perorangan') ...[
                    _buildFormLabel('Nama Instansi / Lembaga / Madrasah', isRequired: true),
                    _buildTextFormField(
                      controller: _instansiController,
                      hint: 'Contoh: MTsN 1 Barito Utara / Pemkab...',
                      icon: LucideIcons.building2,
                      validator: (v) {
                        if (_tipeInstansi != 'Pribadi / Perorangan' && (v == null || v.trim().isEmpty)) {
                          return 'Nama instansi / lembaga wajib diisi';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                  ],

                  _buildFormLabel('Tujuan Seksi / Pejabat yang Dituju', isRequired: true),
                  DropdownButtonFormField<String>(
                    initialValue: _tujuanSeksi,
                    isExpanded: true,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.primaryMedium),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                      ),
                    ),
                    items: kOfficerOptions.map((officer) {
                      return DropdownMenuItem<String>(
                        value: officer,
                        child: Text(officer, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _tujuanSeksi = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  if (_tujuanSeksi == 'Unit Lainnya (Bisa Tulis Manual)') ...[
                    _buildFormLabel('Tuliskan Nama Unit / Pegawai Tujuan', isRequired: true),
                    _buildTextFormField(
                      controller: _customOfficerController,
                      hint: 'Contoh: Pengelola BMN / Kepegawaian...',
                      icon: LucideIcons.pencil,
                      validator: (v) {
                        if (_tujuanSeksi == 'Unit Lainnya (Bisa Tulis Manual)' && (v == null || v.trim().isEmpty)) {
                          return 'Nama unit tujuan wajib dituliskan';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                  ],

                  _buildFormLabel('Keperluan Kunjungan / Pengurusan Berkas', isRequired: true),
                  _buildTextFormField(
                    controller: _keperluanController,
                    hint: 'Jelaskan maksud dan tujuan kunjungan Anda secara singkat...',
                    icon: LucideIcons.fileText,
                    maxLines: 3,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Keperluan kunjungan wajib diisi' : null,
                  ),
                  const SizedBox(height: 22),

                  SizedBox(
                    height: 48,
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _submitBukuTamu,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 2,
                      ),
                      icon: _isLoading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(LucideIcons.send, size: 18),
                      label: Text(
                        _isLoading ? 'Mencatat Kunjungan...' : 'Simpan Kunjungan',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 2: DAFTAR KUNJUNGAN TAMU ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildDaftarKunjunganTab() {
    final listAsync = ref.watch(guestBookListProvider);

    return Column(
      children: [
        // Search & Filter Box
        Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
          color: Colors.white,
          child: Column(
            children: [
              // Search Bar
              TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val.toLowerCase()),
                decoration: InputDecoration(
                  hintText: 'Cari nama, instansi, atau keperluan...',
                  hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                  prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textSecondary),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(LucideIcons.x, size: 16),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFFF1F5F9),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Filter Chips Row & Sort Toggle
              Row(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterChip('Semua'),
                          const SizedBox(width: 6),
                          _buildFilterChip('Pribadi'),
                          const SizedBox(width: 6),
                          _buildFilterChip('Pemerintah'),
                          const SizedBox(width: 6),
                          _buildFilterChip('Swasta'),
                          const SizedBox(width: 6),
                          _buildFilterChip('Madrasah'),
                          const SizedBox(width: 6),
                          _buildFilterChip('Ormas'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Sort Button
                  InkWell(
                    onTap: () {
                      setState(() {
                        _sortOrder = _sortOrder == 'desc' ? 'asc' : 'desc';
                      });
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _sortOrder == 'desc' ? LucideIcons.arrowDown : LucideIcons.arrowUp,
                            size: 14,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            _sortOrder == 'desc' ? 'Terbaru' : 'Terlama',
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // List Content
        Expanded(
          child: listAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
            error: (e, s) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(LucideIcons.alertCircle, color: Colors.red, size: 36),
                  const SizedBox(height: 10),
                  const Text('Gagal mengambil daftar kunjungan.', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  ElevatedButton.icon(
                    onPressed: () => ref.refresh(guestBookListProvider),
                    icon: const Icon(LucideIcons.refreshCw, size: 14),
                    label: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),
            data: (items) {
              // Apply Filter & Search
              var filtered = items.where((item) {
                final matchQuery = _searchQuery.isEmpty ||
                    item.guestName.toLowerCase().contains(_searchQuery) ||
                    (item.institutionName?.toLowerCase().contains(_searchQuery) ?? false) ||
                    item.institutionType.toLowerCase().contains(_searchQuery) ||
                    item.intendedOfficer.toLowerCase().contains(_searchQuery) ||
                    item.purpose.toLowerCase().contains(_searchQuery);

                final matchCategory = _filterInstansi == 'Semua' ||
                    item.institutionType.toLowerCase().contains(_filterInstansi.toLowerCase()) ||
                    (item.institutionName?.toLowerCase().contains(_filterInstansi.toLowerCase()) ?? false);

                return matchQuery && matchCategory;
              }).toList();

              // Apply Sort
              filtered.sort((a, b) {
                return _sortOrder == 'desc'
                    ? b.visitDate.compareTo(a.visitDate)
                    : a.visitDate.compareTo(b.visitDate);
              });

              if (filtered.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.userX, size: 44, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        Text(
                          _searchQuery.isNotEmpty || _filterInstansi != 'Semua'
                              ? 'Tidak ada data kunjungan yang cocok.'
                              : 'Belum ada data kunjungan tamu.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 12),
                        TextButton.icon(
                          onPressed: () => _tabController.animateTo(0),
                          icon: const Icon(LucideIcons.plus, size: 16),
                          label: const Text('Isi Buku Tamu Sekarang'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => ref.refresh(guestBookListProvider),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final item = filtered[index];
                    return _buildGuestCard(item);
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _filterInstansi == label;
    return InkWell(
      onTap: () => setState(() => _filterInstansi = label),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildGuestCard(GuestBookItem item) {
    final timeStr = DateFormat('dd MMM yyyy, HH:mm').format(item.visitDate);
    final instType = item.institutionType.toLowerCase();

    // Color theme based on institution type (resmi kemenag)
    Color badgeBg = const Color(0xFFF1F5F9);
    Color badgeText = const Color(0xFF334155);
    if (instType.contains('madrasah') || instType.contains('sekolah') || instType.contains('kemenag')) {
      badgeBg = const Color(0xFFECFDF5);
      badgeText = const Color(0xFF047857);
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.primarySoft,
            child: Text(
              item.guestName.isNotEmpty ? item.guestName[0].toUpperCase() : 'G',
              style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        item.guestName,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary),
                      ),
                    ),
                    Text(
                      timeStr,
                      style: const TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 3),

                // Phone & Institution Row
                Row(
                  children: [
                    const Icon(LucideIcons.lock, size: 10, color: AppColors.textMuted),
                    const SizedBox(width: 3),
                    Text(
                      maskPhoneNumber(item.whatsapp),
                      style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted, fontFamily: 'monospace'),
                    ),
                    const SizedBox(width: 6),
                    const Text('•', style: TextStyle(color: AppColors.textMuted)),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: badgeBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        item.institutionName != null && item.institutionName!.isNotEmpty
                            ? '${item.institutionName}'
                            : item.institutionType,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: badgeText),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Pejabat Tujuan Pill
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(LucideIcons.userCheck, size: 11, color: Color(0xFF059669)),
                      const SizedBox(width: 5),
                      Text(
                        'Tujuan: ${item.intendedOfficer}',
                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF065F46)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),

                // Purpose
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFF1F5F9)),
                  ),
                  child: Text(
                    item.purpose,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 3: STATISTIK KUNJUNGAN (DATA ANALYTICS) ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildStatistikTab() {
    final listAsync = ref.watch(guestBookListProvider);

    return listAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      error: (e, s) => const Center(child: Text('Gagal memuat statistik.')),
      data: (items) {
        final now = DateTime.now();
        final todayEntries = items.where((i) {
          return i.visitDate.year == now.year &&
              i.visitDate.month == now.month &&
              i.visitDate.day == now.day;
        }).toList();

        final activeEntries = _statsPeriod == 'hari_ini' ? todayEntries : items;
        final total = activeEntries.length;

        // Seksi Calculation
        final Map<String, int> seksiCount = {};
        for (var i in activeEntries) {
          final officer = i.intendedOfficer.isNotEmpty ? i.intendedOfficer : 'Lainnya';
          seksiCount[officer] = (seksiCount[officer] ?? 0) + 1;
        }
        final sortedSeksi = seksiCount.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
        final topSeksi = sortedSeksi.isNotEmpty ? sortedSeksi.first.key : '-';

        // Instansi Calculation
        final Map<String, int> instansiCount = {};
        for (var i in activeEntries) {
          final type = i.institutionType.isNotEmpty ? i.institutionType : 'Lainnya';
          instansiCount[type] = (instansiCount[type] ?? 0) + 1;
        }
        final sortedInstansi = instansiCount.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
        final topInstansi = sortedInstansi.isNotEmpty ? sortedInstansi.first.key : '-';

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Period Toggle
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFFE2E8F0),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _statsPeriod = 'semua'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: _statsPeriod == 'semua' ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(9),
                          boxShadow: _statsPeriod == 'semua'
                              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)]
                              : null,
                        ),
                        child: Text(
                          'Semua Waktu (${items.length})',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: _statsPeriod == 'semua' ? FontWeight.w800 : FontWeight.w600,
                            color: _statsPeriod == 'semua' ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: InkWell(
                      onTap: () => setState(() => _statsPeriod = 'hari_ini'),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: _statsPeriod == 'hari_ini' ? Colors.white : Colors.transparent,
                          borderRadius: BorderRadius.circular(9),
                          boxShadow: _statsPeriod == 'hari_ini'
                              ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)]
                              : null,
                        ),
                        child: Text(
                          'Hari Ini (${todayEntries.length})',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: _statsPeriod == 'hari_ini' ? FontWeight.w800 : FontWeight.w600,
                            color: _statsPeriod == 'hari_ini' ? AppColors.primary : AppColors.textSecondary,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Hero Total Kunjungan Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF064E3B), Color(0xFF047857)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF064E3B).withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Text(
                    _statsPeriod == 'hari_ini' ? 'Total Kunjungan Tamu Hari Ini' : 'Total Kunjungan Terdaftar',
                    style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '$total',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 42,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Buku Tamu Digital PTSP Kemenag Barito Utara',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // Highlights Row (Top Seksi & Top Instansi)
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(LucideIcons.userCheck, size: 14, color: Color(0xFF059669)),
                            SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Top Seksi Tujuan',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          topSeksi,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Row(
                          children: [
                            Icon(LucideIcons.building2, size: 14, color: Color(0xFF334155)),
                            SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'Top Tipe Instansi',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          topInstansi,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Distribution Switcher
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Distribusi Data Kunjungan',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                Row(
                  children: [
                    _buildMetricButton('seksi', 'Seksi Tujuan'),
                    const SizedBox(width: 6),
                    _buildMetricButton('instansi', 'Tipe Instansi'),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Visual Progress Bars
            if (_statsMetric == 'seksi') ...[
              if (sortedSeksi.isEmpty)
                _buildEmptyStats()
              else
                ...sortedSeksi.map((entry) {
                  final pct = total > 0 ? (entry.value / total) : 0.0;
                  return _buildStatBarItem(
                    title: entry.key,
                    count: entry.value,
                    pct: pct,
                    color: AppColors.primaryMedium,
                  );
                }),
            ] else ...[
              if (sortedInstansi.isEmpty)
                _buildEmptyStats()
              else
                ...sortedInstansi.map((entry) {
                  final pct = total > 0 ? (entry.value / total) : 0.0;
                  return _buildStatBarItem(
                    title: entry.key,
                    count: entry.value,
                    pct: pct,
                    color: const Color(0xFF2563EB),
                  );
                }),
            ],
          ],
        );
      },
    );
  }

  Widget _buildMetricButton(String metric, String label) {
    final isSelected = _statsMetric == metric;
    return InkWell(
      onTap: () => setState(() => _statsMetric = metric),
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10.5,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildStatBarItem({
    required String title,
    required int count,
    required double pct,
    required Color color,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: AppColors.textPrimary),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '$count Tamu (${(pct * 100).toStringAsFixed(0)}%)',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 11, color: color),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: pct,
              minHeight: 7,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: AlwaysStoppedAnimation<Color>(color),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyStats() {
    return const Center(
      child: Padding(
        padding: EdgeInsets.all(24.0),
        child: Text('Belum ada data kunjungan untuk dirangkum.'),
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 4: JANJI TEMU & AUDIENSI (FORM & RIWAYAT DATABASE) ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildJanjiTemuTab() {
    final appAsync = ref.watch(appointmentListProvider);
    final appCount = appAsync.valueOrNull?.length ?? 0;

    return Column(
      children: [
        // Sub-Tab Switcher (Ajukan vs Riwayat)
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          color: Colors.white,
          child: Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _appointmentSubTab = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: _appointmentSubTab == 0 ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow: _appointmentSubTab == 0
                            ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            LucideIcons.calendarPlus,
                            size: 14,
                            color: _appointmentSubTab == 0 ? AppColors.primary : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Ajukan Jadwal',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _appointmentSubTab == 0 ? FontWeight.w800 : FontWeight.w600,
                              color: _appointmentSubTab == 0 ? AppColors.primary : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _appointmentSubTab = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: _appointmentSubTab == 1 ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(9),
                        boxShadow: _appointmentSubTab == 1
                            ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            LucideIcons.calendarCheck,
                            size: 14,
                            color: _appointmentSubTab == 1 ? AppColors.primary : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'Riwayat Janji Temu',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: _appointmentSubTab == 1 ? FontWeight.w800 : FontWeight.w600,
                              color: _appointmentSubTab == 1 ? AppColors.primary : AppColors.textSecondary,
                            ),
                          ),
                          if (appCount > 0) ...[
                            const SizedBox(width: 5),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0284C7),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                '$appCount',
                                style: const TextStyle(fontSize: 9.5, color: Colors.white, fontWeight: FontWeight.w800),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // SubTab Content
        Expanded(
          child: _appointmentSubTab == 0
              ? _buildFormJanjiTemuSubTab()
              : _buildRiwayatJanjiTemuSubTab(),
        ),
      ],
    );
  }

  // ── SUBTAB A: FORM AJUKAN JANJI TEMU ──
  Widget _buildFormJanjiTemuSubTab() {
    final dateStr = formatIndonesianDate(_selectedDate, pattern: 'dd MMMM yyyy');
    final timeStr =
        '${_selectedTime.hour.toString().padLeft(2, '0')}:${_selectedTime.minute.toString().padLeft(2, '0')} WIB';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _appointmentFormKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info Card
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFE0F2FE),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFBAE6FD)),
              ),
              child: const Row(
                children: [
                  Icon(LucideIcons.calendarClock, color: Color(0xFF0284C7), size: 22),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Ajukan audiensi atau janji temu resmi dengan pimpinan/pejabat Kemenag Barito Utara agar kepastian jadwal dapat disesuaikan.',
                      style: TextStyle(fontSize: 11.5, color: Color(0xFF0369A1), height: 1.35),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Form Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildFormLabel('Nama Lengkap Pemohon', isRequired: true),
                  _buildTextFormField(
                    controller: _appNamaController,
                    hint: 'Nama lengkap Anda...',
                    icon: LucideIcons.user,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Nama pemohon wajib diisi';
                      if (v.trim().length < 3) return 'Nama minimal 3 karakter';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Nomor WhatsApp (Untuk Konfirmasi Jadwal)', isRequired: true),
                  _buildTextFormField(
                    controller: _appTeleponController,
                    hint: 'Contoh: 081234567890',
                    icon: LucideIcons.phone,
                    keyboard: TextInputType.phone,
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Nomor WhatsApp wajib diisi';
                      final clean = v.replaceAll(RegExp(r'[^0-9]'), '');
                      if (clean.length < 9) return 'Nomor WhatsApp minimal 9 digit angka';
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Kategori Pemohon', isRequired: true),
                  DropdownButtonFormField<String>(
                    initialValue: _appTipeInstansi,
                    isExpanded: true,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.landmark, size: 18, color: AppColors.primaryMedium),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: kInstitutionTypeOptions.map((opt) {
                      return DropdownMenuItem<String>(
                        value: opt,
                        child: Text(opt, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _appTipeInstansi = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Asal Instansi / Lembaga / Tokoh Masyarakat', isRequired: true),
                  _buildTextFormField(
                    controller: _appInstansiController,
                    hint: 'Nama lembaga / instansi Anda...',
                    icon: LucideIcons.building2,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Asal instansi/lembaga wajib diisi' : null,
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Pejabat / Seksi yang Ingin Ditemui', isRequired: true),
                  DropdownButtonFormField<String>(
                    initialValue: _appPejabat,
                    isExpanded: true,
                    decoration: InputDecoration(
                      prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: AppColors.primaryMedium),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: kOfficerOptions.map((p) {
                      return DropdownMenuItem<String>(
                        value: p,
                        child: Text(p, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _appPejabat = val);
                    },
                  ),
                  const SizedBox(height: 14),

                  if (_appPejabat == 'Unit Lainnya (Bisa Tulis Manual)') ...[
                    _buildFormLabel('Tuliskan Pejabat / Unit Tujuan', isRequired: true),
                    _buildTextFormField(
                      controller: _appCustomOfficerController,
                      hint: 'Contoh: Kepala Madrasah / Analis Kepegawaian...',
                      icon: LucideIcons.pencil,
                      validator: (v) {
                        if (_appPejabat == 'Unit Lainnya (Bisa Tulis Manual)' && (v == null || v.trim().isEmpty)) {
                          return 'Nama pejabat/unit tujuan wajib dituliskan';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 14),
                  ],

                  // Date & Time Row Pickers
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildFormLabel('Tanggal Temu', isRequired: true),
                            InkWell(
                              onTap: () async {
                                final picked = await showDatePicker(
                                  context: context,
                                  initialDate: _selectedDate,
                                  firstDate: DateTime.now(),
                                  lastDate: DateTime.now().add(const Duration(days: 90)),
                                );
                                if (picked != null) setState(() => _selectedDate = picked);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFCBD5E1)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.calendar, size: 16, color: AppColors.primaryMedium),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        dateStr,
                                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildFormLabel('Jam Temu', isRequired: true),
                            InkWell(
                              onTap: () async {
                                final picked = await showTimePicker(
                                  context: context,
                                  initialTime: _selectedTime,
                                );
                                if (picked != null) setState(() => _selectedTime = picked);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: const Color(0xFFCBD5E1)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(LucideIcons.clock, size: 16, color: AppColors.primaryMedium),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        timeStr,
                                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),

                  _buildFormLabel('Topik / Pokok Bahasan Audiensi', isRequired: true),
                  _buildTextFormField(
                    controller: _appKeperluanController,
                    hint: 'Jelaskan topik audiensi atau agenda yang ingin dibahas...',
                    icon: LucideIcons.fileText,
                    maxLines: 3,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Pokok bahasan wajib diisi' : null,
                  ),
                  const SizedBox(height: 22),

                  SizedBox(
                    height: 48,
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isAppLoading ? null : _submitAppointment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF0284C7),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 2,
                      ),
                      icon: _isAppLoading
                          ? const SizedBox(
                              height: 18,
                              width: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(LucideIcons.calendarCheck, size: 18),
                      label: Text(
                        _isAppLoading ? 'Mengirim Jadwal...' : 'Kirim Permohonan Janji Temu',
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── SUBTAB B: RIWAYAT JANJI TEMU (DATABASE API) ──
  Widget _buildRiwayatJanjiTemuSubTab() {
    final appAsync = ref.watch(appointmentListProvider);

    return Column(
      children: [
        // Filter Status Chips
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: Colors.white,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildAppStatusChip('Semua'),
                const SizedBox(width: 6),
                _buildAppStatusChip('Menunggu'),
                const SizedBox(width: 6),
                _buildAppStatusChip('Disetujui'),
                const SizedBox(width: 6),
                _buildAppStatusChip('Selesai'),
                const SizedBox(width: 6),
                _buildAppStatusChip('Ditolak'),
              ],
            ),
          ),
        ),

        Expanded(
          child: appAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
            error: (e, s) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(LucideIcons.alertCircle, color: Colors.red, size: 36),
                  const SizedBox(height: 10),
                  const Text('Gagal mengambil data riwayat janji temu.'),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () => ref.refresh(appointmentListProvider),
                    child: const Text('Muat Ulang'),
                  ),
                ],
              ),
            ),
            data: (items) {
              final filtered = items.where((a) {
                if (_appStatusFilter == 'Semua') return true;
                final status = a.status.toLowerCase();
                if (_appStatusFilter == 'Menunggu') return status == 'pending' || status == 'menunggu';
                if (_appStatusFilter == 'Disetujui') return status == 'approved' || status == 'disetujui';
                if (_appStatusFilter == 'Selesai') return status == 'completed' || status == 'selesai';
                if (_appStatusFilter == 'Ditolak') return status == 'rejected' || status == 'ditolak' || status == 'cancelled';
                return true;
              }).toList();

              if (filtered.isEmpty) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.calendarX2, size: 44, color: AppColors.textMuted),
                        const SizedBox(height: 12),
                        const Text(
                          'Tidak ada riwayat janji temu pada kategori ini.',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        const SizedBox(height: 12),
                        TextButton.icon(
                          onPressed: () => setState(() => _appointmentSubTab = 0),
                          icon: const Icon(LucideIcons.calendarPlus, size: 16),
                          label: const Text('Ajukan Janji Temu Baru'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => ref.refresh(appointmentListProvider),
                child: ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: filtered.length,
                  itemBuilder: (context, index) {
                    final app = filtered[index];
                    return _buildAppointmentCard(app);
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAppStatusChip(String label) {
    final isSelected = _appStatusFilter == label;
    return InkWell(
      onTap: () => setState(() => _appStatusFilter = label),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0284C7) : const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(AppointmentItem app) {
    final dateFormatted = formatIndonesianDate(app.appointmentDate, pattern: 'EEEE, dd MMM yyyy');

    // Status Badge Styling
    Color statusBg = const Color(0xFFFEF3C7);
    Color statusText = const Color(0xFFB45309);
    String statusLabel = 'Menunggu Konfirmasi';
    IconData statusIcon = LucideIcons.clock;

    final st = app.status.toLowerCase();
    if (st == 'approved' || st == 'disetujui') {
      statusBg = const Color(0xFFDCFCE7);
      statusText = const Color(0xFF15803D);
      statusLabel = 'Disetujui';
      statusIcon = LucideIcons.circleCheck;
    } else if (st == 'completed' || st == 'selesai') {
      statusBg = const Color(0xFFDBEAFE);
      statusText = const Color(0xFF1D4ED8);
      statusLabel = 'Selesai';
      statusIcon = LucideIcons.checkCheck;
    } else if (st == 'rejected' || st == 'ditolak' || st == 'cancelled') {
      statusBg = const Color(0xFFFEE2E2);
      statusText = const Color(0xFFB91C1C);
      statusLabel = 'Ditolak / Dibatalkan';
      statusIcon = LucideIcons.circleX;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Pejabat & Status Badge
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(LucideIcons.userCheck, size: 14, color: AppColors.primaryMedium),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        app.intendedOfficer,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIcon, size: 11, color: statusText),
                    const SizedBox(width: 4),
                    Text(
                      statusLabel,
                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: statusText),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Schedule Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFBBF7D0)),
            ),
            child: Row(
              children: [
                const Icon(LucideIcons.calendarDays, size: 14, color: Color(0xFF16A34A)),
                const SizedBox(width: 8),
                Text(
                  '$dateFormatted, ${app.appointmentTime} WIB',
                  style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF166534)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Applicant & Instansi
          Row(
            children: [
              const Icon(LucideIcons.user, size: 12, color: AppColors.textMuted),
              const SizedBox(width: 6),
              Text(
                'Pemohon: ${app.guestName}',
                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
              ),
              if (app.institutionName != null && app.institutionName!.isNotEmpty) ...[
                const SizedBox(width: 4),
                Text(
                  '(${app.institutionName})',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),

          // Purpose / Subject
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFF1F5F9)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Topik Bahasan:',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textMuted),
                ),
                const SizedBox(height: 2),
                Text(
                  app.purpose,
                  style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── HELPER WIDGETS ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildFormLabel(String label, {bool isRequired = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: RichText(
        text: TextSpan(
          text: label,
          style: const TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          children: isRequired
              ? [
                  const TextSpan(
                    text: ' *',
                    style: TextStyle(color: Colors.red, fontWeight: FontWeight.w800),
                  ),
                ]
              : [],
        ),
      ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    TextInputType? keyboard,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboard,
      validator: validator,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
        prefixIcon: maxLines == 1 ? Icon(icon, size: 18, color: AppColors.primaryMedium) : null,
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
      ),
    );
  }
}
