import 'package:flutter/material.dart';
import '../components/info_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    Color primaryTextColor = Theme.of(context).colorScheme.onSecondaryFixed;
    Color secondaryTextColor = Theme.of(context).colorScheme.onTertiaryFixed;

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text.rich(
                              TextSpan(
                                children: [
                                  TextSpan(
                                    text: "Bienvenido,\n",
                                    style: TextStyle(
                                      color: secondaryTextColor,
                                      fontSize: 16,
                                    ),
                                  ),
                                  TextSpan(
                                    text: "Rodrigo!",
                                    style: TextStyle(
                                      color: primaryTextColor,
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const CircleAvatar(
                            radius: 26,
                            backgroundImage: AssetImage('assets/avatar.png'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      infoCard(
                        title: "Total de compras",
                        value: "\$1.245.000",
                        icon: Icons.shopping_bag,
                        color: Colors.orangeAccent,
                      ),
                      const SizedBox(height: 16),
                      infoCard(
                        title: "Clientes activos",
                        value: "132",
                        icon: Icons.people,
                        color: Colors.cyanAccent,
                      ),
                      const SizedBox(height: 16),
                      infoCard(
                        title: "Promedio de gasto",
                        value: "\$9.420",
                        icon: Icons.show_chart,
                        color: Colors.purpleAccent,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
