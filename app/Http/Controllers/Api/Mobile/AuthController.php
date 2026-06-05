<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar por nombre_user o correo
        $user = User::where('nombre_user', $request->login)
            ->orWhere('correo', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales incorrectas.'
            ], 401);
        }

        // Verificar estado de aprobación
        if ($user->estado_aprobacion != 'aprobado') {
            $mensaje = $user->estado_aprobacion == 'pendiente' 
                ? 'Tu cuenta está pendiente de aprobación.'
                : 'Tu cuenta fue rechazada.';
            return response()->json(['message' => $mensaje], 403);
        }

        // Verificar cuenta activa
        if (!$user->estado_cuenta) {
            return response()->json(['message' => 'Cuenta deshabilitada por el administrador.'], 403);
        }

        // Obtener rol del usuario
        $rol = $this->getUserRole($user);

        // Crear token de acceso
        $token = $user->createToken('mobile-token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'correo' => $user->correo,
                'rol' => $rol,
                'avatar_url' => $user->avatar_url,
            ],
            'token' => $token,
        ]);
    }
    public function user(Request $request)
    {
        $user = $request->user();
        $rol = $this->getUserRole($user);
        
        return response()->json([
            'id' => $user->idUser,
            'nombre_user' => $user->nombre_user,
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'correo' => $user->correo,
            'rol' => $rol,
            'avatar_url' => $user->avatar_url,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }
    private function getUserRole($user)
    {
        if ($user->administrador) return 'admin';
        if ($user->pasante) return 'pasante';
        if ($user->gerente) return 'gerente';
        if ($user->jefePas) return 'jefe';
        if ($user->tutorAca) return 'tutor';
        return null;
    }
}