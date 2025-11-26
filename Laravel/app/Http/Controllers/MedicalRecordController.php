<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aws\DynamoDb\DynamoDbClient;
use Aws\DynamoDb\Exception\DynamoDbException;
use Ramsey\Uuid\Uuid;

class MedicalRecordController extends Controller
{
    private $ddb;
    private $tablePatients = "CORA_Medical_Record";
    private $tableAllergies = "CORA_Allergies";
    private $tableConsultas = "CORA_Consultations";

    public function __construct()
    {
        $this->ddb = new DynamoDbClient([
            'region' => env('AWS_DEFAULT_REGION'),
            'version' => 'latest',
        ]);
    }

    /* ============================================================
     *  SHOW MEDICAL RECORD (edit method)
     * ============================================================ */
    public function edit($userId)
    {
        \Log::info('MedicalRecordController@edit called with userId: ' . $userId);
        
        try {
            // Obtener paciente
            $result = $this->ddb->getItem([
                'TableName' => $this->tablePatients,
                'Key' => ['userId' => ['S' => $userId]]
            ]);

            \Log::info('DynamoDB getItem result: ' . json_encode($result));

            if (!isset($result['Item'])) {
                \Log::warning('Patient not found for userId: ' . $userId);
                return back()->with('error', 'Paciente no encontrado.');
            }

            $patientData = $this->fromDynamo($result['Item']);
            
            \Log::info('Patient data: ' . json_encode($patientData));
            
            // Convertir a objeto para compatibilidad con la vista
            $patient = (object) $patientData;
            
            // Obtener alergias del paciente
            try {
                $allergiesResult = $this->ddb->query([
                    'TableName' => $this->tableAllergies,
                    'IndexName' => 'userId-index',
                    'KeyConditionExpression' => 'userId = :uid',
                    'ExpressionAttributeValues' => [
                        ':uid' => ['S' => $userId]
                    ]
                ]);

                $allergiesList = [];
                if (isset($allergiesResult['Items'])) {
                    foreach ($allergiesResult['Items'] as $item) {
                        $allergiesList[] = (object) $this->fromDynamo($item);
                    }
                }
                
                $patient->allergies = collect($allergiesList);
                \Log::info('Allergies count: ' . count($allergiesList));
            } catch (\Exception $e) {
                \Log::error('Error fetching allergies: ' . $e->getMessage());
                $patient->allergies = collect([]);
            }

            // Obtener consultas del paciente
            try {
                $consultasResult = $this->ddb->query([
                    'TableName' => $this->tableConsultas,
                    'IndexName' => 'userId-index',
                    'KeyConditionExpression' => 'userId = :uid',
                    'ExpressionAttributeValues' => [
                        ':uid' => ['S' => $userId]
                    ]
                ]);

                $consultasList = [];
                if (isset($consultasResult['Items'])) {
                    foreach ($consultasResult['Items'] as $item) {
                        $consultasList[] = (object) $this->fromDynamo($item);
                    }
                }
                
                $patient->consultas = collect($consultasList);
                \Log::info('Consultas count: ' . count($consultasList));
            } catch (\Exception $e) {
                \Log::error('Error fetching consultas: ' . $e->getMessage());
                $patient->consultas = collect([]);
            }

            \Log::info('Rendering view ficha-medica');
            return view('patients.ficha-medica', compact('patient', 'userId'));
            
        } catch (\Exception $e) {
            \Log::error('Error in MedicalRecordController@edit: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return back()->with('error', 'Error al cargar ficha médica: ' . $e->getMessage());
        }
    }

    /* ============================================================
     *  UPDATE MEDICAL RECORD
     * ============================================================ */
    public function update(Request $req, $userId)
    {
        try {
            $updateExp = "SET #n = :n, edad = :edad, sexo = :sexo, fechaNacimiento = :fn, tipoSangre = :ts";
            $values = [
                ":n" => ["S" => $req->nombre],
                ":edad" => ["N" => (string) $req->edad],
                ":sexo" => ["S" => $req->sexo],
                ":fn" => ["S" => $req->fechaNacimiento],
                ":ts" => ["S" => $req->tipoSangre],
            ];

            $this->ddb->updateItem([
                'TableName' => $this->tablePatients,
                'Key' => ["userId" => ["S" => $userId]],
                'UpdateExpression' => $updateExp,
                'ExpressionAttributeNames' => ["#n" => "nombre"],
                'ExpressionAttributeValues' => $values
            ]);

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Ficha médica actualizada.');
        } catch (\Exception $e) {
            \Log::error('Error updating medical record: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar ficha médica.');
        }
    }

    /* ============================================================
     *  CRUD ALERGIAS
     * ============================================================ */

    /** CREATE */
    public function allergyStore(Request $req, $userId)
    {
        try {
            $id = Uuid::uuid4()->toString();

            $this->ddb->putItem([
                'TableName' => $this->tableAllergies,
                'Item' => [
                    'idAlergia' => ['S' => $id],
                    'userId' => ['S' => $userId],
                    'alergeno' => ['S' => $req->alergeno],
                    'tipoAlergeno' => ['S' => $req->tipoAlergeno],
                ]
            ]);

            // Soporte para AJAX y redirecciones normales
            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Alergia creada correctamente',
                    'data' => [
                        'idAlergia' => $id,
                        'alergeno' => $req->alergeno,
                        'tipoAlergeno' => $req->tipoAlergeno
                    ]
                ], 201);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Alergia creada.');

        } catch (\Exception $e) {
            \Log::error('Error creating allergy: ' . $e->getMessage());
            
            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al crear alergia: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al crear alergia.');
        }
    }

    /** UPDATE */
    public function allergyUpdate(Request $req, $userId, $idAlergia)
    {
        try {
            $this->ddb->updateItem([
                'TableName' => $this->tableAllergies,
                'Key' => ['idAlergia' => ['S' => $idAlergia]],
                'UpdateExpression' => "SET alergeno = :a, tipoAlergeno = :t",
                'ExpressionAttributeValues' => [
                    ":a" => ["S" => $req->alergeno],
                    ":t" => ["S" => $req->tipoAlergeno]
                ]
            ]);

            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Alergia actualizada correctamente'
                ]);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Alergia actualizada.');

        } catch (\Exception $e) {
            \Log::error('Error updating allergy: ' . $e->getMessage());
            
            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al actualizar alergia: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al actualizar alergia.');
        }
    }

    /** DELETE */
    public function allergyDelete($userId, $idAlergia)
    {
        try {
            $this->ddb->deleteItem([
                'TableName' => $this->tableAllergies,
                'Key' => ['idAlergia' => ['S' => $idAlergia]]
            ]);

            if (request()->expectsJson() || request()->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Alergia eliminada correctamente'
                ]);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Alergia eliminada.');

        } catch (\Exception $e) {
            \Log::error('Error deleting allergy: ' . $e->getMessage());
            
            if (request()->expectsJson() || request()->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al eliminar alergia: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al eliminar alergia.');
        }
    }

    /* ============================================================
     *  CRUD CONSULTAS
     * ============================================================ */

    /** CREATE */
    public function consultaStore(Request $req, $userId)
    {
        try {
            $id = Uuid::uuid4()->toString();

            $this->ddb->putItem([
                'TableName' => $this->tableConsultas,
                'Item' => [
                    'idConsulta' => ['S' => $id],
                    'userId' => ['S' => $userId],
                    'descripcion' => ['S' => $req->descripcion ?? ''],
                    'fecha' => ['S' => now()->toDateString()],
                ]
            ]);

            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Consulta registrada correctamente',
                    'data' => [
                        'idConsulta' => $id,
                        'descripcion' => $req->descripcion,
                        'fecha' => now()->toDateString()
                    ]
                ], 201);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Consulta registrada.');

        } catch (\Exception $e) {
            \Log::error('Error creating consultation: ' . $e->getMessage());
            
            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al registrar consulta: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al registrar consulta.');
        }
    }

    /** UPDATE */
    public function consultaUpdate(Request $req, $userId, $idConsulta)
    {
        try {
            $this->ddb->updateItem([
                'TableName' => $this->tableConsultas,
                'Key' => ['idConsulta' => ['S' => $idConsulta]],
                'UpdateExpression' => "SET descripcion = :d",
                'ExpressionAttributeValues' => [
                    ":d" => ["S" => $req->descripcion ?? '']
                ]
            ]);

            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Consulta actualizada correctamente'
                ]);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Consulta actualizada.');

        } catch (\Exception $e) {
            \Log::error('Error updating consultation: ' . $e->getMessage());
            
            if ($req->expectsJson() || $req->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al actualizar consulta: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al actualizar consulta.');
        }
    }

    /** DELETE */
    public function consultaDelete($userId, $idConsulta)
    {
        try {
            $this->ddb->deleteItem([
                'TableName' => $this->tableConsultas,
                'Key' => ['idConsulta' => ['S' => $idConsulta]]
            ]);

            if (request()->expectsJson() || request()->is('api/*')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Consulta eliminada correctamente'
                ]);
            }

            return redirect()->route('medical-records.edit', $userId)->with('success', 'Consulta eliminada.');

        } catch (\Exception $e) {
            \Log::error('Error deleting consultation: ' . $e->getMessage());
            
            if (request()->expectsJson() || request()->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Error al eliminar consulta: ' . $e->getMessage()
                ], 500);
            }
            
            return back()->with('error', 'Error al eliminar consulta.');
        }
    }

    /* ============================================================
     *  UTILIDADES
     * ============================================================ */
    private function fromDynamo($item)
    {
        $out = [];
        foreach ($item as $k => $v) {
            $type = array_key_first($v);
            $out[$k] = $type === "N" ? (int) $v[$type] : $v[$type];
        }
        return $out;
    }
}
