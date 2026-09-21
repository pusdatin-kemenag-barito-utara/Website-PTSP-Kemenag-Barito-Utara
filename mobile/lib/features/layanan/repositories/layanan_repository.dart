import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/layanan_model.dart';

/// Repository untuk komunikasi ke API Layanan Golang Fiber
class LayananRepository {
  final DioClient _client;

  LayananRepository(this._client);

  Dio get _dio => _client.dio;

  Future<List<LayananModel>> getServices() async {
    try {
      final response = await _dio.get(ApiEndpoints.services);
      final dynamic raw = response.data;
      final List<dynamic> list = raw is List
          ? raw
          : (raw['data'] as List<dynamic>? ?? []);
      return list.map((item) => LayananModel.fromJson(item as Map<String, dynamic>)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<LayananModel?> getServiceBySlug(String slug) async {
    try {
      final response = await _dio.get(ApiEndpoints.serviceDetail(slug));
      final dynamic raw = response.data;
      final Map<String, dynamic> data = raw is Map<String, dynamic>
          ? (raw['data'] as Map<String, dynamic>? ?? raw)
          : {};
      return LayananModel.fromJson(data);
    } catch (e) {
      return null;
    }
  }

  Future<List<RequirementModel>> getRequirements(String serviceItemId) async {
    try {
      final response = await _dio.get(ApiEndpoints.serviceRequirements(serviceItemId));
      final dynamic raw = response.data;
      final List<dynamic> list = raw is List
          ? raw
          : (raw['data'] as List<dynamic>? ?? []);
      return list.map((item) => RequirementModel.fromJson(item as Map<String, dynamic>)).toList();
    } catch (e) {
      return [];
    }
  }
}
