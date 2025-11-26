@extends('layouts.app')

@section('content')
<div class="container-fluid py-4">
    <!-- Header Section -->
    <div class="row mb-4">
        <div class="col-12 text-center">
            <h1 class="display-5 fw-bold text-primary mb-3">Consultas en Tiempo Real</h1>
            <p class="lead text-muted">Monitoreo en vivo de las consultas médicas registradas en el sistema</p>
        </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-5">
        <div class="col-md-4 mb-3">
            <div class="card statistic-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="statistic-icon bg-primary bg-gradient rounded-circle me-3">
                            <i class="fas fa-heartbeat fa-lg text-white"></i>
                        </div>
                        <div>
                            <h3 class="statistic-number mb-0" id="total-consultas">0</h3>
                            <p class="text-muted mb-0">Consultas Totales</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="card statistic-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="statistic-icon bg-success bg-gradient rounded-circle me-3">
                            <i class="fas fa-user-md fa-lg text-white"></i>
                        </div>
                        <div>
                            <h3 class="statistic-number mb-0" id="consultores-activos">0</h3>
                            <p class="text-muted mb-0">Consultores Activos</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4 mb-3">
            <div class="card statistic-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="statistic-icon bg-info bg-gradient rounded-circle me-3">
                            <i class="fas fa-clock fa-lg text-white"></i>
                        </div>
                        <div>
                            <h3 class="statistic-number mb-0" id="consultas-hoy">0</h3>
                            <p class="text-muted mb-0">Consultas Hoy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Consultas Section -->
    <div class="row">
        <div class="col-12">
            <div class="card border-0 shadow">
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h4 class="card-title mb-0 text-dark">
                            <i class="fas fa-list-alt me-2 text-primary"></i>
                            Últimas Consultas
                        </h4>
                        <div class="connection-status">
                            <span id="conexion-status" class="badge bg-secondary">
                                <span class="status-dot me-1"></span>
                                Conectando...
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div id="consultas-container" class="consultas-list p-3" style="max-height: 500px; overflow-y: auto;">
                        <!-- Las consultas se insertarán aquí dinámicamente -->
                    </div>
                    
                    <!-- Empty State -->
                    <div id="empty-state" class="text-center py-5">
                        <div class="empty-icon mb-3">
                            <i class="fas fa-stethoscope fa-4x text-muted"></i>
                        </div>
                        <h5 class="text-muted">No hay consultas recientes</h5>
                        <p class="text-muted mb-0">Las nuevas consultas aparecerán aquí automáticamente</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const wsUrl = 'wss://bstp8p0fvg.execute-api.us-east-1.amazonaws.com/dev/';
    const ws = new WebSocket(wsUrl);

    const container = document.getElementById('consultas-container');
    const status = document.getElementById('conexion-status');
    const emptyState = document.getElementById('empty-state');
    const totalConsultas = document.getElementById('total-consultas');
    const consultoresActivos = document.getElementById('consultores-activos');
    const consultasHoy = document.getElementById('consultas-hoy');

    let consultasCount = 0;
    let consultoresSet = new Set();
    let consultasHoyCount = 0;

    const updateStats = (consulta) => {
        consultasCount++;
        totalConsultas.textContent = consultasCount;

        // Contar consultores únicos
        const consultorId = consulta.idConsultor?.S;
        if (consultorId && !consultoresSet.has(consultorId)) {
            consultoresSet.add(consultorId);
            consultoresActivos.textContent = consultoresSet.size;
        }

        // Contar consultas de hoy (simulado)
        const fechaConsulta = consulta.fechaHora?.S;
        if (fechaConsulta && fechaConsulta.includes(new Date().toISOString().split('T')[0])) {
            consultasHoyCount++;
            consultasHoy.textContent = consultasHoyCount;
        }
    };

    const renderConsulta = (consulta) => {
        emptyState.style.display = 'none';
        
        const consultaElement = document.createElement('div');
        consultaElement.className = 'consulta-item card mb-3 border-start border-4 border-primary';
        consultaElement.innerHTML = `
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <div class="d-flex align-items-center mb-2">
                            <span class="badge bg-primary me-2">
                                <i class="fas fa-plus-circle me-1"></i>
                                Nueva Consulta
                            </span>
                            <small class="text-muted">
                                <i class="fas fa-clock me-1"></i>
                                ${new Date().toLocaleTimeString()}
                            </small>
                        </div>
                        <div class="row">
                            <div class="col-sm-6 col-lg-3 mb-2">
                                <small class="text-muted d-block">Consultor</small>
                                <strong><i class="fas fa-user-md me-1 text-primary"></i>${consulta.idConsultor?.S ?? 'N/A'}</strong>
                            </div>
                            <div class="col-sm-6 col-lg-3 mb-2">
                                <small class="text-muted d-block">Fecha y Hora</small>
                                <strong><i class="fas fa-calendar me-1 text-success"></i>${consulta.fechaHora?.S ?? 'N/A'}</strong>
                            </div>
                            <div class="col-sm-6 col-lg-3 mb-2">
                                <small class="text-muted d-block">Lugar</small>
                                <strong><i class="fas fa-map-marker-alt me-1 text-warning"></i>${consulta.lugar?.S ?? 'N/A'}</strong>
                            </div>
                            <div class="col-sm-6 col-lg-3 mb-2">
                                <small class="text-muted d-block">ID Historial</small>
                                <strong><i class="fas fa-id-card me-1 text-info"></i>${consulta.idHistorialConsulta?.S ?? 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Animación de entrada
        consultaElement.style.opacity = '0';
        consultaElement.style.transform = 'translateX(-20px)';
        container.prepend(consultaElement);
        
        // Trigger animation
        setTimeout(() => {
            consultaElement.style.transition = 'all 0.3s ease';
            consultaElement.style.opacity = '1';
            consultaElement.style.transform = 'translateX(0)';
        }, 10);

        // Actualizar estadísticas
        updateStats(consulta);
    };

    ws.onopen = () => {
        console.log('Conectado a', wsUrl);
        status.innerHTML = '<span class="status-dot me-1"></span>Conectado';
        status.className = 'badge bg-success';
    };

    ws.onmessage = (event) => {
        console.log('Mensaje recibido:', event.data);

        let payload;
        try {
            payload = JSON.parse(event.data);
        } catch (error) {
            console.error('No se pudo parsear la respuesta:', error);
            return;
        }

        const records = Array.isArray(payload) ? payload : payload.Records || [];
        if (!records.length) return;

        records.forEach(record => {
            const accion = record.action ?? record.eventName ?? '';
            const newImage = record.newImage ?? record.dynamodb?.NewImage ?? null;

            if (accion === 'INSERT' && newImage) {
                renderConsulta(newImage);
            }
        });
    };

    ws.onerror = (error) => {
        console.error('Error de WebSocket:', error);
        status.innerHTML = '<span class="status-dot me-1"></span>Error en la conexión';
        status.className = 'badge bg-danger';
    };

    ws.onclose = () => {
        console.warn('Conexión cerrada');
        status.innerHTML = '<span class="status-dot me-1"></span>Conexión cerrada';
        status.className = 'badge bg-warning';
    };
});
</script>

<style>
/* Estilos personalizados para complementar Bootstrap */
.statistic-card {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.statistic-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.statistic-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.statistic-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #2c3e50;
}

.consultas-list {
    background-color: #f8f9fa;
}

.consulta-item {
    transition: all 0.3s ease;
    animation: slideIn 0.3s ease-out;
}

.consulta-item:hover {
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transform: translateY(-2px);
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
}

.empty-icon {
    opacity: 0.5;
}

/* Animaciones */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .display-5 {
        font-size: 2rem;
    }
    
    .statistic-number {
        font-size: 2rem;
    }
    
    .statistic-icon {
        width: 50px;
        height: 50px;
    }
    
    .consulta-item .btn {
        width: 100%;
        margin-bottom: 0.5rem;
    }
}
</style>
@endsection