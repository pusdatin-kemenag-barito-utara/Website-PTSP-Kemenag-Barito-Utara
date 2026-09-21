import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/constants/app_colors.dart';
import '../providers/layanan_provider.dart';
import '../widgets/layanan_card.dart';

/// Halaman Katalog Layanan Publik PTSP
class LayananListScreen extends ConsumerWidget {
  const LayananListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final layananAsync = ref.watch(layananListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Katalog Layanan Publik'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, size: 20),
            onPressed: () => ref.refresh(layananListProvider),
          ),
        ],
      ),
      body: layananAsync.when(
        loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
        error: (err, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.alertCircle, size: 48, color: Colors.red),
              const SizedBox(height: 12),
              const Text('Gagal memuat layanan. Periksa koneksi ke Backend.'),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.refresh(layananListProvider),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
        data: (list) {
          if (list.isEmpty) {
            return const Center(
              child: Text('Belum ada layanan publik tersedia.'),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.refresh(layananListProvider),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final item = list[index];
                return LayananCard(
                  layanan: item,
                  onTap: () {
                    context.push('/layanan/${item.slug}');
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }
}
