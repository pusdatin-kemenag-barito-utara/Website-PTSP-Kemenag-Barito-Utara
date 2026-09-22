import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/layanan_model.dart';
import '../providers/layanan_provider.dart';
import '../widgets/layanan_card.dart';

/// Halaman Rincian Katalog Unit Kerja / Bidang & Daftar Sub-Layanan
class LayananDetailScreen extends ConsumerStatefulWidget {
  final String slug;

  const LayananDetailScreen({super.key, required this.slug});

  @override
  ConsumerState<LayananDetailScreen> createState() => _LayananDetailScreenState();
}

class _LayananDetailScreenState extends ConsumerState<LayananDetailScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String? _expandedItemId;

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleExpand(String id) {
    setState(() {
      if (_expandedItemId == id) {
        _expandedItemId = null; // Menutup jika diklik kembali
      } else {
        _expandedItemId = id; // Membuka layanan baru & otomatis menutup layanan sebelumnya
      }
    });
  }

  void _showRequirementsBottomSheet(BuildContext context, ServiceItemModel item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.92,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: Column(
            children: [
              // Handle
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

              // Title
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 12, 12),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(LucideIcons.fileCheck, size: 20, color: AppColors.primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: const TextStyle(
                              fontSize: 15.5,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            'Estimasi: ${item.estimatedTime ?? "1–3 Hari Kerja"} • Biaya: Gratis',
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

              // Content List
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    if (item.description != null && item.description!.isNotEmpty) ...[
                      const Text(
                        'Deskripsi Layanan',
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF334155)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.description!,
                        style: const TextStyle(fontSize: 12.5, color: Color(0xFF64748B), height: 1.5),
                      ),
                      const SizedBox(height: 18),
                    ],

                    // Section Dokumen Persyaratan
                    Row(
                      children: [
                        const Icon(LucideIcons.folderCheck, size: 16, color: AppColors.primary),
                        const SizedBox(width: 8),
                        Text(
                          'Persyaratan Berkas Dokumen (${item.requirements.length})',
                          style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    if (item.requirements.isNotEmpty) ...[
                      for (int idx = 0; idx < item.requirements.length; idx++)
                        _buildReqRow(item.requirements[idx], idx + 1),
                    ] else ...[
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: const Text(
                          'Persyaratan umum: KTP Pemohon, Surat Permohonan Tertulis, dan berkas pendukung relevan.',
                          style: TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.4),
                        ),
                      ),
                    ],

                    // Section Kolom Formulir Isian Khusus jika ada
                    if (item.formFields.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          const Icon(LucideIcons.clipboardList, size: 16, color: Color(0xFF0284C7)),
                          const SizedBox(width: 8),
                          Text(
                            'Informasi Formulir Isian (${item.formFields.length} Kolom)',
                            style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: Color(0xFF1E293B)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      for (final field in item.formFields)
                        Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFF1F5F9)),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  field.label,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155)),
                                ),
                              ),
                              if (field.isRequired)
                                const Text(
                                  'Wajib',
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFFE11D48)),
                                ),
                            ],
                          ),
                        ),
                    ],

                    const SizedBox(height: 24),
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
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Silakan lengkapi berkas untuk ${item.name} sebelum diajukan.'),
                            ),
                          );
                        },
                        child: const Text(
                          'Siapkan Berkas & Ajukan',
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

  Widget _buildReqRow(RequirementModel req, int number) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 20,
                height: 20,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Text(
                  '$number',
                  style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF047857)),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  req.documentName,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF1E293B),
                    height: 1.3,
                  ),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(left: 6),
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: req.isRequired ? const Color(0xFFFFE4E6) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  req.isRequired ? 'Wajib' : 'Opsional',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: req.isRequired ? const Color(0xFFE11D48) : const Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),
          if (req.allowedExtensions != null || req.maxFileSizeMb != null || (req.description != null && req.description!.isNotEmpty)) ...[
            const SizedBox(height: 6),
            Padding(
              padding: const EdgeInsets.only(left: 28),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (req.allowedExtensions != null || req.maxFileSizeMb != null)
                    Text(
                      'Format: ${req.allowedExtensions?.toUpperCase() ?? "PDF, JPG"} • Maks: ${req.maxFileSizeMb ?? 2} MB',
                      style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF64748B)),
                    ),
                  if (req.description != null && req.description!.isNotEmpty)
                    Text(
                      req.description!,
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B), fontStyle: FontStyle.italic),
                    ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final detailAsync = ref.watch(serviceDetailProvider(widget.slug));

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Detail Unit Layanan',
          style: TextStyle(fontWeight: FontWeight.w700),
        ),
      ),
      body: detailAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.alertCircle, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              const Text('Gagal memuat detail unit layanan.'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.refresh(serviceDetailProvider(widget.slug)),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
        data: (service) {
          if (service == null) {
            return const Center(child: Text('Layanan unit kerja tidak ditemukan.'));
          }

          final meta = BidangMeta.get(service.name);

          // Filter sub-items by search query
          final filteredItems = service.items.where((item) {
            if (_searchQuery.isEmpty) return true;
            final q = _searchQuery.toLowerCase();
            final matchName = item.name.toLowerCase().contains(q);
            final matchDesc = item.description != null && item.description!.toLowerCase().contains(q);
            final matchReq = item.requirements.any((r) => r.documentName.toLowerCase().contains(q));
            return matchName || matchDesc || matchReq;
          }).toList();

          return Column(
            children: [
              // Header Card
              Container(
                color: Colors.white,
                padding: const EdgeInsets.all(18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: const Color(0xFFECFDF5),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFA7F3D0)),
                          ),
                          child: Icon(meta.icon, size: 24, color: AppColors.primary),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                service.name,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                  height: 1.25,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      '${service.items.length} Jenis Layanan',
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF047857),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text(
                                    'Gratis (Rp 0)',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Color(0xFF64748B),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),

                    if (service.description != null && service.description!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(
                        service.description!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                          height: 1.4,
                        ),
                      ),
                    ],

                    const SizedBox(height: 14),
                    // Search bar within this Unit Kerja
                    TextField(
                      controller: _searchController,
                      onTapOutside: (_) => FocusScope.of(context).unfocus(),
                      onChanged: (val) => setState(() => _searchQuery = val.trim().toLowerCase()),
                      decoration: InputDecoration(
                        hintText: 'Cari layanan di unit ini (contoh: legalisir, rekomendasi)...',
                        hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                        prefixIcon: const Icon(LucideIcons.search, size: 16, color: AppColors.textMuted),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(LucideIcons.x, size: 14),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, color: Color(0xFFE2E8F0)),

              // Sub-items List
              Expanded(
                child: filteredItems.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(LucideIcons.folderSearch, size: 40, color: AppColors.textMuted),
                            const SizedBox(height: 8),
                            Text(
                              _searchQuery.isNotEmpty
                                  ? 'Tidak ada layanan yang cocok dengan "$_searchQuery".'
                                  : 'Belum ada data layanan di unit ini.',
                              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: filteredItems.length,
                        itemBuilder: (context, index) {
                          final item = filteredItems[index];
                          final isExpanded = _expandedItemId == item.id;
                          final estimasi = item.estimatedTime != null && item.estimatedTime!.isNotEmpty
                              ? item.estimatedTime!
                              : '1–3 Hari Kerja';

                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isExpanded ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
                              ),
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
                                // Item Header Tile
                                Material(
                                  color: Colors.transparent,
                                  child: InkWell(
                                    borderRadius: BorderRadius.circular(16),
                                    onTap: () => _toggleExpand(item.id),
                                    child: Padding(
                                      padding: const EdgeInsets.all(16),
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Row(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.all(8),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFF1F5F9),
                                                  borderRadius: BorderRadius.circular(10),
                                                ),
                                                child: const Icon(LucideIcons.fileText, size: 18, color: Color(0xFF475569)),
                                              ),
                                              const SizedBox(width: 12),
                                              Expanded(
                                                child: Column(
                                                  crossAxisAlignment: CrossAxisAlignment.start,
                                                  children: [
                                                    Text(
                                                      item.name,
                                                      style: const TextStyle(
                                                        fontSize: 14.5,
                                                        fontWeight: FontWeight.w700,
                                                        color: AppColors.textPrimary,
                                                        height: 1.3,
                                                      ),
                                                    ),
                                                    if (item.description != null && item.description!.isNotEmpty) ...[
                                                      const SizedBox(height: 4),
                                                      Text(
                                                        item.description!,
                                                        maxLines: isExpanded ? null : 2,
                                                        overflow: isExpanded ? null : TextOverflow.ellipsis,
                                                        style: const TextStyle(
                                                          fontSize: 12,
                                                          color: AppColors.textSecondary,
                                                          height: 1.4,
                                                        ),
                                                      ),
                                                    ],
                                                  ],
                                                ),
                                              ),
                                              Icon(
                                                isExpanded ? LucideIcons.chevronUp : LucideIcons.chevronDown,
                                                size: 18,
                                                color: const Color(0xFF94A3B8),
                                              ),
                                            ],
                                          ),

                                          const SizedBox(height: 10),
                                          // Row Info: SLA + Syarat Count + Biaya
                                          Row(
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFF8FAFC),
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    const Icon(LucideIcons.clock, size: 11, color: Color(0xFF64748B)),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      estimasi,
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w600,
                                                        color: Color(0xFF475569),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: const Color(0xFFF8FAFC),
                                                  borderRadius: BorderRadius.circular(8),
                                                  border: Border.all(color: const Color(0xFFE2E8F0)),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    const Icon(LucideIcons.folderCheck, size: 11, color: Color(0xFF64748B)),
                                                    const SizedBox(width: 4),
                                                    Text(
                                                      '${item.requirements.length} Syarat',
                                                      style: const TextStyle(
                                                        fontSize: 11,
                                                        fontWeight: FontWeight.w600,
                                                        color: Color(0xFF475569),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                              const Spacer(),
                                              const Text(
                                                'Gratis',
                                                style: TextStyle(
                                                  fontSize: 11.5,
                                                  fontWeight: FontWeight.w700,
                                                  color: Color(0xFF047857),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),

                                // Expandable Detail Section: Persyaratan & Formulir
                                if (isExpanded) ...[
                                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                                  Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        // Header Syarat
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            const Text(
                                              'Persyaratan Dokumen Diunggah',
                                              style: TextStyle(
                                                fontSize: 12.5,
                                                fontWeight: FontWeight.w700,
                                                color: Color(0xFF1E293B),
                                              ),
                                            ),
                                            Text(
                                              '${item.requirements.length} Berkas',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.w600,
                                                color: Color(0xFF64748B),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 8),

                                        if (item.requirements.isNotEmpty) ...[
                                          for (int i = 0; i < item.requirements.length; i++)
                                            _buildReqRow(item.requirements[i], i + 1),
                                        ] else ...[
                                          Container(
                                            padding: const EdgeInsets.all(12),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF8FAFC),
                                              borderRadius: BorderRadius.circular(10),
                                            ),
                                            child: const Text(
                                              'KTP Pemohon & Surat Permohonan Tertulis.',
                                              style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                                            ),
                                          ),
                                        ],

                                        const SizedBox(height: 12),
                                        // Button Buka Dialog Lengkap
                                        SizedBox(
                                          width: double.infinity,
                                          child: OutlinedButton.icon(
                                            style: OutlinedButton.styleFrom(
                                              padding: const EdgeInsets.symmetric(vertical: 10),
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                            ),
                                            onPressed: () => _showRequirementsBottomSheet(context, item),
                                            icon: const Icon(LucideIcons.maximize2, size: 13),
                                            label: const Text(
                                              'Lihat Rincian Formulir & Panduan Lengkap',
                                              style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
