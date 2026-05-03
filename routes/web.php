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
        //not id
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
        
        //------> id
        Route::get('/gerente/jefes/{id}/pasantes', [App\Http\Controllers\Gerente\JefeController::class, 'getPasantesAsignacion'])->name('gerente.jefes.pasantes');
        Route::patch('/gerente/jefes/{id}/toggle-estado', [App\Http\Controllers\Gerente\JefeController::class, 'toggleEstado'])->name('gerente.jefes.toggle-estado');
        Route::get('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'show'])->name('gerente.jefes.show');
        Route::put('/gerente/jefes/{id}', [App\Http\Controllers\Gerente\JefeController::class, 'update'])->name('gerente.jefes.update');
        Route::patch('/gerente/jefes/solicitudes/{id}/aprobar', [App\Http\Controllers\Gerente\JefeController::class, 'aprobarSolicitud'])->name('gerente.jefes.aprobar');
        Route::patch('/gerente/jefes/solicitudes/{id}/rechazar', [App\Http\Controllers\Gerente\JefeController::class, 'rechazarSolicitud'])->name('gerente.jefes.rechazar');
        
        Route::get('/gerente/pasantias/{id}/inscritos', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getInscritos'])->name('gerente.pasantias.inscritos');

        Route::get('/gerente/pasantias/{id}/actividades', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'getActividades'])->name('gerente.pasantias.actividades');
        Route::post('/gerente/pasantias/{id}/actividades', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'storeActividad'])->name('gerente.pasantias.actividades.store');
        Route::put('/gerente/pasantias/actividades/{id}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'updateActividad'])->name('gerente.pasantias.actividades.update');
        Route::delete('/gerente/pasantias/actividades/{id}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'destroyActividad'])->name('gerente.pasantias.actividades.destroy');
        Route::patch('/gerente/pasantias/{id}/cupos', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'updateCupos'])->name('gerente.pasantias.cupos');

        Route::patch('/gerente/pasantias/{idPasantia}/asignar-jefe/{idPasante}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'asignarJefePasante'])->name('gerente.pasantias.asignar-jefe');
        Route::patch('/gerente/pasantias/{idPasantia}/designar-jefe/{idPasante}', [App\Http\Controllers\Gerente\PasantiaPublicadaController::class, 'designarJefePasante'])->name('gerente.pasantias.designar-jefe');

    //no usadas
    //Route::get('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'index'])->name('gerente.empresa');
    //Route::get('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'index'])->name('gerente.jefes');
    //Route::get('/gerente/jefes/crear', [App\Http\Controllers\Gerente\JefeController::class, 'create'])->name('gerente.jefes.create');
    //Route::get('/gerente/pasantias/crear', [App\Http\Controllers\Gerente\PasantiaController::class, 'create'])->name('gerente.pasantias.create');
    //Route::get('/gerente/pasantias/activas', [App\Http\Controllers\Gerente\PasantiaController::class, 'activas'])->name('gerente.pasantias.activas');
});

