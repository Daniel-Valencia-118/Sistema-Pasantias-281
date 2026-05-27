<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\GoogleAuthController;
use Inertia\Inertia;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\GerenteController;
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
use App\Models\Presentacion;
use App\Models\Empresa;


Route::get('auth/google', [GoogleAuthController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [GoogleAuthController::class, 'handleGoogleCallback']);

// Ruta de bienvenida pública
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('welcome');

// Página de Login
Route::get('/login', function () {
    return Inertia::render('Auth/Login', [
        'status' => session('status'),
        'canResetPassword' => Route::has('password.request'),
    ]);
})->name('login');

Route::post('/login', [LoginController::class, 'store'])->name('login.store');

// Cerrar sesión
Route::post('/logout', function () {
    Auth::logout();
    return redirect('/login');
})->name('logout');

// Página de Registro
Route::get('/register', function () {
    // Jalamos únicamente el ID y el Nombre de las empresas de la base de datos
    $empresas = Empresa::select('id_empresa', 'nombre')->orderBy('nombre', 'asc')->get();

    return Inertia::render('Auth/Register', [
        'empresas' => $empresas // Enviamos la lista a React
    ]);
})->name('register');

// Ruta del formulario (Endpoint único)
Route::post('/registro', [RegisterController::class, 'store'])->name('registro.store');

// Ruta de la página amigable de aviso
Route::get('/registro/pendiente', function () {
    return Inertia::render('Auth/RegistroPendiente');
})->name('registro.pendiente');

// Mostrar página de solicitud de enlace
Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword', ['status' => session('status')]);
})->middleware('guest')->name('password.request');

// Enviar enlace de restablecimiento (usa el controlador de Laravel)
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('guest')->name('password.email');

// Página para verificar código (nuestra implementación personalizada)
Route::post('/password/verify', function (Request $request) {
    $request->validate(['email' => 'required|email', 'code' => 'required']);
    // Aquí debes verificar el código contra tu lógica (base de datos, cache, etc.)
    // Si es válido, devolver éxito
    return back()->with('status', 'Código verificado');
})->middleware('guest')->name('password.verify');

// Mostrar formulario de reset (con token)
Route::get('/reset-password/{token}', function (string $token) {
    return Inertia::render('Auth/ResetPassword', [
        'token' => $token,
        'email' => request('email')
    ]);
})->middleware('guest')->name('password.reset');

// Procesar reset de contraseña
Route::post('/reset-password', [NewPasswordController::class, 'store'])
    ->middleware('guest')
    ->name('password.update');

Route::get('/api/configuracion-publica', function () {
    return response()->json(Presentacion::getConfiguracion());
});

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard Admin y perfil
    Route::get('/admin', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/alertas', [DashboardController::class, 'alertas'])->name('admin.alertas');
    Route::get('/admin/perfil', [AdminController::class, 'perfil'])->name('admin.perfil');
    Route::put('/admin/perfil', [AdminController::class, 'updatePerfil'])->name('admin.perfil.update');
    Route::get('/admin/configuracion', [ConfiguracionController::class, 'edit'])->name('admin.configuracion.edit');
    // Usamos POST en lugar de PUT porque la carga de archivos multipart/form-data suele dar problemas con PUT en Laravel
    Route::post('/admin/configuracion', [ConfiguracionController::class, 'update'])->name('admin.configuracion.update');

    // Listar, crear y actualizar Usuarios 
    Route::get('/admin/usuarios', [AdminController::class, 'listarTodosUsuarios'])->name('admin.usuarios.index');
    Route::post('/admin/usuarios', [AdminController::class, 'crearUsuario'])->name('admin.usuarios.store');
    Route::put('/admin/usuarios/{id}', [AdminController::class, 'updateUser'])->name('admin.usuarios.update');
    Route::delete('/admin/usuarios/{id}', [AdminController::class, 'eliminarUsuario'])->name('admin.usuarios.destroy');
    Route::patch('/admin/usuarios/{id}/estado', [AdminController::class, 'toggleEstado'])->name('admin.usuarios.estado');
        
    Route::get('/admin/solicitudes', [AdminController::class, 'listarSolicitudes'])->name('admin.solicitudes.index');
    Route::patch('users/{user}/procesar-aprobacion', [AdminController::class, 'procesarAprobacion'])->name('admin.usuarios.solicitudes');

    Route::get('/admin/administradores', [AdminController::class, 'listarAdministradores'])->name('admin.administradores.index');
    Route::post('/admin/administradores', [AdminController::class, 'storeAdmin'])->name('admin.administradores.store');

    Route::get('/admin/gerentes', [AdminController::class, 'listarGerentes'])->name('admin.gerentes.index');
    Route::put('/admin/gerentes/{id}', [AdminController::class, 'updateGerente'])->name('admin.usuarios.gerente.update');

    Route::get('/admin/jefes', [AdminController::class, 'listarJefes'])->name('admin.jefes.index');
    Route::put('/admin/jefes/{id}', [AdminController::class, 'updateJefe'])->name('admin.usuarios.jefe.update');

    Route::get('/admin/tutores', [AdminController::class, 'listarTutores'])->name('admin.tutores.index');
    Route::put('/admin/tutores/{id}', [AdminController::class, 'updateTutor'])->name('admin.usuarios.tutor.update');

    Route::get('/admin/pasantes', [AdminController::class, 'listarPasantes'])->name('admin.pasantes.index');
    Route::put('/admin/pasantes/{id}', [AdminController::class, 'updatePasante'])->name('admin.usuarios.pasante.update');

    // Empresas
    Route::get('/admin/empresas', [EmpresaController::class, 'index'])->name('admin.empresas');
    Route::put('/admin/empresas/{id}', [EmpresaController::class, 'update'])->name('admin.empresas.update');

    // Pasantías
    Route::get('/admin/pasantias', [PasantiaController::class, 'index'])->name('admin.pasantias.index');
    Route::put('/admin/pasantias/{id}', [PasantiaController::class, 'update'])->name('admin.pasantias.update');
    // Ruta para crear pasantía, el cual reenderiza la pagina Admin/Pasantias/Ofertas.jsx
    Route::get('/admin/pasantias/crear', function () {
        return Inertia::render('Admin/Pasantias/Ofertas');
    })->name('admin.pasantias.create');

    // Monitoreo
    Route::resource('admin/actividades', ActividadController::class)->names([
            'index'   => 'admin.actividades.index',
            'store'   => 'admin.actividades.store',
            'update'  => 'admin.actividades.update',
            'destroy' => 'admin.actividades.destroy',
        ]);

    Route::resource('admin/bitacoras', BitacoraEvaController::class)->names([
            'index'   => 'admin.bitacoras.index',
            'store'   => 'admin.bitacoras.store',
            'update'  => 'admin.bitacoras.update',
            'destroy' => 'admin.bitacoras.destroy',
        ]);

    Route::get('/admin/informes', [InformeFinalController::class, 'index'])->name('admin.informes.index');
    Route::put('/admin/informes/{id_informe}', [InformeFinalController::class, 'update'])->name('admin.informes.update');

    // Comunicación
    Route::resource('/admin/mensajes', MensajeController::class)->names([
            'index'   => 'admin.mensajes.index',
            'store'   => 'admin.mensajes.store',
            'update'  => 'admin.mensajes.update',
            'destroy' => 'admin.mensajes.destroy',
        ]);

    Route::resource('/admin/comentarios', ComentarioController::class)->names([
            'index'   => 'admin.comentarios.index',
            'store'   => 'admin.comentarios.store',
            'update'  => 'admin.comentarios.update',
            'destroy' => 'admin.comentarios.destroy',
        ]);
});

Route::middleware(['auth', 'role:jefe'])->group(function () {
    Route::get('/jefe/perfil', [JefeController::class, 'perfil'])->name('jefe.perfil');
    Route::put('/jefe/perfil', [JefeController::class, 'actualizarPerfil'])->name('jefe.actualizarPerfil');
    Route::get('/jefe/', [JefeController::class, 'dashboard'])->name('jefe.dashboard');
    // Route::get('/jefe', function () {
    //     return Inertia::render('Jefe/Dashboard/Dashboard');
    // })->name('jefe.dashboard');

    Route::get('/jefe/pasantes', [JefeController::class, 'misPasantes'])->name('jefe.pasantes');
    Route::get('/jefe/pasantes/{id_pasantia}', [JefeController::class, 'misPasantes'])->name('jefe.pasantes.show');

    Route::get('/jefe/pasantias', [JefeController::class, 'misPasantias'])->name('jefe.pasantias');
    // pagina de tarjetas de pasantias a cargo del jefe
    Route::get('jefe/pasantias/tarjetas', [PasantiaController::class, 'tarjetas'])->name('jefe.pasantias.tarjetas');


    Route::get('/jefe/evaluaciones/{id_pasantia}/bitacoras', [JefeController::class, 'showPasantiaBitacoras'])->name('pasantias.bitacoras');
    Route::post('/jefe/bitacoras/evaluar', [JefeController::class, 'evaluarBitacora'])->name('jefe.evaluarBitacora');

    // Listado de actividades filtrado por pasantía
    Route::get('/jefe/actividades/{id_pasantia}', [ActividadController::class, 'actividadesPasantia'])->name('jefe.actividades.index');
    Route::get('/jefe/actividades/detalle/{id}', [ActividadController::class, 'obtenerDetalle'])->name('jefe.actividades.detalle');
    Route::get('/jefe/actividades/progresos/{id}', [ActividadController::class, 'obtenerProgresos'])->name('jefe.actividades.progresos');

    // Ruta de asignación existente
    // Route::post('/actividades/asignar', [ActividadController::class, 'asignarActividad'])->name('asignarActividad');

    Route::get('/jefe/bitacora/crear', [JefeController::class, 'crearBitacora'])->name('jefe.bitacora.crear');
    Route::get('/jefe/bitacora/{id}/editar', [JefeController::class, 'editarBitacora'])->name('jefe.bitacora.editar');
    Route::post('/jefe/bitacora/guardar', [JefeController::class, 'guardarBitacora'])->name('jefe.bitacora.guardar');

    Route::get('/jefe/informes/redactar', [JefeController::class, 'redactarInforme'])->name('informes.redactar');
    Route::get('/jefe/api/informes/verificar-status', [JefeController::class, 'verificarStatusInscripcion']);
    Route::post('/jefe/informes/generar', [JefeController::class, 'generarInforme'])->name('jefe.informes.generar');

    // 1. Nueva ruta base para ver las tarjetas de las pasantías
    Route::get('jefe/informes/historial', [InformeFinController::class, 'indexHistorialPasantias'])->name('jefe.informes.index');
    // 2. Ruta modificada para ver el historial específico de una pasantía
    Route::get('jefe/informes/historial/{id_pasantia}', [InformeFinController::class, 'informesHistorial'])->name('jefe.informes.historial');

    Route::get('/jefe/informes/{id}/ver', [JefeController::class, 'verInforme'])->name('jefe.informes.ver');
    Route::get('/jefe/informes/{id}/descargar', [JefeController::class, 'descargarInforme'])->name('jefe.informes.descargar');
    Route::get('/informes/{id}/certificado', [JefeController::class, 'generarCertificado'])->name('informes.certificado');

    // Route::get('/jefe/comunicacion/crear-mensaje', [JefeController::class, 'crearMensaje'])->name('jefe.mensajes.crear');
    // Route::post('/jefe/comunicacion/enviar-mensaje', [JefeController::class, 'enviarMensaje'])->name('jefe.mensajes.enviar');
    // Route::get('/jefe/comunicacion/mensajes-enviados', [JefeController::class, 'mensajesEnviados'])->name('jefe.mensajes.enviados');
    // Rutas del Chat para el Jefe
    Route::get('jefe/mensajes', [MensajeJefeController::class, 'index'])->name('jefe.mensajes.index');
    Route::get('jefe/mensajes/{idContacto}', [MensajeJefeController::class, 'getMensajes'])->name('jefe.mensajes.show');
    Route::post('jefe/mensajes', [MensajeJefeController::class, 'enviarMensaje'])->name('jefe.mensajes.store');
});


// Rutas protegidas (ejemplo)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});

// ROL GERENTE: 
Route::middleware(['auth', 'role:gerente'])->group(function () {
    Route::get('/gerente', function () {
        return Inertia::render('Gerente/Dashboard');
    })->name('gerente.dashboard');
        //---------> not id
        Route::put('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'update'])->name('gerente.perfil.update');   
        Route::get('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'index'])->name('gerente.perfil');  
        
        Route::get('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'index'])->name('gerente.empresa');
        Route::put('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'update'])->name('gerente.empresa.update');
        
        Route::get('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'index'])->name('gerente.jefes');
        Route::post('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'store'])->name('gerente.jefes.store');
        Route::get('/gerente/jefes/crear', [App\Http\Controllers\Gerente\JefeController::class, 'create'])->name('gerente.jefes.create');
        Route::post('/gerente/jefes/asignar-pasante', [App\Http\Controllers\Gerente\JefeController::class, 'asignarPasante'])->name('gerente.jefes.asignar-pasante');
        Route::get('/gerente/jefes/solicitudes', [App\Http\Controllers\Gerente\JefeController::class, 'solicitudes'])->name('gerente.jefes.solicitudes');
        
        Route::get('/gerente/pasantias/crear', [App\Http\Controllers\Gerente\PasantiaController::class, 'create'])->name('gerente.pasantias.create');
        Route::get('/gerente/pasantias', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'index'])->name('gerente.pasantias');
        Route::post('/gerente/pasantias', [App\Http\Controllers\Gerente\PasantiaController::class, 'store'])->name('gerente.pasantias.store');
        
        Route::get('/gerente/pasantias/jefes-disponibles', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getJefesDisponibles'])->name('gerente.pasantias.jefes-disponibles');   
        
        Route::get('/gerente/pasantias/activas', [App\Http\Controllers\Gerente\PasantiaActivaController::class, 'index'])->name('gerente.pasantias.activas');
        
        Route::get('/gerente/cuenta', [App\Http\Controllers\Gerente\CuentaController::class, 'index'])->name('gerente.cuenta');
        Route::put('/gerente/cuenta', [App\Http\Controllers\Gerente\CuentaController::class, 'update'])->name('gerente.cuenta.update');
        
        Route::get('/gerente/estadisticas', [App\Http\Controllers\Gerente\EstadisticaController::class, 'index'])->name('gerente.estadisticas');
        
        // Jefes disponibles para pasantía
        Route::get('/gerente/pasantias/jefes-disponibles', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getJefesDisponiblesParaPasantia'])->name('gerente.pasantias.jefes-disponibles-pasantia');
        
        //------> id
        Route::get('/gerente/jefes/{id}/pasantes', [App\Http\Controllers\Gerente\JefeController::class, 'getPasantesAsignacion'])->name('gerente.jefes.pasantes');
        Route::patch('/gerente/jefes/{id}/toggle-estado', [App\Http\Controllers\Gerente\JefeController::class, 'toggleEstado'])->name('gerente.jefes.toggle-estado');
        Route::get('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'show'])->name('gerente.jefes.show');
        Route::put('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'update'])->name('gerente.jefes.update');
        Route::patch('/gerente/jefes/solicitudes/{id}/aprobar', [App\Http\Controllers\Gerente\JefeController::class, 'aprobarSolicitud'])->name('gerente.jefes.aprobar');
        Route::patch('/gerente/jefes/solicitudes/{id}/rechazar', [App\Http\Controllers\Gerente\JefeController::class, 'rechazarSolicitud'])->name('gerente.jefes.rechazar');
        
        Route::get('/gerente/pasantias/{id}/inscritos', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getInscritos'])->name('gerente.pasantias.inscritos');
        
        Route::get('/gerente/pasantias/finalizadas', [App\Http\Controllers\Gerente\PasantiaFinalizadaController::class, 'index'])->name('gerente.pasantias.finalizadas');

        Route::get('/gerente/pasantias/{id}/actividades', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getActividades'])->name('gerente.pasantias.actividades');
        Route::post('/gerente/pasantias/{id}/actividades', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'storeActividad'])->name('gerente.pasantias.actividades.store');
        Route::put('/gerente/pasantias/actividades/{id}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'updateActividad'])->name('gerente.pasantias.actividades.update');
        Route::delete('/gerente/pasantias/actividades/{id}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'destroyActividad'])->name('gerente.pasantias.actividades.destroy');
        
        Route::patch('/gerente/pasantias/{id}/cupos', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'updateCupos'])->name('gerente.pasantias.cupos');
        
        Route::patch('/gerente/pasantias/{idPasantia}/asignar-jefe/{idPasante}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'asignarJefePasante'])->name('gerente.pasantias.asignar-jefe');
        Route::patch('/gerente/pasantias/{idPasantia}/designar-jefe/{idPasante}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'designarJefePasante'])->name('gerente.pasantias.designar-jefe');
        
        Route::get('/gerente/pasantias-activas/{id}/inscritos', [App\Http\Controllers\Gerente\PasantiaActivaController::class, 'getInscritosConEvaluaciones'])->name('gerente.pasantias.activas.inscritos');
    
        Route::get('/gerente/pasantias/{id}/actividades-realizados', [App\Http\Controllers\Gerente\PasantiaFinalizadaController::class, 'getActividadesConRealizados'])->name('gerente.pasantias.actividades-realizados');
        Route::get('/gerente/pasantias/{id}/pasantes-promedio', [App\Http\Controllers\Gerente\PasantiaFinalizadaController::class, 'getPasantesConPromedio'])->name('gerente.pasantias.pasantes-promedio');
        Route::get('/gerente/pasantias/{id}/calificaciones', [App\Http\Controllers\Gerente\PasantiaFinalizadaController::class, 'getCalificaciones'])->name('gerente.pasantias.calificaciones');

        // Iniciar pasantía (desde Pasantías Publicadas)
        Route::patch('/gerente/pasantias/{id}/iniciar', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'iniciarPasantia'])->name('gerente.pasantias.iniciar');
        Route::get('/gerente/pasantias/{id}/info-inicio', [App\Http\Controllers\Gerente\PasantiaActivaController::class, 'getInfoInicio'])->name('gerente.pasantias.info-inicio');

        // Finalizar pasantía (desde Pasantías Activas)
        Route::patch('/gerente/pasantias-activas/{id}/finalizar', [App\Http\Controllers\Gerente\PasantiaActivaController::class, 'finalizarPasantia'])->name('gerente.pasantias-activas.finalizar');
        Route::get('/gerente/pasantias-activas/{id}/info-fin', [App\Http\Controllers\Gerente\PasantiaActivaController::class, 'getInfoFin'])->name('gerente.pasantias-activas.info-fin');

        Route::put('/gerente/pasantias/{id}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'updatePasantia'])->name('gerente.pasantias.update');

        Route::get('/gerente/pasantias/finalizadas/{id}/clonar', [App\Http\Controllers\Gerente\PasantiaFinalizadaController::class, 'clonarPasantia'])->name('gerente.pasantias.finalizadas.clonar');
        Route::patch('/gerente/pasantias/{id}/abrir', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'abrirPasantia'])->name('gerente.pasantias.abrir');


        // Asignar/Designar jefe a pasantía
        Route::patch('/gerente/pasantias/{id}/asignar-jefe-pasantia', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'asignarJefeAPasantia'])->name('gerente.pasantias.asignar-jefe-pasantia');
        Route::patch('/gerente/pasantias/{id}/designar-jefe-pasantia', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'designarJefeDePasantia'])->name('gerente.pasantias.designar-jefe-pasantia');

});


// ROL PASANTE
Route::middleware(['auth', 'role:pasante'])->group(function () {
    Route::get('/pasante', function () {
        return Inertia::render('Pasante/Dashboard');
    })->name('pasante.dashboard');

    //---------> not id
    Route::get('/pasante/perfil', [App\Http\Controllers\Pasante\PerfilController::class, 'perfil'])->name('pasante.perfil');
    Route::put('/pasante/perfil', [App\Http\Controllers\Pasante\PerfilController::class, 'updatePerfil'])->name('pasante.perfil.update');
    Route::get('/pasante/cuenta', [App\Http\Controllers\Pasante\PerfilController::class, 'cuenta'])->name('pasante.cuenta');
    Route::put('/pasante/cuenta', [App\Http\Controllers\Pasante\PerfilController::class, 'updateCuenta'])->name('pasante.cuenta.update');
    Route::put('/pasante/password', [App\Http\Controllers\Pasante\PerfilController::class, 'updatePassword'])->name('pasante.password.update');
    
    Route::get('/pasante/inscribirse', [App\Http\Controllers\Pasante\InscripcionController::class, 'index'])->name('pasante.inscribirse');
    
    Route::get('/pasante/inscripciones/activas', [App\Http\Controllers\Pasante\InscripcionController::class, 'pasantiasInscritas'])->name('pasante.inscripciones.activas');
    
    Route::get('/pasante/actividades', [App\Http\Controllers\Pasante\ActividadController::class, 'index'])->name('pasante.actividades');
    Route::post('/pasante/progreso', [App\Http\Controllers\Pasante\ActividadController::class, 'storeProgreso'])->name('pasante.progreso.store');
    Route::post('/pasante/auto-eva', [App\Http\Controllers\Pasante\ActividadController::class, 'storeAutoEva'])->name('pasante.auto-eva.store');
    Route::post('/pasante/comentario', [App\Http\Controllers\Pasante\ActividadController::class, 'storeComentario'])->name('pasante.comentario.store');

    Route::get('/pasante/inscripciones/finalizadas', [App\Http\Controllers\Pasante\InscripcionController::class, 'pasantiasFinalizadas'])->name('pasante.inscripciones.finalizadas');
    Route::post('/pasante/calificacion', [App\Http\Controllers\Pasante\InscripcionController::class, 'storeCalificacion'])->name('pasante.calificacion.store');
    
    Route::get('/pasante/mensajes', [App\Http\Controllers\Pasante\MensajeController::class, 'index'])->name('pasante.mensajes');
    Route::post('/pasante/mensajes', [App\Http\Controllers\Pasante\MensajeController::class, 'enviarMensaje'])->name('pasante.mensajes.enviar');
    
    
    //------> id
    Route::post('/pasante/inscribirse/{id}', [App\Http\Controllers\Pasante\InscripcionController::class, 'store'])->name('pasante.inscribirse.store');
    
    Route::get('/pasante/inscripciones/{id}/companeros', [App\Http\Controllers\Pasante\InscripcionController::class, 'getCompaneros'])->name('pasante.inscripciones.companeros');

    Route::get('/pasante/actividades/{id}', [App\Http\Controllers\Pasante\ActividadController::class, 'show'])->name('pasante.actividades.show');
    Route::get('/pasante/evaluacion-detalle/{idActividad}', [App\Http\Controllers\Pasante\ActividadController::class, 'getEvaluacionDetalle'])->name('pasante.evaluacion.detalle');    
    Route::put('/pasante/comentario/{id}', [App\Http\Controllers\Pasante\ActividadController::class, 'updateComentario'])->name('pasante.comentario.update');
    
    Route::get('/pasante/inscripciones/{id}/detalle-promedio', [App\Http\Controllers\Pasante\InscripcionController::class, 'getDetallePromedio'])->name('pasante.inscripciones.detalle-promedio');
    Route::get('/pasante/calificacion/{idPasantia}', [App\Http\Controllers\Pasante\InscripcionController::class, 'getCalificacion'])->name('pasante.calificacion.show');
    
    Route::get('/pasante/informe-final/{idPasantia}', [App\Http\Controllers\Pasante\InscripcionController::class, 'generarInformeFinal'])->name('pasante.informe-final');
    
    Route::get('/pasante/mensajes/{tipo}/{id}', [App\Http\Controllers\Pasante\MensajeController::class, 'getMensajes'])->name('pasante.mensajes.get');
    
    Route::get('/pasante/inscribirse/{id}/calificaciones', [App\Http\Controllers\Pasante\InscripcionController::class, 'getCalificacionesEmpresa'])->name('pasante.inscribirse.calificaciones');
});

Route::middleware('auth:sanctum')->group(function () {
    // Notificaciones
    Route::get('/notificaciones', [App\Http\Controllers\NotificacionController::class, 'index'])->name('notificaciones.index');
    Route::patch('/notificaciones/{id}/leer', [App\Http\Controllers\NotificacionController::class, 'marcarLeida'])->name('notificaciones.leer');
    Route::patch('/notificaciones/marcar-todas', [App\Http\Controllers\NotificacionController::class, 'marcarTodasLeidas'])->name('notificaciones.leer-todas');
    Route::delete('/notificaciones/{id}', [App\Http\Controllers\NotificacionController::class, 'destroy'])->name('notificaciones.destroy');

    //avatar
    Route::post('/avatar/actualizar', [App\Http\Controllers\AvatarController::class, 'update'])->name('avatar.update');
});