@extends('layouts.app')

@section('content')
<style>
    .patient-card {
        transition: transform 0.2s;
        border-left: 4px solid #007bff;
    }
    .patient-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .search-box {
        background: #f8f9fa;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
    }
    .gender-male {
        border-left-color: #007bff !important;
    }
    .gender-female {
        border-left-color: #e83e8c !important;
    }
    .allergy-badge {
        font-size: 0.7em;
    }
</style>

<div class="container mt-4">
    <div class="row">
        <div class="col-12">
            <h1 class="mb-4">
                <i class="fas fa-users me-2"></i>Buscador de Pacientes
            </h1>

            <!-- Panel de Búsqueda -->
            <div class="search-box">
                <form action="{{ route('patients.index') }}" method="GET">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="fas fa-id-card"></i>
                                </span>
                                <input type="text" 
                                       name="search_rut" 
                                       class="form-control" 
                                       placeholder="Buscar por RUT (ej: 17786151-0)..."
                                       value="{{ $searchRut ?? '' }}">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <button type="submit" class="btn btn-primary w-100">
                                <i class="fas fa-search me-1"></i> Buscar
                            </button>
                        </div>
                    </div>
                    @if($searchRut)
                    <div class="mt-2">
                        <a href="{{ route('patients.index') }}" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-times me-1"></i> Limpiar búsqueda
                        </a>
                        <small class="text-muted ms-2">
                            Mostrando resultados para: "{{ $searchRut }}"
                        </small>
                    </div>
                    @endif
                </form>
            </div>

            <!-- Mensajes de Estado -->
            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            @if(isset($error))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    {{ $error }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            <!-- Lista de Pacientes -->
            <div class="row">
                @if(empty($patients))
                    <div class="col-12">
                        <div class="alert alert-info text-center">
                            <i class="fas fa-info-circle me-2"></i>
                            No hay pacientes registrados o no se pudieron cargar los datos.
                        </div>
                    </div>
                @else
                    @foreach($patients as $patient)
                        <div class="col-md-6 col-lg-4 mb-3">
                            <div class="card patient-card h-100 {{ $patient['sexo'] === 'male' ? 'gender-male' : 'gender-female' }}">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h5 class="card-title mb-0">
                                            <i class="fas fa-user me-2"></i>
                                            {{ $patient['nombre'] }}
                                        </h5>
                                        <span class="badge bg-{{ $patient['sexo'] === 'male' ? 'primary' : 'danger' }}">
                                            {{ $patient['sexo'] === 'male' ? 'Hombre' : 'Mujer' }}
                                        </span>
                                    </div>
                                    
                                    <div class="patient-info">
                                        <p class="card-text mb-1">
                                            <strong><i class="fas fa-id-card me-1"></i>RUT:</strong> 
                                            <span class="text-muted">{{ $patient['userId'] }}</span>
                                        </p>
                                        
                                        <p class="card-text mb-1">
                                            <strong><i class="fas fa-stethoscope me-1"></i>Consultas:</strong> 
                                            <span class="badge bg-secondary">
                                                {{ count($patient['idConsultas'] ?? []) }}
                                            </span>
                                        </p>

                                        <p class="card-text mb-2">
                                            <strong><i class="fas fa-allergies me-1"></i>Alergias:</strong> 
                                            <span class="badge bg-{{ !empty($patient['alergias']) ? 'warning' : 'success' }}">
                                                {{ count($patient['alergias'] ?? []) }}
                                            </span>
                                        </p>

                                        @if(!empty($patient['alergias']))
                                        <div class="allergies-list">
                                            <small class="text-muted">
                                                <strong>Tipos:</strong>
                                                @php
                                                    $tiposAlergias = array_unique(array_map(function($alergia) {
                                                        return $alergia['alergia']['tipoAlergeno'] ?? 'N/A';
                                                    }, $patient['alergias']));
                                                @endphp
                                                {{ implode(', ', $tiposAlergias) }}
                                            </small>
                                        </div>
                                        @endif
                                    </div>
                                </div>
                                <div class="card-footer bg-transparent">
                                    <a href="{{ route('patients.show', $patient['userId']) }}" 
                                       class="btn btn-outline-primary btn-sm w-100">
                                        <i class="fas fa-eye me-1"></i> Ver Detalles Completos
                                    </a>
                                </div>
                            </div>
                        </div>
                    @endforeach
                @endif
            </div>

            <!-- Contador de Resultados -->
            @if(!empty($patients))
            <div class="mt-3 text-center text-muted">
                <small>
                    <i class="fas fa-list me-1"></i>
                    Mostrando {{ count($patients) }} paciente(s)
                </small>
            </div>
            @endif
        </div>
    </div>
</div>

@push('scripts')
<script>
    // Auto-focus en el campo de búsqueda
    document.addEventListener('DOMContentLoaded', function() {
        const searchInput = document.querySelector('input[name="search_rut"]');
        if (searchInput) {
            searchInput.focus();
        }
    });
</script>
@endpush
@endsection