@extends('layouts.app')

@section('content')
<div class="container py-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('patients.index') }}">Pacientes</a></li>
            <li class="breadcrumb-item"><a href="{{ route('patients.show', $userId) }}">Detalle Paciente</a></li>
            <li class="breadcrumb-item"><a href="{{ route('medical-records.edit', $userId) }}">Ficha Médica</a></li>
            <li class="breadcrumb-item"><a href="{{ route('consultations.index', $userId) }}">Consultas</a></li>
            <li class="breadcrumb-item active">Editar Consulta</li>
        </ol>
    </nav>

    <h3 class="mb-4"><i class="fas fa-edit me-2 text-success"></i>Editar Consulta</h3>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('consultations.update', [$userId, $consultation->idConsulta]) }}" method="POST">
        @csrf
        @method('PUT')
        
        {{-- Información Básica --}}
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-success text-white">
                <strong><i class="fas fa-info-circle me-2"></i>Información Básica</strong>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Fecha de Atención *</label>
                        <input type="date" 
                               name="fechaAtencion" 
                               class="form-control @error('fechaAtencion') is-invalid @enderror" 
                               value="{{ old('fechaAtencion', isset($consultation->fechaAtencion) ? substr($consultation->fechaAtencion, 0, 10) : date('Y-m-d')) }}"
                               required>
                        @error('fechaAtencion')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Lugar de Atención</label>
                        <input type="text" 
                               name="lugar" 
                               class="form-control @error('lugar') is-invalid @enderror" 
                               value="{{ old('lugar', $consultation->lugar ?? '') }}"
                               placeholder="Ej: Consultorio, Hospital, Urgencias">
                        @error('lugar')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">Razón de Consulta / Motivo *</label>
                    <textarea name="razonConsulta" 
                              class="form-control @error('razonConsulta') is-invalid @enderror" 
                              rows="4"
                              placeholder="Describa el motivo de la consulta, síntomas principales..."
                              required>{{ old('razonConsulta', $consultation->razonConsulta ?? '') }}</textarea>
                    @error('razonConsulta')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                </div>
            </div>
        </div>

        {{-- Profesional --}}
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white">
                <strong><i class="fas fa-user-md me-2"></i>Profesional Tratante</strong>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Seleccionar Profesional *</label>
                    <select name="idProfesional" 
                            class="form-select @error('idProfesional') is-invalid @enderror" 
                            required>
                        <option value="">-- Seleccione un profesional --</option>
                        @foreach($profesionales as $prof)
                            <option value="{{ $prof->idProfesional }}" 
                                {{ old('idProfesional', $consultation->idProfesional['idProfesional'] ?? '') == $prof->idProfesional ? 'selected' : '' }}>
                                {{ $prof->nombre }} - {{ $prof->especialidad ?? 'N/A' }}
                            </option>
                        @endforeach
                    </select>
                    @error('idProfesional')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    
                    @if(isset($consultation->idProfesional['nombre']))
                        <div class="alert alert-info mt-2 mb-0">
                            <small><strong>Profesional actual:</strong> {{ $consultation->idProfesional['nombre'] }} - {{ $consultation->idProfesional['especialidad'] ?? 'N/A' }}</small>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Diagnósticos --}}
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-warning">
                <strong><i class="fas fa-diagnoses me-2"></i>Diagnósticos</strong>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Seleccionar Diagnósticos (múltiple)</label>
                    <select name="idDiagnosticos[]" 
                            class="form-select @error('idDiagnosticos') is-invalid @enderror" 
                            multiple 
                            size="5">
                        @foreach($diagnosticos as $diag)
                            @php
                                $currentDiagnosticos = old('idDiagnosticos', $consultation->idDiagnosticos ?? []);
                                $isSelected = is_array($currentDiagnosticos) && in_array($diag->idDiagnostico, $currentDiagnosticos);
                            @endphp
                            <option value="{{ $diag->idDiagnostico }}" {{ $isSelected ? 'selected' : '' }}>
                                {{ $diag->codigo ?? '' }} - {{ $diag->descripcion ?? $diag->nombre ?? 'N/A' }}
                            </option>
                        @endforeach
                    </select>
                    <small class="text-muted">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples</small>
                    @error('idDiagnosticos')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    
                    @if(isset($consultation->idDiagnosticos) && !empty($consultation->idDiagnosticos))
                        <div class="alert alert-info mt-2 mb-0">
                            <small><strong>Diagnósticos actuales:</strong> {{ count($consultation->idDiagnosticos) }} seleccionado(s)</small>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Procedimientos --}}
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-info text-white">
                <strong><i class="fas fa-procedures me-2"></i>Procedimientos</strong>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Seleccionar Procedimientos (múltiple)</label>
                    <select name="idProcedimientos[]" 
                            class="form-select @error('idProcedimientos') is-invalid @enderror" 
                            multiple 
                            size="5">
                        @foreach($procedimientos as $proc)
                            @php
                                $currentProcedimientos = old('idProcedimientos', $consultation->idProcedimientos ?? []);
                                $isSelected = is_array($currentProcedimientos) && in_array($proc->idProcedimiento, $currentProcedimientos);
                            @endphp
                            <option value="{{ $proc->idProcedimiento }}" {{ $isSelected ? 'selected' : '' }}>
                                {{ $proc->nombre ?? $proc->descripcion ?? 'N/A' }}
                            </option>
                        @endforeach
                    </select>
                    <small class="text-muted">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples</small>
                    @error('idProcedimientos')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    
                    @if(isset($consultation->idProcedimientos) && !empty($consultation->idProcedimientos))
                        <div class="alert alert-info mt-2 mb-0">
                            <small><strong>Procedimientos actuales:</strong> {{ count($consultation->idProcedimientos) }} seleccionado(s)</small>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        {{-- Recetas --}}
        <div class="card shadow-sm mb-4">
            <div class="card-header bg-danger text-white">
                <strong><i class="fas fa-prescription-bottle me-2"></i>Recetas / Medicamentos</strong>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Seleccionar Recetas (múltiple)</label>
                    <select name="idRecetas[]" 
                            class="form-select @error('idRecetas') is-invalid @enderror" 
                            multiple 
                            size="5">
                        @foreach($recetas as $rec)
                            @php
                                $currentRecetas = old('idRecetas', $consultation->idRecetas ?? []);
                                $isSelected = is_array($currentRecetas) && in_array($rec->idReceta, $currentRecetas);
                            @endphp
                            <option value="{{ $rec->idReceta }}" {{ $isSelected ? 'selected' : '' }}>
                                {{ $rec->medicamento ?? $rec->nombre ?? 'N/A' }} 
                                @if(isset($rec->dosis)) - {{ $rec->dosis }} @endif
                            </option>
                        @endforeach
                    </select>
                    <small class="text-muted">Mantén presionado Ctrl (Windows) o Cmd (Mac) para seleccionar múltiples</small>
                    @error('idRecetas')
                        <div class="invalid-feedback">{{ $message }}</div>
                    @enderror
                    
                    @if(isset($consultation->idRecetas) && !empty($consultation->idRecetas))
                        <div class="alert alert-info mt-2 mb-0">
                            <small><strong>Recetas actuales:</strong> {{ count($consultation->idRecetas) }} seleccionada(s)</small>
                        </div>
                    @endif
                </div>
            </div>
        </div>

        <div class="d-flex gap-2">
            <button type="submit" class="btn btn-success">
                <i class="fas fa-save me-2"></i>Actualizar Consulta
            </button>
            <a href="{{ route('consultations.index', $userId) }}" class="btn btn-secondary">
                <i class="fas fa-times me-2"></i>Cancelar
            </a>
        </div>
    </form>
</div>
@endsection