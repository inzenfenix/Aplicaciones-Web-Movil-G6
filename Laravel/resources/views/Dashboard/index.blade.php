@extends('layouts.app')

@section('content')
@php
    $labels = array_keys($counts ?? []);
    $data = array_values($counts ?? []);
    $genderLabels = array_keys($genderCounts ?? []);
    $genderData = array_values($genderCounts ?? []);
    $monthlyData = $monthlyConsultations ?? array_fill(0, 12, 0);
    $allergyLabels = array_keys($allergyCounts ?? []);
    $allergyData = array_values($allergyCounts ?? []);
@endphp

<div class="container-fluid py-4">
    <!-- Header -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h1 class="h3 fw-bold text-primary mb-1">Dashboard Médico</h1>
                    <p class="text-muted mb-0">Resumen estadístico de consultas y pacientes</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Primera Fila: 2 Gráficos -->
    <div class="row mb-4">
        <!-- Gráfico 1: Consultas Mensuales -->
        <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-chart-line text-primary me-2"></i>
                        Consultas Mensuales ({{ date('Y') }})
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-container small-chart">
                        <canvas id="consultasMensualesChart"></canvas>
                    </div>
                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            <strong>Total del año:</strong> {{ array_sum($monthlyData) }} consultas
                        </small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráfico 2: Distribución por Especialidad -->
        <div class="col-md-6 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-pie-chart text-success me-2"></i>
                        Distribución por Especialidad
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-container medium-chart">
                        <canvas id="especialidadesChart"></canvas>
                    </div>
                    <div id="especialidadesLegend" class="d-flex flex-wrap gap-2 mt-3"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Segunda Fila: 3 Gráficos -->
    <div class="row">
        <!-- Gráfico 3: Consultas por Consultor -->
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-user-md text-info me-2"></i>
                        Top Consultores
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-container small-chart">
                        <canvas id="consultoresChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Gráfico 4: Tipos de Alergias -->
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-allergies text-warning me-2"></i>
                        Tipos de Alergias
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-container small-chart">
                        <canvas id="alergiasChart"></canvas>
                    </div>
                    @if(array_sum($allergyData) > 0)
                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            <strong>Total:</strong> {{ array_sum($allergyData) }} alergias registradas
                        </small>
                    </div>
                    @endif
                </div>
            </div>
        </div>

        <!-- Gráfico 5: Distribución por Género -->
        <div class="col-md-4 mb-4">
            <div class="card border-0 shadow-sm h-100">
                <div class="card-header bg-white py-3">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-venus-mars text-danger me-2"></i>
                        Distribución por Género
                    </h5>
                </div>
                <div class="card-body">
                    <div class="chart-container small-chart">
                        <canvas id="generoChart"></canvas>
                    </div>
                    <div class="mt-3">
                        <div class="d-flex justify-content-around text-center">
                            <div>
                                <div class="fs-5 fw-bold text-primary">{{ $genderCounts['Masculino'] ?? 0 }}</div>
                                <small class="text-muted">Masculino</small>
                            </div>
                            <div>
                                <div class="fs-5 fw-bold text-danger">{{ $genderCounts['Femenino'] ?? 0 }}</div>
                                <small class="text-muted">Femenino</small>
                            </div>
                            @if(($genderCounts['Otro'] ?? 0) > 0)
                            <div>
                                <div class="fs-5 fw-bold text-secondary">{{ $genderCounts['Otro'] ?? 0 }}</div>
                                <small class="text-muted">Otro</small>
                            </div>
                            @endif
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const labelsFromServer = {!! json_encode($labels) !!};
    const dataFromServer = {!! json_encode($data) !!};
    const genderLabelsFromServer = {!! json_encode($genderLabels) !!};
    const genderDataFromServer = {!! json_encode($genderData) !!};
    const monthlyDataFromServer = {!! json_encode($monthlyData) !!};
    const allergyLabelsFromServer = {!! json_encode($allergyLabels) !!};
    const allergyDataFromServer = {!! json_encode($allergyData) !!};

    // Colores consistentes
    const colors = {
        primary: 'rgba(54, 162, 235, 0.8)',
        secondary: 'rgba(75, 192, 192, 0.8)',
        success: 'rgba(75, 192, 192, 0.8)',
        danger: 'rgba(255, 99, 132, 0.8)',
        warning: 'rgba(255, 159, 64, 0.8)',
        info: 'rgba(153, 102, 255, 0.8)',
        light: 'rgba(201, 203, 207, 0.8)',
        orange: 'rgba(255, 140, 0, 0.8)',
        pink: 'rgba(255, 105, 180, 0.8)'
    };

    const borderColors = {
        primary: 'rgb(54, 162, 235)',
        secondary: 'rgb(75, 192, 192)',
        success: 'rgb(75, 192, 192)',
        danger: 'rgb(255, 99, 132)',
        warning: 'rgb(255, 159, 64)',
        info: 'rgb(153, 102, 255)',
        light: 'rgb(201, 203, 207)',
        orange: 'rgb(255, 140, 0)',
        pink: 'rgb(255, 105, 180)'
    };

    // opciones comunes para charts reducidos
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        layout: { padding: 8 }
    };

    // Gráfico 1: Consultas Mensuales (línea) - DATOS REALES
    const ctx1 = document.getElementById('consultasMensualesChart').getContext('2d');
    new Chart(ctx1, {
        type: 'line',
        data: {
            labels: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
            datasets: [{
                label: 'Consultas {{ date("Y") }}',
                data: monthlyDataFromServer,
                borderColor: colors.primary,
                backgroundColor: 'rgba(54,162,235,0.08)',
                borderWidth: 2,
                tension: 0.3,
                fill: true
            }]
        },
        options: Object.assign({}, commonOptions, {
            scales: { 
                y: { 
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                } 
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Consultas: ' + context.parsed.y;
                        }
                    }
                }
            }
        })
    });

    // Gráfico 2: Distribución por Especialidad (Dona)
    const ctx2 = document.getElementById('especialidadesChart').getContext('2d');
    const especialidadesChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: labelsFromServer.length ? labelsFromServer : ['Sin datos'],
            datasets: [{
                data: dataFromServer.length ? dataFromServer : [1],
                backgroundColor: (function(n){
                    const pool = [colors.primary, colors.success, colors.warning, colors.danger, colors.info, colors.secondary, colors.light];
                    const out = [];
                    for (let i=0;i<n;i++) out.push(pool[i % pool.length]);
                    return out;
                })(Math.max(labelsFromServer.length, 1)),
                borderColor: (function(n){
                    const pool = [borderColors.primary, borderColors.success, borderColors.warning, borderColors.danger, borderColors.info, borderColors.secondary, borderColors.light];
                    const out = [];
                    for (let i=0;i<n;i++) out.push(pool[i % pool.length]);
                    return out;
                })(Math.max(labelsFromServer.length, 1)),
                borderWidth: 1
            }]
        },
        options: Object.assign({}, commonOptions, {
            plugins: { legend: { display: false }, tooltip: { enabled: true } }
        })
    });

    // Construir leyenda HTML personalizada
    (function buildLegend() {
        const container = document.getElementById('especialidadesLegend');
        if (!container) return;
        container.innerHTML = '';
        const labels = especialidadesChart.data.labels || [];
        const data = especialidadesChart.data.datasets[0].data || [];
        const colorsBg = especialidadesChart.data.datasets[0].backgroundColor || [];

        labels.forEach((lab, i) => {
            const item = document.createElement('div');
            item.className = 'd-flex align-items-center me-3 mb-2 legend-item';
            item.style.gap = '8px';

            const box = document.createElement('span');
            box.style.display = 'inline-block';
            box.style.width = '12px';
            box.style.height = '12px';
            box.style.borderRadius = '3px';
            box.style.background = colorsBg[i] || '#ccc';
            box.style.border = '1px solid rgba(0,0,0,0.06)';

            const text = document.createElement('small');
            text.className = 'text-muted';
            text.textContent = `${lab} (${data[i] ?? 0})`;

            item.appendChild(box);
            item.appendChild(text);
            container.appendChild(item);
        });
    })();

    // Gráfico 3: Top Consultores (Barras Horizontales)
    const ctx3 = document.getElementById('consultoresChart').getContext('2d');
    new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: ['Dr. Pérez','Dra. García','Dr. López','Dra. Martínez','Dr. Rodríguez'],
            datasets: [{ label: 'Consultas', data: [45,38,32,28,25], backgroundColor: colors.info, borderColor: borderColors.info, borderWidth: 1 }]
        },
        options: Object.assign({}, commonOptions, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } })
    });

    // Gráfico 4: Tipos de Alergias (Polar Area) - DATOS REALES
    const ctx4 = document.getElementById('alergiasChart').getContext('2d');
    new Chart(ctx4, {
        type: 'polarArea',
        data: { 
            labels: allergyLabelsFromServer.length ? allergyLabelsFromServer : ['Sin datos'],
            datasets: [{ 
                data: allergyDataFromServer.length ? allergyDataFromServer : [1],
                backgroundColor: (function(n){
                    const pool = [colors.warning, colors.danger, colors.info, colors.success, colors.primary, colors.orange, colors.pink];
                    const out = [];
                    for (let i=0;i<n;i++) out.push(pool[i % pool.length]);
                    return out;
                })(Math.max(allergyLabelsFromServer.length, 1)),
                borderColor: (function(n){
                    const pool = [borderColors.warning, borderColors.danger, borderColors.info, borderColors.success, borderColors.primary, borderColors.orange, borderColors.pink];
                    const out = [];
                    for (let i=0;i<n;i++) out.push(pool[i % pool.length]);
                    return out;
                })(Math.max(allergyLabelsFromServer.length, 1)),
                borderWidth: 1 
            }] 
        },
        options: Object.assign({}, commonOptions, { 
            plugins: { 
                legend: { 
                    position: 'bottom',
                    display: true,
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: { size: 10 }
                    }
                } 
            },
            scales: {
                r: {
                    ticks: { stepSize: 1 }
                }
            }
        })
    });

    // Gráfico 5: Distribución por Género (Barras)
    const ctx5 = document.getElementById('generoChart').getContext('2d');
    new Chart(ctx5, {
        type: 'bar',
        data: { 
            labels: genderLabelsFromServer,
            datasets: [{ 
                label: 'Pacientes por Género', 
                data: genderDataFromServer,
                backgroundColor: [colors.primary, colors.danger, colors.light],
                borderColor: [borderColors.primary, borderColors.danger, borderColors.light],
                borderWidth: 1 
            }] 
        },
        options: Object.assign({}, commonOptions, { 
            plugins: { legend: { display: false } }, 
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } 
        })
    });
});
</script>

<style>
.card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
.card:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; }
.card-header { border-bottom: 1px solid rgba(0,0,0,0.05); }
.card-title { font-size: 1rem; font-weight: 600; }

/* Chart container sizes */
.chart-container { width: 100%; position: relative; }
.small-chart { height: 180px; }
.medium-chart { height: 220px; }

/* Legend styling */
#especialidadesLegend { max-height: 120px; overflow-y: auto; padding-right: 6px; }
.legend-item small { display: inline-block; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Ajustes responsive */
@media (max-width: 992px) {
    .small-chart { height: 160px; }
    .medium-chart { height: 200px; }
}
@media (max-width: 576px) {
    .small-chart { height: 140px; }
    .medium-chart { height: 160px; }
    .legend-item small { max-width: 140px; }
}
</style>
@endsection