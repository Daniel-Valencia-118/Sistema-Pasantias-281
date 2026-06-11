<?php
//routes/api.php
use App\Http\Controllers\Api\Mobile\AuthController;
use App\Http\Controllers\Api\Mobile\GerenteController;
use App\Http\Controllers\Api\Mobile\PasanteController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\JefeController;
use App\Http\Controllers\Api\PasantiaController;
use App\Http\Controllers\Api\ActividadController;
use App\Http\Controllers\Api\BitacoraEvaController;
use App\Http\Controllers\Api\InformeFinController;
use App\Http\Controllers\Api\InformeFinalController;
use App\Http\Controllers\Api\MensajeJefeController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Api\ConfiguracionController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Empresa;


Route::get('/mobile/test', function () {
    return response()->json(['message' => 'Conexión exitosa con el backend! Yooy el pro']);
});

Route::post('/mobile/login', [AuthController::class, 'login']);

// Página de Registro
Route::get('/mobile/register', function () {
    // Jalamos únicamente el ID y el Nombre de las empresas de la base de datos
    $empresas = Empresa::select('id_empresa', 'nombre')->orderBy('nombre', 'asc')->get();

    return response()->json([
        'empresas' => $empresas // Enviamos la lista a React
    ]);
})->name('register');

// Ruta del formulario (Endpoint único)
Route::post('/mobile/registro', [RegisterController::class, 'store'])->name('registro.store');

// Ruta de la página amigable de aviso
// Route::get('/mobile/registro/pendiente', function () {
//     return Inertia::render('Auth/RegistroPendiente');
// })->name('registro.pendiente');

// Grupo para rutas protegidas (requieren autenticación)
Route::middleware(['auth:sanctum'])->group(function () {
    
        Route::post('/mobile/logout', [AuthController::class, 'logout']);
        Route::get('/mobile/user', [AuthController::class, 'user']); // ← AGREGAR ESTA LÍNEA
        // =============================================
        // NOTIFICACIONES (para todos los roles autenticados)
        // =============================================
        Route::get('/mobile/notificaciones', [App\Http\Controllers\Api\NotificacionController::class, 'index']);
        Route::patch('/mobile/notificaciones/{id}/leer', [App\Http\Controllers\Api\NotificacionController::class, 'marcarLeida']);
        Route::patch('/mobile/notificaciones/marcar-todas', [App\Http\Controllers\Api\NotificacionController::class, 'marcarTodasLeidas']);
        Route::post('/avatar/actualizar', [App\Http\Controllers\AvatarController::class, 'update'])->name('avatar.update');
        
            // Rutas para >> ROL GERENTE <<
        Route::middleware(['role:gerente'])->prefix('/mobile/gerente')->group(function () {
            
        //------- whitout id:
        Route::get('/estadisticas', [GerenteController::class, 'estadisticas']);
        
        Route::get('/perfil', [GerenteController::class, 'perfil']);
        Route::put('/perfil', [GerenteController::class, 'actualizarPerfil']);
         
        Route::put('/cuenta', [GerenteController::class, 'actualizarCuenta']);
        Route::put('/password', [GerenteController::class, 'cambiarPassword']);

        Route::get('/empresa', [GerenteController::class, 'empresa']);
        Route::put('/empresa', [GerenteController::class, 'actualizarEmpresa']);
        
        Route::post('/pasantias', [GerenteController::class, 'crearPasantia']);
        
        Route::get('/pasantias/jefes-disponibles', [GerenteController::class, 'jefesDisponibles']);
        Route::get('/pasantias', [GerenteController::class, 'listarPasantias']);

        Route::get('/jefes', [GerenteController::class, 'listarJefes']);
        Route::get('/jefes/solicitudes', [GerenteController::class, 'listarSolicitudesJefes']);

        //------ with id:
        Route::patch('/pasantias/{id}/cupos', [GerenteController::class, 'actualizarCupos']);
        Route::patch('/pasantias/{id}/abrir', [GerenteController::class, 'abrirPasantia']);
        Route::get('/pasantias/{id}/inscritos', [GerenteController::class, 'obtenerInscritos']);
        Route::patch('/pasantias/{id}/iniciar', [GerenteController::class, 'iniciarPasantia']);
        Route::get('/pasantias/{id}/actividades', [GerenteController::class, 'obtenerActividades']);
        Route::patch('/pasantias/{id}/asignar-jefe-pasantia', [GerenteController::class, 'asignarJefePasantia']);
        Route::patch('/pasantias/{id}/designar-jefe-pasantia', [GerenteController::class, 'designarJefePasantia']);

        Route::delete('/pasantias/actividades/{id}', [GerenteController::class, 'eliminarActividad']);  
        Route::post('/pasantias/{id}/actividades', [GerenteController::class, 'crearActividad']);
        Route::put('/pasantias/actividades/{id}', [GerenteController::class, 'actualizarActividad']);

        Route::patch('/pasantias/{idPasantia}/asignar-jefe/{idPasante}', [GerenteController::class, 'asignarJefePasante']);
        Route::patch('/pasantias/{idPasantia}/designar-jefe/{idPasante}', [GerenteController::class, 'designarJefePasante']);

        Route::patch('/jefes/{id}/toggle-estado', [GerenteController::class, 'toggleEstadoJefe']);
        Route::get('/jefes/{id}/pasantes', [GerenteController::class, 'getPasantesAsignados']);
        Route::patch('/jefes/solicitudes/{id}/aprobar', [GerenteController::class, 'aprobarSolicitudJefe']);
        Route::patch('/jefes/solicitudes/{id}/rechazar', [GerenteController::class, 'rechazarSolicitudJefe']);

    });
    
    // Rutas para >> ROL PASANTE <<
    Route::middleware(['role:pasante'])->prefix('/mobile/pasante')->group(function () {

        //------- whitout id:
        Route::get('/info', [PasanteController::class, 'getInfo']);
        
        Route::get('/perfil', [PasanteController::class, 'perfil']);
        Route::put('/perfil', [PasanteController::class, 'actualizarPerfil']);

        Route::put('/cuenta', [PasanteController::class, 'actualizarCuenta']);
        Route::put('/password', [PasanteController::class, 'cambiarPassword']);

        Route::get('/pasantias-disponibles', [PasanteController::class, 'pasantiasDisponibles']);

        Route::get('/inscripciones/activas', [PasanteController::class, 'pasantiasInscritas']);
        Route::post('/progreso', [PasanteController::class, 'storeProgreso']);
        Route::post('/auto-eva', [PasanteController::class, 'storeAutoEva']);
        
        Route::get('/calendario/actividades', [PasanteController::class, 'calendarioActividades']);

        Route::get('/mensajes/contactos', [PasanteController::class, 'getContactos']);
        Route::post('/mensajes', [PasanteController::class, 'enviarMensaje']);
        
        //------ with id:
        Route::post('/inscribirse/{id}', [PasanteController::class, 'inscribirse']);
        Route::get('/empresa/{id}/calificaciones', [PasanteController::class, 'calificacionesEmpresa']);
        
        Route::get('/actividades/{idPasantia}', [PasanteController::class, 'actividadesPasantia']);
        Route::get('/companeros/{idPasantia}', [PasanteController::class, 'getCompaneros']);
        Route::get('/progresos/{idActividad}', [PasanteController::class, 'getProgresos']);
        Route::get('/evaluacion-detalle/{idActividad}', [PasanteController::class, 'getEvaluacionDetalle']);
        
        Route::get('/mensajes/{tipo}/{id}', [PasanteController::class, 'getMensajes']);

    });
 
});


// Route::middleware(['', ''])->prefix('/mobile/admin')->group(function () {
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('/mobile/admin')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    
    Route::get('/perfil', [AdminController::class, 'perfil'])->name('admin.perfil');
    Route::put('/perfil', [AdminController::class, 'updatePerfil'])->name('admin.perfil.update');

    Route::get('/configuracion', [ConfiguracionController::class, 'edit'])->name('admin.configuracion.edit');
    // Usamos POST en lugar de PUT porque la carga de archivos multipart/form-data suele dar problemas con PUT en Laravel
    Route::post('/configuracion', [ConfiguracionController::class, 'update'])->name('admin.configuracion.update');

    // Listar, crear y actualizar Usuarios 
    Route::get('/usuarios', [AdminController::class, 'listarTodosUsuarios'])->name('admin.usuarios.index');
    // Route::post('/usuarios', [AdminController::class, 'crearUsuario'])->name('admin.usuarios.store');
    // Route::put('/usuarios/{id}', [AdminController::class, 'updateUser'])->name('admin.usuarios.update');
    // Route::delete('/usuarios/{id}', [AdminController::class, 'eliminarUsuario'])->name('admin.usuarios.destroy');
    Route::patch('/usuarios/{id}/estado', [AdminController::class, 'toggleEstado'])->name('admin.usuarios.estado');
        
    Route::get('/solicitudes', [AdminController::class, 'listarSolicitudes'])->name('admin.solicitudes.index');
    Route::patch('/users/{user}/procesar-aprobacion', [AdminController::class, 'procesarAprobacion'])->name('admin.usuarios.solicitudes');

    Route::get('/administradores', [AdminController::class, 'listarAdministradores'])->name('admin.administradores.index');
    Route::post('/administradores', [AdminController::class, 'storeAdmin'])->name('admin.administradores.store');

    Route::get('/gerentes', [AdminController::class, 'listarGerentes'])->name('admin.gerentes.index');
    Route::put('/gerentes/{id}', [AdminController::class, 'updateGerente'])->name('admin.usuarios.gerente.update');

    Route::get('/jefes', [AdminController::class, 'listarJefes'])->name('admin.jefes.index');
    Route::put('/jefes/{id}', [AdminController::class, 'updateJefe'])->name('admin.usuarios.jefe.update');

    Route::get('/tutores', [AdminController::class, 'listarTutores'])->name('admin.tutores.index');
    Route::put('/tutores/{id}', [AdminController::class, 'updateTutor'])->name('admin.usuarios.tutor.update');

    Route::get('/pasantes', [AdminController::class, 'listarPasantes'])->name('admin.pasantes.index');
    Route::put('/pasantes/{id}', [AdminController::class, 'updatePasante'])->name('admin.usuarios.pasante.update');

    // Empresas
    Route::get('/empresas', [EmpresaController::class, 'index'])->name('admin.empresas');
    Route::put('/empresas/{id}', [EmpresaController::class, 'update'])->name('admin.empresas.update');

    // Pasantías
    Route::get('/pasantias', [PasantiaController::class, 'index'])->name('admin.pasantias.index');
});


// Route::middleware(['', ''])->prefix('/mobile/jefe')->group(function () {
Route::middleware(['auth:sanctum', 'role:jefe'])->prefix('/mobile/jefe')->group(function () {
    Route::get('/perfil', [JefeController::class, 'perfil'])->name('jefe.perfil');
    Route::put('/perfil', [JefeController::class, 'actualizarPerfil'])->name('jefe.actualizarPerfil');
    Route::get('/dashboard', [JefeController::class, 'dashboard'])->name('jefe.dashboard');
    // Route::get('', function () {
    //     return Inertia::render('/Dashboard/Dashboard');
    // })->name('jefe.dashboard');

    Route::get('/pasantes', [JefeController::class, 'pasantes'])->name('jefe.pasantes');
    // Route::get('/pasantes/{id_pasantia}', [JefeController::class, 'misPasantes'])->name('jefe.pasantes.show');

    Route::get('/pasantias', [JefeController::class, 'misPasantias'])->name('jefe.pasantias');
    // pagina de tarjetas de pasantias a cargo del jefe
    Route::get('/pasantias/tarjetas', [PasantiaController::class, 'tarjetas'])->name('jefe.pasantias.tarjetas');

    Route::get('/seguimiento', [JefeController::class, 'seguimientoPasantes'])->name('jefe.seguimiento');
    Route::get('/evaluaciones/bitacoras/{id_pasantia}/{id_pasante}', [JefeController::class, 'showPasantiaBitacoras'])->name('pasantias.bitacoras');
    Route::post('/bitacoras/evaluar', [JefeController::class, 'evaluarBitacora'])->name('jefe.evaluarBitacora');

    // Listado de actividades filtrado por pasantía
    Route::get('/actividades/{id_pasantia}', [ActividadController::class, 'actividadesPasantia'])->name('jefe.actividades.index');
    Route::get('/actividades/detalle/{id}', [ActividadController::class, 'obtenerDetalle'])->name('jefe.actividades.detalle');
    Route::get('/actividades/progresos/{id}', [ActividadController::class, 'obtenerProgresos'])->name('jefe.actividades.progresos');

    // Ruta de asignación existente
    // Route::post('/actividades/asignar', [ActividadController::class, 'asignarActividad'])->name('asignarActividad');

    // Route::get('/bitacora/crear', [JefeController::class, 'crearBitacora'])->name('jefe.bitacora.crear');
    // Route::get('/bitacora/{id}/editar', [JefeController::class, 'editarBitacora'])->name('jefe.bitacora.editar');
    // Route::post('/bitacora/guardar', [JefeController::class, 'guardarBitacora'])->name('jefe.bitacora.guardar');
    Route::post('/bitacoras/comentario', [JefeController::class, 'storeComentario'])->name('jefe.comentarioActividad');

    Route::get('/informes/redactar', [JefeController::class, 'redactarInforme'])->name('informes.redactar');
    Route::get('/api/informes/verificar-status', [JefeController::class, 'verificarStatusInscripcion']);
    Route::post('/informes/generar', [JefeController::class, 'generarInforme'])->name('jefe.informes.generar');

    // 1. Nueva ruta base para ver las tarjetas de las pasantías
    Route::get('/informes/historial', [InformeFinController::class, 'indexHistorialPasantias'])->name('jefe.informes.index');
    // 2. Ruta modificada para ver el historial específico de una pasantía
    // Route::get('/informes/historial/{id_pasantia}', [InformeFinController::class, 'informesHistorial'])->name('jefe.informes.historial');

    // Route::get('/informes/{id}/ver', [JefeController::class, 'verInforme'])->name('jefe.informes.ver');
    // Route::get('/informes/{id}/descargar', [JefeController::class, 'descargarInforme'])->name('jefe.informes.descargar');
    // Route::get('/informes/{id}/certificado', [JefeController::class, 'generarCertificado'])->name('informes.certificado');

    // Route::get('/comunicacion/crear-mensaje', [JefeController::class, 'crearMensaje'])->name('jefe.mensajes.crear');
    // Route::post('/comunicacion/enviar-mensaje', [JefeController::class, 'enviarMensaje'])->name('jefe.mensajes.enviar');
    // Route::get('/comunicacion/mensajes-enviados', [JefeController::class, 'mensajesEnviados'])->name('jefe.mensajes.enviados');
    // Rutas del Chat para el Jefe
    Route::get('/mensajes', [MensajeJefeController::class, 'index'])->name('jefe.mensajes.index');
    Route::get('/mensajes/{idContacto}', [MensajeJefeController::class, 'getMensajes'])->name('jefe.mensajes.show');
    Route::post('/mensajes', [MensajeJefeController::class, 'enviarMensaje'])->name('jefe.mensajes.store');
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