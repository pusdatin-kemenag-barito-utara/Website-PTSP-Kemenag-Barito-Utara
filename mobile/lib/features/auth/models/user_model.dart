/// Model pengguna sistem PTSP (Pemohon, Pegawai, Admin)
class UserModel {
  final String id;
  final String email;
  final String nama;
  final String role;
  final String? userType;
  final String? nip;
  final String? phone;

  UserModel({
    required this.id,
    required this.email,
    required this.nama,
    required this.role,
    this.userType,
    this.nip,
    this.phone,
  });

  bool get isPegawai =>
      userType == 'internal_pegawai' ||
      userType == 'pegawai' ||
      role == 'pegawai' ||
      (nip != null && nip!.isNotEmpty);

  bool get isAdmin =>
      userType == 'internal_admin' ||
      role == 'admin_ptsp' ||
      role == 'super_admin' ||
      role == 'kepala_kantor' ||
      role == 'kasubag_tu';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? json['user_id']?.toString() ?? '',
      email: json['email'] as String? ?? '',
      nama: json['nama'] as String? ?? json['name'] as String? ?? '',
      role: json['role'] as String? ?? 'user',
      userType: json['user_type'] as String?,
      nip: json['nip'] as String?,
      phone: json['phone'] as String? ?? json['no_hp'] as String?,
    );
  }
}
