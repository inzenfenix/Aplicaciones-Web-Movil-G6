@extends('layouts.app')

@section('content')
<div class="container">
    <h1 class="mb-4">Lista de Alergias</h1>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    <a href="{{ route('alergias.create') }}" class="btn btn-primary mb-3">Agregar Alergia</a>

    @if(count($alergias) > 0)
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Gravedad</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach($alergias as $alergia)
                <tr>
                    <td>{{ $alergia['idAlergia'] }}</td>
                    <td>{{ $alergia['nombre'] }}</td>
                    <td>{{ $alergia['descripcion'] ?? '-' }}</td>
                    <td>{{ $alergia['gravedad'] ?? '-' }}</td>
                    <td>
                        <a href="{{ route('alergias.show', $alergia['idAlergia']) }}" class="btn btn-info btn-sm">Ver</a>
                        <a href="{{ route('alergias.edit', $alergia['idAlergia']) }}" class="btn btn-warning btn-sm">Editar</a>

                        <form action="{{ route('alergias.destroy', $alergia['idAlergia']) }}" method="POST" style="display:inline-block;">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="btn btn-danger btn-sm" onclick="return confirm('¿Seguro que deseas eliminar esta alergia?')">
                                Eliminar
                            </button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <p>No hay alergias registradas.</p>
    @endif
</div>
@endsection
