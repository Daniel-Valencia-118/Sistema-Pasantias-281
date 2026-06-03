<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\User;
use App\Models\Gerente;
use App\Models\Inscripcion;
use App\Models\JefePas;
use App\Models\Comentario;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class GerenteController extends Controller
{
    public function estadisticas()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;

        return response()->json([
            'kpis' => [
                'total_pasantias' => Pasantia::where('id_empresa', $empresa->id_empresa)->count(),
                'total_pasantes' => Inscripcion::whereHas('pasantia', function($q) use ($empresa) {
                    $q->where('id_empresa', $empresa->id_empresa);
                })->distinct('idU_pasante')->count('idU_pasante'),
                'total_jefes' => JefePas::where('id_empresa', $empresa->id_empresa)->count(),
                'calificacion_promedio' => round(Comentario::whereHas('pasantia', function($q) use ($empresa) {
                    $q->where('id_empresa', $empresa->id_empresa);
                })->avg('calificacion') ?? 0, 1),
            ]
        ]);
    }

    public function perfil()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        if (!$gerente) {
            return response()->json(['message' => 'No se encontró información del gerente'], 404);
        }
        
        return response()->json([
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'ci' => $user->ci,
            'numero_cel' => $user->numero_cel,
            'correo' => $user->correo,
            'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
            'nro_secun' => $gerente->nro_secun,
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        $request->validate([
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'required|string|max:50',
            'ci' => 'required|string|max:20',
            'numero_cel' => 'required|string|max:20',
            'correo' => 'required|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'fecha_nac' => 'required|date',
            'nro_secun' => 'nullable|string|max:20',
        ]);
        
        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'correo', 'fecha_nac']));
        $gerente->update(['nro_secun' => $request->nro_secun]);
        
        return response()->json(['message' => 'Perfil actualizado correctamente']);
    }
}