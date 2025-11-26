<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Médico - {{ $patient['nombre'] ?? 'Paciente' }}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #2c7be5;
            --secondary: #6e84a3;
            --success: #00d97e;
            --warning: #f6c343;
            --danger: #e63757;
            --light: #f9fafd;
            --dark: #12263f;
            --border-radius: 0.75rem;
            --shadow: 0 0.25rem 0.75rem rgba(18, 38, 63, 0.08);
            --transition: all 0.3s ease;
        }
        
        body {
            background-color: #f5f6fa;
            color: #3c4b64;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .card {
            border: none;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            transition: var(--transition);
            margin-bottom: 1.5rem;
        }
        
        .card:hover {
            box-shadow: 0 0.5rem 1.5rem rgba(18, 38, 63, 0.12);
        }
        
        .card-header {
            background-color: white;
            border-bottom: 1px solid #e3ebf6;
            font-weight: 600;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius) var(--border-radius) 0 0 !important;
        }
        
        .patient-header {
            background: linear-gradient(135deg, var(--primary) 0%, #1650a1 100%);
            color: white;
            border-radius: var(--border-radius);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            position: relative;
            overflow: hidden;
        }
        
        .patient-header::before {
            content: "";
            position: absolute;
            top: -50%;
            right: -10%;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }
        
        .patient-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-right: 1.5rem;
        }
        
        .info-badge {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-weight: 500;
            font-size: 0.875rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .info-badge i {
            margin-right: 0.5rem;
        }
        
        .stat-card {
            text-align: center;
            padding: 1.5rem 1rem;
            border-radius: var(--border-radius);
            background: white;
            transition: var(--transition);
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-number {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .stat-label {
            font-size: 0.875rem;
            color: var(--secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .allergy-item {
            display: flex;
            align-items: center;
            padding: 0.75rem 1rem;
            border-radius: var(--border-radius);
            background: rgba(255, 193, 7, 0.1);
            margin-bottom: 0.75rem;
            border-left: 4px solid var(--warning);
        }
        
        .consultation-item {
            border-left: 4px solid var(--success);
            margin-bottom: 1rem;
            border-radius: 0 var(--border-radius) var(--border-radius) 0;
            overflow: hidden;
        }
        
        .consultation-header {
            background: rgba(0, 217, 126, 0.1);
            padding: 1rem 1.5rem;
            cursor: pointer;
            transition: var(--transition);
        }
        
        .consultation-header:hover {
            background: rgba(0, 217, 126, 0.15);
        }
        
        .consultation-body {
            padding: 1.5rem;
            background: white;
            border-top: 1px solid #e3ebf6;
        }
        
        .tag {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: #e3ebf6;
            border-radius: 50px;
            font-size: 0.75rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .breadcrumb {
            background: transparent;
            padding: 0;
            margin-bottom: 1.5rem;
        }
        
        .breadcrumb-item a {
            color: var(--primary);
            text-decoration: none;
        }
        
        .empty-state {
            text-align: center;
            padding: 3rem 1rem;
            color: var(--secondary);
        }
        
        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }
        
        @media (max-width: 768px) {
            .patient-header {
                text-align: center;
                padding: 1.5rem 1rem;
            }
            
            .patient-avatar {
                margin: 0 auto 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container py-4">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="{{ route('patients.index') }}"><i class="fas fa-chevron-left me-1"></i> Lista de Pacientes</a></li>
                <li class="breadcrumb-item active" aria-current="page">Historial Médico</li>
            </ol>
        </nav>

        @if(empty($patient))
            <div class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <div>Paciente no encontrado.</div>
            </div>
        @else
            <!-- Encabezado del Paciente -->
            <div class="patient-header">
                <div class="d-flex flex-column flex-md-row align-items-center">
                    <div class="patient-avatar">
                        <i class="fas fa-user-injured"></i>
                    </div>
                    <div class="flex-grow-1 text-center text-md-start">
                        <h2 class="mb-1">{{ $patient['nombre'] ?? 'Nombre no disponible' }}</h2>
                        <p class="mb-2 opacity-75">ID: {{ $patient['userId'] ?? 'No disponible' }}</p>
                        <div class="d-flex flex-wrap justify-content-center justify-content-md-start">
                            <span class="info-badge bg-light text-dark">
                                <i class="fas fa-{{ $patient['sexo'] === 'male' ? 'mars' : ($patient['sexo'] === 'female' ? 'venus' : 'genderless') }}"></i>
                                {{ $patient['sexo'] === 'male' ? 'Masculino' : ($patient['sexo'] === 'female' ? 'Femenino' : 'No especificado') }}
                            </span>
                            <span class="info-badge bg-light text-dark">
                                <i class="fas fa-birthday-cake"></i>
                                Edad: {{ $patient['edad'] ?? 'No disponible' }}
                            </span>
                        </div>
                    </div>

                    <!-- Botón para editar ficha médica (abre la vista con CRUD de alergias y consultas) -->
                    <div class="ms-md-auto mt-3 mt-md-0">
                        @php
                            $patientUserId = $patient['userId'] ?? ($userId ?? '');
                        @endphp                        
                        <a href="{{ route('medical-records.edit', $patientUserId) }}"
                            class="btn btn-white btn-sm shadow-sm">
                            <i class="fas fa-edit me-1"></i> Editar Ficha Médica
                        </a>
                    </div>
                </div>
            </div>

            <!-- Estadísticas Rápidas -->
            <div class="row">
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-number text-primary">{{ is_array($consultations) ? count($consultations) : 0 }}</div>
                        <div class="stat-label"><i class="fas fa-calendar-check me-1"></i> Total Consultas</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-number text-warning">{{ !empty($allergies) && is_array($allergies) ? count($allergies) : 0 }}</div>
                        <div class="stat-label"><i class="fas fa-allergies me-1"></i> Alergias Registradas</div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="stat-card">
                        <div class="stat-number text-success">
                            @php
                                $recentConsultations = 0;
                                if (is_array($consultations)) {
                                    $oneMonthAgo = date('Y-m-d', strtotime('-1 month'));
                                    foreach ($consultations as $c) {
                                        $fecha = $c['fechaAtencion'] ?? $c['fecha'] ?? ($c['createdAt'] ?? '');
                                        if ($fecha >= $oneMonthAgo) $recentConsultations++;
                                    }
                                }
                            @endphp
                            {{ $recentConsultations }}
                        </div>
                        <div class="stat-label"><i class="fas fa-clock me-1"></i> Último Mes</div>
                    </div>
                </div>
            </div>

            <div class="row">
                <!-- Alergias -->
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header d-flex align-items-center">
                            <i class="fas fa-allergies text-warning me-2"></i>
                            <span>Alergias del Paciente</span>
                        </div>
                        <div class="card-body">
                            @if(!empty($allergies) && is_array($allergies))
                                @foreach($allergies as $a)
                                    @php
                                        $id = $a['idAlergia'] ?? $a['id'] ?? '';
                                        $label = $a['alergeno'] ?? ($a['alergia'] ?? 'Alergia no especificada');
                                        $tipo = $a['tipoAlergeno'] ?? 'Tipo no especificado';
                                    @endphp
                                    <div class="allergy-item">
                                        <div class="flex-grow-1">
                                            <div class="fw-bold">{{ $label }}</div>
                                            <div class="small text-muted">{{ $tipo }}</div>
                                        </div>
                                        <div class="text-end">
                                            <small class="text-muted">ID: {{ substr($id, 0, 8) }}...</small>
                                        </div>
                                    </div>
                                @endforeach
                            @else
                                <div class="empty-state">
                                    <i class="fas fa-allergies"></i>
                                    <h5>No hay alergias registradas</h5>
                                    <p class="mb-0">No se han registrado alergias para este paciente.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- Resumen de Consultas -->
                <div class="col-lg-6">
                    <div class="card">
                        <div class="card-header d-flex align-items-center">
                            <i class="fas fa-file-medical text-success me-2"></i>
                            <span>Resumen de Consultas</span>
                        </div>
                        <div class="card-body">
                            @if(!empty($consultations) && is_array($consultations))
                                <div class="mb-3">
                                    <p>Se han registrado <strong>{{ count($consultations) }} consultas</strong> para este paciente.</p>
                                    
                                    @php
                                        $consultationTypes = [];
                                        foreach ($consultations as $c) {
                                            $tipo = $c['tipoConsulta'] ?? $c['tipo'] ?? 'General';
                                            if (!isset($consultationTypes[$tipo])) {
                                                $consultationTypes[$tipo] = 0;
                                            }
                                            $consultationTypes[$tipo]++;
                                        }
                                    @endphp
                                    
                                    @if(!empty($consultationTypes))
                                        <p class="mb-2">Distribución por tipo:</p>
                                        @foreach($consultationTypes as $tipo => $count)
                                            <span class="tag">{{ $tipo }}: {{ $count }}</span>
                                        @endforeach
                                    @endif
                                </div>
                                
                                <div class="alert alert-info d-flex align-items-center">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <small>Desplázate hacia abajo para ver el detalle completo de cada consulta.</small>
                                </div>
                            @else
                                <div class="empty-state">
                                    <i class="fas fa-calendar-times"></i>
                                    <h5>No hay consultas registradas</h5>
                                    <p class="mb-0">No se han registrado consultas para este paciente.</p>
                                </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            <!-- Detalle de Consultas -->
            <div class="card">
                <div class="card-header d-flex align-items-center">
                    <i class="fas fa-history text-primary me-2"></i>
                    <span>Historial de Consultas</span>
                </div>
                <div class="card-body p-0">
                    @php $consultList = $consultations ?? []; @endphp

                    @if(empty($consultList))
                        <div class="empty-state">
                            <i class="fas fa-file-medical-alt"></i>
                            <h5>No hay consultas para mostrar</h5>
                            <p class="mb-0">No se encontraron consultas detalladas para este paciente.</p>
                        </div>
                    @else
                        <div class="consultation-list">
                            @foreach($consultList as $i => $c)
                                @php
                                    $cid = $c['idConsulta'] ?? $c['id'] ?? $c['consultaId'] ?? ('consulta-'.$i);
                                    $fecha = $c['fechaAtencion'] ?? $c['fecha'] ?? ($c['createdAt'] ?? 'Sin fecha');
                                    $prof = $c['profesional'] ?? $c['profesional'] ?? null;
                                    $profNombre = is_array($prof) ? ($prof['nombre'] ?? $prof['nombreCompleto'] ?? json_encode($prof)) : ($prof ?? 'Profesional no especificado');
                                    $motivo = $c['razonConsulta'] ?? $c['motivo'] ?? $c['diagnostico'] ?? 'No especificado';
                                    $lugar = $c['lugar'] ?? $c['centro'] ?? 'Lugar no especificado';
                                    $recetas = $c['recetas'] ?? $c['recetaList'] ?? [];
                                    $diagnosticos = $c['diagnosticos'] ?? $c['diagnosticoList'] ?? [];
                                    $tipoConsulta = $c['tipoConsulta'] ?? $c['tipo'] ?? 'General';
                                @endphp

                                <div class="consultation-item">
                                    <div class="consultation-header" data-bs-toggle="collapse" data-bs-target="#consultation-{{ $i }}" aria-expanded="false">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <div class="d-flex align-items-center">
                                                <div class="me-3">
                                                    <i class="fas fa-stethoscope"></i>
                                                </div>
                                                <div>
                                                    <h6 class="mb-1">{{ $fecha }}</h6>
                                                    <p class="mb-0 text-muted">{{ $profNombre }} • {{ $lugar }}</p>
                                                </div>
                                            </div>
                                            <div class="text-end">
                                                <span class="badge bg-light text-dark">{{ $tipoConsulta }}</span>
                                                <i class="fas fa-chevron-down ms-2"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="collapse" id="consultation-{{ $i }}">
                                        <div class="consultation-body">
                                            <div class="row">
                                                <div class="col-md-8">
                                                    <h6>Motivo de la consulta</h6>
                                                    <p class="mb-3">{{ $motivo }}</p>
                                                    
                                                    @if(!empty($diagnosticos))
                                                        <h6>Diagnósticos</h6>
                                                        <div class="list-group mb-3">
                                                            @foreach($diagnosticos as $d)
                                                                @php
                                                                    // Normalizar estructura del diagnóstico
                                                                    $diagWrapper = is_array($d) ? ($d['diagnostico'] ?? $d) : $d;
                                                                    $diagId = $d['idDiagnostico'] ?? $diagWrapper['idDiagnostico'] ?? $diagWrapper['id'] ?? '';
                                                                    $detalleDiag = $diagWrapper['detalleDiagnostico'] ?? $diagWrapper['detalle'] ?? '';
                                                                    $examenes = $diagWrapper['examenes'] ?? $d['examenes'] ?? [];
                                                                @endphp
                                                                <div class="list-group-item mb-2">
                                                                    <div class="d-flex justify-content-between align-items-start">
                                                                        <div>
                                                                            <div class="fw-bold"><i class="fas fa-diagnoses text-success me-2"></i> {{ $detalleDiag }}</div>
                                                                            <small class="text-muted">ID: {{ substr($diagId,0,8) }}{{ $diagId ? '...' : '' }}</small>
                                                                        </div>
                                                                        <div class="text-end">
                                                                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#exams-{{ $diagId ?: $loop->index }}" aria-expanded="false">Ver exámenes ({{ count($examenes) }})</button>
                                                                        </div>
                                                                    </div>

                                                                    @if(!empty($examenes))
                                                                        <div class="collapse mt-2" id="exams-{{ $diagId ?: $loop->index }}">
                                                                            <ul class="list-group list-group-flush">
                                                                                @foreach($examenes as $ex)
                                                                                    @php
                                                                                        $exObj = is_array($ex) ? ($ex['examen'] ?? $ex) : $ex;
                                                                                        $exId = $ex['idExamen'] ?? $exObj['idExamen'] ?? $exObj['id'] ?? '';
                                                                                        $indicacion = $exObj['indicacion'] ?? $exObj['observacion'] ?? '';
                                                                                        $created = $exObj['createdAt'] ?? ($exObj['fecha'] ?? '');
                                                                                    @endphp
                                                                                    <li class="list-group-item small">
                                                                                        <div class="d-flex justify-content-between">
                                                                                            <div>
                                                                                                <strong>{{ $exObj['idExamen'] ? 'Examen' : 'Examen' }}</strong>
                                                                                                <div class="text-muted small">{{ $indicacion }}</div>
                                                                                            </div>
                                                                                            <div class="text-end">
                                                                                                <div class="small text-muted">{{ $created ? date('Y-m-d', strtotime($created)) : '' }}</div>
                                                                                                <div class="small text-muted">ID: {{ substr($exId,0,8) }}{{ $exId ? '...' : '' }}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </li>
                                                                                @endforeach
                                                                            </ul>
                                                                        </div>
                                                                    @endif
                                                                </div>
                                                            @endforeach
                                                        </div>
                                                    @endif
                                                </div>
                                                
                                                <div class="col-md-4">
                                                    @if(!empty($recetas))
                                                        <h6>Recetas Médicas</h6>
                                                        <div class="bg-light p-3 rounded">
                                                            @foreach($recetas as $r)
                                                                @php
                                                                    $recWrapper = is_array($r) ? ($r['receta'] ?? $r) : $r;
                                                                    $recId = $r['idReceta'] ?? $recWrapper['idReceta'] ?? $recWrapper['id'] ?? '';
                                                                    $instruccion = $recWrapper['instruccion'] ?? $recWrapper['indicacion'] ?? '';
                                                                    $meds = $recWrapper['medicamentos'] ?? $recWrapper['medicamentos'] ?? [];
                                                                @endphp
                                                                <div class="mb-3">
                                                                    <div class="d-flex justify-content-between">
                                                                        <div class="fw-bold"><i class="fas fa-prescription text-primary me-2"></i> Receta</div>
                                                                        <small class="text-muted">ID: {{ substr($recId,0,8) }}{{ $recId ? '...' : '' }}</small>
                                                                    </div>

                                                                    @if(!empty($meds))
                                                                        <ul class="mb-2 small">
                                                                            @foreach($meds as $m)
                                                                                @php
                                                                                    $medObj = is_array($m) ? ($m['medicamento'] ?? $m) : $m;
                                                                                    $medName = $medObj['nombreMedicamento'] ?? $medObj['nombre'] ?? '';
                                                                                    $gramaje = $medObj['gramaje'] ?? null;
                                                                                    $cant = $medObj['cantidad'] ?? null;
                                                                                    $tipo = $medObj['tipoFarma'] ?? $medObj['tipo'] ?? '';
                                                                                    $indic = $medObj['indicacion'] ?? '';
                                                                                @endphp
                                                                                <li class="mb-1">
                                                                                    <div><strong>{{ $medName }}</strong> <small class="text-muted">x{{ $cant ?? 1 }} {{ $gramaje ? '· ' . $gramaje . 'mg' : '' }}</small></div>
                                                                                    <div class="small text-muted">{{ $tipo }}</div>
                                                                                    @if($indic)
                                                                                        <div class="small text-muted">Indic: {{ \Illuminate\Support\Str::limit($indic, 120) }}</div>
                                                                                    @endif
                                                                                </li>
                                                                            @endforeach
                                                                        </ul>
                                                                    @endif

                                                                    @if($instruccion)
                                                                        <div class="small"><strong>Instrucción:</strong> {{ \Illuminate\Support\Str::limit($instruccion, 200) }}</div>
                                                                    @endif
                                                                </div>
                                                            @endforeach
                                                        </div>
                                                    @endif
                                                    
                                                    <div class="mt-3 pt-3 border-top">
                                                        <small class="text-muted">ID de consulta: {{ $cid }}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>
        @endif
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Efecto de acordeón mejorado
        document.addEventListener('DOMContentLoaded', function() {
            const consultationHeaders = document.querySelectorAll('.consultation-header');
            
            consultationHeaders.forEach(header => {
                header.addEventListener('click', function() {
                    const icon = this.querySelector('.fa-chevron-down');
                    if (icon) {
                        icon.classList.toggle('fa-chevron-down');
                        icon.classList.toggle('fa-chevron-up');
                    }
                });
            });
        });
    </script>
</body>
</html>