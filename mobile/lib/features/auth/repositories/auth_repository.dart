import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../../../core/storage/token_storage.dart';
import '../models/user_model.dart';

/// Repository untuk komunikasi autentikasi ke backend Golang Fiber
class AuthRepository {
  final DioClient _client;
  final TokenStorage _storage;

  AuthRepository(this._client, this._storage);

  Dio get _dio => _client.dio;

  Future<UserModel?> login(String emailOrNip, String password) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {
          'email': emailOrNip,
          'password': password,
        },
      );

      final data = response.data;
      final token = data['token'] as String? ?? data['data']?['token'] as String?;
      final userData = data['user'] as Map<String, dynamic>? ?? data['data']?['user'] as Map<String, dynamic>?;

      if (token != null) {
        await _storage.saveToken(token);
      }

      if (userData != null) {
        return UserModel.fromJson(userData);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  Future<UserModel?> getMe() async {
    try {
      final response = await _dio.get(ApiEndpoints.me);
      final raw = response.data;
      final data = raw is Map<String, dynamic> ? (raw['data'] ?? raw['user'] ?? raw) : {};
      return UserModel.fromJson(data as Map<String, dynamic>);
    } catch (e) {
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiEndpoints.logout);
    } catch (_) {}
    await _storage.clearToken();
  }
}
