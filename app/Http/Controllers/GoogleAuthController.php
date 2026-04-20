<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    // Redirige a Google
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Callback después de autenticación
    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->to('/login?error=google_auth_failed');
        }

        // Verificar si el usuario ya existe por correo o google_id
        $usuario = Usuario::where('correo', $googleUser->getEmail())->first();

        if (!$usuario) {
            // Crear nuevo usuario con datos de Google
            $usuario = Usuario::create([
                'nombre_user' => $this->generateUniqueUsername($googleUser->getEmail()),
                'correo' => $googleUser->getEmail(),
                // 'password' => '', // contraseña aleatoria
                'password' => Hash::make(Str::random(24)), // contraseña aleatoria
                'nombre' => $googleUser->getName() ?? explode('@', $googleUser->getEmail())[0],
                'ap_paterno' => '',
                'ap_materno' => '',
                'ci' => 0, // Campo requerido, asigna un valor temporal
                'numero_cel' => 0,
                'fecha_nac' => '2000-01-01',
                'estado_cuenta' => true,
            ]);
        }

        // Generar token Sanctum
        $token = $usuario->createToken('google-auth-token')->plainTextToken;

        // Redirigir al frontend con el token
        // Para API pura, devolver JSON. Para web, redirigir a SPA con token.
        return redirect()->to("http://localhost:5173/auth/callback?token={$token}&user_id={$usuario->idUser}");
    }

    private function generateUniqueUsername($email)
    {
        $base = explode('@', $email)[0];
        $username = $base;
        $counter = 1;
        while (Usuario::where('nombre_user', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }
        return $username;
    }
}