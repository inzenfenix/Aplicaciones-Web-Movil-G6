<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aws\DynamoDb\DynamoDbClient;
use Ramsey\Uuid\Uuid;

class ConsultationController extends Controller
{
    private $ddb;
    private $tableConsultas = "CORA_Consultation";
    private $tableProfesionales = "CORA_Professional";
    private $tableDiagnosticos = "CORA_Diagnosis";
    private $tableProcedimientos = "CORA_Procedure";
    private $tableRecetas = "CORA_Recipe";

    public function __construct()
    {
        $this->ddb = new DynamoDbClient([
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'version' => 'latest',
        ]);
    }

    public function index($userId)
    {
        try {
            $result = $this->ddb->query([
                'TableName' => $this->tableConsultas,
                'KeyConditionExpression' => 'userId = :uid',
                'ExpressionAttributeValues' => [
                    ':uid' => ['S' => $userId]
                ]
            ]);

            $consultations = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $consultations->push((object) $this->fromDynamo($item));
                }
            }

            $consultations = $consultations->sortByDesc('fechaAtencion');

            return view('consultations.index', compact('consultations', 'userId'));

        } catch (\Exception $e) {
            \Log::error('Error fetching consultations: ' . $e->getMessage());
            return redirect()->route('medical-records.edit', $userId)
                ->with('error', 'Error al cargar las consultas.');
        }
    }

    public function create($userId)
    {
        // Obtener listas para los selects
        $profesionales = $this->getProfesionales();
        $diagnosticos = $this->getDiagnosticos();
        $procedimientos = $this->getProcedimientos();
        $recetas = $this->getRecetas();

        return view('consultations.create', compact('userId', 'profesionales', 'diagnosticos', 'procedimientos', 'recetas'));
    }

    public function store(Request $request, $userId)
    {
        $request->validate([
            'fechaAtencion' => 'required|date',
            'razonConsulta' => 'required|string',
            'lugar' => 'nullable|string|max:255',
            'idProfesional' => 'required|string',
            'idDiagnosticos' => 'nullable|array',
            'idProcedimientos' => 'nullable|array',
            'idRecetas' => 'nullable|array',
        ]);

        try {
            $idConsulta = Uuid::uuid4()->toString();

            // Obtener datos del profesional
            $profesionalData = $this->getProfesionalData($request->idProfesional);

            // Preparar listas
            $diagnosticosList = [];
            if ($request->idDiagnosticos) {
                foreach ($request->idDiagnosticos as $id) {
                    $diagnosticosList[] = ['S' => $id];
                }
            }

            $procedimientosList = [];
            if ($request->idProcedimientos) {
                foreach ($request->idProcedimientos as $id) {
                    $procedimientosList[] = ['S' => $id];
                }
            }

            $recetasList = [];
            if ($request->idRecetas) {
                foreach ($request->idRecetas as $id) {
                    $recetasList[] = ['S' => $id];
                }
            }

            $this->ddb->putItem([
                'TableName' => $this->tableConsultas,
                'Item' => [
                    'userId' => ['S' => $userId],
                    'idConsulta' => ['S' => $idConsulta],
                    'fechaAtencion' => ['S' => $request->fechaAtencion . 'T' . now()->format('H:i:s.v') . 'Z'],
                    'razonConsulta' => ['S' => $request->razonConsulta],
                    'lugar' => ['S' => $request->lugar ?? ''],
                    'idProfesional' => ['M' => $profesionalData],
                    'idDiagnosticos' => ['L' => $diagnosticosList],
                    'idProcedimientos' => ['L' => $procedimientosList],
                    'idRecetas' => ['L' => $recetasList],
                ]
            ]);

            return redirect()->route('consultations.index', $userId)
                ->with('success', 'Consulta registrada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error creating consultation: ' . $e->getMessage());
            return back()->with('error', 'Error al crear la consulta: ' . $e->getMessage())->withInput();
        }
    }

    public function edit($userId, $idConsulta)
    {
        try {
            $result = $this->ddb->getItem([
                'TableName' => $this->tableConsultas,
                'Key' => [
                    'userId' => ['S' => $userId],
                    'idConsulta' => ['S' => $idConsulta]
                ]
            ]);

            if (!isset($result['Item'])) {
                return redirect()->route('consultations.index', $userId)
                    ->with('error', 'Consulta no encontrada.');
            }

            $consultation = (object) $this->fromDynamo($result['Item']);

            // Obtener listas para los selects
            $profesionales = $this->getProfesionales();
            $diagnosticos = $this->getDiagnosticos();
            $procedimientos = $this->getProcedimientos();
            $recetas = $this->getRecetas();

            return view('consultations.edit', compact('consultation', 'userId', 'profesionales', 'diagnosticos', 'procedimientos', 'recetas'));

        } catch (\Exception $e) {
            \Log::error('Error fetching consultation: ' . $e->getMessage());
            return redirect()->route('consultations.index', $userId)
                ->with('error', 'Error al cargar la consulta.');
        }
    }

    public function update(Request $request, $userId, $idConsulta)
    {
        $request->validate([
            'fechaAtencion' => 'required|date',
            'razonConsulta' => 'required|string',
            'lugar' => 'nullable|string|max:255',
            'idProfesional' => 'required|string',
            'idDiagnosticos' => 'nullable|array',
            'idProcedimientos' => 'nullable|array',
            'idRecetas' => 'nullable|array',
        ]);

        try {
            // Obtener datos del profesional
            $profesionalData = $this->getProfesionalData($request->idProfesional);

            // Preparar listas
            $diagnosticosList = [];
            if ($request->idDiagnosticos) {
                foreach ($request->idDiagnosticos as $id) {
                    $diagnosticosList[] = ['S' => $id];
                }
            }

            $procedimientosList = [];
            if ($request->idProcedimientos) {
                foreach ($request->idProcedimientos as $id) {
                    $procedimientosList[] = ['S' => $id];
                }
            }

            $recetasList = [];
            if ($request->idRecetas) {
                foreach ($request->idRecetas as $id) {
                    $recetasList[] = ['S' => $id];
                }
            }

            $this->ddb->updateItem([
                'TableName' => $this->tableConsultas,
                'Key' => [
                    'userId' => ['S' => $userId],
                    'idConsulta' => ['S' => $idConsulta]
                ],
                'UpdateExpression' => 'SET fechaAtencion = :f, razonConsulta = :r, lugar = :l, idProfesional = :p, idDiagnosticos = :d, idProcedimientos = :pr, idRecetas = :re',
                'ExpressionAttributeValues' => [
                    ':f' => ['S' => $request->fechaAtencion . 'T' . now()->format('H:i:s.v') . 'Z'],
                    ':r' => ['S' => $request->razonConsulta],
                    ':l' => ['S' => $request->lugar ?? ''],
                    ':p' => ['M' => $profesionalData],
                    ':d' => ['L' => $diagnosticosList],
                    ':pr' => ['L' => $procedimientosList],
                    ':re' => ['L' => $recetasList],
                ]
            ]);

            return redirect()->route('consultations.index', $userId)
                ->with('success', 'Consulta actualizada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error updating consultation: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar la consulta: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy($userId, $idConsulta)
    {
        try {
            $this->ddb->deleteItem([
                'TableName' => $this->tableConsultas,
                'Key' => [
                    'userId' => ['S' => $userId],
                    'idConsulta' => ['S' => $idConsulta]
                ]
            ]);

            return redirect()->route('consultations.index', $userId)
                ->with('success', 'Consulta eliminada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error deleting consultation: ' . $e->getMessage());
            return redirect()->route('consultations.index', $userId)
                ->with('error', 'Error al eliminar la consulta.');
        }
    }

    // Métodos auxiliares
    private function getProfesionales()
    {
        try {
            $result = $this->ddb->scan(['TableName' => $this->tableProfesionales]);
            $profesionales = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $profesionales->push((object) $this->fromDynamo($item));
                }
            }
            return $profesionales;
        } catch (\Exception $e) {
            \Log::error('Error fetching profesionales: ' . $e->getMessage());
            return collect();
        }
    }

    private function getDiagnosticos()
    {
        try {
            $result = $this->ddb->scan(['TableName' => $this->tableDiagnosticos]);
            $diagnosticos = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $diagnosticos->push((object) $this->fromDynamo($item));
                }
            }
            return $diagnosticos;
        } catch (\Exception $e) {
            \Log::error('Error fetching diagnosticos: ' . $e->getMessage());
            return collect();
        }
    }

    private function getProcedimientos()
    {
        try {
            $result = $this->ddb->scan(['TableName' => $this->tableProcedimientos]);
            $procedimientos = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $procedimientos->push((object) $this->fromDynamo($item));
                }
            }
            return $procedimientos;
        } catch (\Exception $e) {
            \Log::error('Error fetching procedimientos: ' . $e->getMessage());
            return collect();
        }
    }

    private function getRecetas()
    {
        try {
            $result = $this->ddb->scan(['TableName' => $this->tableRecetas]);
            $recetas = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $recetas->push((object) $this->fromDynamo($item));
                }
            }
            return $recetas;
        } catch (\Exception $e) {
            \Log::error('Error fetching recetas: ' . $e->getMessage());
            return collect();
        }
    }

    private function getProfesionalData($idProfesional)
    {
        try {
            $result = $this->ddb->getItem([
                'TableName' => $this->tableProfesionales,
                'Key' => ['idProfesional' => ['S' => $idProfesional]]
            ]);

            if (isset($result['Item'])) {
                return $result['Item'];
            }
            return [];
        } catch (\Exception $e) {
            \Log::error('Error fetching profesional data: ' . $e->getMessage());
            return [];
        }
    }

    private function fromDynamo($item)
    {
        $result = [];
        foreach ($item as $key => $value) {
            $type = array_key_first($value);
            
            if ($type === 'N') {
                $result[$key] = (int)$value[$type];
            } elseif ($type === 'L') {
                $result[$key] = array_map(function($listItem) {
                    $listType = array_key_first($listItem);
                    return $listItem[$listType];
                }, $value[$type]);
            } elseif ($type === 'M') {
                $result[$key] = $this->fromDynamo($value[$type]);
            } else {
                $result[$key] = $value[$type];
            }
        }
        return $result;
    }
}