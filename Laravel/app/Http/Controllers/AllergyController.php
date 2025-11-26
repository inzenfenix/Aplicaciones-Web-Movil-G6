<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aws\DynamoDb\DynamoDbClient;
use Ramsey\Uuid\Uuid;

class AllergyController extends Controller
{
    private $ddb;
    private $tableAllergies = "CORA_Allergies";

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
            // Usar Query porque userId es la Partition Key
            $result = $this->ddb->query([
                'TableName' => $this->tableAllergies,
                'KeyConditionExpression' => 'userId = :uid',
                'ExpressionAttributeValues' => [
                    ':uid' => ['S' => $userId]
                ]
            ]);

            $allergies = collect();
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    $allergies->push((object) $this->fromDynamo($item));
                }
            }

            return view('allergies.index', compact('allergies', 'userId'));

        } catch (\Exception $e) {
            \Log::error('Error fetching allergies: ' . $e->getMessage());
            return redirect()->route('medical-records.edit', $userId)
                ->with('error', 'Error al cargar las alergias.');
        }
    }

    public function create($userId)
    {
        return view('allergies.create', compact('userId'));
    }

    public function store(Request $request, $userId)
    {
        $request->validate([
            'alergeno' => 'required|string|max:255',
            'tipoAlergeno' => 'required|string|max:255',
        ]);

        try {
            $idAlergia = Uuid::uuid4()->toString();

            $this->ddb->putItem([
                'TableName' => $this->tableAllergies,
                'Item' => [
                    'userId' => ['S' => $userId],        // Partition Key
                    'idAlergia' => ['S' => $idAlergia],  // Sort Key
                    'alergeno' => ['S' => $request->alergeno],
                    'tipoAlergeno' => ['S' => $request->tipoAlergeno],
                    'createdAt' => ['S' => now()->toIso8601String()],
                ]
            ]);

            return redirect()->route('allergies.index', $userId)
                ->with('success', 'Alergia registrada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error creating allergy: ' . $e->getMessage());
            return back()->with('error', 'Error al crear la alergia.')->withInput();
        }
    }

    public function edit($userId, $idAlergia)
    {
        try {
            $result = $this->ddb->getItem([
                'TableName' => $this->tableAllergies,
                'Key' => [
                    'userId' => ['S' => $userId],        // Partition Key
                    'idAlergia' => ['S' => $idAlergia]   // Sort Key
                ]
            ]);

            if (!isset($result['Item'])) {
                return redirect()->route('allergies.index', $userId)
                    ->with('error', 'Alergia no encontrada.');
            }

            $allergy = (object) $this->fromDynamo($result['Item']);

            return view('allergies.edit', compact('allergy', 'userId'));

        } catch (\Exception $e) {
            \Log::error('Error fetching allergy: ' . $e->getMessage());
            return redirect()->route('allergies.index', $userId)
                ->with('error', 'Error al cargar la alergia.');
        }
    }

    public function update(Request $request, $userId, $idAlergia)
    {
        $request->validate([
            'alergeno' => 'required|string|max:255',
            'tipoAlergeno' => 'required|string|max:255',
        ]);

        try {
            $this->ddb->updateItem([
                'TableName' => $this->tableAllergies,
                'Key' => [
                    'userId' => ['S' => $userId],        // Partition Key
                    'idAlergia' => ['S' => $idAlergia]   // Sort Key
                ],
                'UpdateExpression' => 'SET alergeno = :a, tipoAlergeno = :t',
                'ExpressionAttributeValues' => [
                    ':a' => ['S' => $request->alergeno],
                    ':t' => ['S' => $request->tipoAlergeno],
                ]
            ]);

            return redirect()->route('allergies.index', $userId)
                ->with('success', 'Alergia actualizada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error updating allergy: ' . $e->getMessage());
            return back()->with('error', 'Error al actualizar la alergia.')->withInput();
        }
    }

    public function destroy($userId, $idAlergia)
    {
        try {
            $this->ddb->deleteItem([
                'TableName' => $this->tableAllergies,
                'Key' => [
                    'userId' => ['S' => $userId],        // Partition Key
                    'idAlergia' => ['S' => $idAlergia]   // Sort Key
                ]
            ]);

            return redirect()->route('allergies.index', $userId)
                ->with('success', 'Alergia eliminada correctamente.');

        } catch (\Exception $e) {
            \Log::error('Error deleting allergy: ' . $e->getMessage());
            return redirect()->route('allergies.index', $userId)
                ->with('error', 'Error al eliminar la alergia.');
        }
    }

    private function fromDynamo($item)
    {
        $result = [];
        foreach ($item as $key => $value) {
            $type = array_key_first($value);
            $result[$key] = $type === 'N' ? (int)$value[$type] : $value[$type];
        }
        return $result;
    }
}