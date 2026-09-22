import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../../pegawai/models/cuti_model.dart';
import '../../pegawai/repositories/pegawai_repository.dart';
import '../models/tracking_model.dart';
import '../repositories/tracking_repository.dart';

final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return TrackingRepository(dioClient);
});

/// Index tab yang sedang aktif di Lacak & Cek Layanan (0: Lacak Berkas, 1: Cek Sisa Cuti)
final selectedTrackingTabProvider = StateProvider<int>((ref) => 0);

final pegawaiRepositoryProvider = Provider<PegawaiRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return PegawaiRepository(dioClient);
});

/// Provider pencarian status tracking permohonan berkas
final trackingResultProvider =
    FutureProvider.family<TrackingModel?, String>((ref, requestNumber) async {
  if (requestNumber.trim().isEmpty) return null;
  final repo = ref.watch(trackingRepositoryProvider);
  return repo.trackRequest(requestNumber.trim());
});

/// Provider pengecekan sisa cuti pegawai berdasarkan NIP
final rekapCutiResultProvider =
    FutureProvider.family<RekapCutiPegawai?, String>((ref, nip) async {
  final cleanNip = nip.trim().replaceAll(RegExp(r'[^0-9]'), '');
  if (cleanNip.isEmpty) return null;
  final repo = ref.watch(pegawaiRepositoryProvider);
  return repo.checkCutiByNip(cleanNip);
});
