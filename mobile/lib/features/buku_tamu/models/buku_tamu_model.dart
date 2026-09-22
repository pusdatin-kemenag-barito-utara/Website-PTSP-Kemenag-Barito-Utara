/// Model data entri Buku Tamu Kunjungan PTSP
class BukuTamuInput {
  final String namaLengkap;
  final String? instansi;
  final String tipeInstansi;
  final String telepon;
  final String keperluan;
  final String tujuanSeksi;
  final DateTime? tanggalKunjungan;

  BukuTamuInput({
    required this.namaLengkap,
    this.instansi,
    this.tipeInstansi = 'Pribadi',
    required this.telepon,
    required this.keperluan,
    required this.tujuanSeksi,
    this.tanggalKunjungan,
  });

  Map<String, dynamic> toJson() {
    return {
      'guestName': namaLengkap,
      'whatsapp': telepon,
      'institutionType': tipeInstansi,
      'institutionName': instansi != null && instansi!.trim().isNotEmpty
          ? instansi!.trim()
          : null,
      'intendedOfficer': tujuanSeksi,
      'purpose': keperluan,
      'visitDate': (tanggalKunjungan ?? DateTime.now()).toIso8601String(),
    };
  }
}

/// Model entri buku tamu dari API backend
class GuestBookItem {
  final int id;
  final String guestName;
  final String whatsapp;
  final String institutionType;
  final String? institutionName;
  final String intendedOfficer;
  final String purpose;
  final DateTime visitDate;
  final DateTime? createdAt;

  GuestBookItem({
    required this.id,
    required this.guestName,
    required this.whatsapp,
    required this.institutionType,
    this.institutionName,
    required this.intendedOfficer,
    required this.purpose,
    required this.visitDate,
    this.createdAt,
  });

  factory GuestBookItem.fromJson(Map<String, dynamic> json) {
    return GuestBookItem(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      guestName: (json['guestName'] ?? json['guest_name'] ?? '').toString(),
      whatsapp: (json['whatsapp'] ?? '').toString(),
      institutionType:
          (json['institutionType'] ?? json['institution_type'] ?? 'Pribadi').toString(),
      institutionName: json['institutionName']?.toString() ?? json['institution_name']?.toString(),
      intendedOfficer:
          (json['intendedOfficer'] ?? json['intended_officer'] ?? '').toString(),
      purpose: (json['purpose'] ?? '').toString(),
      visitDate: json['visitDate'] != null
          ? DateTime.tryParse(json['visitDate'].toString()) ?? DateTime.now()
          : (json['visit_date'] != null
              ? DateTime.tryParse(json['visit_date'].toString()) ?? DateTime.now()
              : DateTime.now()),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : (json['created_at'] != null
              ? DateTime.tryParse(json['created_at'].toString())
              : null),
    );
  }
}

/// Model input untuk Janji Temu (Appointment)
class AppointmentInput {
  final String namaLengkap;
  final String telepon;
  final String tipeInstansi;
  final String? instansi;
  final String pejabatTujuan;
  final String keperluan;
  final String tanggal;
  final String jam;

  AppointmentInput({
    required this.namaLengkap,
    required this.telepon,
    this.tipeInstansi = 'Pribadi',
    this.instansi,
    required this.pejabatTujuan,
    required this.keperluan,
    required this.tanggal,
    required this.jam,
  });

  Map<String, dynamic> toJson() {
    return {
      'guestName': namaLengkap,
      'whatsapp': telepon,
      'institutionType': tipeInstansi,
      'institutionName': instansi != null && instansi!.trim().isNotEmpty
          ? instansi!.trim()
          : null,
      'intendedOfficer': pejabatTujuan,
      'purpose': keperluan,
      'appointmentDate': tanggal,
      'appointmentTime': jam,
    };
  }
}

/// Model entri Janji Temu dari database backend
class AppointmentItem {
  final int id;
  final String guestName;
  final String whatsapp;
  final String institutionType;
  final String? institutionName;
  final String intendedOfficer;
  final String purpose;
  final DateTime appointmentDate;
  final String appointmentTime;
  final String status;
  final DateTime createdAt;

  AppointmentItem({
    required this.id,
    required this.guestName,
    required this.whatsapp,
    required this.institutionType,
    this.institutionName,
    required this.intendedOfficer,
    required this.purpose,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.status,
    required this.createdAt,
  });

  factory AppointmentItem.fromJson(Map<String, dynamic> json) {
    return AppointmentItem(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      guestName: (json['guest_name'] ?? json['guestName'] ?? '').toString(),
      whatsapp: (json['whatsapp'] ?? '').toString(),
      institutionType:
          (json['institution_type'] ?? json['institutionType'] ?? 'Pribadi').toString(),
      institutionName: json['institution_name']?.toString() ?? json['institutionName']?.toString(),
      intendedOfficer:
          (json['intended_officer'] ?? json['intendedOfficer'] ?? '').toString(),
      purpose: (json['purpose'] ?? '').toString(),
      appointmentDate: json['appointment_date'] != null
          ? DateTime.tryParse(json['appointment_date'].toString()) ?? DateTime.now()
          : (json['appointmentDate'] != null
              ? DateTime.tryParse(json['appointmentDate'].toString()) ?? DateTime.now()
              : DateTime.now()),
      appointmentTime:
          (json['appointment_time'] ?? json['appointmentTime'] ?? '').toString(),
      status: (json['status'] ?? 'pending').toString().toLowerCase(),
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : (json['createdAt'] != null
              ? DateTime.tryParse(json['createdAt'].toString()) ?? DateTime.now()
              : DateTime.now()),
    );
  }
}
