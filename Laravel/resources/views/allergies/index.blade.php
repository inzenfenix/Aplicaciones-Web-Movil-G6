@extends('layouts.app')

@section('content')
<div class="container py-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('patients.index') }}">Pacientes</a></li>
            <li class="breadcrumb-item"><a href="{{ route('patients.show', $userId) }}">Detalle Paciente</a></li>
            <li class="breadcrumb-item"><a href="{{ route('medical-records.edit', $userId) }}">Ficha Médica</a></li>
            <li class="breadcrumb-item active">Alergias</li>
        </ol>
    </nav>

    <div class="d-flex justify-content-between align-items-center mb-4">
        <h3><i class="fas fa-allergies me-2 text-warning"></i>Gestión de Alergias</h3>
        <a href="{{ route('allergies.create', $userId) }}" class="btn btn-warning">
            <i class="fas fa-plus me-2"></i>Nueva Alergia
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
        <div class="card-header bg-warning">
            <strong>Lista de Alergias del Paciente</strong>
        </div>
        <div class="card-body">
            @if($allergies->isEmpty())
                <div class="text-center py-5">
                    <i class="fas fa-allergies fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No hay alergias registradas para este paciente.</p>
                    <a href="{{ route('allergies.create', $userId) }}" class="btn btn-warning">
                        <i class="fas fa-plus me-2"></i>Agregar Primera Alergia
                    </a>
                </div>
            @else
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th>Alérgeno</th>
                                <th>Tipo de Alérgeno</th>
                                <th>Fecha Registro</th>
                                <th class="text-end">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($allergies as $allergy)
                            <tr>
                                <td><strong>{{ $allergy->alergeno }}</strong></td>
                                <td><span class="badge bg-light text-dark">{{ $allergy->tipoAlergeno }}</span></td>
                                <td><small class="text-muted">{{ $allergy->createdAt ?? 'N/A' }}</small></td>
                                <td class="text-end">
                                    <a href="{{ route('allergies.edit', [$userId, $allergy->idAlergia]) }}" 
                                       class="btn btn-sm btn-outline-primary">
                                        <i class="fas fa-edit me-1"></i>Editar
                                    </a>
                                    <form action="{{ route('allergies.destroy', [$userId, $allergy->idAlergia]) }}" 
                                          method="POST" class="d-inline"
                                          onsubmit="return confirm('¿Está seguro de eliminar esta alergia?');">
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