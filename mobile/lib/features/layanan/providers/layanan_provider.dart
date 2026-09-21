import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/layanan_model.dart';
import '../repositories/layanan_repository.dart';

final layananRepositoryProvider = Provider<LayananRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return LayananRepository(dioClient);
});

final layananListProvider = FutureProvider<List<LayananModel>>((ref) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getServices();
});

final serviceDetailProvider =
    FutureProvider.family<LayananModel?, String>((ref, slug) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getServiceBySlug(slug);
});

final serviceRequirementsProvider =
    FutureProvider.family<List<RequirementModel>, String>((ref, id) async {
  final repo = ref.watch(layananRepositoryProvider);
  return repo.getRequirements(id);
});
