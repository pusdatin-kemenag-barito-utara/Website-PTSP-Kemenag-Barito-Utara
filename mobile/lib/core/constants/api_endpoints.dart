import 'package:flutter/foundation.dart';

/// Daftar URL & Endpoint REST API Golang Fiber PTSP Kemenag Barito Utara
class ApiEndpoints {
  ApiEndpoints._();

  // Base URL backend: otomatis produksi saat rilis atau 10.0.2.2 saat debug emulator
  static const String defaultBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: kReleaseMode
        ? 'https://ptsp.kemenag-baritoutara.com/api/v1'
        : 'http://10.0.2.2:8080/api/v1',
  );

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';

  // Google OAuth Client IDs (Sinkron dengan Infisical / --dart-define)
  static const String googleClientId = String.fromEnvironment(
    'PUBLIC_GOOGLE_CLIENT_ID',
    defaultValue: '796413900805-f70k0kc4mn9e2f7go5brjg0q79r0ujkq.apps.googleusercontent.com',
  );

  static const String googleClientIdAndroid = String.fromEnvironment(
    'PUBLIC_GOOGLE_CLIENT_ID_ANDROID',
    defaultValue: '796413900805-g5flotmfa9h2snd6t5k028gqmlkt5bgk.apps.googleusercontent.com',
  );

  // Layanan Publik
  static const String services = '/services';
  static String serviceDetail(String slug) => '/services/$slug';
  static String serviceRequirements(String id) => '/service-items/$id/requirements';
  static String serviceFormFields(String id) => '/service-items/$id/form-fields';

  // Permohonan Dokumen & Tracking
  static const String requests = '/requests';
  static String trackRequest(String requestNumber) => '/requests/track/$requestNumber';
  static const String uploadDocument = '/upload-document';

  // Buku Tamu & Janji Temu
  static const String guestBook = '/guest-book';
  static const String appointments = '/appointments';

  // Layanan Mandiri ASN Pegawai
  static const String cuti = '/pegawai/cuti';
  static const String lkh = '/pegawai/lkh';
  static const String pejabatList = '/pegawai/pejabat';

  // Admin Petugas
  static const String adminDashboardStats = '/admin/stats';
  static const String adminRequests = '/admin/requests';
  static String adminUpdateStatus(String id) => '/admin/requests/$id/status';
}
