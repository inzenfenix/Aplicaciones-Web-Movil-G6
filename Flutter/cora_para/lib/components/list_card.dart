import 'package:flutter/material.dart';
import 'dart:math';

Widget listCard({
  required String title,
  required List<String> values,
  required IconData icon,
  required Color iconColor,
  double? height,
}) {
  List<Widget> widgetsToShow = List.empty(growable: true);

  Widget titleBox = Padding(
    padding: EdgeInsets.symmetric(horizontal: 12.0, vertical: 5.0),
    child: ListTile(
      leading: Icon(icon, color: iconColor),
      title: Text(
        title,
        style: TextStyle(
          fontWeight: FontWeight.bold,
          color: Colors.grey.shade800,
          fontSize: 18.0,
        ),
      ),
      trailing: Text("Ver más"),
    ),
  );

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
          title: Text('${values[i]}\nDistancia: ${getRandomKM(i * 5)} km'),
        ),
      ),
    );

    widgetsToShow.add(showCard);
  }

  return Card(
    elevation: 7.5,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    child: SizedBox(
      height: 400, // or MediaQuery.of(context).size.height * 0.5
      child: SingleChildScrollView(
        child: Column(
          children: [
            titleBox,
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
