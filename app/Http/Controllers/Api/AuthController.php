<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Login para cualquier rol
    public function login(Request $request)
    {
        $request->validate([
            'nombre_user' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('nombre_user', $request->nombre_user)
                    ->orWhere('correo', $request->nombre_user)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales incorrectas'], 401);
        }

        if (!$user->estado_cuenta) {
            return response()->json(['message' => 'Cuenta deshabilitada'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Determinar rol
        $role = $this->getUserRole($user);

        return response()->json([
            'message' => 'Login exitoso',
            'user' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'nombre' => $user->nombre,
                'correo' => $user->correo,
                'role' => $role,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    // Obtener usuario actual - ver datos
    public function me(Request $request)
    {
        $user = $request->user();
        $role = $this->getUserRole($user);
        
        // Cargar datos según rol
        $userData = [
            'id' => $user->idUser,
            'nombre_user' => $user->nombre_user,
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'correo' => $user->correo,
            'numero_cel' => $user->numero_cel,
            'ci' => $user->ci,
            'fecha_nac' => $user->fecha_nac,
            'role' => $role,
        ];

        // Cargar datos específicos del rol
        if ($user->pasante) {
            $userData['perfil'] = $user->pasante;
        } elseif ($user->gerente) {
            $userData['perfil'] = $user->gerente->load('empresa');
        } elseif ($user->jefePas) {
            $userData['perfil'] = $user->jefePas->load('empresa');
        } elseif ($user->tutorAca) {
            $userData['perfil'] = $user->tutorAca;
        } elseif ($user->administrador) {
            $userData['perfil'] = $user->administrador;
        }

        return response()->json($userData);
    }

    // Logout - cerrar sesion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Sesión cerrada']);
    }

    // Actualizar datos personales (cualquier usuario)
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'password' => 'sometimes|string|min:6',
            'numero_cel' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
        ]);

        if ($request->has('password')) {
            $request->merge(['password' => Hash::make($request->password)]);
        }

        $user->update($request->only([
            'nombre_user', 'password', 'numero_cel', 'correo',
            'nombre', 'ap_paterno', 'ap_materno'
        ]));

        return response()->json(['message' => 'Perfil actualizado', 'user' => $user]);
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