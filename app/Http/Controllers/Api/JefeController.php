<?php
// app/Http/Controllers/Api/JefeController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Mensaje;
use App\Models\InformeFin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JefeController extends Controller
{
    // Ver mis pasantes asignados
    public function misPasantes()
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $pasantes = Inscripcion::with(['pasante.user', 'pasantia.actividades'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->get()
            ->map(function($inscripcion) {
                return [
                    'inscripcion_id' => $inscripcion->id_inscripcion,
                    'pasante' => [
                        'id' => $inscripcion->pasante->idU_pasante,
                        'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                        'ru' => $inscripcion->pasante->ru,
                        'matricula' => $inscripcion->pasante->matricula,
                    ],
                    'pasantia' => [
                        'id' => $inscripcion->pasantia->id_pasantia,
                        'nombre' => $inscripcion->pasantia->nombre_pas,
                    ],
                    'estado' => $inscripcion->estado,
                ];
            });
        
        return response()->json(['data' => $pasantes]);
    }
    
    // Ver datos específicos de 1 pasante
    public function verPasante($idPasante)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $inscripcion = Inscripcion::with(['pasante.user', 'pasantia.actividades'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->where('idU_pasante', $idPasante)
            ->firstOrFail();
        
        // Obtener todas las actividades de la pasantía
        $actividades = $inscripcion->pasantia->actividades;
        
        // Obtener evaluaciones (bitácora) para cada actividad
        $evaluaciones = [];
        foreach ($actividades as $actividad) {
            $bitacoras = BitacoraEva::where('idU_pasante', $idPasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->get();
            
            $evaluaciones[] = [
                'actividad' => [
                    'id' => $actividad->id_actividad,
                    'nombre' => $actividad->nombre_act,
                    'descripcion' => $actividad->descripcion,
                ],
                'subactividades' => $bitacoras->map(function($bit) {
                    return [
                        'id_bitacora' => $bit->id_bitacora,
                        'descripcion' => $bit->descripcion,
                        'nota' => $bit->nota,
                        'observacion' => $bit->observacion,
                        'recomendacion' => $bit->recomendacion,
                        'fecha' => $bit->fecha,
                    ];
                }),
                'promedio' => round($bitacoras->avg('nota'), 2),
            ];
        }
        
        return response()->json([
            'data' => [
                'pasante' => [
                    'id' => $inscripcion->pasante->idU_pasante,
                    'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                    'correo' => $inscripcion->pasante->user->correo,
                    'ru' => $inscripcion->pasante->ru,
                    'matricula' => $inscripcion->pasante->matricula,
                    'semestre' => $inscripcion->pasante->semestre,
                    'mencion' => $inscripcion->pasante->mencion,
                ],
                'pasantia' => [
                    'id' => $inscripcion->pasantia->id_pasantia,
                    'nombre' => $inscripcion->pasantia->nombre_pas,
                    'fecha_ini' => $inscripcion->pasantia->fecha_ini,
                    'fecha_fin' => $inscripcion->pasantia->fecha_fin,
                ],
                'evaluaciones' => $evaluaciones,
            ]
        ]);
    }

        // Ver bitácora completa de un pasante (agrupada por actividad)
    public function verBitacoraPasante($idPasante)
    {
            $user = Auth::user();
            $jefe = $user->jefePas;
            
            // Verificar que el pasante está asignado a este jefe
            Inscripcion::where('idU_pasante', $idPasante)
                ->where('idU_jefe', $jefe->idU_jefe)
                ->firstOrFail();
            
            $bitacora = BitacoraEva::with(['actividad.pasantia'])
                ->where('idU_pasante', $idPasante)
                ->get()
                ->groupBy('id_actividad')
                ->map(function($items, $actividadId) {
                    $actividad = $items->first()->actividad;
                    return [
                        'actividad' => [
                            'id' => $actividad->id_actividad,
                            'nombre' => $actividad->nombre_act,
                            'descripcion' => $actividad->descripcion,
                        ],
                        'subactividades' => $items->map(function($item) {
                            return [
                                'id_bitacora' => $item->id_bitacora,
                                'descripcion' => $item->descripcion,
                                'nota' => $item->nota,
                                'observacion' => $item->observacion,
                                'recomendacion' => $item->recomendacion,
                                'fecha' => $item->fecha,
                            ];
                        }),
                        'promedio_actividad' => round($items->avg('nota'), 2),
                    ];
                });
            
            return response()->json(['data' => $bitacora]);
    }    

    // Evaluar subactividad (crear o actualizar bitácora)
    public function evaluarSubactividad(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'descripcion' => 'required|string', // descripción de la subactividad
            'nota' => 'required|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        // Verificar que la actividad pertenece a una pasantía donde el pasante está inscrito
        $inscripcion = Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->whereHas('pasantia.actividades', function($q) use ($request) {
                $q->where('id_actividad', $request->id_actividad);
            })
            ->firstOrFail();
        
        $bitacora = BitacoraEva::create([
            'descripcion' => $request->descripcion,
            'nota' => $request->nota,
            'observacion' => $request->observacion,
            'recomendacion' => $request->recomendacion,
            'idU_pasante' => $request->idU_pasante,
            'id_actividad' => $request->id_actividad,
            'idU_jefe' => $jefe->idU_jefe,
            'estado' => 'realizada',
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
        ]);
        
        return response()->json(['message' => 'Evaluación guardada', 'data' => $bitacora], 201);
    }
    
    // Actualizar evaluación de subactividad
    public function actualizarEvaluacion(Request $request, $idBitacora)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $bitacora = BitacoraEva::where('idU_jefe', $jefe->idU_jefe)
            ->findOrFail($idBitacora);
        
        $request->validate([
            'nota' => 'sometimes|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
        ]);
        
        $bitacora->update($request->only(['nota', 'observacion', 'recomendacion']));
        
        return response()->json(['message' => 'Evaluación actualizada', 'data' => $bitacora]);
        }
            
    // Enviar mensaje a pasante
    public function enviarMensaje(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'mensaje' => 'required|string',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        $mensaje = Mensaje::create([
            'descripcion' => $request->mensaje,
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
            'idU_pasante' => $request->idU_pasante,
            'idU_jefe' => $jefe->idU_jefe,
        ]);
        
        return response()->json(['message' => 'Mensaje enviado', 'data' => $mensaje]);
    }
    
    // Generar informe final (promedio de cada actividad)
    public function generarInformeFinal(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        $inscripcion = Inscripcion::with('pasantia.actividades')
            ->where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        // Calcular promedio por actividad
        $actividades = $inscripcion->pasantia->actividades;
        $promediosPorActividad = [];
        
        foreach ($actividades as $actividad) {
            $promedio = BitacoraEva::where('idU_pasante', $request->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->avg('nota');
            
            $promediosPorActividad[] = [
                'actividad' => $actividad->nombre_act,
                'promedio' => round($promedio ?: 0, 2),
            ];
        }
        
        // Calcular promedio final (promedio de los promedios de actividades)
        $promedioFinal = collect($promediosPorActividad)->avg('promedio');
        
        $informe = InformeFin::updateOrCreate(
            ['id_inscripcion' => $inscripcion->id_inscripcion],
            [
                'promedio' => round($promedioFinal, 2),
                'resultado' => null, // El tutor pondrá el resultado después
                'fecha' => now()->toDateString(),
                'idU_jefe' => $jefe->idU_jefe,
            ]
        );
        
        return response()->json([
            'message' => 'Informe final generado',
            'data' => [
                'informe' => $informe,
                'detalle_actividades' => $promediosPorActividad,
                'promedio_final' => round($promedioFinal, 2),
            ]
        ]);
    }
    
    // Ver informe final de un pasante
    public function verInformeFinal($idPasante)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $inscripcion = Inscripcion::where('idU_pasante', $idPasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        $informe = InformeFin::where('id_inscripcion', $inscripcion->id_inscripcion)->first();
        
        if (!$informe) {
            return response()->json(['message' => 'Informe no generado aún'], 404);
        }
        
        return response()->json(['data' => $informe]);
    }
}