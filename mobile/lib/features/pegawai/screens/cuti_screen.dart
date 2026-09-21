import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../models/cuti_model.dart';
import '../providers/pegawai_provider.dart';

/// Halaman Riwayat & Pengajuan Cuti Mandiri ASN
class CutiScreen extends ConsumerWidget {
  const CutiScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cutiAsync = ref.watch(cutiListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Layanan Cuti ASN'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: () => ref.refresh(cutiListProvider),
          ),
        ],
      ),
      body: cutiAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, stack) => const Center(
          child: Text('Gagal memuat data cuti. Pastikan Anda telah login sebagai ASN.'),
        ),
        data: (list) {
          if (list.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(LucideIcons.calendar, size: 48, color: AppColors.textMuted),
                  const SizedBox(height: 12),
                  const Text('Belum ada riwayat pengajuan cuti.'),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            itemBuilder: (context, index) {
              final item = list[index];
              return _buildCutiCard(item);
            },
          );
        },
      ),
    );
  }

  Widget _buildCutiCard(CutiModel item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cardBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                item.jenisCuti,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              _buildBadge(item.status),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            item.alasan,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const Divider(height: 20),
          Row(
            children: [
              const Icon(LucideIcons.calendar, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(
                '${item.tanggalMulai} s/d ${item.tanggalSelesai}',
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
              const Spacer(),
              Text(
                '${item.jumlahHari} Hari',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryMedium,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadge(String status) {
    Color bg = AppColors.statusPendingBg;
    Color text = AppColors.statusPending;

    if (status.toLowerCase().contains('setuju') || status.toLowerCase().contains('approved')) {
      bg = AppColors.statusSuccessBg;
      text = AppColors.statusSuccess;
    } else if (status.toLowerCase().contains('tolak') || status.toLowerCase().contains('rejected')) {
      bg = AppColors.statusRejectedBg;
      text = AppColors.statusRejected;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: text),
      ),
    );
  }
}
