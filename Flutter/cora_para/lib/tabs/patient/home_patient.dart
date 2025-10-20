import 'package:flutter/material.dart';
import 'allergies.dart';

class PatientHomePage extends StatefulWidget {

  final String rut;

  const PatientHomePage({super.key, required this.rut});
  
  @override
  State<PatientHomePage> createState() => _PatientHomePageState();
}

class _PatientHomePageState extends State<PatientHomePage> {

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: Theme.of(context).colorScheme.inversePrimary,
          title: const Text(
            "Información Paciente",
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        body: SingleChildScrollView(
          child: Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.max,
              children: <Widget>[
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Card(
                    elevation: 16.0,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          ListTile(
                            leading: Icon(Icons.person),
                            title: Text(
                              "General",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 16.0,
                                color: Theme.of(
                                  context,
                                ).colorScheme.inverseSurface,
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 16.0,
                            width: 128.0,
                            child: Divider(),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoCard(title: "Tipo Sangre", subtitle: "AB+"),
                              SizedBox(width: 32.0),
                              infoCard(title: "¿Crónico?", subtitle: "Si"),
                            ],
                          ),
                          SizedBox(height: 8.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoCard(title: "¿Fumador/a?", subtitle: "Si"),
                              SizedBox(width: 32.0),
                              infoCard(title: "Seguro", subtitle: "ISAPRE"),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Card(
                    elevation: 16.0,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          ListTile(
                            leading: Icon(Icons.stacked_bar_chart),
                            title: Text(
                              "Estadísticas",
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                fontSize: 16.0,
                                color: Theme.of(
                                  context,
                                ).colorScheme.inverseSurface,
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 16.0,
                            width: 128.0,
                            child: Divider(),
                          ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoCard(title: "Latidos", subtitle: "69 bpm"),
                              SizedBox(width: 32.0),
                              infoCard(title: "Glucosa", subtitle: "150 mg/dL"),
                            ],
                          ),
                          SizedBox(height: 8.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoCard(
                                title: "Presión",
                                subtitle: "120/80 mmHg",
                              ),
                              SizedBox(width: 32.0),
                              infoCard(
                                title: "Colesterol",
                                subtitle: "150 mg/dL",
                              ),
                            ],
                          ),
                          SizedBox(height: 8.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoCard(
                                title: "Respiración",
                                subtitle: "32 rpm",
                              ),
                              SizedBox(width: 32.0),
                              infoCard(title: "Temperatura", subtitle: "36.6°"),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Card(
                    elevation: 16.0,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          Text(
                            "Opciones",
                            style: TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 16.0,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          SizedBox(height: 16.0, width: 64.0, child: Divider()),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoButtonCard(
                                title: "Alergías",
                                icon: Icons.list,
                                onPressedButton: () {
                                  showDialog<String>(
                                    context: context,
                                    builder: (BuildContext context) =>
                                        Dialog(child: AllergiesPage(rut: widget.rut)),
                                  );
                                },
                              ),
                              SizedBox(width: 32.0),
                              infoButtonCard(
                                title: "Recetas",
                                icon: Icons.receipt,
                              ),
                            ],
                          ),
                          SizedBox(height: 16.0),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              infoButtonCard(
                                title: "Historial",
                                icon: Icons.history,
                              ),
                              SizedBox(width: 32.0),
                              infoButtonCard(
                                title: "Hábitos",
                                icon: Icons.watch_later_outlined,
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Widget infoCard({required String title, required String subtitle}) {
  return Center(
    child: SizedBox.square(
      dimension: 128.0,
      child: Card(
        elevation: 12.0,
        shape: BeveledRectangleBorder(
          borderRadius: BorderRadius.all(Radius.elliptical(10, 10)),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
              ),
              SizedBox(height: 8.0, width: 32.0, child: Divider()),
              Text(
                subtitle,
                style: TextStyle(fontWeight: FontWeight.w400, fontSize: 16.0),
              ),
            ],
          ),
        ),
      ),
    ),
  );
}

Widget infoButtonCard({
  required String title,
  required IconData icon,
  VoidCallback? onPressedButton,
}) {
  return Center(
    child: SizedBox.square(
      dimension: 128.0,
      child: Card(
        elevation: 12.0,
        shape: CircleBorder(),
        child: TextButton(
          onPressed: onPressedButton ?? () {},
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 42.0),
                Text(title, style: TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}
