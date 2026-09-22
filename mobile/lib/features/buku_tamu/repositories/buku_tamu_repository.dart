import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/buku_tamu_model.dart';

/// Repository untuk operasional Buku Tamu & Janji Temu ke API Golang Fiber
class BukuTamuRepository {
  final DioClient _client;

  BukuTamuRepository(this._client);

  Dio get _dio => _client.dio;

  /// Kirim data entri Buku Tamu baru ke backend
  Future<bool> submitBukuTamu(BukuTamuInput input) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.guestBook,
        data: input.toJson(),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('🚨 [submitBukuTamu] Error: $e');
      return false;
    }
  }

  /// Ambil daftar entri Buku Tamu untuk riwayat dan statistik (default limit 1000 seperti di web)
  Future<List<GuestBookItem>> getGuestBookList({int limit = 1000}) async {
    try {
      final response = await _dio.get(
        ApiEndpoints.guestBook,
        queryParameters: {'limit': limit},
      );
      if (response.statusCode == 200 && response.data != null) {
        final dynamic raw = response.data;
        final List<dynamic> list = raw is Map<String, dynamic>
            ? (raw['data'] as List<dynamic>? ?? [])
            : (raw is List<dynamic> ? raw : []);
        return list
            .whereType<Map<String, dynamic>>()
            .map((json) => GuestBookItem.fromJson(json))
            .toList();
      }
      return [];
    } catch (e, stack) {
      debugPrint('🚨 [getGuestBookList] Error: $e\n$stack');
      return [];
    }
  }

  /// Kirim pengajuan Janji Temu / Audiensi baru
  Future<bool> submitAppointment(AppointmentInput input) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.appointments,
        data: input.toJson(),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      debugPrint('🚨 [submitAppointment] Error: $e');
      return false;
    }
  }

  /// Ambil riwayat Janji Temu dari database backend
  Future<List<AppointmentItem>> getAppointments({
    String? status,
    int limit = 100,
  }) async {
    try {
      final queryParams = <String, dynamic>{'limit': limit};
      if (status != null && status.isNotEmpty) {
        queryParams['status'] = status;
      }

      final response = await _dio.get(
        ApiEndpoints.appointments,
        queryParameters: queryParams,
      );

      if (response.statusCode == 200 && response.data != null) {
        final dynamic raw = response.data;
        final List<dynamic> list = raw is Map<String, dynamic>
            ? (raw['data'] as List<dynamic>? ?? [])
            : (raw is List<dynamic> ? raw : []);
        return list
            .whereType<Map<String, dynamic>>()
            .map((json) => AppointmentItem.fromJson(json))
            .toList();
      }
      return [];
    } catch (e, stack) {
      debugPrint('🚨 [getAppointments] Error: $e\n$stack');
      return [];
    }
  }
}
