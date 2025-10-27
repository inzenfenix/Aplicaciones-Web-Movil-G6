@extends('layouts.app')

@section('content')
<div class="container">
    <h1 class="mb-4">Editar Alergia</h1>

    <form action="{{ route('alergias.update', $alergia->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="mb-3">
            <label for="idAlergia" class="form-label">ID Alergia</label>
            <input type="text" name="idAlergia" class="form-control" value="{{ $alergia->idAlergia }}" disabled>
        </div>

        <div class="mb-3">
            <label for="nombre" class="form-label">Nombre</label>
            <input type="text" name="nombre" class="form-control" value="{{ old('nombre', $alergia->nombre) }}">
            @error('nombre') <small class="text-danger">{{ $message }}</small> @enderror
        </div>

        <div class="mb-3">
            <label for="descripcion" class="form-label">Descripción</label>
            <textarea name="descripcion" class="form-control">{{ old('descripcion', $alergia->descripcion) }}</textarea>
            @error('descripcion') <small class="text-danger">{{ $message }}</small> @enderror
        </div>

        <div class="mb-3">
            <label for="gravedad" class="form-label">Gravedad</label>
            <input type="text" name="gravedad" class="form-control" value="{{ old('gravedad', $alergia->gravedad) }}">
            @error('gravedad') <small class="text-danger">{{ $message }}</small> @enderror
        </div>

        <button type="submit" class="btn btn-success">Actualizar</button>
        <a href="{{ route('alergias.index') }}" class="btn btn-secondary">Cancelar</a>
    </form>
</div>
@endsection
