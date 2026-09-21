import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/layanan_provider.dart';

/// Halaman Detail Layanan & Persyaratan Dokumen
class LayananDetailScreen extends ConsumerWidget {
  final String slug;

  const LayananDetailScreen({super.key, required this.slug});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(serviceDetailProvider(slug));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Layanan'),
      ),
      body: detailAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, stack) => const Center(
          child: Text('Gagal memuat detail layanan.'),
        ),
        data: (layanan) {
          if (layanan == null) {
            return const Center(child: Text('Layanan tidak ditemukan.'));
          }

          final reqAsync = ref.watch(serviceRequirementsProvider(layanan.id));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Info
                Text(
                  layanan.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                if (layanan.description != null) ...[
                  Text(
                    layanan.description!,
                    style: const TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
                // Info badges
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.cardBorder),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildInfoItem(
                        LucideIcons.clock,
                        'Estimasi',
                        '${layanan.estimatedDays ?? 1-3} Hari',
                      ),
                      const SizedBox(height: 30, child: VerticalDivider()),
                      _buildInfoItem(
                        LucideIcons.tag,
                        'Biaya',
                        layanan.cost ?? 'Rp 0 (Gratis)',
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                // Section Persyaratan
                const Text(
                  'Persyaratan Berkas & Dokumen',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                reqAsync.when(
                  loading: () => const Center(
                    child: Padding(
                      padding: EdgeInsets.all(16.0),
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ),
                  ),
                  error: (e, s) => const Text('Persyaratan berkas umum.'),
                  data: (reqs) {
                    if (reqs.isEmpty) {
                      return const Text(
                        '1. KTP / Identitas Diri Pemohon\n2. Surat Permohonan Tertulis\n3. Berkas Pendukung Lainnya',
                        style: TextStyle(fontSize: 13, height: 1.6),
                      );
                    }
                    return Column(
                      children: reqs.map((r) => _buildReqItem(r.name)).toList(),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoItem(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildReqItem(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(LucideIcons.checkCircle, size: 16, color: AppColors.primaryMedium),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
