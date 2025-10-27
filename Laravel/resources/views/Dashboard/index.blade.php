@extends('layouts.app')
@section('content')
    
<div class="dashboard-container">
    <!-- Título del dashboard -->
    <h1 class="dashboard-title">Dashboard General</h1>
    
    <div class="top-row">
        <div class="chart-large">
            <div class="chart-content">
                <canvas id="chart1"></canvas>
            </div>
        </div>
        <div class="chart-large">
            <div class="chart-content">
                <canvas id="chart2"></canvas>
            </div>
        </div>
    </div>
    <div class="bottom-row">
        <div class="chart-small">
            <div class="chart-content">
                <canvas id="chart3"></canvas>
            </div>
        </div>
        <div class="chart-small">
            <div class="chart-content">
                <canvas id="chart4"></canvas>
            </div>
        </div>
        <div class="chart-small">
            <div class="chart-content">
                <canvas id="chart5"></canvas>
            </div>
        </div>
    </div>
</div>

<!-- Incluir Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function () {
    // Datos para el gráfico 1 (Alergias) - Estos vendrían del controlador
    const alergiasData = {!! json_encode($alergiasData) !!};

    const charts = [
        { 
            id: 'chart1', 
            type: 'bar', 
            data: alergiasData.cantidades,
            labels: alergiasData.gravedades,
            title: 'Distribución de Alergias por Gravedad'
        },
        { 
            id: 'chart2', 
            type: 'line', 
            data: [5, 10, 8, 12, 6],
            labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
            title: 'Tendencia Semanal'
        },
        { 
            id: 'chart3', 
            type: 'pie', 
            data: [10, 20, 30, 15, 25],
            labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D', 'Producto E'],
            title: 'Distribución de Productos'
        },
        { 
            id: 'chart4', 
            type: 'doughnut', 
            data: [60, 40, 30, 20],
            labels: ['Norte', 'Sur', 'Este', 'Oeste'],
            title: 'Distribución Geográfica'
        },
        { 
            id: 'chart5', 
            type: 'radar', 
            data: [80, 60, 90, 70, 85],
            labels: ['Calidad', 'Precio', 'Servicio', 'Innovación', 'Soporte'],
            title: 'Evaluación de Servicios'
        }
    ];

    charts.forEach(chart => {
        const ctx = document.getElementById(chart.id).getContext('2d');
        new Chart(ctx, {
            type: chart.type,
            data: {
                labels: chart.labels,
                datasets: [{
                    label: chart.id === 'chart1' ? 'Cantidad de Alergias' : 'Datos',
                    data: chart.data,
                    backgroundColor: chart.id === 'chart1' ? [
                        'rgba(255, 99, 132, 0.6)',   // Leve - Rojo
                        'rgba(255, 159, 64, 0.6)',   // Moderada - Naranja
                        'rgba(255, 205, 86, 0.6)',   // Grave - Amarillo
                        'rgba(75, 192, 192, 0.6)',   // Muy Grave - Verde
                        'rgba(54, 162, 235, 0.6)'    // Crítica - Azul
                    ] : [
                        'rgba(0, 123, 255, 0.6)',
                        'rgba(40, 167, 69, 0.6)',
                        'rgba(255, 193, 7, 0.6)',
                        'rgba(220, 53, 69, 0.6)',
                        'rgba(111, 66, 193, 0.6)'
                    ],
                    borderColor: chart.id === 'chart1' ? [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)'
                    ] : [
                        'rgba(0, 123, 255, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)',
                        'rgba(111, 66, 193, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { 
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            color: '#333',
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: chart.title,
                        color: '#333',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: chart.type !== 'pie' && chart.type !== 'doughnut' ? {
                    y: { 
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: '#333',
                            callback: function(value) {
                                if (chart.id === 'chart1') {
                                    return value + ' alergias';
                                }
                                return value;
                            }
                        },
                        title: {
                            display: chart.id === 'chart1',
                            text: 'Cantidad de Alergias',
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            color: '#333'
                        },
                        title: {
                            display: chart.id === 'chart1',
                            text: 'Niveles de Gravedad',
                            color: '#333',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        }
                    }
                } : {}
            }
        });
    });
});
</script>

<style>
.dashboard-container {
    padding: 20px;
    background-color: #f8f9fa;
    min-height: calc(100vh - 60px);
}

.dashboard-title {
    text-align: center;
    color: #007bff;
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 30px;
    padding-bottom: 15px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.top-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
}

.bottom-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
}

.chart-large {
    background: white;
    color: white;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    padding: 15px;
    position: relative;
}

.chart-small {
    background: white;
    color: white;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    padding: 15px;
    position: relative;
}

.chart-content {
    width: 100%;
    height: 100%;
    position: relative;
}

.chart-content canvas {
    width: 100% !important;
    height: 100% !important;
}

/* Colores de fondo para cada gráfico */
.chart-large:nth-child(1) { border-left: 4px solid #007bff; }
.chart-large:nth-child(2) { border-left: 4px solid #28a745; }
.chart-small:nth-child(1) { border-left: 4px solid #ffc107; }
.chart-small:nth-child(2) { border-left: 4px solid #dc3545; }
.chart-small:nth-child(3) { border-left: 4px solid #6f42c1; }

/* Responsive */
@media (max-width: 1024px) {
    .bottom-row {
        grid-template-columns: 1fr 1fr;
    }
}

@media (max-width: 768px) {
    .dashboard-title {
        font-size: 2rem;
        margin-bottom: 20px;
    }
    
    .top-row {
        grid-template-columns: 1fr;
    }
    
    .bottom-row {
        grid-template-columns: 1fr;
    }
    
    .chart-large {
        height: 350px;
    }
    
    .chart-small {
        height: 300px;
    }
}

@media (max-width: 480px) {
    .dashboard-title {
        font-size: 1.75rem;
        margin-bottom: 15px;
    }
    
    .chart-large {
        height: 300px;
    }
    
    .chart-small {
        height: 250px;
    }
    
    .dashboard-container {
        padding: 10px;
    }
}
</style>
@endsection