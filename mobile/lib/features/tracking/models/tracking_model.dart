/// Model status tracking pengajuan permohonan
class TrackingModel {
  final String requestNumber;
  final String serviceName;
  final String applicantName;
  final String status;
  final String? note;
  final DateTime createdAt;

  TrackingModel({
    required this.requestNumber,
    required this.serviceName,
    required this.applicantName,
    required this.status,
    this.note,
    required this.createdAt,
  });

  factory TrackingModel.fromJson(Map<String, dynamic> json) {
    return TrackingModel(
      requestNumber: json['request_number'] as String? ?? json['no_permohonan'] as String? ?? '',
      serviceName: json['service_title'] as String? ?? json['nama_layanan'] as String? ?? '',
      applicantName: json['applicant_name'] as String? ?? json['nama_pemohon'] as String? ?? '',
      status: json['status'] as String? ?? 'diajukan',
      note: json['note'] as String? ?? json['catatan'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }
}
