import 'package:cora_para/tabs/patient/apis/consultations_api.dart';
import 'package:flutter/material.dart';

class ConsultationsPage extends StatefulWidget {
  final String rut;

  const ConsultationsPage({super.key, required this.rut});

  @override
  State<ConsultationsPage> createState() => _ConsultationsPageState();
}

class _ConsultationsPageState extends State<ConsultationsPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();
  String searchInput = "";

  List<dynamic> allConsultations = [];
  List<dynamic>? filteredConsultations;

  void onChangeSearchInput(String value) {
    searchInput = value;
  }

  void onPressSearchButton() {
    final q = searchInput.trim().toLowerCase();

    if (q.isEmpty) {
      setState(() => filteredConsultations = allConsultations);
      return;
    }

    final results = allConsultations.where((consulta) {
      // professional name
      final profName = (consulta["profesional"]?["nombre"] ?? "")
          .toString()
          .toLowerCase();

      if (profName.contains(q)) return true;

      // recetas -> medicamentos names
      final recetas = (consulta["recetas"] as List<dynamic>?) ?? [];
      for (final r in recetas) {
        final meds = (r["receta"]?["medicamentos"] as List<dynamic>?) ?? [];
        for (final m in meds) {
          final medName = (m["medicamento"]?["nombreMedicamento"] ?? "")
              .toString()
              .toLowerCase();
          if (medName.contains(q)) return true;
        }
      }

      // procedimientos -> nombre or tipo
      final procedimientos =
          (consulta["procedimientos"] as List<dynamic>?) ?? [];
      for (final p in procedimientos) {
        final proc = p["procedimiento"] ?? {};
        final pname = (proc["nombre"] ?? "").toString().toLowerCase();
        final ptype = (proc["tipoProcedimiento"] ?? "")
            .toString()
            .toLowerCase();
        if (pname.contains(q) || ptype.contains(q)) return true;
      }

      // diagnosticos -> detalleDiagnostico
      final diagnosticos = (consulta["diagnosticos"] as List<dynamic>?) ?? [];
      for (final d in diagnosticos) {
        final det = (d["diagnostico"]?["detalleDiagnostico"] ?? "")
            .toString()
            .toLowerCase();
        if (det.contains(q)) return true;
      }

      // razonConsulta / lugar
      final razon = (consulta["razonConsulta"] ?? "").toString().toLowerCase();
      final lugar = (consulta["lugar"] ?? "").toString().toLowerCase();
      if (razon.contains(q) || lugar.contains(q)) return true;

      return false;
    }).toList();

    setState(() => filteredConsultations = results);
  }

  @override
  void initState() {
    super.initState();
    fetchConsultations(id: widget.rut);
  }

  Future<void> fetchConsultations({required String id}) async {
    try {
      final data = await ConsultationsAPI.fetchData(id: id);

      setState(() {
        allConsultations = data;
        filteredConsultations = data;
      });
    } catch (e) {
      debugPrint('Error fetching recipes: $e');
    }
  }

  String formatDate(String? dateStr) {
    if (dateStr == null) return "";
    try {
      final dt = DateTime.parse(dateStr).toLocal();
      return "${dt.year.toString().padLeft(4, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} ${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    } catch (_) {
      return dateStr;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
        // header row
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
          child: Row(
            children: [
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.all(10),
                  shape: const CircleBorder(),
                ),
                child: Icon(Icons.close, color: theme.colorScheme.shadow),
              ),
              Expanded(
                child: Center(
                  child: Text(
                    "Consultas",
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.grey.shade800,
                      fontSize: 19.0,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 48),
            ],
          ),
        ),

        const Divider(),

        // search bar
        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Card(
            elevation: 4,
            child: Form(
              key: _searchKey,
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 6,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(
                          hintText:
                              'Buscar consultas (médico, medicamento, procedimiento, diagnóstico...)',
                          border: InputBorder.none,
                        ),
                        onChanged: onChangeSearchInput,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: onPressSearchButton,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // list
        Expanded(
          child: consultationList(
            values: filteredConsultations,
            formatDate: formatDate,
          ),
        ),
      ],
    );
  }
}

Widget consultationList({
  required List<dynamic>? values,
  required String Function(String?) formatDate,
}) {
  if (values == null || values.isEmpty) {
    return const Center(child: Text("No se encontraron consultas"));
  }

  return ListView.builder(
    padding: const EdgeInsets.all(12),
    itemCount: values.length,
    itemBuilder: (context, idx) {
      final consulta = values[idx];
      final prof = consulta["profesional"] ?? {};
      final recetas = (consulta["recetas"] as List<dynamic>?) ?? [];
      final diagnosticos = (consulta["diagnosticos"] as List<dynamic>?) ?? [];
      final procedimientos =
          (consulta["procedimientos"] as List<dynamic>?) ?? [];
      final razon = consulta["razonConsulta"] ?? "";
      final lugar = consulta["lugar"] ?? "";
      final fecha = formatDate(consulta["fechaAtencion"]?.toString());

      return Card(
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          childrenPadding: const EdgeInsets.all(12),
          title: Row(
            children: [
              CircleAvatar(
                radius: 20,
                child: Text(
                  (prof["nombre"] ?? "D")
                      .toString()
                      .split(' ')
                      .map((s) => s.isNotEmpty ? s[0] : "")
                      .take(2)
                      .join(),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      prof["nombre"] ?? "Sin profesional",
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      prof["especialidad"] ?? "",
                      style: const TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(fecha, style: const TextStyle(fontSize: 12)),
                  const SizedBox(height: 4),
                ],
              ),
            ],
          ),

          children: [
            // Professional contact card
            Card(
              margin: const EdgeInsets.symmetric(vertical: 6),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(10.0),
                child: Row(
                  children: [
                    const Icon(Icons.person_outline),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            prof["nombre"] ?? "Sin nombre",
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(prof["correo"] ?? "", style: TextStyle(fontSize: 11.0)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(prof["telefono"] ?? ""),
                        Text("Edad: ${prof["edad"] ?? 'N/A'}"),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Razon / Lugar
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Razón:",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Text(razon),
            const SizedBox(height: 8),
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Lugar:",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Text(lugar),
            const SizedBox(height: 12),

            // Recetas section
            if (recetas.isNotEmpty) ...[
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Recetas:",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Column(
                children: recetas.map((r) {
                  final receta = r["receta"] ?? {};
                  final medicamentos =
                      (receta["medicamentos"] as List<dynamic>?) ?? [];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ExpansionTile(
                      tilePadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      childrenPadding: const EdgeInsets.all(8),
                      title: Text(
                        "Receta: ${(recetas.indexOf(r) + 1).toString()}",
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      children: medicamentos.map<Widget>((m) {
                        final med = m["medicamento"] ?? {};
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          leading: const Icon(Icons.medication),
                          title: Text(med["nombreMedicamento"] ?? "Sin nombre"),
                          subtitle: Text(
                            "Tipo: ${med["tipoSimple"] ?? ""} • Cant: ${med["cantidad"] ?? ""}",
                          ),
                          onTap: () => showMedicationPopup(context, med),
                        );
                      }).toList(),
                    ),
                  );
                }).toList(),
              ),
            ],

            // Diagnosticos section
            if (diagnosticos.isNotEmpty) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Diagnósticos:",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Column(
                children: diagnosticos.map((d) {
                  final diag = d["diagnostico"] ?? {};
                  final examenes = (diag["examenes"] as List<dynamic>?) ?? [];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ExpansionTile(
                      tilePadding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      childrenPadding: const EdgeInsets.all(8),
                      title: Text(
                        diag["detalleDiagnostico"] ?? "Diagnóstico",
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      children: examenes.map<Widget>((e) {
                        final ex = e["examen"] ?? {};
                        return ListTile(
                          leading: const Icon(Icons.note),
                          title: Text(ex["idExamen"] ?? ""),
                          subtitle: Text(
                            "Indicacion: ${ex["indicacion"] ?? ""}",
                          ),
                          onTap: () => showExamPopup(context, ex),
                        );
                      }).toList(),
                    ),
                  );
                }).toList(),
              ),
            ],

            // Procedimientos section
            if (procedimientos.isNotEmpty) ...[
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  "Procedimientos:",
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              const SizedBox(height: 8),
              Column(
                children: procedimientos.map((p) {
                  final proc = p["procedimiento"] ?? {};
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: ListTile(
                      leading: const Icon(Icons.local_hospital),
                      title: Text(proc["nombre"] ?? ""),
                      subtitle: Text(proc["tipoProcedimiento"] ?? ""),
                      onTap: () => showProcedurePopup(context, proc),
                    ),
                  );
                }).toList(),
              ),
            ],

            const SizedBox(height: 10),
          ],
        ),
      );
    },
  );
}

/// Medication details popup
void showMedicationPopup(BuildContext context, Map med) {
  showDialog(
    context: context,
    builder: (_) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text(med["nombreMedicamento"] ?? "Medicamento"),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Tipo: ${med["tipoSimple"] ?? ""}"),
              Text("Farmacología: ${med["tipoFarma"] ?? ""}"),
              const SizedBox(height: 8),
              Text(
                "Indicaciones:",
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(med["indicacion"] ?? ""),
              const SizedBox(height: 8),
              Text("Cantidad: ${med["cantidad"] ?? ""}"),
              Text("Gramaje: ${med["gramaje"] ?? ""} mg"),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cerrar"),
          ),
        ],
      );
    },
  );
}

/// Exam details popup
void showExamPopup(BuildContext context, Map exam) {
  showDialog(
    context: context,
    builder: (_) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text("Examen: ${exam["idExamen"] ?? ""}"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Indicacion: ${exam["indicacion"] ?? ""}"),
            const SizedBox(height: 6),
            Text("CreatedAt: ${exam["createdAt"] ?? ""}"),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cerrar"),
          ),
        ],
      );
    },
  );
}

/// Procedure details popup
void showProcedurePopup(BuildContext context, Map proc) {
  showDialog(
    context: context,
    builder: (_) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: Text(proc["nombre"] ?? "Procedimiento"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Tipo: ${proc["tipoProcedimiento"] ?? ""}"),
            const SizedBox(height: 8),
            Text(proc["descripcion"] ?? ""),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cerrar"),
          ),
        ],
      );
    },
  );
}
