import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/cuti_model.dart';
import '../repositories/pegawai_repository.dart';

final pegawaiRepositoryProvider = Provider<PegawaiRepository>((ref) {
  final client = ref.watch(dioClientProvider);
  return PegawaiRepository(client);
});

final cutiListProvider = FutureProvider<List<CutiModel>>((ref) async {
  final repo = ref.watch(pegawaiRepositoryProvider);
  return repo.getCutiList();
});
