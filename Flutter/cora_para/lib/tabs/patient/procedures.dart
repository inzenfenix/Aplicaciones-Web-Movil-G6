import 'package:cora_para/tabs/patient/apis/procedures_api.dart';
import 'package:flutter/material.dart';

class ProceduresPage extends StatefulWidget {
  final String rut;

  const ProceduresPage({super.key, required this.rut});

  @override
  State<ProceduresPage> createState() => _ProceduresPageState();
}

class _ProceduresPageState extends State<ProceduresPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();

  String searchInput = "";

  List<dynamic> allProcedures = [];
  List<dynamic>? filteredProcedures;

  void onChangeSearchInput(String value) {
    searchInput = value;
  }

  void onPressSearchButton() {
    final q = searchInput.trim().toLowerCase();

    if (q.isEmpty) {
      setState(() => filteredProcedures = allProcedures);
      return;
    }

    final results = allProcedures.where((item) {
      final nombre = item["nombre"].toString().toLowerCase();
      final tipo   = item["tipoProcedimiento"].toString().toLowerCase();
      return nombre.contains(q) || tipo.contains(q);
    }).toList();

    setState(() => filteredProcedures = results);
  }

  @override
  void initState() {
    super.initState();
    fetchProcedures(id: widget.rut);
  }
  Future<void> fetchProcedures({required String id}) async {
    try {
      final data = await ProceduresAPI.fetchData(id: id);

      setState(() {
        allProcedures = data;
        filteredProcedures = data;
      });
    } catch (e) {
      debugPrint('Error fetching recipes: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: [
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
                child: Icon(
                  Icons.close,
                  color: theme.colorScheme.shadow,
                ),
              ),
              Expanded(
                child: Center(
                  child: Text(
                    "Procedimientos",
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

        Padding(
          padding: const EdgeInsets.all(12.0),
          child: Card(
            elevation: 4,
            child: Form(
              key: _searchKey,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        decoration: const InputDecoration(
                          hintText: 'Buscar procedimientos...',
                          border: InputBorder.none,
                        ),
                        onChanged: onChangeSearchInput,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () => onPressSearchButton(),
                    )
                  ],
                ),
              ),
            ),
          ),
        ),

        Expanded(
          child: ProcedureList(values: filteredProcedures),
        ),
      ],
    );
  }
}

class ProcedureList extends StatelessWidget {
  final List<dynamic>? values;

  const ProcedureList({super.key, required this.values});

  @override
  Widget build(BuildContext context) {
    if (values == null || values!.isEmpty) {
      return const Center(child: Text("No se encontraron procedimientos"));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: values!.length,
      itemBuilder: (context, i) {
        final item = values![i];

        return Card(
          elevation: 6,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: const Icon(Icons.local_hospital, size: 30),
            title: Text(
              item["nombre"],
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            subtitle: Text(item["tipoProcedimiento"]),
            onTap: () => showProcedurePopup(context, item),
          ),
        );
      },
    );
  }
}

void showProcedurePopup(BuildContext context, Map item) {
  showDialog(
    context: context,
    builder: (_) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(item["nombre"]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Tipo: ${item["tipoProcedimiento"]}",
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(item["descripcion"]),
          ],
        ),
        actions: [
          TextButton(
            child: const Text("Cerrar"),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      );
    },
  );
}
