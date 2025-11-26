<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PatientController extends Controller
{
    private $baseUrl = 'https://xz5lorj4p4.execute-api.us-east-1.amazonaws.com';

    /**
     * Obtener todos los pacientes
     */
    public function index(Request $request)
    {
        try {
            // Obtener todos los registros médicos (pacientes)
            $response = Http::withOptions([
                'verify' => false  // Deshabilitar verificación SSL
            ])->get("{$this->baseUrl}/medicalRecords");
            
            $patients = [];
            
            if ($response->successful()) {
                $patients = $response->json();
            }

            // Inicializar searchRut
            $searchRut = $request->get('search_rut', '');
            
            // Si hay búsqueda por RUT (userId)
            if ($searchRut) {
                $patients = $this->searchPatientByRut($searchRut, $patients);
            }

            return view('patients.index', compact('patients', 'searchRut'));

        } catch (\Exception $e) {
            return view('patients.index', [
                'patients' => [],
                'searchRut' => '',
                'error' => 'Error al cargar los pacientes: ' . $e->getMessage()
            ]);
        }
    }

    /**
     * Buscar paciente por RUT (userId)
     */
    private function searchPatientByRut($rut, $allPatients)
    {
        if (empty($allPatients)) {
            return [];
        }

        return array_filter($allPatients, function($patient) use ($rut) {
            $patientRut = $patient['userId'] ?? '';
            return stripos($patientRut, $rut) !== false;
        });
    }

    /**
     * Mostrar detalles de un paciente específico
     */
    public function show($userId)
    {
        try {
            $response = Http::withOptions([
                'verify' => false
            ])->get("{$this->baseUrl}/medicalRecords/{$userId}");

            $patient = null;
            
            if ($response->successful()) {
                $patient = $response->json();
            }

            if (!$patient) {
                return redirect()->route('patients.index')->with('error', 'Paciente no encontrado');
            }

            // Obtener alergias del paciente
            $allergies = $this->getPatientAllergies($userId);

            // Obtener consultas del paciente (DETALLE)
            $consultations = $this->getPatientConsultations($userId);

            return view('patients.show', [
                'patient' => $patient,  // array con los datos del paciente
                'userId' => $userId,     // <-- IMPORTANTE: debe estar presente
                'consultations' => $consultations ?? [],
                'allergies' => $allergies ?? []
            ]);

        } catch (\Exception $e) {
            \Log::error('Error loading patient: ' . $e->getMessage());
            return back()->with('error', 'Error al cargar el paciente.');
        }
    }

    /**
     * Obtener alergias del paciente
     */
    private function getPatientAllergies($userId)
    {
        try {
            $response = Http::withOptions([
                'verify' => false
            ])->get("{$this->baseUrl}/allergies/{$userId}");

            if ($response->successful()) {
                return $response->json();
            }

        } catch (\Exception $e) {
            \Log::error("Error obteniendo alergias para paciente {$userId}: " . $e->getMessage());
        }

        return [];
    }

    /**
     * Obtener consultas del paciente (detalle) desde /consultations/{userId}
     */
    private function getPatientConsultations($userId)
    {
        try {
            $response = Http::withOptions([
                'verify' => false
            ])->get("{$this->baseUrl}/consultations/{$userId}");

            if ($response->successful()) {
                return $response->json();
            } else {
                \Log::warning("Consultations API responded {$response->status()} for user {$userId}: {$response->body()}");
            }
        } catch (\Exception $e) {
            \Log::error("Error obteniendo consultas para paciente {$userId}: " . $e->getMessage());
        }

        return [];
    }

    /**
     * Almacenar nueva alergia
     */
    public function storeAllergy(Request $request, $userId)
    {
        try {
            $validated = $request->validate([
                'alergeno' => 'required|string|max:255',
                'tipoAlergeno' => 'required|string|max:100',
                'reaccion' => 'nullable|string',
                'fecha_diagnostico' => 'nullable|date',
            ]);

            $response = Http::withOptions([
                'verify' => false
            ])->post("{$this->baseUrl}/medicalRecords/{$userId}/allergies", $validated);

            if ($response->successful()) {
                return redirect()->route('patients.show', $userId)
                    ->with('success', 'Alergia agregada correctamente');
            } else {
                return redirect()->route('patients.show', $userId)
                    ->with('error', 'Error al agregar la alergia: ' . $response->body());
            }

        } catch (\Exception $e) {
            return redirect()->route('patients.show', $userId)
                ->with('error', 'Error al agregar la alergia: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar alergia existente
     */
    public function updateAllergy(Request $request, $userId, $allergyId)
    {
        try {
            $validated = $request->validate([
                'alergeno' => 'required|string|max:255',
                'tipoAlergeno' => 'required|string|max:100',
                'reaccion' => 'nullable|string',
                'fecha_diagnostico' => 'nullable|date',
            ]);

            $response = Http::withOptions([
                'verify' => false
            ])->put("{$this->baseUrl}/medicalRecords/{$userId}/allergies/{$allergyId}", $validated);

            if ($response->successful()) {
                return redirect()->route('patients.show', $userId)
                    ->with('success', 'Alergia actualizada correctamente');
            } else {
                return redirect()->route('patients.show', $userId)
                    ->with('error', 'Error al actualizar la alergia: ' . $response->body());
            }

        } catch (\Exception $e) {
            return redirect()->route('patients.show', $userId)
                ->with('error', 'Error al actualizar la alergia: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar alergia
     */
    public function destroyAllergy($userId, $allergyId)
    {
        try {
            $response = Http::withOptions([
                'verify' => false
            ])->delete("{$this->baseUrl}/medicalRecords/{$userId}/allergies/{$allergyId}");

            if ($response->successful()) {
                return redirect()->route('patients.show', $userId)
                    ->with('success', 'Alergia eliminada correctamente');
            } else {
                return redirect()->route('patients.show', $userId)
                    ->with('error', 'Error al eliminar la alergia: ' . $response->body());
            }

        } catch (\Exception $e) {
            return redirect()->route('patients.show', $userId)
                ->with('error', 'Error al eliminar la alergia: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar información del paciente
     */
    public function update(Request $request, $userId)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:255',
                'sexo' => 'required|in:male,female',
                'nacimiento' => 'nullable|date',
                'tipoSangre' => 'nullable|string|max:10',
                'telefono' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'direccion' => 'nullable|string',
                'contacto_emergencia' => 'nullable|string|max:255',
                'telefono_emergencia' => 'nullable|string|max:20',
            ]);

            $response = Http::withOptions([
                'verify' => false
            ])->put("{$this->baseUrl}/medicalRecords/{$userId}", $validated);

            if ($response->successful()) {
                return redirect()->route('patients.show', $userId)
                    ->with('success', 'Información del paciente actualizada correctamente');
            } else {
                return redirect()->route('patients.show', $userId)
                    ->with('error', 'Error al actualizar el paciente: ' . $response->body());
            }

        } catch (\Exception $e) {
            return redirect()->route('patients.show', $userId)
                ->with('error', 'Error al actualizar el paciente: ' . $e->getMessage());
        }
    }
}