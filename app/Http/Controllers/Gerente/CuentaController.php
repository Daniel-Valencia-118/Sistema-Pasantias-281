<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CuentaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Gerente/Cuenta/Index', [
            'user' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'correo' => $user->correo,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nombre_user' => 'required|string|max:255|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'correo' => 'required|email|max:255|unique:usuario,correo,' . $user->idUser . ',idUser',
            'current_password' => 'required_with:password|string|min:6',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        // Verificar contraseña actual si se quiere cambiar la contraseña
        if ($request->filled('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return back()->withErrors(['current_password' => 'La contraseña actual es incorrecta.']);
            }
            
            $user->password = Hash::make($request->password);
        }

        $user->nombre_user = $request->nombre_user;
        $user->correo = $request->correo;
        $user->save();

        return redirect()->back()->with('success', 'Cuenta actualizada correctamente.');
    }
}