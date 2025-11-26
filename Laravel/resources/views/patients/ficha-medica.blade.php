@extends('layouts.app')

@section('content')
<div class="container py-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('patients.index') }}">Pacientes</a></li>
            <li class="breadcrumb-item"><a href="{{ route('patients.show', $userId) }}">Detalle</a></li>
            <li class="breadcrumb-item active">Ficha Médica</li>
        </ol>
    </nav>

    <h3 class="mb-4"><i class="fas fa-file-medical me-2"></i>Ficha Médica / {{ $patient->nombre ?? 'Paciente' }}</h3>

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

    {{-- FORM PRINCIPAL DE FICHA --}}
    <form method="POST" action="{{ route('medical-records.update', $patient->userId) }}">
        @csrf
        @method('PUT')

        <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white">
                <strong>Información General</strong>
            </div>
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nombre Completo</label>
                        <input name="nombre" class="form-control" value="{{ $patient->nombre ?? '' }}" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Edad</label>
                        <input name="edad" type="number" class="form-control" value="{{ $patient->edad ?? '' }}" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Sexo</label>
                        <select name="sexo" class="form-select" required>
                            <option value="male" {{ ($patient->sexo ?? '') === 'male' ? 'selected' : '' }}>Masculino</option>
                            <option value="female" {{ ($patient->sexo ?? '') === 'female' ? 'selected' : '' }}>Femenino</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fecha de Nacimiento</label>
                        <input name="fechaNacimiento" type="date" class="form-control" value="{{ $patient->fechaNacimiento ?? '' }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tipo de Sangre</label>
                        <select name="tipoSangre" class="form-select" required>
                            @foreach(['A+','A-','B+','B-','AB+','AB-','O+','O-'] as $tipo)
                                <option value="{{ $tipo }}" {{ ($patient->tipoSangre ?? '') === $tipo ? 'selected' : '' }}>{{ $tipo }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="d-flex gap-2 mb-4">
            <button type="submit" class="btn btn-primary"><i class="fas fa-save me-2"></i>Guardar Cambios</button>
            <a href="{{ route('patients.show', $userId) }}" class="btn btn-secondary"><i class="fas fa-arrow-left me-2"></i>Volver</a>
        </div>
    </form>

    {{-- SECCIÓN DE ALERGIAS Y CONSULTAS --}}
    <div class="row">
        <div class="col-lg-6">
            <div class="card mb-4 shadow-sm">
                <div class="card-header bg-warning d-flex justify-content-between align-items-center">
                    <strong><i class="fas fa-allergies me-2"></i>Alergias ({{ $patient->allergies->count() }})</strong>
                    <a href="{{ route('allergies.index', $userId) }}" class="btn btn-sm btn-dark">
                        <i class="fas fa-list me-1"></i>Gestionar Alergias
                    </a>
                </div>
                <div class="card-body">
                    @if($patient->allergies->isEmpty())
                        <p class="text-muted mb-0"><i class="fas fa-info-circle me-2"></i>Sin alergias registradas</p>
                    @else
                        <ul class="list-group list-group-flush">
                            @foreach($patient->allergies->take(3) as $a)
                            <li class="list-group-item px-0">
                                <strong>{{ $a->alergeno }}</strong>
                                <span class="badge bg-light text-dark float-end">{{ $a->tipoAlergeno }}</span>
                            </li>
                            @endforeach
                        </ul>
                        @if($patient->allergies->count() > 3)
                            <small class="text-muted">Y {{ $patient->allergies->count() - 3 }} más...</small>
                        @endif
                    @endif
                </div>
            </div>
        </div>

        <div class="col-lg-6">
            <div class="card mb-4 shadow-sm">
                <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                    <strong><i class="fas fa-stethoscope me-2"></i>Consultas ({{ $patient->consultas->count() }})</strong>
                    <a href="{{ route('consultations.index', $userId) }}" class="btn btn-sm btn-light">
                        <i class="fas fa-list me-1"></i>Gestionar Consultas
                    </a>
                </div>
                <div class="card-body">
                    @if($patient->consultas->isEmpty())
                        <p class="text-muted mb-0"><i class="fas fa-info-circle me-2"></i>Sin consultas registradas</p>
                    @else
                        <ul class="list-group list-group-flush">
                            @foreach($patient->consultas->sortByDesc('fecha')->take(3) as $c)
                            <li class="list-group-item px-0">
                                <div class="d-flex justify-content-between">
                                    <span>{{ \Illuminate\Support\Str::limit($c->descripcion ?? '', 40) }}</span>
                                    <small class="text-muted">{{ $c->fecha }}</small>
                                </div>
                            </li>
                            @endforeach
                        </ul>
                        @if($patient->consultas->count() > 3)
                            <small class="text-muted">Y {{ $patient->consultas->count() - 3 }} más...</small>
                        @endif
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
