import 'package:flutter/material.dart';
import 'tabs/home.dart';
import 'tabs/search.dart';
import 'tabs/scan_qr.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../apis/public/get_weather_data.dart';

Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(const CoraApp());
}

class CoraApp extends StatelessWidget {
  const CoraApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cora Paramedicos',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color.fromARGB(255, 185, 14, 14),
        ),
      ),
      home: const MainPage(title: 'Cora Paramédicos'),
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({super.key, required this.title});

  final String title;

  @override
  State<MainPage> createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int curPageIndex = 0;
  HomePage homePageTab = HomePage();
  SearchPage searchPageTab = SearchPage();
  QrScannerPage qrScannerPage = QrScannerPage();

  String temp = "";

  @override
  void initState() {
    super.initState();
    fetchWeatherData();
  }

  Future<void> fetchWeatherData() async {
    try {
      final data = await WeatherAPIConnector.getWeather();
      DateTime now = DateTime.now();
      List<WeatherEntry> weatherEntries = data
          .map((e) => WeatherEntry.fromMap(e))
          .toList();

      WeatherEntry? closest = WeatherAPIConnector.getClosestTemperature(
        weatherEntries,
        now,
      );

      setState(() {
        if(closest != null)
        {
        temp = '${closest.temperatura.toString()} °C';
        }
      });
    } catch (e) {
      debugPrint('$e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: ListTile(
            trailing: Text(temp, style: TextStyle(fontSize: 16.0)),
            title: Text(
              widget.title,
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 24.0),
            ),
          ),
        ),
        body: <Widget>[homePageTab, qrScannerPage, searchPageTab][curPageIndex],
        bottomNavigationBar: NavigationBar(
          onDestinationSelected: (int index) {
            setState(() {
              curPageIndex = index;
            });
          },
          indicatorColor: Theme.of(context).colorScheme.inversePrimary,
          selectedIndex: curPageIndex,
          destinations: const <Widget>[
            NavigationDestination(
              selectedIcon: Icon(Icons.home),
              icon: Icon(Icons.home_outlined),
              label: "Inicio",
            ),
            NavigationDestination(
              selectedIcon: Icon(Icons.camera_alt),
              icon: Icon(Icons.camera_alt_outlined),
              label: "Escanear QR",
            ),
            NavigationDestination(
              selectedIcon: Icon(Icons.search_rounded),
              icon: Icon(Icons.search_rounded),
              label: "Búsqueda",
            ),
          ],
        ),
      ),
    );
  }
}
