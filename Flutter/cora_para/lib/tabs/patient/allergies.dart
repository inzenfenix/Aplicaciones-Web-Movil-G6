import 'package:flutter/material.dart';
import 'dart:math';
import 'apis/allergies_api.dart';

class AllergiesPage extends StatefulWidget {
  final String rut;

  const AllergiesPage({super.key, required this.rut});

  @override
  State<AllergiesPage> createState() => _AllergiesPageState();
}

class _AllergiesPageState extends State<AllergiesPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();
  String searchInput = "";

  List<dynamic>? filteredData;
  List<dynamic> userAllergies = List.empty(growable: true);

  void onChangeSearchInput(String value) {
    searchInput = value;
  }

  void onPressSearchButton() {
    List<dynamic> selectedFilteredData = List.empty(growable: true);

    for (var allergy in userAllergies) {
      String allergen = allergy["allergen"] as String;
      String typeAllergen = allergy["typeAllergen"] as String;

      if (allergen.toLowerCase().contains(searchInput.toLowerCase()) ||
          typeAllergen.toLowerCase().contains(searchInput.toLowerCase())) {
        selectedFilteredData.add(allergy);
      }
    }

    setState(() {
      filteredData = selectedFilteredData;
    });
  }

  @override
  void initState() {
    super.initState();

    String id = widget.rut.split("-")[0];
    fetchData(id: id);
  }

  Future<void> fetchData({required String id}) async {
    try {
      final data = await AllergiesAPI.fetchData(id: id);
      setState(() {
        userAllergies = data;
      });
    } catch (e) {
      debugPrint('$e');
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget titleBox = Padding(
      padding: EdgeInsets.symmetric(horizontal: 12.0, vertical: 5.0),
      child: ListTile(
        leading: ElevatedButton(
          onPressed: () {
            Navigator.pop(context);
          },
          child: Icon(Icons.close, color: Theme.of(context).colorScheme.shadow),
        ),
        title: Text(
          "Alergías",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
            fontSize: 18.0,
          ),
        ),
      ),
    );

    return Column(
      mainAxisAlignment: MainAxisAlignment.start,
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisSize: MainAxisSize.max,
      children: <Widget>[
        titleBox,
        SizedBox(width: double.infinity, child: Divider()),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: Card(
              child: Form(
                key: _searchKey,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: TextFormField(
                          decoration: const InputDecoration.collapsed(
                            hintText: 'Buscar alergías...',
                          ),
                          onChanged: onChangeSearchInput,
                          validator: (String? value) {
                            if (value == null || value.isEmpty) {
                              setState(() {
                                filteredData = null;
                              });
                              return 'Ingresa algo para buscar!';
                            }
                            return null;
                          },
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (_searchKey.currentState!.validate()) {
                            onPressSearchButton();
                          }
                        },
                        child: const Icon(Icons.search_sharp),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: 12),
        Expanded(child: listCard(values: filteredData ?? userAllergies)),
      ],
    );
  }
}

Widget listCard({required List<dynamic>? values}) {
  if (values == null) return Text("No se encontraron alergías");
  if (values.isEmpty) return Text("No se encontraron alergías");

  List<Widget> widgetsToShow = List.empty(growable: true);

  for (int i = 0; i < values.length; i++) {
    Widget showCard = Card(
      clipBehavior: Clip.hardEdge,
      child: InkWell(
        splashColor: Colors.red.withAlpha(30),
        onTap: () {
          debugPrint('${values[i]}');
        },
        child: ListTile(
          leading: Text('${i + 1}.', style: TextStyle(fontSize: 16.0)),
          title: Text(
            '${values[i]["allergen"]}\nTipo: ${values[i]["typeAllergen"]}',
          ),
        ),
      ),
    );

    widgetsToShow.add(showCard);
  }

  return Padding(
    padding: const EdgeInsets.all(8.0),
    child: Card(
      elevation: 7.5,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(
                vertical: 10,
                horizontal: 30.0,
              ),
              child: Column(children: widgetsToShow),
            ),
          ],
        ),
      ),
    ),
  );
}