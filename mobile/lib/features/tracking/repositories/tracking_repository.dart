import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/tracking_model.dart';

/// Repository untuk pelacakan permohonan ke API Golang Fiber
class TrackingRepository {
  final DioClient _client;

  TrackingRepository(this._client);

  Dio get _dio => _client.dio;

  Future<TrackingModel?> trackRequest(String requestNumber) async {
    try {
      final response = await _dio.get(ApiEndpoints.trackRequest(requestNumber));
      final dynamic raw = response.data;
      final Map<String, dynamic> data = raw is Map<String, dynamic>
          ? (raw['data'] as Map<String, dynamic>? ?? raw)
          : {};
      return TrackingModel.fromJson(data);
    } catch (e) {
      return null;
    }
  }
}
