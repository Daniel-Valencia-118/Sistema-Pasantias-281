<?php
// routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\PasanteController;
use App\Http\Controllers\Api\GerenteController;
use App\Http\Controllers\Api\JefeController;
use App\Http\Controllers\Api\TutorController;

// =============================================
// RUTAS PÚBLICAS
// =============================================
Route::post('/login', [AuthController::class, 'login']);

// =============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación y perfil (todos los roles)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // =========================================
    // RUTAS DE ADMINISTRADOR
    // =========================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        // Pasantes
        Route::get('/pasantes', [AdminController::class, 'listarPasantes']);
        Route::post('/pasantes', [AdminController::class, 'crearPasante']);
        Route::put('/pasantes/{id}', [AdminController::class, 'actualizarPasante']);
        Route::patch('/pasantes/{id}/estado', [AdminController::class, 'cambiarEstadoPasante']);
        Route::delete('/pasantes/{id}', [AdminController::class, 'eliminarPasante']);
        
        // Gerentes
        Route::get('/gerentes', [AdminController::class, 'listarGerentes']);
        Route::post('/gerentes', [AdminController::class, 'crearGerente']);
        Route::put('/gerentes/{id}', [AdminController::class, 'actualizarGerente']);
        Route::patch('/gerentes/{id}/estado', [AdminController::class, 'cambiarEstadoGerente']);
        
        // Tutores
        Route::get('/tutores', [AdminController::class, 'listarTutores']);
        Route::post('/tutores', [AdminController::class, 'crearTutor']);
        Route::put('/tutores/{id}', [AdminController::class, 'actualizarTutor']);
        Route::patch('/tutores/{id}/estado', [AdminController::class, 'cambiarEstadoTutor']);
        
        // Administradores
        Route::get('/administradores', [AdminController::class, 'listarAdministradores']);
        Route::post('/administradores', [AdminController::class, 'crearAdministrador']);
        Route::patch('/administradores/{id}/estado', [AdminController::class, 'cambiarEstadoAdministrador']);
        
        // Asignaciones
        Route::post('/asignar-pasante-tutor', [AdminController::class, 'asignarPasanteATutor']);
        
        // Listar todos los usuarios
        Route::get('/usuarios', [AdminController::class, 'listarTodosUsuarios']);
    });
    
    // =========================================
    // RUTAS DE PASANTE (Estudiante)
    // =========================================
    Route::middleware('role:pasante')->prefix('pasante')->group(function () {
        // Pasantías
        Route::get('/pasantias', [PasanteController::class, 'listarPasantias']);
        Route::get('/pasantias/{id}', [PasanteController::class, 'verPasantia']);
        
        // Inscripciones
        Route::post('/inscribirse', [PasanteController::class, 'inscribirse']);
        Route::get('/mis-inscripciones', [PasanteController::class, 'misInscripciones']);
        
        // Bitácora (solo lectura)
        Route::get('/bitacora', [PasanteController::class, 'verBitacora']);
        
        // Calificaciones
        Route::post('/calificar', [PasanteController::class, 'calificarPasantia']);
        Route::get('/mis-calificaciones', [PasanteController::class, 'misCalificaciones']);
    });
    
    // ==========================================
    // RUTAS DE GERENTE
    // =========================================
    Route::middleware('role:gerente')->prefix('gerente')->group(function () {
        // Empresa
        Route::get('/mi-empresa', [GerenteController::class, 'miEmpresa']);
        Route::put('/mi-empresa', [GerenteController::class, 'actualizarEmpresa']);
        
        // Pasantías
        Route::get('/pasantias', [GerenteController::class, 'listarPasantias']);
        Route::post('/pasantias', [GerenteController::class, 'crearPasantia']);
        Route::put('/pasantias/{id}', [GerenteController::class, 'actualizarPasantia']);
        Route::delete('/pasantias/{id}', [GerenteController::class, 'eliminarPasantia']);
        
        // Jefes
        Route::get('/jefes', [GerenteController::class, 'listarJefes']);
        Route::post('/jefes', [GerenteController::class, 'crearJefe']);
        
        // Asignaciones
        Route::post('/asignar-jefe', [GerenteController::class, 'asignarJefeAPasantes']);
        
        // Listar pasantes de mi empresa.
        Route::get('/pasantes', [GerenteController::class, 'listarPasantes']);
    });
    
    // =========================================
    // RUTAS DE JEFE DE PASANTE
    // =========================================
    Route::middleware('role:jefe')->prefix('jefe')->group(function () {
        Route::get('/mis-pasantes', [JefeController::class, 'misPasantes']);
        Route::get('/bitacora/{idPasante}', [JefeController::class, 'verBitacoraPasante']);
        Route::post('/evaluar', [JefeController::class, 'evaluarActividad']);
        Route::post('/mensaje', [JefeController::class, 'enviarMensaje']);
        Route::post('/informe-final', [JefeController::class, 'generarInformeFinal']);
    });
    
    // =========================================
    // RUTAS DE TUTOR
    // =========================================
    Route::middleware('role:tutor')->prefix('tutor')->group(function () {
        Route::get('/mis-pasantes', [TutorController::class, 'misPasantes']);
        Route::get('/bitacora/{idPasante}', [TutorController::class, 'verBitacoraPasante']);
        Route::get('/informe/{idPasante}', [TutorController::class, 'verInformeFinal']);
        Route::post('/informe-final', [TutorController::class, 'generarInformeFinal']);
    });
});