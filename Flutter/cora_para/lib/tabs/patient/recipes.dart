import 'package:cora_para/tabs/patient/apis/recipes_api.dart';
import 'package:flutter/material.dart';

class RecipesPage extends StatefulWidget {
  final String rut;

  const RecipesPage({super.key, required this.rut});

  @override
  State<RecipesPage> createState() => _RecipesPageState();
}

class _RecipesPageState extends State<RecipesPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();
  String searchInput = "";

  List<dynamic>? filteredRecipes;
  List<dynamic> allRecipes = [];

  void onChangeSearchInput(String value) {
    searchInput = value;
  }

  void onPressSearchButton() {
    final q = searchInput.trim().toLowerCase();

    if (q.isEmpty) {
      setState(() => filteredRecipes = allRecipes);
      return;
    }

    final results = allRecipes.where((recipe) {
      final meds = recipe["medicamentos"] as List<dynamic>;

      return meds.any((item) {
        final med = item["medicamento"] ?? {};
        final nombre = med["nombreMedicamento"].toString().toLowerCase();
        final tipo = med["tipoSimple"].toString().toLowerCase();
        final farma = med["tipoFarma"].toString().toLowerCase();

        return nombre.contains(q) || tipo.contains(q) || farma.contains(q);
      });
    }).toList();

    setState(() => filteredRecipes = results);
  }

  @override
  void initState() {
    super.initState();
    fetchData(id: widget.rut);
  }

  Future<void> fetchData({required String id}) async {
    try {
      final data = await RecipesAPI.fetchData(id: id);

      setState(() {
        allRecipes = data; // FULL recipe objects
        filteredRecipes = data; // Initially show all
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
                child: Icon(Icons.close, color: theme.colorScheme.shadow),
              ),
              Expanded(
                child: Center(
                  child: Text(
                    "Recetas",
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

        /// Search Bar
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
                          hintText: 'Buscar en recetas...',
                          border: InputBorder.none,
                        ),
                        onChanged: onChangeSearchInput,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: () => onPressSearchButton(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),

        Expanded(child: recipeList(values: filteredRecipes)),
      ],
    );
  }
}

///
/// UI FOR RECIPES (Expansion Cards)
///
Widget recipeList({required List<dynamic>? values}) {
  if (values == null || values.isEmpty) {
    return const Center(child: Text("No se encontraron recetas"));
  }

  return ListView.builder(
    padding: const EdgeInsets.all(12),
    itemCount: values.length,
    itemBuilder: (context, i) {
      final recipe = values[i];
      final meds = recipe["medicamentos"] as List<dynamic>;
      final instruccion = recipe["instruccion"] ?? "Sin instrucciones";

      return Card(
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          childrenPadding: const EdgeInsets.all(12),
          title: Text(
            "Receta ${i + 1}",
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          subtitle: Text(
            recipe != null
                ? "Medicamentos: ${(recipe["medicamentos"] as List<dynamic>).length}"
                : "",
            style: const TextStyle(fontSize: 13),
          ),

          /// BODY OF EXPANDED RECIPE
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Text(
                "Instrucción:",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Text(instruccion),
            const SizedBox(height: 12),

            /// List of medications inside this recipe
            Column(
              children: meds.map((item) {
                final med = item["medicamento"];

                return Card(
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => showMedicationPopup(context, med),
                    child: Padding(
                      padding: const EdgeInsets.all(14.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.medication, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  med["nombreMedicamento"] ?? "",
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "Tipo: ${med["tipoSimple"]}",
                                  style: const TextStyle(fontSize: 13),
                                ),
                                Text(
                                  "Farmacología: ${med["tipoFarma"]}",
                                  style: const TextStyle(fontSize: 13),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      );
    },
  );
}

///
/// POPUP WITH MEDICATION DETAILS
///
void showMedicationPopup(BuildContext context, Map med) {
  showDialog(
    context: context,
    builder: (_) {
      return AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(med["nombreMedicamento"] ?? "Medicamento"),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Tipo: ${med["tipoSimple"]}"),
              Text("Farmacología: ${med["tipoFarma"]}"),
              const SizedBox(height: 10),
              Text(
                "Indicaciones:",
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(med["indicacion"] ?? ""),
              const SizedBox(height: 10),
              Text("Cantidad: ${med["cantidad"]}"),
              Text("Gramaje: ${med["gramaje"]} mg"),
            ],
          ),
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
