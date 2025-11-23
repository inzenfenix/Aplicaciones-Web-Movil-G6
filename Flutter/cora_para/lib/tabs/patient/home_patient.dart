// Prettified version of your PatientHomePage code.
// Logic preserved; improved aesthetics, spacing, structure, and readability.

import 'package:cora_para/tabs/patient/apis/patient_data_api.dart';
import 'package:cora_para/tabs/patient/consultations.dart';
import 'package:cora_para/tabs/patient/procedures.dart';
import 'package:cora_para/tabs/patient/recipes.dart';
import 'package:flutter/material.dart';
import 'allergies.dart';

class PatientHomePage extends StatefulWidget {
  final String rut;

  const PatientHomePage({super.key, required this.rut});

  @override
  State<PatientHomePage> createState() => _PatientHomePageState();
}

class _PatientHomePageState extends State<PatientHomePage> {
  final ScrollController _scrollController = ScrollController();
  Map patientData = {};

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    fetchInitialData(id: widget.rut);
  }

  Future<void> fetchInitialData({required String id}) async {
    try {
      final data = await MedicalRecordAPI.fetchData(id: id);
      setState(() => patientData = data);
    } catch (e) {
      debugPrint('$e');
    }
  }

  void _scrollToTop() => _scrollController.animateTo(
    0,
    duration: const Duration(milliseconds: 400),
    curve: Curves.easeInOut,
  );

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final sideCardColor = theme.colorScheme.primaryContainer;
    final screenWidth = MediaQuery.of(context).size.width;
    final crossAxisCount = screenWidth < 600 ? 2 : 3;

    return SafeArea(
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: theme.colorScheme.inversePrimary,
          title: const Text(
            "Ficha médica",
            style: TextStyle(fontWeight: FontWeight.w300, letterSpacing: 1.4),
          ),
        ),
        body: SingleChildScrollView(
          controller: _scrollController,
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _headerField("Paciente", patientData["nombre"] ?? ""),
              _headerField("Sexo", patientData["sexo"] ?? ""),
              const SizedBox(height: 12),

              sectionCard(
                context: context,
                icon: Icons.person,
                title: "General",
                children: [
                  responsiveGrid([
                    infoCard(
                      title: "Tipo Sangre",
                      subtitle: "AB+",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "¿Crónico?",
                      subtitle: "Sí",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "¿Fumador/a?",
                      subtitle: "Sí",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Seguro",
                      subtitle: "ISAPRE",
                      sideColor: sideCardColor,
                    ),
                  ], crossAxisCount),
                ],
              ),

              sectionCard(
                context: context,
                icon: Icons.stacked_bar_chart,
                title: "Estadísticas",
                children: [
                  responsiveGrid([
                    infoCard(
                      title: "Latidos",
                      subtitle: "69 bpm",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Glucosa",
                      subtitle: "150 mg/dL",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Presión",
                      subtitle: "120/80 mmHg",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Colesterol",
                      subtitle: "150 mg/dL",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Respiración",
                      subtitle: "32 rpm",
                      sideColor: sideCardColor,
                    ),
                    infoCard(
                      title: "Temperatura",
                      subtitle: "36.6°",
                      sideColor: sideCardColor,
                    ),
                  ], crossAxisCount),
                ],
              ),

              sectionCard(
                context: context,
                icon: Icons.settings,
                title: "Opciones",
                children: [
                  responsiveGrid([
                    infoButtonCard(
                      title: "Alergías",
                      icon: Icons.list,
                      onPressedButton: () {
                        showDialog(
                          context: context,
                          builder: (_) =>
                              Dialog(child: AllergiesPage(rut: widget.rut)),
                        );
                      },
                    ),
                    infoButtonCard(
                      title: "Recetas",
                      icon: Icons.receipt,
                      onPressedButton: () {
                        showDialog(
                          context: context,
                          builder: (_) =>
                              Dialog(child: RecipesPage(rut: widget.rut)),
                        );
                      },
                    ),
                    infoButtonCard(
                      title: "Procedmientos",
                      icon: Icons.analytics,
                      onPressedButton: () {
                        showDialog(
                          context: context,
                          builder: (_) =>
                              Dialog(child: ProceduresPage(rut: widget.rut)),
                        );
                      },
                    ),
                    infoButtonCard(
                      title: "Consultas",
                      icon: Icons.watch_later_outlined,
                      onPressedButton: () {
                        showDialog(
                          context: context,
                          builder: (_) =>
                              Dialog(child: ConsultationsPage(rut: widget.rut)),
                        );
                      },
                    ),
                  ], crossAxisCount),
                ],
              ),

              const SizedBox(height: 24),

              Center(
                child: ElevatedButton.icon(
                  icon: const Icon(Icons.arrow_upward),
                  label: const Text("Volver arriba"),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 22,
                      vertical: 14,
                    ),
                    textStyle: const TextStyle(letterSpacing: 1.1),
                  ),
                  onPressed: _scrollToTop,
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _headerField(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(left: 12, bottom: 4),
      child: Text(
        "$label: $value",
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w500,
          letterSpacing: 1.1,
        ),
      ),
    );
  }

  Widget sectionCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required List<Widget> children,
  }) {
    final theme = Theme.of(context);

    return Padding(
      padding: const EdgeInsets.only(bottom: 18.0),
      child: Card(
        elevation: 10,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(icon, size: 28, color: theme.colorScheme.primary),
                  const SizedBox(width: 10),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ...children,
            ],
          ),
        ),
      ),
    );
  }
}

Widget responsiveGrid(List<Widget> children, int crossAxisCount) {
  return GridView.count(
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    crossAxisCount: crossAxisCount,
    crossAxisSpacing: 16,
    mainAxisSpacing: 16,
    childAspectRatio: 1.6,
    children: children,
  );
}

// ------------------------------------------------------------
// COMPONENTS
// ------------------------------------------------------------

Widget infoCard({
  required String title,
  required String subtitle,
  Color sideColor = Colors.blueGrey,
}) {
  return Card(
    elevation: 8.0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    child: Container(
      decoration: BoxDecoration(
        border: Border(right: BorderSide(color: sideColor, width: 3)),
        borderRadius: BorderRadius.circular(16),
      ),
      padding: const EdgeInsets.all(12.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15.0),
          ),
          const SizedBox(height: 6.0),
          const Divider(thickness: 0.8),
          const SizedBox(height: 6.0),
          Text(subtitle, style: const TextStyle(fontSize: 14.0)),
        ],
      ),
    ),
  );
}

Widget infoButtonCard({
  required String title,
  required IconData icon,
  VoidCallback? onPressedButton,
}) {
  return Card(
    elevation: 10.0,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    child: InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onPressedButton ?? () {},
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 38.0),
            const SizedBox(height: 8.0),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15.0,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
