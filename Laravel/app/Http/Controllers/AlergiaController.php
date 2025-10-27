<?php

namespace App\Http\Controllers;

use App\Models\Alergia;
use Illuminate\Http\Request;

class AlergiaController extends Controller
{
    public function index()
    {
        $alergias = Alergia::all();
        return view('Alergia.index', compact('alergias'));
    }

    public function create()
    {
        return view('Alergia.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'idAlergia' => 'required|string',
            'nombre' => 'required|string',
            'descripcion' => 'nullable|string',
            'gravedad' => 'nullable|string',
        ]);

        Alergia::create($data);

        return redirect()->route('alergias.index')
                         ->with('success', 'Alergia creada correctamente.');
    }

    public function edit($id)
    {
        $alergia = Alergia::find($id);
        return view('Alergia.edit', compact('alergia'));
    }

    public function update(Request $request, $id)
    {
        $alergia = Alergia::find($id);

        $data = $request->validate([
            'nombre' => 'required|string',
            'descripcion' => 'nullable|string',
            'gravedad' => 'nullable|string',
        ]);

        $alergia->update($data);

        return redirect()->route('alergias.index')
                         ->with('success', 'Alergia actualizada correctamente.');
    }

    public function destroy($id)
    {
        $alergia = Alergia::find($id);
        $alergia->delete();

        return redirect()->route('alergias.index')
                         ->with('success', 'Alergia eliminada correctamente.');
    }
}
