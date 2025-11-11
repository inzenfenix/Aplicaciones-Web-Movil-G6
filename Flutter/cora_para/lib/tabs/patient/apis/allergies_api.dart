import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/widgets.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class AllergiesAPI {
  static Future<List<dynamic>> fetchData({required String id}) async {

    final apiUrl = dotenv.env['API_URL'];
    final url = Uri.parse(
      '$apiUrl/allergies/$id',
    );

    final response = await http.get(url);

    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      return data;
    } else {
      debugPrint('Error: ${response.statusCode}');
      return List.empty();
    }
  }
}
