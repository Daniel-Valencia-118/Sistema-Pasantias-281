<?php
//routes/api.php
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\GerenteController;
use App\Http\Controllers\Api\Mobile\PasanteController;

Route::get('/mobile/test', function () {
    return response()->json(['message' => '✅ Conexión exitosa con el backend! Yooy el pro']);
});

Route::post('/mobile/login', [AuthController::class, 'login']);

// Grupo para rutas protegidas (requieren autenticación)
Route::middleware(['auth:sanctum'])->group(function () {
    
    Route::post('/mobile/logout', [AuthController::class, 'logout']);
    Route::get('/mobile/user', [AuthController::class, 'user']); // ← AGREGAR ESTA LÍNEA
    
    // Rutas para Gerente
    Route::middleware(['role:gerente'])->prefix('/mobile/gerente')->group(function () {
        Route::get('/estadisticas', [GerenteController::class, 'estadisticas']);
        Route::get('/perfil', [GerenteController::class, 'perfil']);
        Route::put('/perfil', [GerenteController::class, 'actualizarPerfil']);
    });
    
    // Rutas para Pasante
    Route::middleware(['role:pasante'])->prefix('/mobile/pasante')->group(function () {
        Route::get('/info', [PasanteController::class, 'getInfo']);
        Route::get('/perfil', [PasanteController::class, 'perfil']);
        Route::put('/perfil', [PasanteController::class, 'actualizarPerfil']);
    });
});

//Antiguo 
// routes/api.php

// use Illuminate\Support\Facades\Route;
// use App\Http\Controllers\Api\AuthController;
// use App\Http\Controllers\Api\AdminController;
// use App\Http\Controllers\Api\PasanteController;
// use App\Http\Controllers\Api\GerenteController;
// use App\Http\Controllers\Api\JefeController;
// use App\Http\Controllers\Api\TutorController;
// use App\Http\Controllers\Api\InformeFinalController;
// use App\Http\Controllers\Api\RegistroPublicoController;
// use App\Http\Controllers\Api\PresentacionController;

// =============================================
// RUTAS PÚBLICAS
// =============================================
// Route::post('/login', [AuthController::class, 'login']);
// // =============================================
// // RUTAS DE REGISTRO PÚBLICO (sin autenticación)
// // =============================================
// Route::prefix('registro')->group(function () {
//     Route::post('/pasante', [RegistroPublicoController::class, 'registrarPasante']);
//     Route::post('/tutor', [RegistroPublicoController::class, 'registrarTutor']);
//     Route::post('/gerente', [RegistroPublicoController::class, 'registrarGerente']);
//     Route::post('/jefe', [RegistroPublicoController::class, 'registrarJefe']);
// });
// =============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =============================================
// Route::middleware('auth:sanctum')->group(function () {
    
//     // Autenticación y perfil (todos los roles)
//     Route::post('/logout', [AuthController::class, 'logout']);
//     Route::get('/me', [AuthController::class, 'me']);
//     Route::put('/profile', [AuthController::class, 'updateProfile']);
    
//     // =========================================
//     // RUTAS DE ADMINISTRADOR 
//     // =========================================

//     Route::get('/presentacion', [PresentacionController::class, 'show']);

//     Route::middleware('role:admin')->prefix('admin')->group(function () {
//         // mision, vision, logo, nombre sistema, descripción corta
//         Route::put('/admin/presentacion', [PresentacionController::class, 'update']);
//         // Solicitudes
//         Route::get('/solicitudes', [AdminController::class, 'listarSolicitudes']);
//         Route::post('/solicitudes/{id}/aprobar', [AdminController::class, 'aprobarSolicitud']);
//         Route::post('/solicitudes/{id}/rechazar', [AdminController::class, 'rechazarSolicitud']);
//         // Pasantes
//         Route::get('/pasantes', [AdminController::class, 'listarPasantes']);
//         Route::get('/pasantes/{id}', [AdminController::class, 'verPasante']);
//         Route::post('/pasantes', [AdminController::class, 'crearPasante']);
//         Route::put('/pasantes/{id}', [AdminController::class, 'actualizarPasante']);
//         Route::patch('/pasantes/{id}/estado', [AdminController::class, 'cambiarEstadoPasante']);
//         Route::delete('/pasantes/{id}', [AdminController::class, 'eliminarPasante']);
        
//         // Gerentes Gerentes 
//         Route::get('/gerentes', [AdminController::class, 'listarGerentes']);
//         Route::get('/gerentes/{id}', [AdminController::class, 'verGerente']);
//         Route::post('/gerentes', [AdminController::class, 'crearGerente']);
//         Route::put('/gerentes/{id}', [AdminController::class, 'actualizarGerente']);
//         Route::patch('/gerentes/{id}/estado', [AdminController::class, 'cambiarEstadoGerente']); //deshabilita también jefes
        
//         // Tutores
//         Route::get('/tutores', [AdminController::class, 'listarTutores']);
//         Route::get('/tutores/{id}', [AdminController::class, 'verTutor']);
//         Route::post('/tutores', [AdminController::class, 'crearTutor']);
//         Route::put('/tutores/{id}', [AdminController::class, 'actualizarTutor']);
//         Route::patch('/tutores/{id}/estado', [AdminController::class, 'cambiarEstadoTutor']);
        
//         // Administradores
//         Route::get('/administradores', [AdminController::class, 'listarAdministradores']);
//         Route::get('/administradores/{id}', [AdminController::class, 'verAdministrador']); 
//         Route::post('/administradores', [AdminController::class, 'crearAdministrador']);
//         Route::patch('/administradores/{id}/estado', [AdminController::class, 'cambiarEstadoAdministrador']);
        
//         // Asignaciones
//         Route::post('/asignar-pasante-tutor', [AdminController::class, 'asignarPasanteATutor']);
        
//         // Listar todos los usuarios
//         Route::get('/usuarios', [AdminController::class, 'listarTodosUsuarios']);
        
//     });
    
//     // =========================================
//     // RUTAS DE PASANTE (Estudiante)
//     // =========================================
//     Route::middleware('role:pasante')->prefix('pasante')->group(function () {
//         // Pasantías
//         Route::get('/pasantias', [PasanteController::class, 'listarPasantias']);
//         Route::get('/pasantias/{id}', [PasanteController::class, 'verPasantia']);
//         Route::get('/estado-pasantia', [PasanteController::class, 'obtenerEstadoPasantia']);     
        
//         // Inscripciones
//         Route::post('/inscribirse', [PasanteController::class, 'inscribirse']);
//         Route::get('/mis-inscripciones', [PasanteController::class, 'misInscripciones']);
        
//         // Bitácora (solo lectura)
//         Route::get('/bitacora', [PasanteController::class, 'verBitacora']);
//         Route::get('/bitacora/{idActividad}', [PasanteController::class, 'verBitacoraPorActividad']);          
//         // Calificaciones
//         Route::post('/calificar', [PasanteController::class, 'calificarPasantia']);
//         // Mensajes
//         Route::get('/mensajes/{idJefe}', [PasanteController::class, 'verMensajesJefe']);        
//         // Informe final (solo si resultado no es null)
//         Route::get('/informe-final/{idInscripcion}', [PasanteController::class, 'verInformeFinal']);       
    
//         //busquedas:
//         Route::get('/buscar', [PasanteController::class, 'busquedaGlobal']); // NUEVO
//         Route::get('/menciones', [PasanteController::class, 'getMenciones']); // NUEVO
//         Route::get('/empresas-activas', [PasanteController::class, 'getEmpresas']); // NUEVO
//     });
    
//     // ==========================================
//     // RUTAS DE GERENTE
//     // =========================================
//     Route::middleware('role:gerente')->prefix('gerente')->group(function () {

//         // Solicitudes de jefes
//         Route::get('/solicitudes-jefes', [GerenteController::class, 'listarSolicitudesJefes']);
//         Route::post('/solicitudes-jefes/{id}/aprobar', [GerenteController::class, 'aprobarJefe']);
//         Route::post('/solicitudes-jefes/{id}/rechazar', [GerenteController::class, 'rechazarJefe']);
//         // Empresa
//         Route::get('/mi-empresa', [GerenteController::class, 'miEmpresa']);
//         Route::put('/mi-empresa', [GerenteController::class, 'actualizarEmpresa']);
        
//         // Pasantías
//         Route::get('/pasantias', [GerenteController::class, 'listarPasantias']); //incluye actividades e inscripciones
//         Route::get('/pasantias/{id}', [GerenteController::class, 'verPasantia']); 
//         Route::get('/estado-pasantia', [GerenteController::class, 'obtenerEstadoPasantia']); 
//         Route::post('/pasantias', [GerenteController::class, 'crearPasantia']);
//         Route::put('/pasantias/{id}', [GerenteController::class, 'actualizarPasantia']);
//         Route::delete('/pasantias/{id}', [GerenteController::class, 'eliminarPasantia']);
//         // Cambiar estado de una pasantía
//         Route::put('/pasantias/{id}/estado', [GerenteController::class, 'cambiarEstadoPasantia']);      
        
//         //actividades
//         Route::post('/actividades', [GerenteController::class, 'crearActividad']);
//         Route::put('/actividades/{id}', [GerenteController::class, 'actualizarActividad']);
//         Route::delete('/actividades/{id}', [GerenteController::class, 'eliminarActividad']);

//         // Jefes
//         Route::get('/jefes', [GerenteController::class, 'listarJefes']);
//         Route::get('/jefes/{id}', [GerenteController::class, 'verJefe']);
//         Route::post('/jefes', [GerenteController::class, 'crearJefe']);
//         Route::patch('/jefes/{id}/estado', [GerenteController::class, 'cambiarEstadoJefe']); 
//         Route::delete('/jefes/{id}', [GerenteController::class, 'eliminarJefe']); 
    
//         // Asignaciones
//         Route::post('/asignar-jefe', [GerenteController::class, 'asignarJefeAPasantes']); //asignación uno o múltiple  
        
//         // Listar pasantes de mi empresa.
//         Route::get('/pasantes', [GerenteController::class, 'listarPasantes']); //incluye pasantía y jefe
//     });
    
//     // =========================================
//     // RUTAS DE JEFE DE PASANTE
//     // =========================================
//      Route::middleware('role:jefe')->prefix('jefe')->group(function () {
//         Route::get('/mis-pasantes', [JefeController::class, 'misPasantes']);
//         Route::get('/pasante/{idPasante}', [JefeController::class, 'verPasante']); // ver datos específicos de 1 pasante
//         Route::get('/bitacora/{idPasante}', [JefeController::class, 'verBitacoraPasante']);
        
//         // Evaluaciones (subactividades-bitacora)
//         Route::post('/asignar-subactividad', [JefeController::class, 'asignarSubactividad']); 
//         Route::post('/evaluar-bitacora', [JefeController::class, 'evaluarBitacora']); 
//         Route::put('/evaluar/{idBitacora}', [JefeController::class, 'actualizarEvaluacion']);       
//         //Route::post('/evaluar', [JefeController::class, 'evaluarSubactividad']);

//         //pasantia 
//         Route::get('/estado-pasantia', [JefeController::class, 'obtenerEstadoPasantia']); // NUEVO
//         Route::put('/estado-pasantia', [JefeController::class, 'cambiarEstadoPasantia']); // NUEVO
        
//         //mensaje
//         Route::post('/mensaje', [JefeController::class, 'enviarMensaje']);
        
//         // Informe final
//         Route::post('/informe-final/{idInscripcion}', [JefeController::class, 'generarInformeFinalPorInscripcion']); 
//     });
//     // =========================================
//     // RUTAS DE TUTOR
//     // =========================================
//     Route::middleware('role:tutor')->prefix('tutor')->group(function () {
//         //pasante
//         Route::get('/mis-pasantes', [TutorController::class, 'misPasantes']); // incluye detalles de pasantía
//         Route::get('/mis-pasantes/{id}', [TutorController::class, 'verPasante']);
//         Route::get('/bitacora/{idPasante}', [TutorController::class, 'verBitacoraPasante']);

//         //Informe Final
//         Route::put('/informe/{idInscripcion}/resultado', [TutorController::class, 'modificarResultadoInformePorInscripcion']); 
        
//         // Estado pasantía
//         Route::get('/estado-pasantia', [TutorController::class, 'obtenerEstadoPasantia']); 
//     });
//     // =========================================
//     // INFORME FINAL (Compartido: Gerente, Jefe, Tutor)
//     // =========================================
//     Route::get('/informe-final/{idInscripcion}', [InformeFinalController::class, 'verInformeFinal']);

// });