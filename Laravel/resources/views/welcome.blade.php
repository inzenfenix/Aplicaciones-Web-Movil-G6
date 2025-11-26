@extends('layouts.app')

@section('content')
<div class="home-container">
    <!-- Hero Section con Imagen -->
    <section class="hero-section">
        <div class="container-fluid px-0">
            <div class="row g-0 align-items-center min-vh-100">
                <!-- Columna de Contenido -->
                <div class="col-lg-6 px-5 py-5 text-content">
                    <div class="hero-content">
                        <h1 class="display-3 fw-bold text-primary mb-4">
                            Bienvenido a CORA
                        </h1>
                        <p class="lead text-muted mb-4">
                            Sistema integral de gestión médica para el cuidado de tus pacientes.
                        </p>
                        <p class="mb-5">
                            Administra historiales médicos, consultas, diagnósticos y más desde una plataforma moderna y segura.
                        </p>
                        
                        <div class="d-flex gap-3 flex-wrap">
                            <a href="{{ route('login') }}" class="btn btn-primary btn-lg px-5">
                                <i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Columna de Imagen -->
                <div class="col-lg-6 px-0">
                    <div class="hero-image">
                        <img src="{{ asset('images/CORA.png') }}" 
                             alt="Sistema Médico CORA" 
                             class="img-fluid w-100 h-100 object-fit-cover">
                        <div class="image-overlay"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5 bg-light">
        <div class="container py-5">
            <div class="text-center mb-5">
                <h2 class="display-5 fw-bold text-primary mb-3">Características Principales</h2>
                <p class="text-muted lead">Todo lo que necesitas para gestionar tu práctica médica</p>
            </div>

            <div class="row g-4">
                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-file-medical-alt text-primary fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Historiales Médicos</h5>
                            <p class="text-muted">
                                Gestiona de forma completa los historiales de tus pacientes con acceso rápido y seguro.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-calendar-check text-success fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Consultas y Citas</h5>
                            <p class="text-muted">
                                Registra consultas, diagnósticos y tratamientos de manera eficiente.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-chart-pie text-info fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Reportes y Estadísticas</h5>
                            <p class="text-muted">
                                Visualiza métricas importantes con dashboards interactivos y reportes detallados.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-allergies text-warning fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Control de Alergias</h5>
                            <p class="text-muted">
                                Mantén un registro detallado de alergias y condiciones especiales de cada paciente.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-prescription-bottle text-danger fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Recetas Médicas</h5>
                            <p class="text-muted">
                                Genera y gestiona recetas médicas con seguimiento de medicamentos.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="feature-card card border-0 shadow-sm h-100">
                        <div class="card-body text-center p-4">
                            <div class="feature-icon mb-3">
                                <i class="fas fa-cloud text-primary fs-1"></i>
                            </div>
                            <h5 class="fw-bold mb-3">Almacenamiento en la Nube</h5>
                            <p class="text-muted">
                                Datos seguros y accesibles desde cualquier lugar con AWS DynamoDB.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<style>
/* Hero Section */
.hero-section {
    position: relative;
    overflow: hidden;
}

.text-content {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.hero-content {
    max-width: 600px;
    animation: fadeInLeft 0.8s ease-out;
}

.hero-image {
    position: relative;
    min-height: 100vh;
}

.hero-image img {
    animation: fadeInRight 0.8s ease-out;
    object-fit: cover;
}

.image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%);
    pointer-events: none;
}

/* Buttons */
.btn-lg {
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
}

.btn-outline-primary:hover,
.btn-outline-secondary:hover {
    transform: translateY(-2px);
}

/* Stat Cards */
.stat-card {
    text-align: center;
    padding: 1rem;
    transition: transform 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
}

/* Feature Cards */
.feature-card {
    transition: all 0.3s ease;
    border-radius: 15px;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
}

.feature-icon {
    transition: transform 0.3s ease;
}

.feature-card:hover .feature-icon {
    transform: scale(1.1);
}

/* Animations */
@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Responsive */
@media (max-width: 991px) {
    .hero-image {
        min-height: 400px;
    }
    
    .text-content {
        text-align: center;
    }
    
    .hero-content {
        margin: 0 auto;
    }
    
    .d-flex.gap-3 {
        justify-content: center;
    }
    
    .image-overlay {
        background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 50%);
    }
}

@media (max-width: 576px) {
    .display-3 {
        font-size: 2.5rem;
    }
    
    .hero-image {
        min-height: 300px;
    }
    
    .btn-lg {
        width: 100%;
        margin-bottom: 0.5rem;
    }
    
    .d-flex.gap-3 {
        flex-direction: column;
    }
}
</style>
@endsection