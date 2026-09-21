import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/buku_tamu_model.dart';

/// Repository untuk submit buku tamu ke API Golang Fiber
class BukuTamuRepository {
  final DioClient _client;

  BukuTamuRepository(this._client);

  Dio get _dio => _client.dio;

  Future<bool> submitBukuTamu(BukuTamuInput input) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.guestBook,
        data: input.toJson(),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }
}
