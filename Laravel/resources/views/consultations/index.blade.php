@extends('layouts.app')

@section('content')
<div class="container py-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('patients.index') }}">Pacientes</a></li>
            <li class="breadcrumb-item"><a href="{{ route('patients.show', $userId) }}">Detalle Paciente</a></li>
            <li class="breadcrumb-item"><a href="{{ route('medical-records.edit', $userId) }}">Ficha Médica</a></li>
            <li class="breadcrumb-item active">Consultas</li>
        </ol>
    </nav>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3><i class="fas fa-stethoscope me-2 text-success"></i>Gestión de Consultas</h3>
        <a href="{{ route('consultations.create', $userId) }}" class="btn btn-success">
            <i class="fas fa-plus me-2"></i>Nueva Consulta
        </a>
    </div>

    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show">
            <i class="fas fa-check-circle me-2"></i>{{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger alert-dismissible fade show">
            <i class="fas fa-exclamation-triangle me-2"></i>{{ session('error') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    @endif

    <div class="card shadow-sm">
        <div class="card-header bg-success text-white">
            <strong>Lista de Consultas del Paciente</strong>
        </div>
        <div class="card-body">
            @if($consultations->isEmpty())
                <div class="text-center py-5">
                    <i class="fas fa-stethoscope fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay consultas registradas para este paciente.</p>
                    <a href="{{ route('consultations.create', $userId) }}" class="btn btn-success">
                        <i class="fas fa-plus me-2"></i>Agregar Primera Consulta
                    </a>
                </div>
            @else
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Fecha</th>
                                <th>Razon Consulta</th>
                                <th>Lugar de la Consulta</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($consultations as $consultation)
                            <tr>
                                <td><strong>{{ isset($consultation->fechaAtencion) ? substr($consultation->fechaAtencion, 0, 10) : 'Sin fecha' }}</strong></td>
                                <td>{{ \Illuminate\Support\Str::limit($consultation->razonConsulta ?? 'Sin descripción', 60) }}</td>
                                <td><small class="text-muted">{{ $consultation->lugar ?? 'N/A' }}</small></td>
                                <td class="text-end">
                                    <a href="{{ route('consultations.edit', [$userId, $consultation->idConsulta]) }}" 
                                       class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-edit me-1"></i>Editar
                                    </a>
                                    <form action="{{ route('consultations.destroy', [$userId, $consultation->idConsulta]) }}" 
                                          method="POST" class="d-inline"
                                          onsubmit="return confirm('¿Está seguro de eliminar esta consulta?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-sm btn-outline-danger">
                                            <i class="fas fa-trash me-1"></i>Eliminar
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            @endif
        </div>
    </div>

    <div class="mt-3">
        <a href="{{ route('medical-records.edit', $userId) }}" class="btn btn-secondary">
            <i class="fas fa-arrow-left me-2"></i>Volver a Ficha Médica
        </a>
    </div>
</div>
@endsection