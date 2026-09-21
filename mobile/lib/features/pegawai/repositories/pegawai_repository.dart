import 'package:dio/dio.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/network/dio_client.dart';
import '../models/cuti_model.dart';

/// Repository untuk layanan mandiri ASN Pegawai ke API Golang Fiber
class PegawaiRepository {
  final DioClient _client;

  PegawaiRepository(this._client);

  Dio get _dio => _client.dio;

  Future<List<CutiModel>> getCutiList() async {
    try {
      final response = await _dio.get(ApiEndpoints.cuti);
      final raw = response.data;
      final List<dynamic> list = raw is List
          ? raw
          : (raw['data'] as List<dynamic>? ?? []);
      return list.map((e) => CutiModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      return [];
    }
  }

  Future<bool> ajukanCuti({
    required String jenisCuti,
    required String alasan,
    required String tanggalMulai,
    required String tanggalSelesai,
    required int jumlahHari,
  }) async {
    try {
      final response = await _dio.post(
        ApiEndpoints.cuti,
        data: {
          'jenis_cuti': jenisCuti,
          'alasan': alasan,
          'tanggal_mulai': tanggalMulai,
          'tanggal_selesai': tanggalSelesai,
          'jumlah_hari': jumlahHari,
        },
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      return false;
    }
  }
}
