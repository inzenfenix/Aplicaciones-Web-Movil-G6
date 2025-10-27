@extends('layouts.app')

@section('content')
<div class="container">
    <h1 class="mb-4">Detalle de Alergia</h1>

    <div class="card">
        <div class="card-body">
            <h5 class="card-title">{{ $alergia->nombre }} ({{ $alergia->idAlergia }})</h5>
            <p><strong>Descripción:</strong> {{ $alergia->descripcion ?? '-' }}</p>
            <p><strong>Gravedad:</strong> {{ $alergia->gravedad ?? '-' }}</p>
        </div>
    </div>

    <a href="{{ route('alergias.index') }}" class="btn btn-secondary mt-3">Volver al listado</a>
</div>
@endsection
