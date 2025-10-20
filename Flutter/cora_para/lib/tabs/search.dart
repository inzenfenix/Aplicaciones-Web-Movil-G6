import 'package:flutter/material.dart';
import 'dart:math';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final GlobalKey<FormState> _searchKey = GlobalKey<FormState>();
  String searchInput = "";
  List<String>? filteredData;

  List<String> medicalCenters = [
    "Hospital Padre Hurtado",
    "Hospital San Ramón",
    "Clínica Alemana",
    "Hospital San Ramón",
    "Policlínico Las Condes",
    "Hospital 3",
    "Hospital 4",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
    "Hospital 5",
  ];

  void onChangeSearchInput(String value)
  {
    searchInput = value;
  }

  void onPressSearchButton()
  {
      List<String> selectedFilteredData = List.empty(growable: true);

      for (var center in medicalCenters) {
        if(center.toLowerCase().contains(searchInput.toLowerCase()))
        {
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
      leading: Icon(Icons.list, color: Theme.of(context).colorScheme.shadow),
      title: Text(
        "Centros de atención",
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
        SizedBox(width: double.infinity, child: Divider(),),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Center(
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
                            hintText: 'Buscar centros...',
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
        SizedBox(height: 8,),
        listCard(
          values: filteredData ?? medicalCenters,
        ),
      ],
    );
  }
}

Widget listCard({
  required List<String> values,
}) {
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
          leading: Text('${i + 1}.', style: TextStyle(fontSize: 16.0),),
          title: Text('${values[i]}\nDistancia: ${getRandomKM(i * 5)} km'),
        ),
      ),
    );

    widgetsToShow.add(showCard);
  }

  return Expanded(
    child: Padding(
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
    ),
  );
}

int getRandomKM(int startingValue) {
  Random rand = Random.secure();

  return rand.nextInt(5) + startingValue + 1;
}
