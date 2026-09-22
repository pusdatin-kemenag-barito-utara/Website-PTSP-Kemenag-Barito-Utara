import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/tracking_model.dart';

/// Repository untuk pelacakan permohonan ke API Golang Fiber
class TrackingRepository {
  final DioClient _client;

  TrackingRepository(this._client);

  Dio get _dio => _client.dio;

  /// Lacak permohonan berkas berdasarkan nomor tiket/registrasi
  Future<TrackingModel?> trackRequest(String requestNumber) async {
    final cleaned = requestNumber.trim().toUpperCase();
    if (cleaned.isEmpty) return null;

    try {
      final response = await _dio.get(ApiEndpoints.trackRequest(cleaned));
      if (response.statusCode == 200 && response.data != null) {
        final dynamic raw = response.data;
        final Map<String, dynamic> data = raw is Map<String, dynamic>
            ? (raw['data'] as Map<String, dynamic>? ?? raw)
            : {};
        if (data.isEmpty || data['request_number'] == null && data['id'] == null) {
          return null;
        }
        return TrackingModel.fromJson(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}
