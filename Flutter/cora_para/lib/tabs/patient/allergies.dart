import 'package:flutter/material.dart';
import 'dart:math';

class AllergiesPage extends StatefulWidget {

  final String rut;

  const AllergiesPage({super.key, required this.rut});

  @override
  State<AllergiesPage> createState() => _AllergiesPageState();
}

class _AllergiesPageState extends State<AllergiesPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();
  String searchInput = "";
  List<String>? filteredData;

  List<String> allergies = [
    "Alergia 1",
    "Alergia 2",
    "Alergia 3",
    "Alergia 4",
    "Alergia 5",
    "Alergia 6",
    "Alergia 7",
    "Alergia 8",
    "Alergia 9",
    "Alergia 10",
    "Alergia 1",
    "Alergia 1",
    "Alergia 1",
    "Alergia 1",
    "Alergia 1",
  ];

  void onChangeSearchInput(String value) {
    searchInput = value;
  }

  void onPressSearchButton() {
    List<String> selectedFilteredData = List.empty(growable: true);

    for (var center in allergies) {
      if (center.toLowerCase().contains(searchInput.toLowerCase())) {
        selectedFilteredData.add(center);
      }
    }

    setState(() {
      filteredData = selectedFilteredData;
    });
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
        Expanded(child: listCard(values: filteredData ?? allergies))
      ],
    );
  }
}

Widget listCard({required List<String> values}) {
  List<Widget> widgetsToShow = List.empty(growable: true);

  for (int i = 0; i < values.length; i++) {
    Widget showCard = Card(
      clipBehavior: Clip.hardEdge,
      child: InkWell(
        splashColor: Colors.red.withAlpha(30),
        onTap: () {
          debugPrint(values[i]);
        },
        child: ListTile(
          leading: Text('${i + 1}.', style: TextStyle(fontSize: 16.0)),
          title: Text('${values[i]}\nTipo: ${getRandomKM(i * 5)}'),
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

int getRandomKM(int startingValue) {
  Random rand = Random.secure();

  return rand.nextInt(5) + startingValue + 1;
}
