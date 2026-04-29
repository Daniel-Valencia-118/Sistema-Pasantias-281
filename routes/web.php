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

Route::middleware(['auth', 'role:gerente'])->group(function () {
    Route::get('/gerente', function () {
        return Inertia::render('Gerente/Dashboard');
    })->name('gerente.dashboard');
    //perfil
    Route::put('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'update'])->name('gerente.perfil.update');   
    Route::get('/gerente/perfil', [App\Http\Controllers\Gerente\PerfilController::class, 'index'])->name('gerente.perfil');  
    //no usadas
    Route::get('/gerente/empresa', [App\Http\Controllers\Gerente\EmpresaController::class, 'index'])->name('gerente.empresa');
    Route::get('/gerente/jefes', [App\Http\Controllers\Gerente\JefeController::class, 'index'])->name('gerente.jefes');
    Route::get('/gerente/jefes/crear', [App\Http\Controllers\Gerente\JefeController::class, 'create'])->name('gerente.jefes.create');
    Route::get('/gerente/pasantias', [App\Http\Controllers\Gerente\PasantiaController::class, 'index'])->name('gerente.pasantias');
    Route::get('/gerente/pasantias/crear', [App\Http\Controllers\Gerente\PasantiaController::class, 'create'])->name('gerente.pasantias.create');
    Route::get('/gerente/pasantias/activas', [App\Http\Controllers\Gerente\PasantiaController::class, 'activas'])->name('gerente.pasantias.activas');
});