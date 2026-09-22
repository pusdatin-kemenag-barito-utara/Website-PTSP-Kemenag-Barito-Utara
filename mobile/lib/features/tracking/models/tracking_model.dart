import 'package:flutter/material.dart';

/// Model status tracking pengajuan permohonan berkas PTSP
class TrackingModel {
  final String id;
  final String requestNumber;
  final String status;
  final String serviceName;
  final String itemName;
  final DateTime? submittedAt;
  final DateTime? completedAt;
  final DateTime? rejectedAt;
  final String? revisionNote;
  final String? rejectionReason;
  final DateTime createdAt;

  TrackingModel({
    required this.id,
    required this.requestNumber,
    required this.status,
    required this.serviceName,
    required this.itemName,
    this.submittedAt,
    this.completedAt,
    this.rejectedAt,
    this.revisionNote,
    this.rejectionReason,
    required this.createdAt,
  });

  factory TrackingModel.fromJson(Map<String, dynamic> json) {
    DateTime? parseDate(dynamic val) {
      if (val == null) return null;
      return DateTime.tryParse(val.toString());
    }

    return TrackingModel(
      id: json['id']?.toString() ?? '',
      requestNumber: json['request_number']?.toString() ??
          json['requestNumber']?.toString() ??
          json['no_permohonan']?.toString() ??
          '',
      status: (json['status']?.toString() ?? 'submitted').toLowerCase(),
      serviceName: json['service_name']?.toString() ??
          json['serviceName']?.toString() ??
          json['service_title']?.toString() ??
          'Layanan PTSP',
      itemName: json['item_name']?.toString() ??
          json['itemName']?.toString() ??
          '-',
      submittedAt: parseDate(json['submitted_at'] ?? json['submittedAt']),
      completedAt: parseDate(json['completed_at'] ?? json['completedAt']),
      rejectedAt: parseDate(json['rejected_at'] ?? json['rejectedAt']),
      revisionNote: json['revision_note']?.toString() ??
          json['revisionNote']?.toString(),
      rejectionReason: json['rejection_reason']?.toString() ??
          json['rejectionReason']?.toString(),
      createdAt:
          parseDate(json['created_at'] ?? json['createdAt']) ?? DateTime.now(),
    );
  }

  String get statusLabel {
    switch (status) {
      case 'submitted':
        return 'Diterima';
      case 'under_review':
        return 'Sedang Diverifikasi';
      case 'revision_required':
        return 'Perlu Revisi';
      case 'approved':
        return 'Disetujui';
      case 'completed':
        return 'Selesai';
      case 'rejected':
        return 'Ditolak';
      default:
        return status.toUpperCase();
    }
  }

  Color get statusColor {
    switch (status) {
      case 'submitted':
        return const Color(0xFF2563EB); // Blue
      case 'under_review':
        return const Color(0xFFD97706); // Amber
      case 'revision_required':
        return const Color(0xFFE11D48); // Rose
      case 'approved':
        return const Color(0xFF059669); // Emerald
      case 'completed':
        return const Color(0xFF16A34A); // Green
      case 'rejected':
        return const Color(0xFFDC2626); // Red
      default:
        return const Color(0xFF64748B); // Slate
    }
  }

  Color get statusBgColor {
    switch (status) {
      case 'submitted':
        return const Color(0xFFDBEAFE);
      case 'under_review':
        return const Color(0xFFFEF3C7);
      case 'revision_required':
        return const Color(0xFFFFE4E6);
      case 'approved':
        return const Color(0xFFD1FAE5);
      case 'completed':
        return const Color(0xFFDCFCE7);
      case 'rejected':
        return const Color(0xFFFEE2E2);
      default:
        return const Color(0xFFF1F5F9);
    }
  }

  String get statusDescription {
    switch (status) {
      case 'submitted':
        return 'Berkas permohonan Anda telah kami terima dan sedang dalam antrean verifikasi petugas loket PTSP.';
      case 'under_review':
        return 'Petugas loket & seksi teknis sedang memeriksa kelengkapan serta keabsahan dokumen persyaratan Anda.';
      case 'revision_required':
        return revisionNote != null && revisionNote!.trim().isNotEmpty
            ? 'Catatan revisi: $revisionNote'
            : 'Ada dokumen yang perlu direvisi atau dilengkapi kembali oleh pemohon.';
      case 'approved':
        return 'Permohonan telah disetujui dan sedang dalam proses penandatanganan surat / penerbitan SK.';
      case 'completed':
        return 'Permohonan telah selesai diproses. Dokumen hasil resmi telah terbit dan siap diambil di loket PTSP.';
      case 'rejected':
        return rejectionReason != null && rejectionReason!.trim().isNotEmpty
            ? 'Alasan penolakan: $rejectionReason'
            : 'Mohon maaf, permohonan tidak dapat diproses lebih lanjut.';
      default:
        return 'Status berkas sedang diperbarui dalam sistem.';
    }
  }

  int get currentStep {
    switch (status) {
      case 'submitted':
        return 1;
      case 'under_review':
        return 2;
      case 'revision_required':
        return 2;
      case 'approved':
        return 4;
      case 'completed':
        return 5;
      case 'rejected':
        return 5;
      default:
        return 1;
    }
  }
}
