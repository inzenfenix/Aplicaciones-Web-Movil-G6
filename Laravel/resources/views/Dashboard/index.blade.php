@extends('layouts.app')

@section('content')
<div class="container py-4">
    <h2 class="mb-4 text-center">Consultas en Tiempo Real</h2>

    <div id="consultas-container" class="d-flex flex-column gap-3"></div>

    <div id="conexion-status" class="text-muted small mt-3 text-center">
        Conectando al WebSocket...
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const wsUrl = 'wss://4hanyg31oi.execute-api.us-east-2.amazonaws.com/dev';
    const ws = new WebSocket(wsUrl);

    const container = document.getElementById('consultas-container');
    const status = document.getElementById('conexion-status');

    const renderConsulta = (consulta) => {
        const card = document.createElement('div');
        card.className = 'alert alert-info shadow-sm mb-0';
        card.innerHTML = `
            <h5 class="mb-2">Nueva Consulta Registrada</h5>
            <p class="mb-1"><strong>Consultor:</strong> ${consulta.idConsultor?.S ?? 'N/A'}</p>
            <p class="mb-1"><strong>Fecha:</strong> ${consulta.fechaHora?.S ?? 'N/A'}</p>
            <p class="mb-1"><strong>Lugar:</strong> ${consulta.lugar?.S ?? 'N/A'}</p>
            <p class="mb-0"><strong>ID Historial:</strong> ${consulta.idHistorialConsulta?.S ?? 'N/A'}</p>
        `;
        container.prepend(card);
    };

    ws.onopen = () => {
        console.log('Conectado a', wsUrl);
        status.textContent = 'Conectado';
        status.classList.remove('text-muted');
        status.classList.add('text-success');
        // Envía mensaje de suscripción si fuese necesario:
        // ws.send(JSON.stringify({ action: 'subscribe', channel: 'consultas' }));
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
        status.textContent = 'Error en la conexión';
        status.classList.remove('text-muted', 'text-success');
        status.classList.add('text-danger');
    };

    ws.onclose = () => {
        console.warn('Conexión cerrada');
        status.textContent = 'Conexión cerrada';
        status.classList.remove('text-success');
        status.classList.add('text-warning');
    };
});
</script>
@endsection