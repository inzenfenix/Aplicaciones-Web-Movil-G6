<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aws\DynamoDb\DynamoDbClient;

class DashboardController extends Controller
{
    private $ddb;

    public function __construct()
    {
        $this->ddb = new DynamoDbClient([
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'version' => 'latest',
        ]);
    }

    public function index()
    {
        try {
            // Obtener distribución por especialidad desde CORA_Consultation
            $counts = $this->getEspecialidadDistribution();
            
            // Obtener distribución por género desde CORA_Medical_Record
            $genderCounts = $this->getGenderDistribution();

            // Obtener consultas mensuales desde CORA_HistoricConsultation
            $monthlyConsultations = $this->getMonthlyConsultations();

            // Obtener distribución de alergias desde CORA_Allergies
            $allergyCounts = $this->getAllergyDistribution();

            return view('Dashboard.index', compact('counts', 'genderCounts', 'monthlyConsultations', 'allergyCounts'));

        } catch (\Exception $e) {
            \Log::error('Error loading dashboard: ' . $e->getMessage());
            return view('Dashboard.index', [
                'counts' => [],
                'genderCounts' => ['Masculino' => 0, 'Femenino' => 0, 'Otro' => 0],
                'monthlyConsultations' => array_fill(0, 12, 0),
                'allergyCounts' => []
            ]);
        }
    }

    private function getEspecialidadDistribution()
    {
        try {
            $result = $this->ddb->scan([
                'TableName' => 'CORA_Consultation',
            ]);

            $counts = [];
            
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    if (isset($item['idProfesional']['M']['especialidad']['S'])) {
                        $especialidad = $item['idProfesional']['M']['especialidad']['S'];
                        if (!isset($counts[$especialidad])) {
                            $counts[$especialidad] = 0;
                        }
                        $counts[$especialidad]++;
                    }
                }
            }

            arsort($counts);
            return array_slice($counts, 0, 7, true);

        } catch (\Exception $e) {
            \Log::error('Error fetching especialidad distribution: ' . $e->getMessage());
            return [];
        }
    }

    private function getGenderDistribution()
    {
        try {
            $result = $this->ddb->scan([
                'TableName' => 'CORA_Medical_Record',
            ]);

            $genderCounts = [
                'Masculino' => 0,
                'Femenino' => 0,
                'Otro' => 0
            ];
            
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    if (isset($item['sexo']['S'])) {
                        $sexo = $item['sexo']['S'];
                        
                        // Normalizar valores
                        if (strtolower($sexo) === 'masculino' || strtolower($sexo) === 'male' || strtolower($sexo) === 'm') {
                            $genderCounts['Masculino']++;
                        } elseif (strtolower($sexo) === 'femenino' || strtolower($sexo) === 'female' || strtolower($sexo) === 'f') {
                            $genderCounts['Femenino']++;
                        } else {
                            $genderCounts['Otro']++;
                        }
                    }
                }
            }

            return $genderCounts;

        } catch (\Exception $e) {
            \Log::error('Error fetching gender distribution: ' . $e->getMessage());
            return ['Masculino' => 0, 'Femenino' => 0, 'Otro' => 0];
        }
    }

    private function getMonthlyConsultations()
    {
        try {
            $result = $this->ddb->scan([
                'TableName' => 'CORA_HistoricConsultation',
            ]);

            // Inicializar array con 12 meses (0 = Enero, 11 = Diciembre)
            $monthCounts = array_fill(0, 12, 0);
            $currentYear = date('Y');

            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    // Buscar campo de fecha (puede ser 'fecha', 'fechaConsulta', 'fechaAtencion', etc.)
                    $fecha = null;
                    
                    if (isset($item['fecha']['S'])) {
                        $fecha = $item['fecha']['S'];
                    } elseif (isset($item['fechaConsulta']['S'])) {
                        $fecha = $item['fechaConsulta']['S'];
                    } elseif (isset($item['fechaAtencion']['S'])) {
                        $fecha = $item['fechaAtencion']['S'];
                    } elseif (isset($item['createdAt']['S'])) {
                        $fecha = $item['createdAt']['S'];
                    }

                    if ($fecha) {
                        // Parsear la fecha (formato ISO: 2025-11-23T17:10:03.779Z)
                        try {
                            $timestamp = strtotime($fecha);
                            $year = date('Y', $timestamp);
                            $month = (int)date('n', $timestamp); // 1-12
                            
                            // Solo contar consultas del año actual
                            if ($year == $currentYear) {
                                $monthCounts[$month - 1]++; // Convertir a índice 0-11
                            }
                        } catch (\Exception $e) {
                            \Log::warning('Error parsing date: ' . $fecha);
                            continue;
                        }
                    }
                }
            }

            return $monthCounts;

        } catch (\Exception $e) {
            \Log::error('Error fetching monthly consultations: ' . $e->getMessage());
            return array_fill(0, 12, 0);
        }
    }

    private function getAllergyDistribution()
    {
        try {
            $result = $this->ddb->scan([
                'TableName' => 'CORA_Allergies',
            ]);

            $allergyCounts = [];
            
            if (isset($result['Items'])) {
                foreach ($result['Items'] as $item) {
                    // Contar por tipo de alérgeno
                    if (isset($item['tipoAlergeno']['S'])) {
                        $tipo = $item['tipoAlergeno']['S'];
                        
                        if (!isset($allergyCounts[$tipo])) {
                            $allergyCounts[$tipo] = 0;
                        }
                        $allergyCounts[$tipo]++;
                    }
                }
            }

            // Ordenar de mayor a menor
            arsort($allergyCounts);
            
            // Retornar solo los top 5-7 tipos
            return array_slice($allergyCounts, 0, 7, true);

        } catch (\Exception $e) {
            \Log::error('Error fetching allergy distribution: ' . $e->getMessage());
            return [];
        }
    }
}