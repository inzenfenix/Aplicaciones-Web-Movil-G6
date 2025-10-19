import 'package:flutter/material.dart';
import '../components/list_card.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  Widget build(BuildContext context) {
    Color primaryTextColor = Theme.of(context).colorScheme.onSecondaryFixed;
    Color secondaryTextColor = Theme.of(context).colorScheme.onTertiaryFixed;

    List<String> closestMedicalCenters = [
      "Hospital Padre Hurtado",
      "Hospital San Ramón",
      "Clínica Alemana",
      "Hospital San Ramón",
      "Policlínico Las Condes",
      "Hospital 3",
      "Hospital 4",
      "Hospital 5",
    ];

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                welcomeProfile(
                  name: "Rodrigo",
                  primaryTextColor: primaryTextColor,
                  secondaryTextColor: secondaryTextColor,
                ),
                const SizedBox(
                  height: 24,
                  width: double.infinity,
                  child: Divider(),
                ),
                Card(
                  elevation: 7.5,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        ListTile(
                          title: Center(
                            child: Text(
                              "General",
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            homeGeneralButton(title: "Perfil", icon: Icons.person),
                            const SizedBox(width: 64),
                            homeGeneralButton(title: "Opciones", icon: Icons.settings),
                          ],
                        ),
                        const SizedBox(height: 12, width: double.infinity),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          mainAxisSize: MainAxisSize.max,
                          children: [
                            homeGeneralButton(title: "Buscar", icon: Icons.search),
                            const SizedBox(width: 64),
                            homeGeneralButton(title: "QR", icon: Icons.qr_code),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24, width: double.infinity),
                listCard(
                  title: "Centros más cercanos",
                  values: closestMedicalCenters,
                  icon: Icons.local_hospital,
                  iconColor: Colors.red.shade400,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Widget welcomeProfile({
  required String name,
  required Color primaryTextColor,
  required Color secondaryTextColor,
  String? avatarURL,
}) {
  String avatar = avatarURL ?? 'assets/images/avatar_icon.png';

  return Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Expanded(
        child: Text.rich(
          TextSpan(
            children: [
              TextSpan(
                text: "Bienvenido,\n",
                style: TextStyle(color: secondaryTextColor, fontSize: 16),
              ),
              TextSpan(
                text: '$name!',
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
      CircleAvatar(radius: 26, backgroundImage: AssetImage(avatar)),
    ],
  );
}

Widget homeGeneralButton({required String title, IconData? icon}) {
  IconData selectedIcon = icon ?? Icons.settings;

  return Card(
    elevation: 5.0,
    child: SizedBox.square(
      dimension: 100.0,
      child: TextButton(
        onPressed: () {},
        child: Column(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [Icon(selectedIcon, size: 36.0), Text(title)],
        ),
      ),
    ),
  );
}
