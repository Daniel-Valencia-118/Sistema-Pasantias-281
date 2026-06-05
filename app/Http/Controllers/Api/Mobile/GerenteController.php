<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Gerente;
use App\Models\Inscripcion;
use App\Models\JefePas;
use App\Models\Comentario;
use App\Models\Pasantia;
use App\Models\Actividad;
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

    public function empresa()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        $empresa = $gerente->empresa;
        
        if (!$empresa) {
            return response()->json(['message' => 'No se encontró información de la empresa'], 404);
        }
        
        return response()->json([
            'id_empresa' => $empresa->id_empresa,
            'nombre' => $empresa->nombre,
            'nit' => $empresa->nit,
            'direccion' => $empresa->direccion,
            'telefono' => $empresa->telefono,
            'email' => $empresa->email,
        ]);
    }

    public function actualizarEmpresa(Request $request)
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        $empresa = $gerente->empresa;
        
        if (!$empresa) {
            return response()->json(['message' => 'No se encontró información de la empresa'], 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:100',
            'direccion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);
        
        $empresa->update($request->only(['nombre', 'direccion', 'telefono', 'email']));
        
        return response()->json(['message' => 'Empresa actualizada correctamente']);
    }

    public function crearPasantia(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre_pas' => 'required|string|max:255',
            'mencion' => 'required|string',
            'cupos' => 'required|integer|min:1|max:20',
            'turno' => 'required|string',
            'carga_horaria' => 'nullable|integer|min:0',
            'detalles_horario' => 'nullable|string',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_ini',
            'actividades' => 'required|array|min:1',
            'actividades.*.nombre_act' => 'required|string|max:255',
            'actividades.*.tipo' => 'required|string|in:OPERATIVA,TECNICA',
            'actividades.*.descripcion' => 'nullable|string',
            'actividades.*.fecha_ini' => 'required|date',
            'actividades.*.fecha_fin' => 'required|date|after_or_equal:actividades.*.fecha_ini',
        ]);
        
        $pasantia = Pasantia::create([
            'nombre_pas' => $request->nombre_pas,
            'estado' => 'ABIERTA',
            'mencion' => $request->mencion,
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'cupos' => $request->cupos,
            'cupos_disponibles' => $request->cupos,
            'carga_horaria' => $request->carga_horaria ?? 0,
            'detalles_horario' => $request->detalles_horario,
            'turno' => $request->turno,
            'id_empresa' => $empresa->id_empresa,
        ]);
        
        foreach ($request->actividades as $actividad) {
            Actividad::create([
                'nombre_act' => $actividad['nombre_act'],
                'tipo' => $actividad['tipo'],
                'fecha_ini' => $actividad['fecha_ini'],
                'fecha_fin' => $actividad['fecha_fin'],
                'descripcion' => $actividad['descripcion'] ?? 'sin descripción',
                'id_pasantia' => $pasantia->id_pasantia,
            ]);
        }
        
        return response()->json(['message' => 'Pasantía publicada exitosamente'], 201);
    }
}