<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AlergiaController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;


Route::get('/inicio', function () {
    return view('inicio');
})->name('inicio');

Route::get('/', [AuthController::class, 'index'])->name('home');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/logados', [AuthController::class, 'logados'])->name('logados');

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

