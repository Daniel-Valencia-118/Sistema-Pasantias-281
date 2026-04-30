<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmpresaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        $empresa = $gerente->empresa;
        
        return Inertia::render('Gerente/Empresa/Index', [
            'empresa' => [
                'id_empresa' => $empresa->id_empresa,
                'nombre' => $empresa->nombre,
                'nit' => $empresa->nit,
                'direccion' => $empresa->direccion,
                'telefono' => $empresa->telefono,
                'email' => $empresa->email,
            ],
            'gerente' => [
                'nombre_completo' => $user->nombre . ' ' . $user->ap_paterno . ' ' . $user->ap_materno,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'nit' => 'required|string|max:50',
            'direccion' => 'nullable|string',
            'telefono' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);
        
        $empresa->update($request->only([
            'nombre', 'nit', 'direccion', 'telefono', 'email'
        ]));
        
        return redirect()->back()->with('success', 'Empresa actualizada correctamente.');
    }
}