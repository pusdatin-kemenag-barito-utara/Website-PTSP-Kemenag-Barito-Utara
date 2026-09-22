import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/layanan_model.dart';
import '../repositories/layanan_repository.dart';

final layananRepositoryProvider = Provider<LayananRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return LayananRepository(dioClient);
});

/// Index tab yang sedang aktif pada Katalog Layanan (0: Layanan Masyarakat, 1: Layanan ASN)
final selectedLayananTabProvider = StateProvider<int>((ref) => 0);

/// Mengambil seluruh layanan PTSP (Publik & ASN)
final layananListProvider = FutureProvider<List<ServiceModel>>((ref) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getServices();
});

/// Menyaring layanan masyarakat publik (per-bidang unit kerja)
final publicServicesProvider = Provider<AsyncValue<List<ServiceModel>>>((ref) {
  final all = ref.watch(layananListProvider);
  return all.whenData((list) {
    return list
        .where((s) => s.category == 'public' || s.category == 'umum' || s.category == null)
        .toList();
  });
});

/// Menyaring layanan mandiri pegawai internal ASN
final asnServicesProvider = Provider<AsyncValue<List<ServiceModel>>>((ref) {
  final all = ref.watch(layananListProvider);
  return all.whenData((list) {
    return list.where((s) => s.category == 'asn').toList();
  });
});

/// Detail satu layanan/bidang berdasarkan slug
final serviceDetailProvider =
    FutureProvider.family<ServiceModel?, String>((ref, slug) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getServiceBySlug(slug);
});

/// Persyaratan berkas dokumen untuk service item tertentu
final serviceRequirementsProvider =
    FutureProvider.family<List<RequirementModel>, String>((ref, id) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getRequirements(id);
});
