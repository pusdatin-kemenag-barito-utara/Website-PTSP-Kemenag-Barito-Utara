import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Service penyimpan token JWT secara aman di Android KeyStore & iOS Keychain
class TokenStorage {
  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(
                encryptedSharedPreferences: true,
                resetOnError: true,
              ),
            );

  static const String _keyToken = 'ptsp_jwt_token';
  static const String _keyUserData = 'ptsp_user_data';
  static const String _keyBaseUrl = 'ptsp_custom_base_url';

  Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _keyToken, value: token);
    } catch (_) {}
  }

  Future<String?> getToken() async {
    try {
      return await _storage.read(key: _keyToken);
    } catch (_) {
      try {
        await _storage.deleteAll();
      } catch (_) {}
      return null;
    }
  }

  Future<void> clearToken() async {
    try {
      await _storage.delete(key: _keyToken);
      await _storage.delete(key: _keyUserData);
    } catch (_) {}
  }

  Future<void> saveBaseUrl(String url) async {
    try {
      await _storage.write(key: _keyBaseUrl, value: url);
    } catch (_) {}
  }

  Future<String?> getBaseUrl() async {
    try {
      return await _storage.read(key: _keyBaseUrl);
    } catch (_) {
      return null;
    }
  }
}
