@extends('layouts.app')

@section('content')
<div class="container-fluid py-4">
    <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
            <!-- Card del formulario -->
            <div class="card shadow-lg border-0">
                <!-- Header de la card -->
                <div class="card-header bg-gradient-primary text-white py-4">
                    <div class="d-flex align-items-center">
                        <div class="flex-grow-1">
                            <h2 class="h4 mb-0">
                                <i class="fas fa-allergy me-2"></i>
                                Crear Nueva Alergia
                            </h2>
                            <p class="mb-0 opacity-8">Complete la información de la alergia</p>
                        </div>
                        <div class="flex-shrink-0">
                            <div class="bg-white bg-opacity-20 rounded-circle p-2">
                                <i class="fas fa-plus text-white"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Body de la card -->
                <div class="card-body p-4">
                    <form action="{{ route('alergias.store') }}" method="POST" class="needs-validation" novalidate>
                        @csrf
                        
                        <!-- ID Alergia -->
                        <div class="form-group mb-4">
                            <label for="idAlergia" class="form-label fw-semibold text-dark mb-2">
                                <i class="fas fa-id-card text-primary me-2"></i>
                                ID Alergia
                            </label>
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-hashtag text-muted"></i>
                                </span>
                                <input type="text" 
                                       name="idAlergia" 
                                       class="form-control border-start-0 ps-2 @error('idAlergia') is-invalid @enderror" 
                                       value="{{ old('idAlergia') }}"
                                       placeholder="Ej: ALG001"
                                       required>
                            </div>
                            @error('idAlergia')
                                <div class="invalid-feedback d-block mt-2">
                                    <i class="fas fa-exclamation-circle me-1"></i>
                                    {{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Nombre -->
                        <div class="form-group mb-4">
                            <label for="nombre" class="form-label fw-semibold text-dark mb-2">
                                <i class="fas fa-tag text-primary me-2"></i>
                                Nombre de la Alergia
                            </label>
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-pencil-alt text-muted"></i>
                                </span>
                                <input type="text" 
                                       name="nombre" 
                                       class="form-control border-start-0 ps-2 @error('nombre') is-invalid @enderror" 
                                       value="{{ old('nombre') }}"
                                       placeholder="Ej: Alergia al polen"
                                       required>
                            </div>
                            @error('nombre')
                                <div class="invalid-feedback d-block mt-2">
                                    <i class="fas fa-exclamation-circle me-1"></i>
                                    {{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Descripción -->
                        <div class="form-group mb-4">
                            <label for="descripcion" class="form-label fw-semibold text-dark mb-2">
                                <i class="fas fa-file-alt text-primary me-2"></i>
                                Descripción
                            </label>
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-end-0 align-items-start pt-3">
                                    <i class="fas fa-align-left text-muted"></i>
                                </span>
                                <textarea name="descripcion" 
                                          class="form-control border-start-0 ps-2 @error('descripcion') is-invalid @enderror" 
                                          rows="4"
                                          placeholder="Describa los síntomas y características de la alergia..."
                                          required>{{ old('descripcion') }}</textarea>
                            </div>
                            @error('descripcion')
                                <div class="invalid-feedback d-block mt-2">
                                    <i class="fas fa-exclamation-circle me-1"></i>
                                    {{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Gravedad -->
                        <div class="form-group mb-4">
                            <label for="gravedad" class="form-label fw-semibold text-dark mb-2">
                                <i class="fas fa-exclamation-triangle text-primary me-2"></i>
                                Nivel de Gravedad
                            </label>
                            <div class="input-group input-group-lg">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-thermometer-half text-muted"></i>
                                </span>
                                <select name="gravedad" 
                                        class="form-select border-start-0 ps-2 @error('gravedad') is-invalid @enderror" 
                                        required>
                                    <option value="">Seleccione el nivel de gravedad</option>
                                    <option value="leve" {{ old('gravedad') == 'leve' ? 'selected' : '' }}>Leve</option>
                                    <option value="moderada" {{ old('gravedad') == 'moderada' ? 'selected' : '' }}>Moderada</option>
                                    <option value="alta" {{ old('gravedad') == 'alta' ? 'selected' : '' }}>Alta</option>
                                    <option value="grave" {{ old('gravedad') == 'grave' ? 'selected' : '' }}>Grave</option>
                                    <option value="critica" {{ old('gravedad') == 'critica' ? 'selected' : '' }}>Crítica</option>
                                </select>
                            </div>
                            @error('gravedad')
                                <div class="invalid-feedback d-block mt-2">
                                    <i class="fas fa-exclamation-circle me-1"></i>
                                    {{ $message }}
                                </div>
                            @enderror
                        </div>

                        <!-- Botones de acción -->
                        <div class="form-group mt-5 pt-3 border-top">
                            <div class="d-flex gap-3 justify-content-end">
                                <a href="{{ route('alergias.index') }}" class="btn btn-lg btn-outline-secondary px-4">
                                    <i class="fas fa-times me-2"></i>
                                    Cancelar
                                </a>
                                <button type="submit" class="btn btn-lg btn-primary px-4">
                                    <i class="fas fa-save me-2"></i>
                                    Guardar Alergia
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Incluir Font Awesome para los íconos -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

<style>
.card {
    border-radius: 20px;
    border: none;
}

.card-header {
    border-radius: 20px 20px 0 0 !important;
    border: none;
}

.bg-gradient-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.form-control, .form-select {
    border-radius: 12px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    font-size: 1rem;
    padding: 0.75rem 1rem;
}

.form-control:focus, .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    transform: translateY(-2px);
}

.input-group-text {
    border-radius: 12px 0 0 12px;
    border: 2px solid #e9ecef;
    border-right: none;
    background-color: #f8f9fa;
    transition: all 0.3s ease;
}

.form-control.border-start-0 {
    border-left: none;
}

.form-control.border-start-0:focus {
    border-left: none;
    box-shadow: none;
}

.btn {
    border-radius: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-outline-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(108, 117, 125, 0.2);
}

.invalid-feedback {
    font-size: 0.875rem;
    margin-top: 0.5rem;
}

.form-label {
    font-size: 1.1rem;
}

/* Efectos hover para las cards */
.card:hover {
    transform: translateY(-5px);
    transition: all 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
    .container-fluid {
        padding: 1rem;
    }
    
    .card-header .d-flex {
        flex-direction: column;
        text-align: center;
    }
    
    .btn-lg {
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
    }
    
    .input-group-lg {
        flex-direction: column;
    }
    
    .input-group-text {
        border-radius: 12px 12px 0 0;
        border-right: 2px solid #e9ecef;
        border-bottom: none;
    }
    
    .form-control.border-start-0 {
        border-radius: 0 0 12px 12px;
        border-left: 2px solid #e9ecef;
        border-top: none;
    }
}

/* Animación de carga */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.card {
    animation: fadeIn 0.6s ease-out;
}
</style>

<script>
// Validación del formulario
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });

    // Efectos interactivos
    const inputs = document.querySelectorAll('.form-control, .form-select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});
</script>
@endsection