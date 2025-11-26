<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HistorialConsultaController extends Controller
{
    public function index()
    {
        return view('HistorialConsultas.getHistorialConsultas');
    }

    public function show($id)
    {
        return view('HistorialConsultas.show', compact('id'));
    }
}