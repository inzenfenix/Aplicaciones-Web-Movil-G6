import 'package:flutter/material.dart';
import '../components/info_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Row(
        mainAxisSize: MainAxisSize.max,
        children: <Widget>[
          Column(
            mainAxisSize: MainAxisSize.max,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Card(
                margin: EdgeInsets.zero,
                color: Colors.transparent,
                elevation: 0,
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,0
                    children: [
                      Text.rich(
                        TextSpan(
                          children: [
                            const TextSpan(text: "Bienvenido, \n"),
                            TextSpan(
                              text: "Rodrigo!",
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(width: 8),

                      const Icon(Icons.waving_hand, color: Colors.yellow),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
