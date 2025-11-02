import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

class DataConsultationAPI {
  static Future<int?> execute({
    required String userId,
    required String place,
    required String consultorId,
  }) async {
    final dio = Dio(
      BaseOptions(
        headers: {'Content-Type': 'application/json'},
        responseType: ResponseType.json,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ),
    );

    final url =
        "https://qfptnbgte8.execute-api.us-east-2.amazonaws.com/HistoricConsultations";
    final curDateTime = DateTime.now().toIso8601String();

    try {
      final response = await dio.post(
        url,
        data: {
          'idConsultor': consultorId,
          'userId': userId,
          'fechaHora': curDateTime,
          'lugar': place,
        },
      );

      debugPrint("Response: ${response.statusCode}");
      return response.statusCode;
    } on DioException catch (e) {
      debugPrint("Dio error: ${e.message}");
      if (e.response != null) {
        debugPrint("Response: ${e.response?.data}");
        return e.response?.statusCode;
      }
      return null;
    } catch (e, st) {
      debugPrint("Unexpected error: $e");
      debugPrint(st.toString());
      return null;
    }
  }
}
