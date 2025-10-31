import 'package:flutter/material.dart';
import 'patient/home_patient.dart';
import '../apis/private/post_data_consultation.dart';

class QrScannerPage extends StatefulWidget {
  const QrScannerPage({super.key});

  @override
  State<QrScannerPage> createState() => _QrScannerPageState();
}

class _QrScannerPageState extends State<QrScannerPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Escanear Código QR"),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.qr_code,
                size: 120,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 24),
              const Text(
                "Escaneo QR en camino!",
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  showDialog<String>(
                    context: context,
                    builder: (BuildContext context) =>
                        Dialog(child: ManualEntryPage()),
                  );
                },
                child: const Text("Ingresar manualmente"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ManualEntryPage extends StatefulWidget {
  const ManualEntryPage({super.key});

  @override
  State<ManualEntryPage> createState() => _ManualEntryPageState();
}

class _ManualEntryPageState extends State<ManualEntryPage> {
  final GlobalKey<FormState> _rutKey = GlobalKey<FormState>();
  String rutInput = "";

  void onChangeRutInput(String value) {
    rutInput = value;
  }

  void navigateToPatientInfoPage() {
    Navigator.pop(context);
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => PatientHomePage(rut: rutInput)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 256.0,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            "OBTENER\nINFORMACIÓN DEL PACIENTE",
            style: TextStyle(
              fontWeight: FontWeight.w300,
              fontFamily: "Fjalla One",
              fontSize: 18.0,
              wordSpacing: 2.0,
              letterSpacing: 1.2,
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 24.0, child: Divider()),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Card(
              child: Form(
                key: _rutKey,
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: TextFormField(
                          decoration: const InputDecoration.collapsed(
                            hintText: 'Ingresar RUT...',
                          ),
                          onChanged: onChangeRutInput,
                          onFieldSubmitted: (String value) {
                            if (_rutKey.currentState!.validate()) {
                              DataConsultationAPI.request(
                                consultorId: "1234567-8",
                                place:
                                    "Padre hurtado norte 123, Santiago - Ambulancia",
                                userId: (rutInput),
                              );
                              navigateToPatientInfoPage();
                            }
                          },
                          validator: (String? value) {
                            if (value == null || value.isEmpty) {
                              return 'Ingresa rut para buscar!';
                            }
                            return null;
                          },
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {
                          if (_rutKey.currentState!.validate()) {
                            navigateToPatientInfoPage();
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
          const SizedBox(height: 15),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
            },
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}
