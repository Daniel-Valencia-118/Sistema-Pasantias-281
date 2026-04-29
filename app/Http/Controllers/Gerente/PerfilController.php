<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PerfilController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        return Inertia::render('Gerente/Perfil/Index', [
            'user' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'correo' => $user->correo,
                'numero_cel' => $user->numero_cel,
                'ci' => $user->ci,
                'fecha_nac' => $user->fecha_nac,
                'estado_cuenta' => $user->estado_cuenta,
            ],
            'gerente' => [
                'nro_secun' => $gerente->nro_secun ?? null,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'numero_cel' => 'sometimes|string',
            'ci' => 'sometimes|string|unique:usuario,ci,' . $user->idUser . ',idUser',
            'fecha_nac' => 'sometimes|date',
            'nro_secun' => 'nullable|string',
            'password' => 'nullable|string|min:6',
            'password_confirmation' => 'nullable|same:password',
        ]);

        // Actualizar datos del usuario
        $userData = $request->only([
            'nombre_user', 'nombre', 'ap_paterno', 'ap_materno',
            'correo', 'numero_cel', 'ci', 'fecha_nac'
        ]);
        
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }
        
        $user->update($userData);
        
        // Actualizar datos del gerente
        if ($request->has('nro_secun')) {
            $user->gerente->update([
                'nro_secun' => $request->nro_secun
            ]);
        }
        
        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }
}