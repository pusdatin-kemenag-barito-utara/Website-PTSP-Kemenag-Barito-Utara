import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/providers/core_providers.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final client = ref.watch(dioClientProvider);
  final storage = ref.watch(tokenStorageProvider);
  return AuthRepository(client, storage);
});

class AuthNotifier extends StateNotifier<AsyncValue<UserModel?>> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AsyncValue.loading()) {
    checkSession();
  }

  Future<void> checkSession() async {
    state = const AsyncValue.loading();
    try {
      final user = await _repo.getMe();
      state = AsyncValue.data(user);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<String?> login(
    String identifier,
    String password, {
    String mode = 'pemohon',
    String? nama,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repo.login(identifier, password, mode: mode, nama: nama);
      if (user != null) {
        state = AsyncValue.data(user);
        return null; // Null menandakan login sukses
      }
      state = const AsyncValue.data(null);
      return 'Kredensial atau kata sandi tidak sesuai.';
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      final msg = e.toString().replaceFirst('Exception: ', '');
      return msg.isNotEmpty ? msg : 'Terjadi kendala saat menghubungi server.';
    }
  }

  Future<String?> registerPemohon({
    required String nama,
    required String phone,
    required String password,
    String? alamat,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repo.registerPemohon(
        nama: nama,
        phone: phone,
        password: password,
        alamat: alamat,
      );
      if (user != null) {
        state = AsyncValue.data(user);
        return null;
      }
      state = const AsyncValue.data(null);
      return 'Gagal memproses pendaftaran akun.';
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      final msg = e.toString().replaceFirst('Exception: ', '');
      return msg.isNotEmpty ? msg : 'Terjadi kendala saat menghubungi server.';
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AsyncValue.data(null);
  }
}

final authStateProvider = StateNotifierProvider<AuthNotifier, AsyncValue<UserModel?>>((ref) {
  final repo = ref.watch(authRepositoryProvider);
  return AuthNotifier(repo);
});
