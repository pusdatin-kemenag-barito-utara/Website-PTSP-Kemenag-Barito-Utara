import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/layanan_model.dart';
import '../providers/layanan_provider.dart';
import '../widgets/layanan_card.dart';

/// Halaman Katalog Layanan Terpadu PTSP Kemenag Barito Utara
/// Tab 1: Layanan Masyarakat (Publik per-Bidang Unit Kerja)
/// Tab 2: Layanan Pegawai (ASN Internal)
class LayananListScreen extends ConsumerStatefulWidget {
  final int initialTab;
  const LayananListScreen({super.key, this.initialTab = 0});

  @override
  ConsumerState<LayananListScreen> createState() => _LayananListScreenState();
}

class _LayananListScreenState extends ConsumerState<LayananListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchMasyarakatController = TextEditingController();
  final TextEditingController _searchPegawaiController = TextEditingController();

  String _selectedMasyarakatCategory = 'Semua';
  String _searchMasyarakatQuery = '';

  String _selectedAsnCategory = 'Semua';
  String _searchAsnQuery = '';

  final List<String> _masyarakatCategories = [
    'Semua',
    'Madrasah',
    'Bimas Islam',
    'Tata Usaha',
    'PAIS',
    'PD Pontren',
    'Zakat & Wakaf',
    'Hindu',
    'Kristen',
  ];

  final List<String> _asnCategories = [
    'Semua',
    'Cuti & Izin',
    'Karier & Mutasi',
    'Kesejahteraan',
    'Pengembangan Diri',
    'Administrasi ASN',
  ];

  @override
  void initState() {
    super.initState();
    final tabFromProvider = ref.read(selectedLayananTabProvider);
    final initial = widget.initialTab != 0 ? widget.initialTab : tabFromProvider;
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: initial.clamp(0, 1),
    );
    _tabController.addListener(() {
      if (!_tabController.indexIsChanging) {
        ref.read(selectedLayananTabProvider.notifier).state = _tabController.index;
      }
    });
  }

  @override
  void didUpdateWidget(covariant LayananListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialTab != widget.initialTab && widget.initialTab != _tabController.index) {
      _tabController.animateTo(widget.initialTab.clamp(0, 1));
      ref.read(selectedLayananTabProvider.notifier).state = widget.initialTab.clamp(0, 1);
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchMasyarakatController.dispose();
    _searchPegawaiController.dispose();
    super.dispose();
  }

  /// Menampilkan BottomSheet Rincian Syarat & SOP untuk Layanan ASN
  void _showAsnSyaratModal(BuildContext context, ServiceModel service) {
    final meta = AsnMeta.get(service.name);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Drag handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Title & Close Button
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 12, 12),
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
                      child: Center(
                        child: Icon(meta.icon, size: 20, color: AppColors.primary),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            service.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Kategori: ${meta.category} • SLA: ${meta.sla}',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(LucideIcons.x, size: 20),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // Scrollable content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    // Deskripsi Layanan
                    if (service.description != null && service.description!.isNotEmpty) ...[
                      const Text(
                        'Deskripsi Layanan',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        service.description!,
                        style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.5),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Catatan SOP / Teks Persyaratan Khusus jika ada
                    if (service.requirementsText != null && service.requirementsText!.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFFBEB),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFFDE68A)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Row(
                              children: [
                                Icon(LucideIcons.alertCircle, size: 16, color: Color(0xFFD97706)),
                                SizedBox(width: 8),
                                Text(
                                  'Catatan Persyaratan Resmi',
                                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF92400E)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              service.requirementsText!,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF78350F), height: 1.5),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // Sub-jenis Layanan & Dokumen Persyaratan
                    if (service.items.isNotEmpty) ...[
                      Text(
                        'Rincian Berkas Persyaratan (${service.items.length} Sub-Layanan)',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 10),
                      for (final item in service.items)
                        Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(LucideIcons.fileCheck, size: 15, color: AppColors.primary),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      item.name,
                                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                                    ),
                                  ),
                                  if (item.estimatedTime != null)
                                    Text(
                                      item.estimatedTime!,
                                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                                    ),
                                ],
                              ),
                              if (item.requirements.isNotEmpty) ...[
                                const SizedBox(height: 8),
                                for (final req in item.requirements)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4, left: 6),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('• ', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
                                        Expanded(
                                          child: Text(
                                            req.documentName,
                                            style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569)),
                                          ),
                                        ),
                                        if (req.isRequired)
                                          Container(
                                            margin: const EdgeInsets.only(left: 4),
                                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFFFE4E6),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: const Text('Wajib', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Color(0xFFE11D48))),
                                          ),
                                      ],
                                    ),
                                  ),
                              ],
                            ],
                          ),
                        ),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'Dokumen persyaratan dapat dikonfirmasi langsung dengan admin kepegawaian Subbagian Tata Usaha Kantor Kemenag Barito Utara.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF475569), height: 1.4),
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),
                    // Tombol Ajukan di BottomSheet
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          Navigator.pop(ctx);
                          _handleAsnAjukan(service);
                        },
                        child: const Text(
                          'Lanjut ke Pengajuan',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Menangani aksi Ajukan Layanan ASN
  void _handleAsnAjukan(ServiceModel service) {
    final lower = service.name.toLowerCase();
    if (lower.contains('cuti')) {
      context.push('/pegawai/cuti');
      return;
    }

    final user = ref.read(authStateProvider).asData?.value;
    if (user == null || !user.isPegawai) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(LucideIcons.lock, size: 20, color: Color(0xFF0284C7)),
              SizedBox(width: 8),
              Text('Akses Khusus ASN', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
            ],
          ),
          content: Text(
            'Layanan "${service.name}" memerlukan autentikasi NIP Pegawai ASN Kemenag Barito Utara. Silakan masuk menggunakan akun kepegawaian Anda.',
            style: const TextStyle(fontSize: 13, color: Color(0xFF475569)),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              onPressed: () {
                Navigator.pop(ctx);
                context.push('/login');
              },
              child: const Text('Masuk Akun ASN'),
            ),
          ],
        ),
      );
    } else {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(service.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Pengajuan usulan berkas ${service.name} dapat disampaikan melalui portal online atau loket PTSP Subbagian Tata Usaha.',
                style: const TextStyle(fontSize: 13, color: Color(0xFF475569), height: 1.4),
              ),
              const SizedBox(height: 12),
              const Text(
                'Pastikan dokumen berkas persyaratan telah lengkap sesuai SOP resmi.',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF047857)),
              ),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
              ),
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Mengerti'),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<int>(selectedLayananTabProvider, (prev, next) {
      if (_tabController.index != next) {
        _tabController.animateTo(next);
      }
    });

    final publicAsync = ref.watch(publicServicesProvider);
    final asnAsync = ref.watch(asnServicesProvider);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Katalog Pelayanan',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          indicatorColor: const Color(0xFFD4AF37),
          indicatorWeight: 3,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(
              icon: Icon(LucideIcons.users, size: 18),
              text: 'Layanan Masyarakat',
            ),
            Tab(
              icon: Icon(LucideIcons.briefcase, size: 18),
              text: 'Layanan Pegawai (ASN)',
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // ══════════════════════════════════════════════════════════
          // ── TAB 1: LAYANAN MASYARAKAT (PER-BIDANG / SEKSI) ──
          // ══════════════════════════════════════════════════════════
          Column(
            children: [
              // Search & Quick Category Chips
              Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchMasyarakatController,
                      onTapOutside: (_) => FocusScope.of(context).unfocus(),
                      onChanged: (val) => setState(() => _searchMasyarakatQuery = val.trim().toLowerCase()),
                      decoration: InputDecoration(
                        hintText: 'Cari seksi atau jenis layanan (nikah, ijazah, wakaf)...',
                        hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                        prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
                        suffixIcon: _searchMasyarakatQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(LucideIcons.x, size: 16),
                                onPressed: () {
                                  _searchMasyarakatController.clear();
                                  setState(() => _searchMasyarakatQuery = '');
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Filter Chips Horizontal
                    SizedBox(
                      height: 34,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _masyarakatCategories.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 8),
                        itemBuilder: (context, idx) {
                          final cat = _masyarakatCategories[idx];
                          final isSelected = _selectedMasyarakatCategory == cat;
                          return ChoiceChip(
                            label: Text(
                              cat,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: AppColors.primary,
                            backgroundColor: const Color(0xFFF1F5F9),
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(
                                color: isSelected ? AppColors.primary : Colors.transparent,
                              ),
                            ),
                            onSelected: (val) {
                              if (val) setState(() => _selectedMasyarakatCategory = cat);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Main List of Unit Kerja (Bidang)
              Expanded(
                child: publicAsync.when(
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                  error: (err, stack) => Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.wifiOff, size: 48, color: Colors.orange),
                          const SizedBox(height: 14),
                          const Text(
                            'Gagal Terhubung ke Backend',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Pastikan backend Golang sudah dijalankan di port 8080 (http://10.0.2.2:8080).',
                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            ),
                            icon: const Icon(LucideIcons.refreshCw, size: 15),
                            onPressed: () => ref.refresh(layananListProvider),
                            label: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  data: (bidangList) {
                    final filtered = bidangList.where((service) {
                      final meta = BidangMeta.get(service.name);

                      // Match category chip
                      bool matchCategory = true;
                      if (_selectedMasyarakatCategory != 'Semua') {
                        final catLower = _selectedMasyarakatCategory.toLowerCase();
                        matchCategory = service.name.toLowerCase().contains(catLower) ||
                            meta.shortName.toLowerCase().contains(catLower);
                      }

                      // Match query (across Bidang Name, Description, Sub-items, Requirements)
                      bool matchQuery = true;
                      if (_searchMasyarakatQuery.isNotEmpty) {
                        final q = _searchMasyarakatQuery;
                        final matchService = service.name.toLowerCase().contains(q) ||
                            (service.description != null && service.description!.toLowerCase().contains(q)) ||
                            meta.shortName.toLowerCase().contains(q);

                        final matchSubItem = service.items.any((item) {
                          final matchName = item.name.toLowerCase().contains(q) ||
                              (item.description != null && item.description!.toLowerCase().contains(q));
                          final matchReq = item.requirements.any((r) => r.documentName.toLowerCase().contains(q));
                          return matchName || matchReq;
                        });

                        matchQuery = matchService || matchSubItem;
                      }

                      return matchCategory && matchQuery;
                    }).toList();

                    final totalLayananCount = filtered.fold<int>(
                      0,
                      (acc, curr) => acc + curr.items.length,
                    );

                    if (filtered.isEmpty) {
                      return RefreshIndicator(
                        onRefresh: () async => ref.refresh(layananListProvider),
                        child: ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.18),
                            Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(LucideIcons.folderSearch, size: 44, color: AppColors.textMuted),
                                  const SizedBox(height: 10),
                                  Text(
                                    _searchMasyarakatQuery.isNotEmpty
                                        ? 'Tidak ada seksi atau layanan yang cocok dengan "$_searchMasyarakatQuery".'
                                        : 'Belum ada data pada kategori ini.',
                                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    textAlign: TextAlign.center,
                                  ),
                                  if (_searchMasyarakatQuery.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    TextButton(
                                      onPressed: () {
                                        _searchMasyarakatController.clear();
                                        setState(() => _searchMasyarakatQuery = '');
                                      },
                                      child: const Text('Reset Pencarian'),
                                    ),
                                  ] else ...[
                                    const SizedBox(height: 14),
                                    ElevatedButton.icon(
                                      onPressed: () => ref.refresh(layananListProvider),
                                      icon: const Icon(LucideIcons.refreshCw, size: 14),
                                      label: const Text('Segarkan Data'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async => ref.refresh(layananListProvider),
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          // Statistics Sub-header
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Row(
                              children: [
                                Text(
                                  'Menampilkan ${filtered.length} Unit Kerja',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF475569),
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFECFDF5),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: const Color(0xFFA7F3D0)),
                                  ),
                                  child: Text(
                                    '$totalLayananCount Total Layanan',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF047857),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // List of BidangCards
                          for (final svc in filtered)
                            BidangCard(
                              service: svc,
                              onTap: () => context.push('/layanan/${svc.slug}'),
                            ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),

          // ══════════════════════════════════════════════════════════
          // ── TAB 2: LAYANAN PEGAWAI (ASN INTERNAL) ──
          // ══════════════════════════════════════════════════════════
          Column(
            children: [
              // Search & Filter Box ASN
              Container(
                color: Colors.white,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchPegawaiController,
                      onTapOutside: (_) => FocusScope.of(context).unfocus(),
                      onChanged: (val) => setState(() => _searchAsnQuery = val.trim().toLowerCase()),
                      decoration: InputDecoration(
                        hintText: 'Cari layanan ASN (cuti, KGB, kenaikan pangkat, pensiun)...',
                        hintStyle: const TextStyle(fontSize: 12.5, color: AppColors.textMuted),
                        prefixIcon: const Icon(LucideIcons.search, size: 18, color: AppColors.textMuted),
                        suffixIcon: _searchAsnQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(LucideIcons.x, size: 16),
                                onPressed: () {
                                  _searchPegawaiController.clear();
                                  setState(() => _searchAsnQuery = '');
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Filter Chips Kategori ASN
                    SizedBox(
                      height: 34,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: _asnCategories.length,
                        separatorBuilder: (context, index) => const SizedBox(width: 8),
                        itemBuilder: (context, idx) {
                          final cat = _asnCategories[idx];
                          final isSelected = _selectedAsnCategory == cat;
                          return ChoiceChip(
                            label: Text(
                              cat,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                color: isSelected ? Colors.white : AppColors.textSecondary,
                              ),
                            ),
                            selected: isSelected,
                            selectedColor: AppColors.primary,
                            backgroundColor: const Color(0xFFF1F5F9),
                            showCheckmark: false,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(
                                color: isSelected ? AppColors.primary : Colors.transparent,
                              ),
                            ),
                            onSelected: (val) {
                              if (val) setState(() => _selectedAsnCategory = cat);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),

              // Main List of ASN Services
              Expanded(
                child: asnAsync.when(
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                  error: (err, stack) => Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(LucideIcons.wifiOff, size: 48, color: Colors.orange),
                          const SizedBox(height: 14),
                          const Text(
                            'Gagal Terhubung ke Backend',
                            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Pastikan backend Golang sudah dijalankan di port 8080 (http://10.0.2.2:8080).',
                            style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                            ),
                            icon: const Icon(LucideIcons.refreshCw, size: 15),
                            onPressed: () => ref.refresh(layananListProvider),
                            label: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  data: (asnList) {
                    final filtered = asnList.where((service) {
                      final meta = AsnMeta.get(service.name);

                      // Match category chip
                      bool matchCategory = true;
                      if (_selectedAsnCategory != 'Semua') {
                        matchCategory = meta.category.toLowerCase() == _selectedAsnCategory.toLowerCase();
                      }

                      // Match query
                      bool matchQuery = true;
                      if (_searchAsnQuery.isNotEmpty) {
                        final q = _searchAsnQuery;
                        matchQuery = service.name.toLowerCase().contains(q) ||
                            (service.description != null && service.description!.toLowerCase().contains(q)) ||
                            meta.category.toLowerCase().contains(q);
                      }

                      return matchCategory && matchQuery;
                    }).toList();

                    if (filtered.isEmpty) {
                      return RefreshIndicator(
                        onRefresh: () async => ref.refresh(layananListProvider),
                        child: ListView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          children: [
                            SizedBox(height: MediaQuery.of(context).size.height * 0.18),
                            Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(LucideIcons.folderSearch, size: 44, color: AppColors.textMuted),
                                  const SizedBox(height: 10),
                                  Text(
                                    _searchAsnQuery.isNotEmpty
                                        ? 'Tidak ada layanan ASN yang cocok dengan "$_searchAsnQuery".'
                                        : 'Belum ada data pada kategori ini.',
                                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                                    textAlign: TextAlign.center,
                                  ),
                                  if (_searchAsnQuery.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    TextButton(
                                      onPressed: () {
                                        _searchPegawaiController.clear();
                                        setState(() => _searchAsnQuery = '');
                                      },
                                      child: const Text('Reset Pencarian'),
                                    ),
                                  ] else ...[
                                    const SizedBox(height: 14),
                                    ElevatedButton.icon(
                                      onPressed: () => ref.refresh(layananListProvider),
                                      icon: const Icon(LucideIcons.refreshCw, size: 14),
                                      label: const Text('Segarkan Data'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: AppColors.primary,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async => ref.refresh(layananListProvider),
                      child: ListView(
                        padding: const EdgeInsets.all(16),
                        children: [
                          // Banner Portal Mandiri ASN (Clean Government Design)
                          Container(
                            padding: const EdgeInsets.all(16),
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F172A),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.08),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Row(
                              children: [
                                Icon(LucideIcons.shieldCheck, color: Color(0xFF38BDF8), size: 32),
                                SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Portal Mandiri Kepegawaian ASN',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontSize: 14,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        'Layanan administrasi mandiri bagi PNS & PPPK Kemenag Barito Utara.',
                                        style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11, height: 1.3),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Sub-header count
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Text(
                              'Menampilkan ${filtered.length} Layanan Kepegawaian',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF475569),
                              ),
                            ),
                          ),

                          // Real Synchronized ASN Service Cards
                          for (final svc in filtered)
                            AsnServiceCard(
                              service: svc,
                              onSyaratTap: () => _showAsnSyaratModal(context, svc),
                              onAjukanTap: () => _handleAsnAjukan(svc),
                            ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
