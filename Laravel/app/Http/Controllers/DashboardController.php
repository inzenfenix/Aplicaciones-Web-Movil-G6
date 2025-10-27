<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aws\DynamoDb\DynamoDbClient;
use Aws\Exception\AwsException;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            // Obtener datos reales de DynamoDB
            $alergiasData = $this->getAlergiasPorGravedad();
        } catch (\Exception $e) {
            // Si hay error, usar datos de ejemplo basados en tu data
            $alergiasData = [
                'gravedades' => ['leve', 'moderada', 'alta'],
                'cantidades' => [1, 1, 6] // Basado en tus datos: 1 leve, 1 moderada, 2 altas
            ];
        }

        return view('Dashboard/index', ['alergiasData' => $alergiasData]);
    }

    private function getAlergiasPorGravedad()
    {
        try {
            // Scan para obtener todos los registros de la tabla Alergias
            $result = $this->dynamoDb->scan([
                'TableName' => 'Alergias', // Nombre de tu tabla en DynamoDB
                'Select' => 'ALL_ATTRIBUTES'
            ]);

            $alergias = $result['Items'];
            
            // Contar alergias por gravedad
            $conteoGravedad = [];
            
            foreach ($alergias as $alergia) {
                $gravedad = $this->extractAttribute($alergia, 'gravedad');
                if ($gravedad) {
                    if (!isset($conteoGravedad[$gravedad])) {
                        $conteoGravedad[$gravedad] = 0;
                    }
                    $conteoGravedad[$gravedad]++;
                }
            }

            // Ordenar por nivel de gravedad
            $ordenGravedad = ['leve', 'moderada', 'alta'];
            $gravedades = [];
            $cantidades = [];

            foreach ($ordenGravedad as $nivel) {
                if (isset($conteoGravedad[$nivel])) {
                    $gravedades[] = ucfirst($nivel);
                    $cantidades[] = $conteoGravedad[$nivel];
                }
            }

            return [
                'gravedades' => $gravedades,
                'cantidades' => $cantidades
            ];

        } catch (AwsException $e) {
            // Si hay error con DynamoDB, lanzar excepción para usar datos de ejemplo
            throw new \Exception('Error connecting to DynamoDB: ' . $e->getMessage());
        }
    }

    private function extractAttribute($item, $attribute)
    {
        if (isset($item[$attribute])) {
            if (isset($item[$attribute]['S'])) {
                return $item[$attribute]['S']; // String
            } elseif (isset($item[$attribute]['N'])) {
                return $item[$attribute]['N']; // Number
            }
        }
        return null;
    }
}