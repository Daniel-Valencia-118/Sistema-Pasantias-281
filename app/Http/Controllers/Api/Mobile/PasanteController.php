<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class PasanteController extends Controller
{
    public function perfil()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No se encontró información del pasante'], 404);
        }
        
        return response()->json([
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'ci' => $user->ci,
            'numero_cel' => $user->numero_cel,
            'correo' => $user->correo,
            'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
            'ru' => $pasante->ru,
            'matricula' => $pasante->matricula,
            'semestre' => $pasante->semestre,
            'mencion' => $pasante->mencion,
        ]);
    }
    
    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No se encontró información del pasante'], 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'required|string|max:50',
            'ci' => 'required|string|max:20',
            'numero_cel' => 'required|string|max:20',
            'correo' => 'required|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'fecha_nac' => 'required|date',
            'ru' => 'required|string|unique:pasante,ru,' . $pasante->idU_pasante . ',idU_pasante',
            'matricula' => 'required|string|unique:pasante,matricula,' . $pasante->idU_pasante . ',idU_pasante',
            'semestre' => 'required|integer|min:1|max:10',
            'mencion' => 'required|string|max:100',
        ]);
        
        // Actualizar usuario
        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'correo', 'fecha_nac']));
        
        // Actualizar pasante
        $pasante->update($request->only(['ru', 'matricula', 'semestre', 'mencion']));
        
        return response()->json(['message' => 'Perfil actualizado correctamente']);
    }

    public function getInfo()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        return response()->json([
            'ru' => $pasante->ru,
            'matricula' => $pasante->matricula,
            'semestre' => $pasante->semestre,
            'mencion' => $pasante->mencion,
        ]);
    }
}