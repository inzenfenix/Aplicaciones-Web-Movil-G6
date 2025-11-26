@extends('layouts.app')

@section('content')
<div class="container py-4">
    <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="{{ route('patients.index') }}">Pacientes</a></li>
            <li class="breadcrumb-item"><a href="{{ route('patients.show', $userId) }}">Detalle Paciente</a></li>
            <li class="breadcrumb-item"><a href="{{ route('medical-records.edit', $userId) }}">Ficha Médica</a></li>
            <li class="breadcrumb-item"><a href="{{ route('allergies.index', $userId) }}">Alergias</a></li>
            <li class="breadcrumb-item active">Nueva Alergia</li>
        </ol>
    </nav>

    <h3 class="mb-4"><i class="fas fa-plus-circle me-2 text-warning"></i>Registrar Nueva Alergia</h3>

    @if($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <div class="card shadow-sm">
        <div class="card-header bg-warning">
            <strong>Información de la Alergia</strong>
        </div>
        <div class="card-body">
            <form action="{{ route('allergies.store', $userId) }}" method="POST">
                @csrf
                
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Alérgeno *</label>
                        <input type="text" 
                               name="alergeno" 
                               class="form-control @error('alergeno') is-invalid @enderror" 
                               value="{{ old('alergeno') }}"
                               placeholder="Ej: Polen, Penicilina, Mariscos"
                               required>
                        @error('alergeno')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>

                    <div class="col-md-6 mb-3">
                        <label class="form-label">Tipo de Alérgeno *</label>
                        <select name="tipoAlergeno" class="form-select @error('tipoAlergeno') is-invalid @enderror" required>
                            <option value="">Seleccione un tipo</option>
                            <option value="Ambiental" {{ old('tipoAlergeno') == 'Ambiental' ? 'selected' : '' }}>Ambiental</option>
                            <option value="Medicamento" {{ old('tipoAlergeno') == 'Medicamento' ? 'selected' : '' }}>Medicamento</option>
                            <option value="Alimento" {{ old('tipoAlergeno') == 'Alimento' ? 'selected' : '' }}>Alimento</option>
                            <option value="Contacto" {{ old('tipoAlergeno') == 'Contacto' ? 'selected' : '' }}>Contacto</option>
                            <option value="Otro" {{ old('tipoAlergeno') == 'Otro' ? 'selected' : '' }}>Otro</option>
                        </select>
                        @error('tipoAlergeno')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                </div>

                <div class="d-flex gap-2 mt-4">
                    <button type="submit" class="btn btn-warning">
                        <i class="fas fa-save me-2"></i>Guardar Alergia
                    </button>
                    <a href="{{ route('allergies.index', $userId) }}" class="btn btn-secondary">
                        <i class="fas fa-times me-2"></i>Cancelar
                    </a>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection