<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlergiaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

// Rutas públicas (solo invitados)
Route::middleware('guest')->group(function () {
    Route::get('/', [AuthController::class, 'index'])->name('home');
    Route::get('/', [AuthController::class, 'index'])->name('login.form');
    // Ruta para procesar el login (POST)
    Route::post('/login', [AuthController::class, 'login'])->name('login');

});

// Rutas protegidas (requieren login)
Route::middleware('auth')->group(function () {
    // Ruta para la página de inicio (protegida)
    Route::get('/inicio', [AuthController::class, 'logueados'])->name('inicio');

    // Ruta para logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Opcional: Si quieres también una ruta GET para logout
    Route::get('/logout', [AuthController::class, 'logout'])->name('logout.get');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('alergias', AlergiaController::class)->names([
        'index' => 'alergias.index',
        'create' => 'alergias.create',
        'store' => 'alergias.store',
        'show' => 'alergias.show',
        'edit' => 'alergias.edit',
        'update' => 'alergias.update',
        'destroy' => 'alergias.destroy',
    ]);

});

