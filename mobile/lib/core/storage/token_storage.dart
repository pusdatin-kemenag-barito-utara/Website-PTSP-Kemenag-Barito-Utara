import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service penyimpan token JWT secara aman di Android KeyStore & iOS Keychain
class TokenStorage {
  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  static const String _keyToken = 'ptsp_jwt_token';
  static const String _keyUserData = 'ptsp_user_data';
  static const String _keyBaseUrl = 'ptsp_custom_base_url';

  Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: _keyToken);
    await _storage.delete(key: _keyUserData);
  }

  Future<void> saveBaseUrl(String url) async {
    await _storage.write(key: _keyBaseUrl, value: url);
  }

  Future<String?> getBaseUrl() async {
    return await _storage.read(key: _keyBaseUrl);
  }
}
