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

/// Model rekap dan sisa cuti pegawai berdasarkan NIP dari API backend
class RekapCutiPegawai {
  final String name;
  final String nip;
  final String jabatan;
  final String unitKerja;
  final int totalCuti;
  final int cutiTahun1;
  final int cutiTahun2;
  final int cutiTahunan;
  final int cutiPenting;
  final int cutiBesar;
  final int cutiBersalin;
  final int cutiSakit;
  final int cutiCltn;
  final int sisaCuti;
  final int tahun;
  final String status;

  RekapCutiPegawai({
    required this.name,
    required this.nip,
    required this.jabatan,
    required this.unitKerja,
    required this.totalCuti,
    required this.cutiTahun1,
    required this.cutiTahun2,
    required this.cutiTahunan,
    required this.cutiPenting,
    required this.cutiBesar,
    required this.cutiBersalin,
    required this.cutiSakit,
    required this.cutiCltn,
    required this.sisaCuti,
    required this.tahun,
    required this.status,
  });

  factory RekapCutiPegawai.fromJson(Map<String, dynamic> json) {
    int parseInt(dynamic val, [int def = 0]) {
      if (val == null) return def;
      if (val is int) return val;
      if (val is double) return val.toInt();
      if (val is String) return int.tryParse(val) ?? def;
      return def;
    }

    return RekapCutiPegawai(
      name: json['name']?.toString() ?? json['nama']?.toString() ?? 'Pegawai',
      nip: json['nip']?.toString() ?? '',
      jabatan: json['jabatan']?.toString() ?? '-',
      unitKerja: json['unitKerja']?.toString() ?? json['unit_kerja']?.toString() ?? '-',
      totalCuti: parseInt(json['totalCuti'] ?? json['total_cuti'] ?? json['jumlah_cuti'], 12),
      cutiTahun1: parseInt(json['cutiTahun1'] ?? json['cuti_tahun_1'], 0),
      cutiTahun2: parseInt(json['cutiTahun2'] ?? json['cuti_tahun_2'], 0),
      cutiTahunan: parseInt(json['cutiTahunan'] ?? json['cuti_tahunan'], 0),
      cutiPenting: parseInt(json['cutiPenting'] ?? json['cuti_alasan_penting'], 0),
      cutiBesar: parseInt(json['cutiBesar'] ?? json['cuti_besar'], 0),
      cutiBersalin: parseInt(json['cutiBersalin'] ?? json['cuti_bersalin'], 0),
      cutiSakit: parseInt(json['cutiSakit'] ?? json['cuti_sakit'], 0),
      cutiCltn: parseInt(json['cutiCltn'] ?? json['cuti_cltn'], 0),
      sisaCuti: parseInt(json['sisaCuti'] ?? json['sisa_cuti'], 12),
      tahun: parseInt(json['tahun'] ?? json['tahun_target'], DateTime.now().year),
      status: json['status']?.toString() ?? 'Aktif',
    );
  }
}
