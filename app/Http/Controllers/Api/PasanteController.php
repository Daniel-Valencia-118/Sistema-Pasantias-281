<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PasanteController extends Controller
{
    // Ver todas las pasantías disponibles
    public function listarPasantias(Request $request)
    {
        $query = Pasantia::with('empresa')
            ->where('estado', 'activo')
            ->where('fecha_ini', '<=', now())
            ->where('fecha_fin', '>=', now())
            ->where('cupos_disponibles', '>', 0);
        
        // Filtros
        if ($request->has('mencion') && $request->mencion) {
            $query->where('mencion', 'like', '%' . $request->mencion . '%');
        }
        
        if ($request->has('empresa_id') && $request->empresa_id) {
            $query->where('id_empresa', $request->empresa_id);
        }
        
        if ($request->has('turno') && $request->turno) {
            $query->where('turno', $request->turno);
        }
        
        $pasantias = $query->get();
        
        // Agregar calificaciones promedio de la empresa
        foreach ($pasantias as $pasantia) {
            $pasantia->empresa->calificacion_promedio = Comentario::whereHas('pasantia', function($q) use ($pasantia) {
                $q->where('id_empresa', $pasantia->id_empresa);
            })->avg('calificacion');
        }
        
        return response()->json(['data' => $pasantias]);
    }
    
    // Ver detalles de una pasantía específica
    public function verPasantia($id)
    {
        $pasantia = Pasantia::with(['empresa', 'actividades'])->findOrFail($id);
        
        // Comentarios de la empresa
        $comentarios = Comentario::with('pasante.user')
            ->whereHas('pasantia', function($q) use ($pasantia) {
                $q->where('id_empresa', $pasantia->id_empresa);
            })
            ->get();
        
        return response()->json([
            'data' => [
                'pasantia' => $pasantia,
                'actividades' => $pasantia->actividades,
            ],
            'comentarios' => $comentarios
        ]);
    }
    
    // Inscribirse a una pasantía
    public function inscribirse(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);
        
        $pasantia = Pasantia::findOrFail($request->id_pasantia);
        
        // Verificar condiciones
        if ($pasantia->estado != 'activo') {
            return response()->json(['message' => 'Esta pasantía no está disponible'], 400);
        }
        
        if ($pasantia->cupos_disponibles <= 0) {
            return response()->json(['message' => 'No hay cupos disponibles'], 400);
        }
        
        if ($pasantia->fecha_ini > now()) {
            return response()->json(['message' => 'La pasantía aún no ha comenzado'], 400);
        }
        
        if ($pasantia->fecha_fin < now()) {
            return response()->json(['message' => 'La pasantía ya finalizó'], 400);
        }
        
        // Verificar si ya está inscrito
        $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->exists();
        
        if ($yaInscrito) {
            return response()->json(['message' => 'Ya estás inscrito en esta pasantía'], 400);
        }
        
        try {
            DB::beginTransaction();
            
            $inscripcion = Inscripcion::create([
                'fecha_insc' => now()->toDateString(),
                'hora_insc' => now()->toTimeString(),
                'estado' => 'inscrito',
                'idU_pasante' => $pasante->idU_pasante,
                'id_pasantia' => $request->id_pasantia,
                'idU_jefe' => null,
            ]);
            
            $pasantia->decrement('cupos_disponibles');
            
            DB::commit();
            
            return response()->json(['message' => 'Inscripción exitosa', 'data' => $inscripcion], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    // Ver mis inscripciones
    public function misInscripciones()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        $inscripciones = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->get();
        
        return response()->json(['data' => $inscripciones]);
    }
    
    // Ver mi bitácora 
    public function verBitacora(Request $request, $idActividad = null)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        // Si se especifica una actividad, ver solo esa
        if ($idActividad) {
            $bitacora = BitacoraEva::with(['actividad.pasantia.empresa'])
                ->where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $idActividad)
                ->first();
            
            if (!$bitacora) {
                return response()->json(['message' => 'No hay evaluación para esta actividad'], 404);
            }
            
            return response()->json(['data' => $bitacora]);
        }
        
        // Si no, ver toda la bitácora agrupada por actividad
        $bitacora = BitacoraEva::with(['actividad.pasantia.empresa'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->get()
            ->groupBy('id_actividad')
            ->map(function($items, $actividadId) {
                $actividad = $items->first()->actividad;
                $subActividades = $items->map(function($item) {
                    return [
                        'id_bitacora' => $item->id_bitacora,
                        'descripcion' => $item->descripcion,
                        'nota' => $item->nota,
                        'observacion' => $item->observacion,
                        'recomendacion' => $item->recomendacion,
                        'fecha' => $item->fecha,
                        'hora' => $item->hora,
                    ];
                });
                
                $promedioActividad = $items->avg('nota');
                
                return [
                    'actividad' => [
                        'id' => $actividad->id_actividad,
                        'nombre' => $actividad->nombre_act,
                        'descripcion' => $actividad->descripcion,
                        'pasantia' => $actividad->pasantia->nombre_pas,
                        'empresa' => $actividad->pasantia->empresa->nombre,
                    ],
                    'promedio_actividad' => round($promedioActividad, 2),
                    'subactividades' => $subActividades
                ];
            });
        
        return response()->json(['data' => $bitacora]);
    }

    // Calificar pasantía (al finalizar la pasantia)
    public function calificarPasantia(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'required|string',
        ]);
        
        // Verificar que el pasante estuvo inscrito en esta pasantía
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->where('estado', 'finalizado')
            ->first();
        
        if (!$inscripcion) {
            return response()->json(['message' => 'No puedes calificar esta pasantía'], 403);
        }
        
        // Verificar que no haya calificado ya
        $yaCalifico = Comentario::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->exists();
        
        if ($yaCalifico) {
            return response()->json(['message' => 'Ya calificaste esta pasantía'], 400);
        }
        
        $comentario = Comentario::create([
            'descripcion' => $request->comentario,
            'calificacion' => $request->calificacion,
            'fecha' => now()->toDateString(),
            'idU_pasante' => $pasante->idU_pasante,
            'id_pasantia' => $request->id_pasantia,
        ]);
        
        // Actualizar promedio de la empresa
        $pasantia = Pasantia::find($request->id_pasantia);
        $promedio = Comentario::whereHas('pasantia', function($q) use ($pasantia) {
            $q->where('id_empresa', $pasantia->id_empresa);
        })->avg('calificacion');
        
        $pasantia->empresa->update(['calificacion_promedio' => $promedio]);
        
        return response()->json(['message' => 'Calificación enviada', 'data' => $comentario]);
    }
    
  
}