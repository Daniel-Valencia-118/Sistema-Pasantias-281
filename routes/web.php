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
    return Inertia::render('Auth/Register');
})->name('register');

// Mostrar página de solicitud de enlace
Route::get('/forgot-password', function () {
    return Inertia::render('Auth/ForgotPassword', ['status' => session('status')]);
})->middleware('guest')->name('password.request');

// Enviar enlace de restablecimiento (usa el controlador de Laravel)
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('guest')
    ->name('password.email');

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

Route::middleware(['auth', 'role:admin'])->group(function () {
    // Dashboard Admin
    Route::get('/admin', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('admin');
    Route::get('/admin/alertas', [App\Http\Controllers\Admin\DashboardController::class, 'alertas'])
        ->name('admin.alertas');

    // Usuarios
    Route::get('/admin/usuarios', [AdminController::class, 'listarTodosUsuarios'])
        ->name('admin.usuarios.index');
    Route::get('/admin/solicitudes', [AdminController::class, 'listarSolicitudes'])
        ->name('admin.solicitudes.index');
    Route::get('/admin/administradores', [AdminController::class, 'listarAdministradores'])
        ->name('admin.administradores.index');
    Route::get('/admin/gerentes', [AdminController::class, 'listarGerentes'])
        ->name('admin.gerentes.index');
    Route::get('/admin/jefes', [AdminController::class, 'listarJefes'])
        ->name('admin.jefes.index');
    Route::get('/admin/tutores', [AdminController::class, 'listarTutores'])
        ->name('admin.tutores.index');
    Route::get('/admin/pasantes', [AdminController::class, 'listarPasantes'])
        ->name('admin.pasantes.index');

    // Empresas
    Route::get('/admin/empresas', [EmpresaController::class, 'index'])
        ->name('admin.empresas');

    // Pasantías
    Route::get('/admin/pasantias', [PasantiaController::class, 'index'])
        ->name('admin.pasantias.index');
    // Ruta para crear pasantía, el cual reenderiza la pagina Admin/Pasantias/Ofertas.jsx
    Route::get('/admin/pasantias/crear', function () {
        return Inertia::render('Admin/Pasantias/Ofertas');
    })->name('admin.pasantias.create');

    // Monitoreo
    Route::get('/admin/actividades', [App\Http\Controllers\Admin\ActividadController::class, 'index'])
        ->name('admin.actividades.index');
    Route::get('/admin/bitacoras', [App\Http\Controllers\Admin\BitacoraController::class, 'index'])
        ->name('admin.bitacoras.index');
    Route::get('/admin/informes', [App\Http\Controllers\Admin\InformeController::class, 'index'])
        ->name('admin.informes.index');

    // Comunicación
    Route::get('/admin/mensajes', [App\Http\Controllers\Admin\MensajeController::class, 'index'])
        ->name('admin.mensajes.index');
    Route::get('/admin/comentarios', [App\Http\Controllers\Admin\ComentarioController::class, 'index'])
        ->name('admin.comentarios.index');
});

// Route::middleware(['auth:sanctum', 'admin'])->group(function () {
//     // ... anteriores
//     Route::get('/admin/usuarios', [App\Http\Controllers\Admin\UsuarioController::class, 'index'])->name('admin.usuarios.index');
//     Route::post('/admin/usuarios', [App\Http\Controllers\Admin\UsuarioController::class, 'store'])->name('admin.usuarios.store');
//     Route::put('/admin/usuarios/{id}', [App\Http\Controllers\Admin\UsuarioController::class, 'update'])->name('admin.usuarios.update');
//     Route::patch('/admin/usuarios/{id}/estado', [App\Http\Controllers\Admin\UsuarioController::class, 'toggleEstado'])->name('admin.usuarios.estado');
// });

Route::middleware(['auth', 'role:jefe'])->group(function () {
    Route::get('/jefe/perfil', [JefeController::class, 'perfil'])->name('jefe.perfil');
    Route::put('/jefe/perfil', [JefeController::class, 'actualizarPerfil'])->name('jefe.actualizarPerfil');
    Route::get('/jefe', [JefeController::class, 'dashboard'])->name('jefe.dashboard');
    Route::get('/jefe/pasantes', [JefeController::class, 'misPasantes'])->name('jefe.pasantes');

    Route::get('/jefe/pasantias', [JefeController::class, 'misPasantias'])->name('jefe.pasantias');

    Route::get('/jefe/evaluaciones/bitacoras', [JefeController::class, 'bitacoras'])->name('jefe.bitacoras');
    Route::post('/jefe/evaluaciones/evaluar', [JefeController::class, 'evaluarBitacora'])->name('jefe.evaluarBitacora');
    Route::get('/jefe/evaluaciones/subactividades', [JefeController::class, 'subactividades'])->name('jefe.subactividades');
    Route::post('/jefe/evaluaciones/asignar-subactividad', [JefeController::class, 'asignarSubactividad'])->name('jefe.asignarSubactividad');

    Route::get('/jefe/bitacora/crear', [JefeController::class, 'crearBitacora'])->name('jefe.bitacora.crear');
    Route::get('/jefe/bitacora/{id}/editar', [JefeController::class, 'editarBitacora'])->name('jefe.bitacora.editar');
    Route::post('/jefe/bitacora/guardar', [JefeController::class, 'guardarBitacora'])->name('jefe.bitacora.guardar');

    Route::get('/jefe/comunicacion/crear-mensaje', [JefeController::class, 'crearMensaje'])->name('jefe.mensajes.crear');
    Route::post('/jefe/comunicacion/enviar-mensaje', [JefeController::class, 'enviarMensaje'])->name('jefe.mensajes.enviar');
    Route::get('/jefe/comunicacion/mensajes-enviados', [JefeController::class, 'mensajesEnviados'])->name('jefe.mensajes.enviados');

    Route::get('/jefe/informes/historial', [JefeController::class, 'informesHistorial'])->name('jefe.informes.historial');
    Route::get('/jefe/informes/redactar', [JefeController::class, 'redactarInforme'])->name('jefe.informes.redactar');
    Route::post('/jefe/informes/generar', [JefeController::class, 'generarInforme'])->name('jefe.informes.generar');
    Route::get('/jefe/informes/{id}/ver', [JefeController::class, 'verInforme'])->name('jefe.informes.ver');
    Route::get('/jefe/informes/{id}/descargar', [JefeController::class, 'descargarInforme'])->name('jefe.informes.descargar');
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
    
    Route::put('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'update'])->name('gerente.perfil.update');   
    Route::get('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'index'])->name('gerente.perfil');  
    Route::get('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'index'])->name('gerente.empresa');
    Route::get('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'index'])->name('gerente.jefes');
    Route::put('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'update'])->name('gerente.empresa.update');
    Route::post('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'store'])->name('gerente.jefes.store');
    Route::get('/gerente/jefes/crear', [App\Http\Controllers\Gerente\JefeController::class, 'create'])->name('gerente.jefes.create');
    Route::post('/gerente/jefes/asignar-pasante', [App\Http\Controllers\Gerente\JefeController::class, 'asignarPasante'])->name('gerente.jefes.asignar-pasante');
    Route::get('/gerente/jefes/solicitudes', [App\Http\Controllers\Gerente\JefeController::class, 'solicitudes'])->name('gerente.jefes.solicitudes');
    Route::get('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'show'])->name('gerente.jefes.show');
    Route::put('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'update'])->name('gerente.jefes.update');
    Route::patch('/gerente/jefes/{id}/toggle-estado', [App\Http\Controllers\Gerente\JefeController::class, 'toggleEstado'])->name('gerente.jefes.toggle-estado');
    Route::get('/gerente/jefes/{id}/pasantes', [App\Http\Controllers\Gerente\JefeController::class, 'getPasantesAsignacion'])->name('gerente.jefes.pasantes');
    Route::patch('/gerente/jefes/solicitudes/{id}/aprobar', [App\Http\Controllers\Gerente\JefeController::class, 'aprobarSolicitud'])->name('gerente.jefes.aprobar');
    Route::patch('/gerente/jefes/solicitudes/{id}/rechazar', [App\Http\Controllers\Gerente\JefeController::class, 'rechazarSolicitud'])->name('gerente.jefes.rechazar');


    //no usadas
    //Route::get('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'index'])->name('gerente.empresa');
    //Route::get('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'index'])->name('gerente.jefes');
    //Route::get('/gerente/jefes/crear', [App\Http\Controllers\Gerente\JefeController::class, 'create'])->name('gerente.jefes.create');
    //Route::get('/gerente/pasantias', [App\Http\Controllers\Gerente\PasantiaController::class, 'index'])->name('gerente.pasantias');
    //Route::get('/gerente/pasantias/crear', [App\Http\Controllers\Gerente\PasantiaController::class, 'create'])->name('gerente.pasantias.create');
    //Route::get('/gerente/pasantias/activas', [App\Http\Controllers\Gerente\PasantiaController::class, 'activas'])->name('gerente.pasantias.activas');
});

