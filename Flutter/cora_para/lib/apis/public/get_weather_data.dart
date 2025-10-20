import 'package:dio/dio.dart';

class WeatherAPIConnector {
  static Future<List<dynamic>> getWeather() async {
    var dio = Dio();

    final url =
        'https://climatologia.meteochile.gob.cl/application/servicios/getDatosRecientesEma/330020/2025/10?usuario=tsolanos@udd.cl&token=08db819155320f3054468acc';

    try {
      final response = await dio.get(url);
      return response.data["datosEstaciones"]["datos"];
    } catch (e) {
      print('Error: $e');
      return List.empty();
    }
  }

  static WeatherEntry? getClosestTemperature(List<WeatherEntry> entries, DateTime targetTime) {
  if (entries.isEmpty) return null;

  WeatherEntry closest = entries.first;
  int minDiff = (entries.first.momento.difference(targetTime)).inSeconds.abs();

  for (var entry in entries) {
    int diff = entry.momento.difference(targetTime).inSeconds.abs();
    if (diff < minDiff) {
      closest = entry;
      minDiff = diff;
    }
  }

  return closest;
}

}

class WeatherEntry {
  final DateTime momento;
  final double temperatura;

  WeatherEntry({required this.momento, required this.temperatura});

  factory WeatherEntry.fromMap(Map<String, dynamic> map) {
    final temp = double.parse(map['temperatura'].replaceAll(' °C', ''));
    final momento = DateTime.parse(map['momento']);
    return WeatherEntry(momento: momento, temperatura: temp);
  }
}