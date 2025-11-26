@extends('layouts.app')

@section('content')
<div class="container py-4">
    <h2 class="mb-4 text-center">Historial de Consultas</h2>

    <!-- Filtro por ID -->
    <div class="card mb-4">
        <div class="card-body">
            <div class="row">
                <div class="col-md-8">
                    <input 
                        type="text" 
                        id="consultaId" 
                        class="form-control" 
                        placeholder="Ingrese ID de consulta para buscar..."
                    >
                </div>
                <div class="col-md-4">
                    <button onclick="buscarPorId()" class="btn btn-primary w-100">
                        Buscar por ID
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Contenedor de consultas -->
    <div id="consultas-container" class="row g-3"></div>

    <!-- Estado de carga -->
    <div id="loading-status" class="text-center mt-4">
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
        </div>
    </div>

    <div id="error-status" class="alert alert-danger mt-4" style="display: none;"></div>
</div>

<script>
const API_BASE = 'https://34lte9hcq6.execute-api.us-east-1.amazonaws.com';

const loading = document.getElementById('loading-status');
const errorDiv = document.getElementById('error-status');
const container = document.getElementById('consultas-container');

// Renderizar una consulta
function renderConsulta(consulta) {
    return `
        <div class="col-md-6 col-lg-4">
            <div class="card shadow-sm h-100">
                <div class="card-header bg-primary text-white">
                    <strong>ID:</strong> ${consulta.idHistorialConsulta || 'N/A'}
                </div>
                <div class="card-body">
                    <p class="mb-2"><strong>Consultor:</strong> ${consulta.idConsultor || 'N/A'}</p>
                    <p class="mb-2"><strong>Usuario:</strong> ${consulta.userId || 'N/A'}</p>
                    <p class="mb-2"><strong>Fecha:</strong> ${consulta.fechaHora || 'N/A'}</p>
                    <p class="mb-0"><strong>Lugar:</strong> ${consulta.lugar || 'N/A'}</p>
                </div>
            </div>
        </div>
    `;
}

// Cargar todas las consultas
async function cargarConsultas() {
    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        container.innerHTML = '';

        const response = await fetch(`${API_BASE}/HistoricConsultations`);
        
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        
        const data = await response.json();
        const consultas = Array.isArray(data) ? data : data.Items || [];

        if (!consultas.length) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">No hay consultas disponibles</p></div>';
            return;
        }

        container.innerHTML = consultas.map(renderConsulta).join('');
    } catch (error) {
        console.error('Error cargando consultas:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Buscar consulta por ID
async function buscarPorId() {
    const id = document.getElementById('consultaId').value.trim();
    
    if (!id) {
        alert('Por favor ingrese un ID');
        return;
    }

    try {
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        container.innerHTML = '';

        const response = await fetch(`${API_BASE}/HistoricConsultations/${id}`);
        
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        
        const consulta = await response.json();
        
        container.innerHTML = renderConsulta(consulta);
    } catch (error) {
        console.error('Error buscando consulta:', error);
        errorDiv.textContent = `Error: ${error.message}`;
        errorDiv.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

// Cargar consultas al iniciar
document.addEventListener('DOMContentLoaded', cargarConsultas);

fetch('https://34lte9hcq6.execute-api.us-east-1.amazonaws.com/HistoricConsultations')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
</script>
@endsection