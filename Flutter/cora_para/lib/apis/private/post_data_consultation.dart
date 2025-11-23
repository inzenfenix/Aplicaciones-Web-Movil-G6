import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

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

    final apiUrl = dotenv.env['API_URL'];
    final url =
        "$apiUrl/HistoricConsultations";
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
