<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PerfilController extends Controller
{
    // Vista de perfil (datos personales)
    public function index()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        return Inertia::render('Gerente/Perfil/Index', [
            'user' => [
                'id' => $user->idUser,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'ci' => $user->ci,
                'numero_cel' => $user->numero_cel,
                'correo' => $user->correo,
                'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
            ],
            'gerente' => [
                'nro_secun' => $gerente->nro_secun ?? null,
            ]
        ]);
    }

    // Actualizar datos personales (sin contraseña)
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ap_paterno' => 'required|string|max:255',
            'ap_materno' => 'required|string|max:255',
            'ci' => 'required|string|max:20|unique:usuario,ci,' . $user->idUser . ',idUser',
            'numero_cel' => 'required|string|max:20',
            'correo' => 'required|email|max:255|unique:usuario,correo,' . $user->idUser . ',idUser',
            'fecha_nac' => 'required|date',
            'nro_secun' => 'nullable|string|max:20',
        ]);

        $user->update([
            'nombre' => $request->nombre,
            'ap_paterno' => $request->ap_paterno,
            'ap_materno' => $request->ap_materno,
            'ci' => $request->ci,
            'numero_cel' => $request->numero_cel,
            'correo' => $request->correo,
            'fecha_nac' => $request->fecha_nac,
        ]);

        $user->gerente->update([
            'nro_secun' => $request->nro_secun,
        ]);

        return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
    }
}