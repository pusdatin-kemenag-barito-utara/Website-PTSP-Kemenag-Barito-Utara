/// Model data entri Buku Tamu Kunjungan PTSP
class BukuTamuInput {
  final String namaLengkap;
  final String instansi;
  final String telepon;
  final String keperluan;
  final String tujuanSeksi;

  BukuTamuInput({
    required this.namaLengkap,
    required this.instansi,
    required this.telepon,
    required this.keperluan,
    required this.tujuanSeksi,
  });

  Map<String, dynamic> toJson() {
    return {
      'nama_lengkap': namaLengkap,
      'instansi': instansi,
      'telepon': telepon,
      'keperluan': keperluan,
      'tujuan_seksi': tujuanSeksi,
    };
  }
}
