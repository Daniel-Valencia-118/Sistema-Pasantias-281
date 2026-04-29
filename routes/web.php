<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GoogleAuthController;
use Inertia\Inertia;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Api\AdminController;

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

// Route::middleware(['auth:sanctum', 'verified'])->group(function () {
    // Dashboard Admin
    Route::get('/admin/dashboard', [App\Http\Controllers\Admin\DashboardController::class, 'index'])
        ->name('admin.dashboard');
    Route::get('/admin/alertas', [App\Http\Controllers\Admin\DashboardController::class, 'alertas'])
        ->name('admin.alertas');

    // Usuarios
    Route::get('/admin/usuarios', [AdminController::class, 'listarTodosUsuarios'])
        ->name('admin.usuarios.index');
    Route::get('/admin/solicitudes', [App\Http\Controllers\Admin\SolicitudController::class, 'index'])
        ->name('admin.solicitudes.index');
    Route::get('/admin/administradores', [App\Http\Controllers\Admin\AdministradorController::class, 'index'])
        ->name('admin.administradores.index');
    Route::get('/admin/gerentes', [App\Http\Controllers\Admin\GerenteController::class, 'index'])
        ->name('admin.gerentes.index');
    Route::get('/admin/jefes', [App\Http\Controllers\Admin\JefeController::class, 'index'])
        ->name('admin.jefes.index');
    Route::get('/admin/tutores', [App\Http\Controllers\Admin\TutorController::class, 'index'])
        ->name('admin.tutores.index');
    Route::get('/admin/pasantes', [App\Http\Controllers\Admin\PasanteController::class, 'index'])
        ->name('admin.pasantes.index');

    // Empresas
    Route::get('/admin/empresas', [App\Http\Controllers\Admin\EmpresaController::class, 'index'])
        ->name('admin.empresas.index');

    // Pasantías
    Route::get('/admin/pasantias', [App\Http\Controllers\Admin\PasantiaController::class, 'index'])
        ->name('admin.pasantias.index');

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
// });

// ruta log out
Route::post('/logout', function () {
    auth()->logout();
    return redirect()->route('welcome');
})->name('logout');












// Rutas protegidas (ejemplo)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
