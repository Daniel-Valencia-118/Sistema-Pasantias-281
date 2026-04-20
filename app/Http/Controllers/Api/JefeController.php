<?php
// app/Http/Controllers/Api/JefeController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Mensaje;
use App\Models\InformeFin;
use App\Models\Pasantia;
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

    // =============================================
    // ASIGNAR SUBACTIVIDAD (sin nota, estado pendiente)
    // =============================================
    public function asignarSubactividad(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'descripcion' => 'required|string',
            'estado' => 'requiered|string|in:pendiente,realizada,no realizada',           
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
            'nota' => null,
            'observacion' => null,
            'recomendacion' => null,
            'estado' => 'pendiente',
            'idU_pasante' => $request->idU_pasante,
            'id_actividad' => $request->id_actividad,
            'idU_jefe' => $jefe->idU_jefe,
            'fecha' => null,
            'hora' => null,
        ]);
        
        return response()->json(['message' => 'Subactividad asignada', 'data' => $bitacora], 201);
    }

    // =============================================
    // EVALUAR SUBACTIVIDAD EXISTENTE 
    // =============================================
    public function evaluarBitacora(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idBitacora' => 'required|exists:bitacora_eva,id_bitacora',
            'nota' => 'required|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
            //'estado' => 'requiered|string|in:pendiente,realizada,no realizada',           
        ]);
        
        $bitacora = BitacoraEva::where('idU_jefe', $jefe->idU_jefe)
            ->findOrFail($request->idBitacora);
        
        $bitacora->update([
            'nota' => $request->nota,
            'observacion' => $request->observacion,
            'recomendacion' => $request->recomendacion,
            'estado' => 'realizada',
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
        ]);
        
        return response()->json(['message' => 'Evaluación guardada', 'data' => $bitacora]);
    }
    
    // // Evaluar subactividad (crear o actualizar bitácora)
    // public function evaluarSubactividad(Request $request)
    // {
    //     $user = Auth::user();
    //     $jefe = $user->jefePas;
        
    //     $request->validate([
    //         'idU_pasante' => 'required|exists:pasante,idU_pasante',
    //         'id_actividad' => 'required|exists:actividad,id_actividad',
    //         'descripcion' => 'required|string', // descripción de la subactividad de la actividad
    //         'nota' => 'required|integer|min:0|max:100',
    //         'observacion' => 'nullable|string',
    //         'recomendacion' => 'nullable|string',
    //         'estado' => 'requiered|string|in:pendiente,realizada,no realizada',
    //     ]);
        
    //     // Verificar que el pasante está asignado a este jefe
    //     Inscripcion::where('idU_pasante', $request->idU_pasante)
    //         ->where('idU_jefe', $jefe->idU_jefe)
    //         ->firstOrFail();
        
    //     // Verificar que la actividad pertenece a una pasantía donde el pasante está inscrito
    //     $inscripcion = Inscripcion::where('idU_pasante', $request->idU_pasante)
    //         ->whereHas('pasantia.actividades', function($q) use ($request) {
    //             $q->where('id_actividad', $request->id_actividad);
    //         })
    //         ->firstOrFail();
        
    //     $bitacora = BitacoraEva::create([
    //         'descripcion' => $request->descripcion,
    //         'nota' => $request->nota,
    //         'observacion' => $request->observacion,
    //         'recomendacion' => $request->recomendacion,
    //         'idU_pasante' => $request->idU_pasante,
    //         'id_actividad' => $request->id_actividad,
    //         'idU_jefe' => $jefe->idU_jefe,
    //         'estado' => 'realizada',
    //         'fecha' => now()->toDateString(),
    //         'hora' => now()->toTimeString(),
    //     ]);
        
    //     return response()->json(['message' => 'Evaluación guardada', 'data' => $bitacora], 201);
    // }
    
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
    
    // =============================================
    // GENERAR INFORME FINAL POR ID DE INSCRIPCIÓN
    // =============================================
    public function generarInformeFinalPorInscripcion($idInscripcion)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $inscripcion = Inscripcion::with(['pasante.user', 'pasantia.actividades'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->findOrFail($idInscripcion);
        
        $pasantia = $inscripcion->pasantia;
        $actividades = $pasantia->actividades;
        
        // CONDICIÓN 1: Por cada actividad debe existir al menos 1 subactividad
        foreach ($actividades as $actividad) {
            $subactividades = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->get();
            
            if ($subactividades->count() == 0) {
                return response()->json([
                    'message' => "La actividad '{$actividad->nombre_act}' no tiene subactividades asignadas"
                ], 400);
            }
        }
        
        // CONDICIÓN 2: No debe haber subactividades pendientes
        $subactividadesPendientes = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
            ->where('estado', 'pendiente')
            ->exists();
        
        if ($subactividadesPendientes) {
            return response()->json([
                'message' => 'Hay subactividades pendientes de evaluar'
            ], 400);
        }
        
        // CONDICIÓN 3: Estado de la pasantía debe ser "finalizado"
        if ($pasantia->estado != 'finalizado') {
            return response()->json([
                'message' => 'La pasantía no ha sido marcada como finalizada'
            ], 400);
        }
        
        // Calcular promedio por actividad
        $promediosPorActividad = [];
        foreach ($actividades as $actividad) {
            $promedio = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->avg('nota');
            
            $promediosPorActividad[] = [
                'actividad' => $actividad->nombre_act,
                'promedio' => round($promedio ?: 0, 2),
            ];
        }
        
        $promedioFinal = collect($promediosPorActividad)->avg('promedio');
        
        $informe = InformeFin::updateOrCreate(
            ['id_inscripcion' => $idInscripcion],
            [
                'promedio' => round($promedioFinal, 2),
                'resultado' => null,
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
    

    // =============================================
    // OBTENER ESTADO DE UNA PASANTÍA
    // =============================================
    public function obtenerEstadoPasantia(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);
        
        $pasantia = Pasantia::findOrFail($request->id_pasantia);
        
        return response()->json([
            'data' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'estado' => $pasantia->estado,
            ]
        ]);
    }
}