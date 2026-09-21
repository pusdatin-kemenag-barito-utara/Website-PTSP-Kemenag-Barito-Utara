/// Model data Cuti Pegawai ASN
class CutiModel {
  final String id;
  final String nip;
  final String jenisCuti;
  final String alasan;
  final String tanggalMulai;
  final String tanggalSelesai;
  final int jumlahHari;
  final String status;

  CutiModel({
    required this.id,
    required this.nip,
    required this.jenisCuti,
    required this.alasan,
    required this.tanggalMulai,
    required this.tanggalSelesai,
    required this.jumlahHari,
    required this.status,
  });

  factory CutiModel.fromJson(Map<String, dynamic> json) {
    return CutiModel(
      id: json['id']?.toString() ?? '',
      nip: json['nip'] as String? ?? '',
      jenisCuti: json['jenis_cuti'] as String? ?? 'Cuti Tahunan',
      alasan: json['alasan'] as String? ?? '',
      tanggalMulai: json['tanggal_mulai'] as String? ?? '',
      tanggalSelesai: json['tanggal_selesai'] as String? ?? '',
      jumlahHari: json['jumlah_hari'] as int? ?? 1,
      status: json['status'] as String? ?? 'diajukan',
    );
  }
}
