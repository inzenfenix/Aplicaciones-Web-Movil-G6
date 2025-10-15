import 'package:flutter/material.dart';
import 'tabs/home.dart';

void main() {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
            selectedIcon: Icon(Icons.dashboard),
            icon: Icon(Icons.dashboard_outlined),
            label: "Dashboard",
          ),
        ],
      ),
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        title: Text(widget.title),
      ),
      body:<Widget>[
        homePageTab,
        homePageTab,
        homePageTab
     ][curPageIndex] 
    );
  }
}
