/// Format standar response JSON dari backend Golang Fiber
class ApiResponse<T> {
  final bool success;
  final String? message;
  final String? error;
  final T? data;

  ApiResponse({
    required this.success,
    this.message,
    this.error,
    this.data,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      success: json['success'] as bool? ?? (json['error'] == null),
      message: json['message'] as String?,
      error: json['error'] as String?,
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'] as T?,
    );
  }
}
