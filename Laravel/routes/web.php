<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\HistorialConsultaController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\MedicalRecordController;
use App\Http\Controllers\AllergyController;
use App\Http\Controllers\ConsultationController;

// Rutas públicas (solo invitados)
Route::middleware('guest')->group(function () {
    Route::get('/', function () {
        return view('welcome');
    })->name('home');
    Route::get('/login', [AuthController::class, 'index'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Rutas protegidas (requieren login)
Route::middleware('auth')->group(function () {
    Route::get('/inicio', [AuthController::class, 'logueados'])->name('inicio');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/logout', [AuthController::class, 'logout'])->name('logout.get');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/historialConsultas', [HistorialConsultaController::class, 'index'])->name('historialConsultas.index');

    // Pacientes
    Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('/patients/{userId}', [PatientController::class, 'show'])->name('patients.show');

    // Medical Records - Ficha Médica
    Route::get('/medical-records/{userId}/edit', [MedicalRecordController::class, 'edit'])->name('medical-records.edit');
    Route::put('/medical-records/{userId}', [MedicalRecordController::class, 'update'])->name('medical-records.update');

    // CRUD Alergias
    Route::get('/patients/{userId}/allergies', [AllergyController::class, 'index'])->name('allergies.index');
    Route::get('/patients/{userId}/allergies/create', [AllergyController::class, 'create'])->name('allergies.create');
    Route::post('/patients/{userId}/allergies', [AllergyController::class, 'store'])->name('allergies.store');
    Route::get('/patients/{userId}/allergies/{idAlergia}/edit', [AllergyController::class, 'edit'])->name('allergies.edit');
    Route::put('/patients/{userId}/allergies/{idAlergia}', [AllergyController::class, 'update'])->name('allergies.update');
    Route::delete('/patients/{userId}/allergies/{idAlergia}', [AllergyController::class, 'destroy'])->name('allergies.destroy');

    // CRUD Consultas
    Route::get('/patients/{userId}/consultations', [ConsultationController::class, 'index'])->name('consultations.index');
    Route::get('/patients/{userId}/consultations/create', [ConsultationController::class, 'create'])->name('consultations.create');
    Route::post('/patients/{userId}/consultations', [ConsultationController::class, 'store'])->name('consultations.store');
    Route::get('/patients/{userId}/consultations/{idConsulta}/edit', [ConsultationController::class, 'edit'])->name('consultations.edit');
    Route::put('/patients/{userId}/consultations/{idConsulta}', [ConsultationController::class, 'update'])->name('consultations.update');
    Route::delete('/patients/{userId}/consultations/{idConsulta}', [ConsultationController::class, 'destroy'])->name('consultations.destroy');
});

