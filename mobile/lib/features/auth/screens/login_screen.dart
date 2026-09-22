import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';

/// Halaman Masuk Akun PTSP Kemenag Barito Utara (Clean, Minimalis, & Profesional)
class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

enum LoginRole { masyarakat, pegawai }

class _LoginScreenState extends ConsumerState<LoginScreen> {
  LoginRole _selectedRole = LoginRole.masyarakat;
  final _emailOrNipController = TextEditingController();
  final _passwordController = TextEditingController();
  final _googleSignIn = GoogleSignIn(
    serverClientId: ApiEndpoints.googleClientId,
    scopes: ['email', 'profile'],
  );
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailOrNipController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  String get _modeString {
    switch (_selectedRole) {
      case LoginRole.masyarakat:
        return 'pemohon';
      case LoginRole.pegawai:
        return 'pegawai';
    }
  }

  Future<void> _handleLogin() async {
    final input = _emailOrNipController.text.trim();
    final pass = _passwordController.text.trim();

    if (input.isEmpty || pass.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.statusRejected,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          content: Text(
            _selectedRole == LoginRole.pegawai
                ? 'NIP dan kata sandi wajib diisi.'
                : 'Nomor WhatsApp dan kata sandi wajib diisi.',
          ),
        ),
      );
      return;
    }

    if (_selectedRole == LoginRole.masyarakat && input.length < 9) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.statusRejected,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          content: const Text('Nomor WhatsApp minimal 9 digit angka.'),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final errorMsg = await ref.read(authStateProvider.notifier).login(input, pass, mode: _modeString);
    setState(() => _isLoading = false);

    if (mounted) {
      if (errorMsg == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.statusSuccess,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            content: const Text('Berhasil masuk ke akun.'),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.statusRejected,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            content: Text(errorMsg),
          ),
        );
      }
    }
  }

  Future<void> _handleGoogleLogin() async {
    try {
      setState(() => _isLoading = true);

      // Sign out terlebih dahulu agar dialog pemilihan akun selalu muncul
      try {
        await _googleSignIn.signOut();
      } catch (_) {}

      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // Pengguna membatalkan pemilihan akun Google
        if (mounted) setState(() => _isLoading = false);
        return;
      }

      final email = googleUser.email;
      final nama = googleUser.displayName ?? '';

      final errorMsg = await ref.read(authStateProvider.notifier).login(
            email,
            'google_oauth_verified',
            mode: 'pemohon',
            nama: nama,
          );

      if (!mounted) return;
      setState(() => _isLoading = false);

      if (errorMsg == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.statusSuccess,
            behavior: SnackBarBehavior.floating,
            content: Text('Berhasil masuk dengan Akun Google: $email'),
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.statusRejected,
            behavior: SnackBarBehavior.floating,
            content: Text(errorMsg),
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);

      final errStr = e.toString();
      String message = 'Gagal masuk dengan Google.';
      if (errStr.contains('10') || errStr.contains('ApiException: 10') || errStr.contains('sign_in_failed')) {
        message = 'Google Sign-In gagal: Pastikan SHA-1 keystore telah didaftarkan di Google Cloud Console untuk package com.kemenag.baritoutara.mobile.';
      } else {
        message = 'Kendala Google Sign-In: ${errStr.replaceFirst('PlatformException(', '').replaceFirst('Exception: ', '')}';
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.statusRejected,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 5),
          content: Text(message),
        ),
      );
    }
  }

  Future<void> _handleRegisterPemohon() async {
    final namaController = TextEditingController();
    final phoneController = TextEditingController();
    final passwordController = TextEditingController();
    final alamatController = TextEditingController();
    bool obscureRegPassword = true;
    bool isSubmitting = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => StatefulBuilder(
        builder: (modalContext, setModalState) {
          return Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(ctx).size.height * 0.88,
            ),
            padding: EdgeInsets.only(
              left: 24,
              right: 24,
              top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Row(
                    children: [
                      Icon(LucideIcons.userPlus, size: 22, color: AppColors.primary),
                      SizedBox(width: 10),
                      Text(
                        'Daftar Akun Masyarakat',
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1E293B),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // 1. Nama Lengkap
                  _buildRequiredLabel('Nama Lengkap'),
                  const SizedBox(height: 6),
                  TextField(
                    controller: namaController,
                    textCapitalization: TextCapitalization.words,
                    style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Contoh: Budi Santoso',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(LucideIcons.userCheck, size: 18, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 2. Nomor WhatsApp
                  _buildRequiredLabel('Nomor WhatsApp'),
                  const SizedBox(height: 6),
                  TextField(
                    controller: phoneController,
                    keyboardType: TextInputType.phone,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(15),
                    ],
                    style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Contoh: 081234567890',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(LucideIcons.phone, size: 18, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // 3. Kata Sandi
                  _buildRequiredLabel('Kata Sandi'),
                  const SizedBox(height: 6),
                  TextField(
                    controller: passwordController,
                    obscureText: obscureRegPassword,
                    onChanged: (_) => setModalState(() {}),
                    style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Minimal 6 karakter',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(LucideIcons.lock, size: 18, color: Color(0xFF64748B)),
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscureRegPassword ? LucideIcons.eyeOff : LucideIcons.eye,
                          size: 18,
                          color: const Color(0xFF94A3B8),
                        ),
                        onPressed: () => setModalState(() => obscureRegPassword = !obscureRegPassword),
                      ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  // Animasi indikator kekuatan password
                  _buildPasswordStrengthIndicator(passwordController.text),
                  const SizedBox(height: 14),

                  // 4. Alamat Domisili
                  _buildRequiredLabel('Alamat Domisili'),
                  const SizedBox(height: 6),
                  TextField(
                    controller: alamatController,
                    style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Contoh: Muara Teweh, Barito Utara',
                      hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                      prefixIcon: const Icon(LucideIcons.mapPin, size: 18, color: Color(0xFF64748B)),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 22),

                  // Tombol Daftar
                  SizedBox(
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: isSubmitting
                          ? null
                          : () async {
                              final nama = namaController.text.trim();
                              final phone = phoneController.text.trim();
                              final pass = passwordController.text.trim();
                              final alamat = alamatController.text.trim();

                              if (nama.isEmpty) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.statusRejected,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text('Nama lengkap wajib diisi.'),
                                  ),
                                );
                                return;
                              }

                              if (phone.isEmpty || phone.length < 9) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.statusRejected,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text('Nomor WhatsApp wajib diisi (minimal 9 digit angka).'),
                                  ),
                                );
                                return;
                              }

                              if (pass.isEmpty || pass.length < 6) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.statusRejected,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text('Kata sandi wajib diisi (minimal 6 karakter).'),
                                  ),
                                );
                                return;
                              }

                              if (alamat.isEmpty) {
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  const SnackBar(
                                    backgroundColor: AppColors.statusRejected,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text('Alamat domisili wajib diisi.'),
                                  ),
                                );
                                return;
                              }

                              setModalState(() => isSubmitting = true);

                              final errorMsg = await ref.read(authStateProvider.notifier).registerPemohon(
                                    nama: nama,
                                    phone: phone,
                                    password: pass,
                                    alamat: alamat,
                                  );

                              if (!mounted || !ctx.mounted) return;

                              if (errorMsg == null) {
                                Navigator.pop(ctx);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    backgroundColor: AppColors.statusSuccess,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text('Pendaftaran berhasil! Selamat datang, $nama'),
                                  ),
                                );
                              } else {
                                setModalState(() => isSubmitting = false);
                                ScaffoldMessenger.of(ctx).showSnackBar(
                                  SnackBar(
                                    backgroundColor: AppColors.statusRejected,
                                    behavior: SnackBarBehavior.floating,
                                    content: Text(errorMsg),
                                  ),
                                );
                              }
                            },
                      child: isSubmitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text(
                              'Daftar Akun Baru',
                              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final user = authState.asData?.value;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          user != null ? 'Profil Akun' : 'Masuk Akun',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        centerTitle: true,
      ),
      body: user != null ? _buildUserProfileView(user) : _buildLoginFormView(),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: FORM LOGIN CLEAN & MINIMALIS
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildLoginFormView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── LOGO & HEADER MINIMALIS ──
          Center(
            child: Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: Image.asset(
                'assets/images/atak-portal.png',
                fit: BoxFit.cover,
                alignment: Alignment.topCenter,
                errorBuilder: (context, error, stackTrace) => Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(
                    LucideIcons.shieldCheck,
                    color: AppColors.primary,
                    size: 28,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          const Text(
            'PTSP Kemenag Barito Utara',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Silakan pilih jenis akses akun Anda',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 24),

          // ── SEGMENTED TAB SELECTOR (CLEAN & SUBTLE) ──
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFFE2E8F0),
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.all(3),
            child: Row(
              children: [
                _buildRoleTab(LoginRole.masyarakat, 'Masyarakat'),
                _buildRoleTab(LoginRole.pegawai, 'Pegawai ASN'),
              ],
            ),
          ),

          const SizedBox(height: 12),

          // ── HINT TEXT BERSIH TANPA BANNER WARNA-WARNI ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              _getRoleHint(),
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ── FORM CARD PUTIH BERSIH ──
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Label Input
                Text(
                  _selectedRole == LoginRole.pegawai
                      ? 'NIP (18 Digit Angka)'
                      : 'Nomor WhatsApp',
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _emailOrNipController,
                  keyboardType: _selectedRole == LoginRole.pegawai
                      ? TextInputType.number
                      : TextInputType.phone,
                  inputFormatters: _selectedRole == LoginRole.pegawai
                      ? [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(18),
                        ]
                      : [
                          FilteringTextInputFormatter.digitsOnly,
                          LengthLimitingTextInputFormatter(15),
                        ],
                  style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: _selectedRole == LoginRole.pegawai
                        ? 'Contoh: 198501012010011001'
                        : 'Contoh: 081234567890',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: Icon(
                      _selectedRole == LoginRole.pegawai
                          ? LucideIcons.idCard
                          : LucideIcons.phone,
                      size: 18,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Label Password & Lupa Sandi
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Kata Sandi',
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        _showHelpDialog(
                          'Bantuan Kata Sandi',
                          'Silakan hubungi Admin PTSP / Kepegawaian Kemenag Barito Utara di kantor atau melalui loket pelayanan untuk reset kata sandi.',
                        );
                      },
                      child: const Text(
                        'Lupa sandi?',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  style: const TextStyle(fontSize: 13.5, color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Masukkan kata sandi',
                    hintStyle: const TextStyle(fontSize: 13, color: Color(0xFF94A3B8)),
                    prefixIcon: const Icon(
                      LucideIcons.lock,
                      size: 18,
                      color: Color(0xFF64748B),
                    ),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                        size: 18,
                        color: const Color(0xFF94A3B8),
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  onSubmitted: (_) => _handleLogin(),
                ),

                const SizedBox(height: 20),

                // Tombol Masuk (Konsisten Hijau Kemenag)
                SizedBox(
                  width: double.infinity,
                  height: 46,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: _isLoading ? null : _handleLogin,
                    child: _isLoading
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text(
                            'Masuk',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                  ),
                ),

                // Akses Login via Google khusus untuk Masyarakat
                if (_selectedRole == LoginRole.masyarakat) ...[
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(child: Divider(color: Colors.grey.shade200, height: 1)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'atau',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey.shade400,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.grey.shade200, height: 1)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    height: 46,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1E293B),
                        side: BorderSide(color: Colors.grey.shade300, width: 1.2),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _isLoading ? null : _handleGoogleLogin,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildGoogleLogo(20),
                          const SizedBox(width: 10),
                          const Text(
                            'Masuk dengan Google',
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 18),
                  // Pendaftaran Akun Baru Masyarakat via WhatsApp
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        'Belum punya akun pemohon? ',
                        style: TextStyle(fontSize: 12.5, color: Color(0xFF64748B)),
                      ),
                      GestureDetector(
                        onTap: _handleRegisterPemohon,
                        child: const Text(
                          'Daftar Sekarang',
                          style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 32),

          // ── FOOTER RESMI MINIMALIS ──
          Center(
            child: Text(
              'Kantor Kementerian Agama Kabupaten Barito Utara\nLayanan Terpadu Satu Pintu (PTSP)',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11.5,
                color: Colors.grey.shade500,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // VIEW: DASHBOARD PROFIL USER CLEAN (JIKA SUDAH LOGIN)
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildUserProfileView(UserModel user) {
    final displayName = user.nama.isNotEmpty ? user.nama : 'Pengguna PTSP';
    final initial = displayName.isNotEmpty ? displayName[0].toUpperCase() : 'U';

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // ── 1. HERO PROFILE CARD ──
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                  child: Text(
                    initial,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        displayName,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                          letterSpacing: -0.2,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        user.email,
                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      // Verified Role Badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: user.isPegawai
                              ? const Color(0xFFEFF6FF)
                              : const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: user.isPegawai
                                ? const Color(0xFFBFDBFE)
                                : const Color(0xFFA7F3D0),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              user.isPegawai ? LucideIcons.award : LucideIcons.checkCircle2,
                              size: 13,
                              color: user.isPegawai
                                  ? const Color(0xFF2563EB)
                                  : const Color(0xFF059669),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              user.isPegawai ? 'PEGAWAI ASN KEMENAG' : 'MASYARAKAT PEMOHON',
                              style: TextStyle(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: user.isPegawai
                                    ? const Color(0xFF1D4ED8)
                                    : const Color(0xFF047857),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // ── 2. STATS & PINTASAN CEPAT ──
          Row(
            children: [
              _buildStatCard(
                count: 'Lacak',
                label: 'Status Berkas',
                icon: LucideIcons.fileSearch,
                color: const Color(0xFF0D9488),
                onTap: () => context.go('/tracking'),
              ),
              const SizedBox(width: 10),
              _buildStatCard(
                count: 'Konsultasi',
                label: 'Janji Temu',
                icon: LucideIcons.calendarDays,
                color: const Color(0xFF2563EB),
                onTap: () => context.go('/buku-tamu'),
              ),
              const SizedBox(width: 10),
              _buildStatCard(
                count: '40+ Layanan',
                label: 'Katalog PTSP',
                icon: LucideIcons.layoutGrid,
                color: const Color(0xFF7C3AED),
                onTap: () => context.go('/layanan'),
              ),
            ],
          ),

          const SizedBox(height: 22),

          // ── 3. MENU: AKTIVITAS & LAYANAN ──
          _buildSectionHeader('AKTIVITAS & PERMOHONAN'),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildMenuTile(
                  icon: LucideIcons.fileText,
                  iconColor: const Color(0xFF0D9488),
                  title: 'Riwayat Permohonan Berkas',
                  subtitle: 'Pantau progress & verifikasi berkas permohonan',
                  onTap: () => context.go('/tracking'),
                ),
                const Divider(height: 1, indent: 64),
                _buildMenuTile(
                  icon: LucideIcons.calendarDays,
                  iconColor: const Color(0xFF2563EB),
                  title: 'Janji Temu & Konsultasi Loket',
                  subtitle: 'Atur jadwal tatap muka dengan petugas kantor',
                  onTap: () => context.go('/buku-tamu'),
                ),
                const Divider(height: 1, indent: 64),
                _buildMenuTile(
                  icon: LucideIcons.bookOpen,
                  iconColor: const Color(0xFFEA580C),
                  title: 'Buku Tamu Kunjungan',
                  subtitle: 'Daftar kehadiran saat mengunjungi kantor PTSP',
                  onTap: () => context.go('/buku-tamu'),
                ),
                if (user.isPegawai) ...[
                  const Divider(height: 1, indent: 64),
                  _buildMenuTile(
                    icon: LucideIcons.award,
                    iconColor: AppColors.primary,
                    title: 'Layanan Cuti Mandiri ASN',
                    subtitle: 'Pengajuan & riwayat cuti tahunan pegawai',
                    onTap: () => context.push('/pegawai/cuti'),
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── 4. MENU: PUSAT INFORMASI & BANTUAN ──
          _buildSectionHeader('PUSAT INFORMASI & BANTUAN'),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildMenuTile(
                  icon: LucideIcons.messageCircle,
                  iconColor: const Color(0xFF16A34A),
                  title: 'Hubungi Loket PTSP (WhatsApp)',
                  subtitle: 'Konsultasi langsung dengan petugas loket pelayanan',
                  onTap: _showContactDialog,
                ),
                const Divider(height: 1, indent: 64),
                _buildMenuTile(
                  icon: LucideIcons.scroll,
                  iconColor: const Color(0xFFD97706),
                  title: 'Maklumat Pelayanan Kemenag',
                  subtitle: 'Standar integritas & komitmen bebas biaya (Rp 0)',
                  onTap: _showMaklumatDialog,
                ),
                const Divider(height: 1, indent: 64),
                _buildMenuTile(
                  icon: LucideIcons.helpCircle,
                  iconColor: const Color(0xFF0284C7),
                  title: 'Panduan & Tanya Jawab (FAQ)',
                  subtitle: 'Syarat dokumen, alur verifikasi & kepastian waktu',
                  onTap: _showFaqDialog,
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // ── 5. MENU: AKUN & KEAMANAN ──
          _buildSectionHeader('AKUN & KEAMANAN'),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Column(
              children: [
                _buildMenuTile(
                  icon: LucideIcons.shieldCheck,
                  iconColor: const Color(0xFF475569),
                  title: 'Informasi Kredensial Akun',
                  subtitle: 'Email: ${user.email}',
                  onTap: () => _showAccountDetailDialog(user),
                ),
                const Divider(height: 1, indent: 64),
                _buildMenuTile(
                  icon: LucideIcons.info,
                  iconColor: const Color(0xFF64748B),
                  title: 'Kebijakan Privasi & Ketentuan',
                  subtitle: 'Perlindungan data dan dokumen pemohon',
                  onTap: _showPrivacyDialog,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── 6. TOMBOL KELUAR ──
          SizedBox(
            height: 46,
            child: OutlinedButton.icon(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Konfirmasi Keluar', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                    content: const Text('Apakah Anda yakin ingin keluar dari akun ini?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal')),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.statusRejected),
                        onPressed: () async {
                          Navigator.pop(ctx);
                          try {
                            await _googleSignIn.signOut();
                          } catch (_) {}
                          ref.read(authStateProvider.notifier).logout();
                        },
                        child: const Text('Keluar'),
                      ),
                    ],
                  ),
                );
              },
              icon: const Icon(LucideIcons.logOut, size: 16, color: AppColors.statusRejected),
              label: const Text(
                'Keluar dari Akun',
                style: TextStyle(color: AppColors.statusRejected, fontWeight: FontWeight.w600, fontSize: 13.5),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFFFECACA), width: 1.2),
                backgroundColor: const Color(0xFFFEF2F2),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ),

          const SizedBox(height: 20),

          // ── FOOTER ──
          Center(
            child: Text(
              'Kantor Kementerian Agama Kabupaten Barito Utara\nPelayanan Terpadu Satu Pintu (PTSP) • Versi 1.0.0',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 11,
                color: Colors.grey.shade500,
                height: 1.4,
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required String count,
    required String label,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, size: 17, color: color),
              ),
              const SizedBox(height: 8),
              Text(
                count,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: color,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w700,
          color: Color(0xFF64748B),
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Widget? trailing,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 19, color: iconColor),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            trailing ?? const Icon(LucideIcons.chevronRight, size: 16, color: Color(0xFFCBD5E1)),
          ],
        ),
      ),
    );
  }

  void _showContactDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(LucideIcons.messageCircle, color: Color(0xFF16A34A), size: 20),
            SizedBox(width: 8),
            Text('Loket PTSP Kemenag', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Text(
          'Petugas loket Pelayanan Terpadu Satu Pintu (PTSP) Kantor Kementerian Agama Kabupaten Barito Utara siap melayani Anda:\n\n'
          '📍 Alamat Kantor:\nJl. R.A. Kartini No. 44, Muara Teweh\n\n'
          '🕒 Jam Pelayanan:\n'
          '• Senin - Kamis: 07.30 - 16.00 WIB\n'
          '• Jumat: 07.30 - 16.30 WIB\n\n'
          '📞 Kontak & Konsultasi:\n'
          'Telepon: (0519) 21062\n'
          'Konsultasi dapat dilakukan melalui loket tatap muka maupun fitur Janji Temu pada aplikasi ini.',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF334155)),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  void _showMaklumatDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(LucideIcons.scroll, color: Color(0xFFD97706), size: 20),
            SizedBox(width: 8),
            Text('Maklumat Pelayanan', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Text(
          '“Dengan ini, kami segenap pimpinan dan pegawai Kantor Kementerian Agama Kabupaten Barito Utara menyatakan sanggup menyelenggarakan pelayanan sesuai standar pelayanan yang telah ditetapkan.”\n\n'
          'Prinsip Pelayanan PTSP:\n'
          '1. Transparan, Akuntabel, dan Pasti\n'
          '2. Bebas Pungli (Seluruh layanan Rp 0 / GRATIS)\n'
          '3. Pelayanan Berorientasi Kepuasan Masyarakat (5S: Senyum, Salam, Sapa, Sopan, Santun).',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF334155)),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  void _showFaqDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(LucideIcons.helpCircle, color: Color(0xFF0284C7), size: 20),
            SizedBox(width: 8),
            Text('Panduan & FAQ Layanan', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Text(
          '1. Berapa biaya pengurusan di PTSP?\n'
          'Seluruh proses permohonan layanan di PTSP Kemenag Barito Utara adalah GRATIS (Rp 0).\n\n'
          '2. Bagaimana cara memantau status berkas?\n'
          'Gunakan tab "Lacak" di navigasi bawah untuk memeriksa progres berkas menggunakan nomor registrasi permohonan Anda.\n\n'
          '3. Berapa lama proses verifikasi dokumen?\n'
          'Estimasi penyelesaian berkas rata-rata adalah 1 s/d 3 hari kerja tergantung kelengkapan berkas fisik dan verifikasi pejabat teknis.',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF334155)),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  void _showAccountDetailDialog(UserModel user) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Detail Informasi Akun', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildProfileRow('Nama Lengkap', user.nama),
            const Divider(height: 16),
            _buildProfileRow('Email Terdaftar', user.email),
            if (user.phone != null && user.phone!.isNotEmpty) ...[
              const Divider(height: 16),
              _buildProfileRow('No. WhatsApp', user.phone!),
            ],
            if (user.nip != null && user.nip!.isNotEmpty) ...[
              const Divider(height: 16),
              _buildProfileRow('NIP Pegawai', user.nip!),
            ],
            const Divider(height: 16),
            _buildProfileRow('Hak Akses / Peran', user.isPegawai ? 'Pegawai ASN' : 'Masyarakat Pemohon'),
          ],
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(LucideIcons.shieldCheck, color: Color(0xFF475569), size: 20),
            SizedBox(width: 8),
            Text('Keamanan & Privasi', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          ],
        ),
        content: const Text(
          'Kantor Kementerian Agama Kabupaten Barito Utara berkomitmen penuh melindungi data pribadi seluruh pemohon layanan publik.\n\n'
          '• Seluruh dokumen permohonan tersimpan secara terenkripsi di cloud resmi pemerintah.\n'
          '• Data nomor WhatsApp dan identitas pemohon hanya digunakan untuk keperluan verifikasi dan notifikasi status berkas.\n'
          '• Tidak ada data pemohon yang dibagikan kepada pihak ketiga manapun.',
          style: TextStyle(fontSize: 12.5, height: 1.45, color: Color(0xFF334155)),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER WIDGETS
  // ══════════════════════════════════════════════════════════════════════════
  Widget _buildRoleTab(LoginRole role, String label) {
    final isSelected = _selectedRole == role;
    return Expanded(
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedRole = role;
            _emailOrNipController.clear();
            _passwordController.clear();
          });
        },
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 3,
                      offset: const Offset(0, 1),
                    ),
                  ]
                : null,
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              color: isSelected ? AppColors.textPrimary : const Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }

  String _getRoleHint() {
    switch (_selectedRole) {
      case LoginRole.masyarakat:
        return 'Gunakan Nomor WhatsApp aktif atau Akun Google Anda.';
      case LoginRole.pegawai:
        return 'Gunakan NIP 18 digit dan password akun kepegawaian Anda.';
    }
  }

  Widget _buildProfileRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary)),
        Text(
          value,
          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
        ),
      ],
    );
  }

  void _showHelpDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
        content: Text(message, style: const TextStyle(fontSize: 13, height: 1.4)),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Tutup'),
          ),
        ],
      ),
    );
  }

  Widget _buildRequiredLabel(String label) {
    return RichText(
      text: TextSpan(
        text: label,
        style: const TextStyle(
          fontSize: 12.5,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        children: const [
          TextSpan(
            text: ' *',
            style: TextStyle(
              color: AppColors.statusRejected,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  int _calculatePasswordStrength(String password) {
    if (password.isEmpty) return 0;
    if (password.length < 6) return 1;

    int score = 1;
    if (password.length >= 8) score++;
    final hasLetters = RegExp(r'[a-zA-Z]').hasMatch(password);
    final hasDigits = RegExp(r'[0-9]').hasMatch(password);
    final hasSpecial = RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(password);
    final hasUpperLower = RegExp(r'[a-z]').hasMatch(password) && RegExp(r'[A-Z]').hasMatch(password);

    if (hasLetters && (hasDigits || hasSpecial)) score++;
    if (password.length >= 8 && hasUpperLower && (hasDigits || hasSpecial)) score++;

    return score.clamp(1, 4);
  }

  Widget _buildPasswordStrengthIndicator(String password) {
    if (password.isEmpty) {
      return const SizedBox(height: 6);
    }

    final score = _calculatePasswordStrength(password);

    Color activeColor;
    String label;
    switch (score) {
      case 1:
        activeColor = const Color(0xFFEF4444); // Lemah / Merah
        label = password.length < 6 ? 'Terlalu pendek (min. 6)' : 'Lemah';
        break;
      case 2:
        activeColor = const Color(0xFFF59E0B); // Sedang / Amber
        label = 'Sedang';
        break;
      case 3:
        activeColor = const Color(0xFF10B981); // Kuat / Hijau Emerald
        label = 'Kuat';
        break;
      case 4:
        activeColor = const Color(0xFF047857); // Sangat Kuat / Kemenag Deep Green
        label = 'Sangat Kuat';
        break;
      default:
        activeColor = const Color(0xFFCBD5E1);
        label = '';
    }

    return Padding(
      padding: const EdgeInsets.only(top: 8, bottom: 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(4, (index) {
              final isFilled = index < score;
              return Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                  margin: EdgeInsets.only(right: index < 3 ? 4 : 0),
                  height: 4,
                  decoration: BoxDecoration(
                    color: isFilled ? activeColor : const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Kekuatan Sandi:',
                style: TextStyle(
                  fontSize: 11,
                  color: Color(0xFF64748B),
                  fontWeight: FontWeight.w500,
                ),
              ),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 250),
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: activeColor,
                ),
                child: Text(label),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGoogleLogo(double size) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _GoogleLogoPainter(),
      ),
    );
  }
}

/// Painter resmi untuk rendering ikon 4-warna Google "G" beresolusi tinggi tanpa dependensi eksternal
class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final strokeWidth = size.width * 0.22;
    final rect = Rect.fromCircle(center: center, radius: (size.width - strokeWidth) / 2);

    final paintRed = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintYellow = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintGreen = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    final paintBlue = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.butt;

    const pi = 3.1415926535897932;

    // Busur Lingkaran Google "G"
    // Merah (atas)
    canvas.drawArc(rect, -pi * 0.72, pi * 0.55, false, paintRed);
    // Kuning (kiri)
    canvas.drawArc(rect, pi * 0.73, pi * 0.45, false, paintYellow);
    // Hijau (bawah)
    canvas.drawArc(rect, pi * 0.18, pi * 0.55, false, paintGreen);
    // Biru (kanan bawah)
    canvas.drawArc(rect, -pi * 0.17, pi * 0.35, false, paintBlue);

    // Garis horizontal biru tengah
    final barPaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;
    final barRect = Rect.fromLTRB(
      center.dx - strokeWidth * 0.1,
      center.dy - strokeWidth / 2,
      size.width,
      center.dy + strokeWidth / 2,
    );
    canvas.drawRRect(
      RRect.fromRectAndRadius(barRect, Radius.circular(strokeWidth * 0.15)),
      barPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
