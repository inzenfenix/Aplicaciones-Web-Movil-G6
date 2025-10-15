import 'package:flutter/material.dart';

class InfoCard extends StatelessWidget {
  const InfoCard({super.key, required this.cardTitle});
  final String cardTitle;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 360,
      height: 200,
      child: Center(
        child: Text(cardTitle)
        ),
    );
  }
}
