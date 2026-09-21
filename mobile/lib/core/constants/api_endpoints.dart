/// Daftar URL & Endpoint REST API Golang Fiber PTSP Kemenag Barito Utara
class ApiEndpoints {
  ApiEndpoints._();

  // Base URL backend (Gunakan IP LAN saat testing fisik / 10.0.2.2 di emulator Android)
  static const String defaultBaseUrl = 'http://10.0.2.2:8080/api/v1';

  // Auth
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';
  static const String changePassword = '/auth/change-password';

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
