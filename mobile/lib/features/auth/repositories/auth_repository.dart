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

  Future<UserModel?> login(
    String identifier,
    String password, {
    String mode = 'pemohon',
    String? nama,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.login,
        data: {
          'identifier': identifier.trim(),
          'email': identifier.trim(),
          'nip': identifier.trim(),
          'phone': identifier.trim(),
          'password': password,
          'mode': mode,
          'metode_login': password == 'google_oauth_verified' ? 'Google Akun' : null,
          if (nama != null && nama.isNotEmpty) 'nama': nama,
          'remember_me': true,
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
    } on DioException catch (e) {
      final serverMsg = e.response?.data is Map<String, dynamic>
          ? (e.response?.data['error'] ?? e.response?.data['message'])
          : null;
      throw Exception(serverMsg?.toString() ?? 'Gagal masuk. Periksa kembali kredensial Anda.');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<UserModel?> registerPemohon({
    required String nama,
    required String phone,
    required String password,
    String? alamat,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.register,
        data: {
          'nama': nama.trim(),
          'phone': phone.trim(),
          'password': password,
          'alamat': alamat?.trim() ?? '',
          'mode': 'pemohon',
          'metode_login': 'WhatsApp (PTSP)',
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
    } on DioException catch (e) {
      final serverMsg = e.response?.data is Map<String, dynamic>
          ? (e.response?.data['error'] ?? e.response?.data['message'])
          : null;
      throw Exception(serverMsg?.toString() ?? 'Gagal mendaftar. Silakan periksa kembali data Anda.');
    } catch (e) {
      throw Exception(e.toString());
    }
  }

  Future<UserModel?> getMe() async {
    try {
      final token = await _storage.getToken();
      if (token == null || token.isEmpty) return null;

      final response = await _dio.get(ApiEndpoints.me);
      final raw = response.data;
      if (raw is Map<String, dynamic>) {
        if (raw['success'] == false) return null;
        final userData = raw['data'] ?? raw['user'];
        if (userData is Map<String, dynamic>) {
          return UserModel.fromJson(userData);
        }
      }
      return null;
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
