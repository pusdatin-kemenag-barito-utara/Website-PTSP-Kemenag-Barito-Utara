import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/tracking_model.dart';
import '../repositories/tracking_repository.dart';

final trackingRepositoryProvider = Provider<TrackingRepository>((ref) {
  final dioClient = ref.watch(dioClientProvider);
  return TrackingRepository(dioClient);
});

final trackingResultProvider =
    FutureProvider.family<TrackingModel?, String>((ref, requestNumber) async {
  if (requestNumber.trim().isEmpty) return null;
  final repo = ref.watch(trackingRepositoryProvider);
  return repo.trackRequest(requestNumber.trim());
});
