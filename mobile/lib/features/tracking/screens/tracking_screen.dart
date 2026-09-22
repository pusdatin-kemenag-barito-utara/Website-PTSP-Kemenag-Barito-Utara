import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../pegawai/models/cuti_model.dart';
import '../models/tracking_model.dart';
import '../providers/tracking_provider.dart';

/// Helper format tanggal Indonesia dengan fallback aman
String formatIndonesianDate(DateTime dt, {String pattern = 'EEEE, dd MMMM yyyy'}) {
  try {
    return DateFormat(pattern, 'id_ID').format(dt);
  } catch (_) {
    return DateFormat(pattern).format(dt);
  }
}

/// Halaman Lacak Berkas Permohonan PTSP & Cek Sisa Cuti Pegawai ASN
class TrackingScreen extends ConsumerStatefulWidget {
  final int initialTab;
  const TrackingScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<TrackingScreen> createState() => _TrackingScreenState();
}

class _TrackingScreenState extends ConsumerState<TrackingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // ── Tab 1: Lacak Berkas Controllers & State ──
  final _searchTicketController = TextEditingController();
  String _searchedTicket = '';

  // ── Tab 2: Cek Sisa Cuti Controllers & State ──
  final _nipController = TextEditingController();
  String _searchedNip = '';

  @override
  void initState() {
    super.initState();
    final tabFromProvider = ref.read(selectedTrackingTabProvider);
    final initial = widget.initialTab != 0 ? widget.initialTab : tabFromProvider;
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: initial.clamp(0, 1),
    );
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        ref.read(selectedTrackingTabProvider.notifier).state = _tabController.index;
      }
    });
  }

  @override
  void didUpdateWidget(covariant TrackingScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab && widget.initialTab != _tabController.index) {
      _tabController.animateTo(widget.initialTab.clamp(0, 1));
      ref.read(selectedTrackingTabProvider.notifier).state = widget.initialTab.clamp(0, 1);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchTicketController.dispose();
    _nipController.dispose();
    super.dispose();
  }

  // ── Action: Lacak No. Tiket ──
  void _doSearchTicket([String? query]) {
    final raw = query ?? _searchTicketController.text;
    final cleaned = raw.trim().toUpperCase();
    if (cleaned.isEmpty) return;

    setState(() {
      _searchTicketController.text = cleaned;
      _searchedTicket = cleaned;
    });
  }

  Future<void> _pasteTicketFromClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    if (data?.text != null && data!.text!.trim().isNotEmpty) {
      final text = data.text!.trim().toUpperCase();
      _searchTicketController.text = text;
      _doSearchTicket(text);
    }
  }

  // ── Action: Cek Cuti Pegawai NIP ──
  void _doSearchCuti([String? query]) {
    final raw = query ?? _nipController.text;
    final cleaned = raw.replaceAll(RegExp(r'[^0-9]'), '').trim();
    if (cleaned.isEmpty) return;

    setState(() {
      _nipController.text = cleaned;
      _searchedNip = cleaned;
    });
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<int>(selectedTrackingTabProvider, (prev, next) {
      if (_tabController.index != next) {
        _tabController.animateTo(next);
      }
    });

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
              'Lacak & Cek Layanan',
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
          preferredSize: const Size.fromHeight(50),
          child: Container(
            color: const Color(0xFF043E30),
            child: TabBar(
              controller: _tabController,
              labelColor: const Color(0xFFFDE68A), // Amber Gold
              unselectedLabelColor: Colors.white70,
              indicatorColor: const Color(0xFFF59E0B),
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700),
              unselectedLabelStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w500),
              tabs: const [
                Tab(
                  icon: Icon(LucideIcons.fileSearch, size: 16),
                  text: 'Lacak Berkas',
                ),
                Tab(
                  icon: Icon(LucideIcons.calendarCheck, size: 16),
                  text: 'Cek Sisa Cuti Pegawai',
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildLacakBerkasTab(),
          _buildCekCutiPegawaiTab(),
        ],
      ),
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 1: LACAK BERKAS PERMOHONAN (NO. TIKET) ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildLacakBerkasTab() {
    final trackingAsync = _searchedTicket.isNotEmpty
        ? ref.watch(trackingResultProvider(_searchedTicket))
        : null;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Search Box Card
          Container(
            padding: const EdgeInsets.all(16),
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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Nomor Registrasi / Tiket',
                      style: TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    TextButton.icon(
                      onPressed: _pasteTicketFromClipboard,
                      style: TextButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      icon: const Icon(LucideIcons.clipboard, size: 14, color: AppColors.primaryMedium),
                      label: const Text(
                        'Tempel No. Tiket',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryMedium),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _searchTicketController,
                  textCapitalization: TextCapitalization.characters,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  decoration: InputDecoration(
                    hintText: 'Contoh: REQ-20260920-ACF07C',
                    hintStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.normal, color: AppColors.textMuted),
                    prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.primaryMedium),
                    suffixIcon: _searchTicketController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(LucideIcons.x, size: 16),
                            onPressed: () {
                              _searchTicketController.clear();
                              setState(() => _searchedTicket = '');
                            },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                  onSubmitted: (val) => _doSearchTicket(val),
                ),
                const SizedBox(height: 10),

                // Quick Sample Pill Chip
                Row(
                  children: [
                    const Text(
                      'Coba No. Tiket:',
                      style: TextStyle(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: () {
                        _searchTicketController.text = 'REQ-20260920-ACF07C';
                        _doSearchTicket('REQ-20260920-ACF07C');
                      },
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Text(
                          'REQ-20260920-ACF07C',
                          style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: AppColors.primary, fontFamily: 'monospace'),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: () => _doSearchTicket(),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    icon: const Icon(LucideIcons.fileSearch, size: 18),
                    label: const Text('Lacak Status Berkas', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Content Result Area
          if (_searchedTicket.isEmpty)
            _buildLacakEmptyState()
          else if (trackingAsync != null)
            trackingAsync.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: AppColors.primary),
                      SizedBox(height: 12),
                      Text('Melacak permohonan ke database...', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
              error: (e, s) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.alertCircle, color: Color(0xFFDC2626)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Gagal terhubung ke backend untuk melacak berkas. Pastikan koneksi internet atau server aktif.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF991B1B)),
                      ),
                    ),
                  ],
                ),
              ),
              data: (model) {
                if (model == null) {
                  return _buildTicketNotFoundCard();
                }
                return _buildTicketResultCard(model);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildLacakEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Center(
              child: Icon(LucideIcons.fileClock, size: 24, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Lacak Berkas Secara Real-Time',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Masukkan nomor registrasi yang tertera pada tanda terima PTSP atau pesan WhatsApp notifikasi Anda untuk mengetahui status proses terkini.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 18),
          const Divider(),
          const SizedBox(height: 12),
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              '5 Tahapan Standar Pelayanan Berkas:',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(height: 10),
          _buildStageLegend('1', 'Berkas Masuk & Teregistrasi'),
          _buildStageLegend('2', 'Verifikasi Dokumen oleh Petugas Loket'),
          _buildStageLegend('3', 'Pemeriksaan & Validasi Seksi Teknis'),
          _buildStageLegend('4', 'Penandatanganan Surat / Rekomendasi / SK'),
          _buildStageLegend('5', 'Selesai & Siap Diambil di Loket PTSP'),
        ],
      ),
    );
  }

  Widget _buildStageLegend(String step, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          CircleAvatar(
            radius: 10,
            backgroundColor: AppColors.primarySoft,
            child: Text(
              step,
              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: AppColors.primary),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketNotFoundCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Column(
        children: [
          const Icon(LucideIcons.searchX, color: Color(0xFFDC2626), size: 42),
          const SizedBox(height: 12),
          const Text(
            'Nomor Permohonan Tidak Ditemukan',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF991B1B),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Nomor tiket "$_searchedTicket" belum terdaftar pada sistem PTSP Kemenag Barito Utara. Mohon periksa kembali ejaan huruf dan angka, atau hubungi petugas loket.',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: Color(0xFFB91C1C), height: 1.35),
          ),
        ],
      ),
    );
  }

  Widget _buildTicketResultCard(TrackingModel item) {
    final createdDateStr = formatIndonesianDate(item.createdAt, pattern: 'dd MMM yyyy, HH:mm');

    return Container(
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
          // Header Status Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: item.statusColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(LucideIcons.circleCheck, size: 12, color: Colors.white),
                          SizedBox(width: 5),
                          Text(
                            'STATUS SAAT INI',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white, letterSpacing: 0.5),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      createdDateStr,
                      style: const TextStyle(fontSize: 11, color: Colors.white70, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  item.statusLabel.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  item.statusDescription,
                  style: const TextStyle(fontSize: 12, color: Colors.white, height: 1.35),
                ),
              ],
            ),
          ),

          // Details Body
          Padding(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Nomor Tiket Row with Copy
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(LucideIcons.hash, size: 16, color: AppColors.primaryMedium),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Nomor Tiket Permohonan', style: TextStyle(fontSize: 10, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                            Text(
                              item.requestNumber,
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontFamily: 'monospace'),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(LucideIcons.copy, size: 16, color: AppColors.primaryMedium),
                        tooltip: 'Salin Nomor Tiket',
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: item.requestNumber));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Nomor tiket berhasil disalin ke clipboard.'),
                              duration: Duration(seconds: 2),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                _buildTrackInfoRow('Layanan Utama', item.serviceName, LucideIcons.layers),
                const SizedBox(height: 10),
                _buildTrackInfoRow('Rincian Berkas', item.itemName, LucideIcons.fileText),
                const SizedBox(height: 20),

                const Text(
                  'Progres Tahapan Pelayanan',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 14),

                // 5-Stage Stepper
                _buildTimelineStep(
                  stepNumber: 1,
                  title: '1. Berkas Masuk & Teregistrasi',
                  desc: 'Permohonan berhasil disimpan ke sistem informasi PTSP.',
                  isDone: item.currentStep >= 1,
                  isActive: item.currentStep == 1,
                ),
                _buildTimelineStep(
                  stepNumber: 2,
                  title: '2. Verifikasi Dokumen oleh Petugas Loket',
                  desc: 'Pengecekan kelengkapan berkas persyaratan fisik & digital.',
                  isDone: item.currentStep >= 2,
                  isActive: item.currentStep == 2,
                  isError: item.status == 'revision_required',
                  errorNote: item.revisionNote,
                ),
                _buildTimelineStep(
                  stepNumber: 3,
                  title: '3. Pemeriksaan & Validasi Seksi Teknis',
                  desc: 'Telaah dokumen oleh Kepala Seksi / Penyelenggara teknis.',
                  isDone: item.currentStep >= 3,
                  isActive: item.currentStep == 3,
                ),
                _buildTimelineStep(
                  stepNumber: 4,
                  title: '4. Penandatanganan Surat / Rekomendasi / SK',
                  desc: 'Proses penandatanganan dan penomoran resmi.',
                  isDone: item.currentStep >= 4,
                  isActive: item.currentStep == 4,
                ),
                _buildTimelineStep(
                  stepNumber: 5,
                  title: '5. Selesai & Siap Diambil di Loket PTSP',
                  desc: item.status == 'rejected'
                      ? (item.rejectionReason ?? 'Permohonan ditolak.')
                      : 'Dokumen hasil telah terbit dan siap diserahkan kepada pemohon.',
                  isDone: item.currentStep >= 5 && item.status != 'rejected',
                  isActive: item.currentStep == 5,
                  isLast: true,
                  isError: item.status == 'rejected',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackInfoRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.primaryMedium),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTimelineStep({
    required int stepNumber,
    required String title,
    required String desc,
    required bool isDone,
    required bool isActive,
    bool isLast = false,
    bool isError = false,
    String? errorNote,
  }) {
    Color nodeColor = const Color(0xFFCBD5E1);
    IconData nodeIcon = LucideIcons.circle;

    if (isError) {
      nodeColor = const Color(0xFFDC2626);
      nodeIcon = LucideIcons.circleX;
    } else if (isDone) {
      nodeColor = const Color(0xFF16A34A);
      nodeIcon = LucideIcons.circleCheck;
    } else if (isActive) {
      nodeColor = const Color(0xFF2563EB);
      nodeIcon = LucideIcons.clock;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            CircleAvatar(
              radius: 12,
              backgroundColor: nodeColor.withValues(alpha: 0.15),
              child: Icon(nodeIcon, size: 14, color: nodeColor),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 42,
                color: isDone ? const Color(0xFF16A34A) : const Color(0xFFE2E8F0),
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: isActive || isDone ? AppColors.textPrimary : AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  desc,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.3),
                ),
                if (errorNote != null && errorNote.trim().isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEE2E2),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFFCA5A5)),
                    ),
                    child: Text(
                      'Catatan: $errorNote',
                      style: const TextStyle(fontSize: 10.5, color: Color(0xFF991B1B), fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ═════════════════════════════════════════════════════════════════
  // ── TAB 2: CEK SISA CUTI PEGAWAI (BERDASARKAN NIP) ──
  // ═════════════════════════════════════════════════════════════════
  Widget _buildCekCutiPegawaiTab() {
    final cutiAsync = _searchedNip.isNotEmpty
        ? ref.watch(rekapCutiResultProvider(_searchedNip))
        : null;

    final currentNipLength = _nipController.text.length;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Penjelasan Kepegawaian
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF047857)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(LucideIcons.calendarClock, color: Color(0xFFFDE68A), size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Layanan Cuti ASN',
                      style: TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  'Layanan Pengecekan Sisa Jumlah Cuti dan Hak Cuti Pegawai Kementerian Agama Kabupaten Barito Utara.',
                  style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 11.5, height: 1.35),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Search Card
          Container(
            padding: const EdgeInsets.all(16),
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
                const Text(
                  'Cari Data Pegawai',
                  style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Masukkan NIP (Nomor Induk Pegawai) Anda yang terdaftar pada sistem:',
                  style: TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),

                TextField(
                  controller: _nipController,
                  keyboardType: TextInputType.number,
                  maxLength: 18,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 1),
                  onChanged: (val) => setState(() {}),
                  onSubmitted: (val) {
                    if (val.length == 18) _doSearchCuti(val);
                  },
                  decoration: InputDecoration(
                    hintText: 'Masukkan 18 digit NIP Pegawai...',
                    hintStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.normal, color: AppColors.textMuted, letterSpacing: 0),
                    prefixIcon: const Icon(LucideIcons.user, size: 18, color: AppColors.primaryMedium),
                    suffixIcon: _nipController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(LucideIcons.x, size: 16),
                            onPressed: () {
                              _nipController.clear();
                              setState(() => _searchedNip = '');
                            },
                          )
                        : null,
                    counterText: '',
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                    ),
                  ),
                ),

                // Realtime Validation NIP Counter
                if (currentNipLength > 0 && currentNipLength != 18) ...[
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(LucideIcons.alertCircle, size: 13, color: Color(0xFFDC2626)),
                      const SizedBox(width: 5),
                      Text(
                        'NIP harus 18 digit (saat ini: $currentNipLength digit, kurang ${18 - currentNipLength} digit)',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFFDC2626)),
                      ),
                    ],
                  ),
                ] else if (currentNipLength == 18) ...[
                  const SizedBox(height: 6),
                  const Row(
                    children: [
                      Icon(LucideIcons.circleCheck, size: 13, color: Color(0xFF16A34A)),
                      SizedBox(width: 5),
                      Text(
                        'Format 18 digit NIP sudah lengkap',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF16A34A)),
                      ),
                    ],
                  ),
                ],

                const SizedBox(height: 12),

                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton.icon(
                    onPressed: currentNipLength == 18 ? () => _doSearchCuti() : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: const Color(0xFFA7F3D0),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      elevation: 2,
                    ),
                    icon: const Icon(LucideIcons.search, size: 18),
                    label: const Text('Cari Data Pegawai', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Result Area Cuti
          if (_searchedNip.isEmpty)
            _buildCutiEmptyState()
          else if (cutiAsync != null)
            cutiAsync.when(
              loading: () => const Center(
                child: Padding(
                  padding: EdgeInsets.all(40.0),
                  child: Column(
                    children: [
                      CircularProgressIndicator(color: AppColors.primary),
                      SizedBox(height: 12),
                      Text('Mengambil data cuti pegawai dari database...', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
              error: (e, s) => Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEE2E2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.alertCircle, color: Color(0xFFDC2626)),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Gagal mengambil data cuti. Periksa koneksi backend Anda.',
                        style: TextStyle(fontSize: 12, color: Color(0xFF991B1B)),
                      ),
                    ),
                  ],
                ),
              ),
              data: (rekap) {
                if (rekap == null) {
                  return _buildCutiNotFoundCard();
                }
                return _buildCutiResultCard(rekap);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildCutiEmptyState() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Center(
              child: Icon(LucideIcons.userCheck, size: 24, color: AppColors.primary),
            ),
          ),
          const SizedBox(height: 12),
          const Text(
            'Informasi Sisa Cuti ASN',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Ketik 18 digit NIP Anda pada formulir pencarian di atas untuk memeriksa sisa kuota cuti tahunan, hak cuti N-1 & N-2, serta rincian cuti yang telah diambil.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }

  Widget _buildCutiNotFoundCard() {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Column(
        children: [
          const Icon(LucideIcons.userX, color: Color(0xFFDC2626), size: 42),
          const SizedBox(height: 12),
          const Text(
            'Data Pegawai Tidak Ditemukan',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 15.5,
              fontWeight: FontWeight.w800,
              color: Color(0xFF991B1B),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'NIP "$_searchedNip" belum terdaftar pada master data pegawai atau rekap cuti Kemenag Barito Utara. Mohon periksa kembali nomor NIP Anda atau hubungi Subbag Tata Usaha (Kepegawaian).',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: Color(0xFFB91C1C), height: 1.35),
          ),
        ],
      ),
    );
  }

  Widget _buildCutiResultCard(RekapCutiPegawai rekap) {
    final todayStr = formatIndonesianDate(DateTime.now(), pattern: 'dd MMMM yyyy');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Employee Profile Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.primarySoft,
                    child: Text(
                      rekap.name.isNotEmpty ? rekap.name[0].toUpperCase() : 'P',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.primary),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          rekap.name,
                          style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'NIP. ${rekap.nip}',
                          style: const TextStyle(fontSize: 11.5, fontFamily: 'monospace', color: AppColors.textMuted, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDCFCE7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text(
                      'Aktif',
                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: Color(0xFF16A34A)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              const Divider(height: 1),
              const SizedBox(height: 12),

              _buildProfileDetailRow('Jabatan', rekap.jabatan, LucideIcons.briefcase),
              const SizedBox(height: 8),
              _buildProfileDetailRow('Unit Kerja', rekap.unitKerja, LucideIcons.building2),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Hero Sisa Cuti Card
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF064E3B), Color(0xFF059669)],
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'SISA KUOTA CUTI TAHUNAN (${rekap.tahun})',
                    style: const TextStyle(color: Color(0xFFA7F3D0), fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'Hak Cuti: ${rekap.totalCuti} Hari',
                      style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w700),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    '${rekap.sisaCuti}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 48,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'HARI KERJA',
                    style: TextStyle(color: Color(0xFFD1FAE5), fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'Rincian: Sisa N-2 (${rekap.cutiTahun1} hari) • Sisa N-1 (${rekap.cutiTahun2} hari) • Hak N (12 hari)',
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70, fontSize: 10.5),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // 6 Breakdown Cuti Terpakai Grid
        const Text(
          'Rincian Penggunaan Cuti',
          style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
        ),
        const SizedBox(height: 10),

        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.1,
          children: [
            _buildLeaveGridItem('Cuti Tahunan', '${rekap.cutiTahunan} Hari'),
            _buildLeaveGridItem('Alasan Penting', '${rekap.cutiPenting} Hari'),
            _buildLeaveGridItem('Cuti Bersalin', '${rekap.cutiBersalin} Hari'),
            _buildLeaveGridItem('Cuti Besar', '${rekap.cutiBesar} Hari'),
            _buildLeaveGridItem('Cuti Sakit', '${rekap.cutiSakit} Hari'),
            _buildLeaveGridItem('CLTN', '${rekap.cutiCltn} Hari'),
          ],
        ),
        const SizedBox(height: 16),

        // Update Tag
        Center(
          child: Text(
            'Data sinkron per $todayStr',
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
        ),
      ],
    );
  }

  Widget _buildProfileDetailRow(String label, String value, IconData icon) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 14, color: AppColors.primaryMedium),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(fontSize: 11.5, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
        ),
      ],
    );
  }

  Widget _buildLeaveGridItem(String title, String count) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 3),
          Text(
            count,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }
}
