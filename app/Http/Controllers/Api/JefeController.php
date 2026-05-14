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
use App\Models\Pasante;
use App\Models\JefePas;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Pdf;

class JefeController extends Controller
{
public function dashboard()
{
    $user = Auth::user();
    $idJefe = $user->idUser; 

    // 1. ESTADÍSTICAS (KPIs)
    $stats = [
        'pasantes_activos' => Inscripcion::where('idU_jefe', $idJefe)->count(),
        
        'actividades_pendientes' => BitacoraEva::where('idU_jefe', $idJefe)
            ->where('estado', 'no realizada')
            ->count(),
            
        'actividades_completadas' => BitacoraEva::where('idU_jefe', $idJefe)
            ->where('estado', 'completada')
            ->count(),
            
        'mensajes_recibidos' => Mensaje::where('idU_jefe', $idJefe)->count(),
    ];

    // 2. RENDIMIENTO POR PASANTE (Uso de Eloquent para evitar errores de tabla)
    $rendimiento_pasantes = BitacoraEva::query()
        ->join('usuario', 'bitacora_eva.idU_pasante', '=', 'usuario.idUser')
        ->select(
            DB::raw("CONCAT(usuario.nombre, ' ', usuario.ap_paterno) as nombre"),
            DB::raw("AVG(bitacora_eva.nota) as progreso")
        )
        ->where('bitacora_eva.idU_jefe', $idJefe)
        ->where('bitacora_eva.estado', 'completada')
        ->groupBy('usuario.idUser', 'usuario.nombre', 'usuario.ap_paterno')
        ->get();

    // 3. BITÁCORAS PENDIENTES
    $bitacoras_pendientes = BitacoraEva::where('idU_jefe', $idJefe)
        ->where('estado', 'no realizada')
        ->with(['pasante.user', 'actividad']) 
        ->orderBy('fecha', 'desc')
        ->take(5)
        ->get()
        ->map(fn($b) => [
            'id' => $b->id_bitacora,
            'pasante_nombre' => $b->pasante && $b->pasante->usuario 
                                ? $b->pasante->usuario->nombre . ' ' . $b->pasante->usuario->ap_paterno 
                                : 'Sin nombre',
            'pasantia_titulo' => $b->actividad->nombre_act ?? 'Actividad General',
            'fecha' => $b->fecha ? $b->fecha->format('d/m/Y') : 'S/F',
        ]);

    // 4. SEGUIMIENTO DE INFORMES FINALES
    $informes_status = Inscripcion::where('idU_jefe', $idJefe)
        ->with(['pasante.user', 'informeFinal'])
        ->get()
        ->map(fn($i) => [
            'pasante' => $i->pasante && $i->pasante->usuario 
                         ? $i->pasante->usuario->nombre . ' ' . $i->pasante->usuario->ap_paterno 
                         : 'N/A',
            'completitud' => $i->informeFinal ? 100 : 40, // 40% si está inscrito, 100% si tiene informe
            'resultado' => $i->informeFinal->resultado ?? 'Pendiente',
            'fecha_limite' => $i->fecha_insc,
        ]);

    return Inertia::render('Jefe/Dashboard', [
        'stats' => $stats,
        'rendimiento_pasantes' => $rendimiento_pasantes,
        'bitacoras_pendientes' => $bitacoras_pendientes,
        'actividades_recientes' => $informes_status,
    ]);
}
    public function perfil()
    {
        $user = Auth::user();
        $jefe = $user->jefePas()->with('empresa')->first();

        return Inertia::render('Jefe/Perfil', [
            'usuario' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'correo' => $user->correo,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'ci' => $user->ci,
                'numero_cel' => $user->numero_cel,
                'fecha_nac' => $user->fecha_nac,
            ],
            'jefe' => [
                'id' => $jefe->idU_jefe,
                'cargo' => $jefe->cargo,
                'area' => $jefe->area,
                'empresa' => $jefe->empresa->nombre ?? '',
            ],
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();
        $request->validate([
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'nullable|string|max:50',
            'ci' => 'required|integer|unique:usuario,ci,'.$user->idUser.',idUser',
            'numero_cel' => 'required|integer',
            'correo' => 'required|email|unique:usuario,correo,'.$user->idUser.',idUser',
            'cargo' => 'nullable|string',
            'area' => 'nullable|string',
            'password_actual' => 'nullable|current_password',
            'password' => 'nullable|confirmed|min:8',
        ]);

        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'correo']));

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        $jefe = $user->jefePas;
        if ($jefe) {
            $jefe->update($request->only(['cargo', 'area']));
        }

        return back()->with('success', 'Perfil actualizado correctamente.');
    }

    public function misPasantes2()
    {
        $user = Auth::user();
        $jefe = $user->jefePas;

        $pasantes = Pasante::with(['user', 'inscripciones' => function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            }, 'inscripciones.pasantia'])
            ->whereHas('inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(function ($pasante) {
                $inscripcionActiva = $pasante->inscripciones->first();
                return [
                    'id' => $pasante->idU_pasante,
                    'nombre_completo' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno . ' ' . $pasante->user->ap_materno,
                    'correo' => $pasante->user->correo,
                    'ru' => $pasante->ru,
                    'matricula' => $pasante->matricula,
                    'semestre' => $pasante->semestre,
                    'mencion' => $pasante->mencion,
                    'pasantia_actual' => $inscripcionActiva ? $inscripcionActiva->pasantia->nombre_pas : 'Sin pasantía activa',
                    'estado_inscripcion' => $inscripcionActiva ? $inscripcionActiva->estado : 'No asignado',
                    'id_inscripcion' => $inscripcionActiva ? $inscripcionActiva->id_inscripcion : null,
                ];
            });

        return Inertia::render('Jefe/MisPasantes', [
            'pasantes' => $pasantes,
        ]);
    }
    // Ver mis pasantes asignados
    public function misPasantes()
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $pasantes = Inscripcion::with(['pasante.user', 'pasantia.actividades', 'pasantia.actividades.evaluaciones'])
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
                    // Extraer y aplanar todas las evaluaciones de todas las actividades de esta pasantía
                    'bitacora' => $inscripcion->pasantia->actividades->flatMap(function($actividad) {
                        return $actividad->evaluaciones->map(function($eva) use ($actividad) {
                            return [
                                'id_bitacora' => $eva->id_bitacora,
                                'descripcion' => $eva->descripcion,
                                'nota' => $eva->nota,
                                'observacion' => $eva->observacion,
                                'recomendacion' => $eva->recomendacion,
                                'fecha' => $eva->fecha,
                                'actividad_nombre' => $actividad->nombre_act,
                            ];
                        });
                    }),
                ];
            });
        
        // return response()->json(['data' => $pasantes]);
        return Inertia::render('Jefe/MisPasantes', [
            'pasantes' => $pasantes,
        ]);
    }

    public function misPasantias()
    {
        $jefe = Auth::user()->jefePas;
        $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
            $q->where('idU_jefe', $jefe->idU_jefe);
        })->with(['inscripciones.pasante.user'])->get()->map(function ($pasantia) {
            return [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'estado' => $pasantia->estado,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
                'cupos' => $pasantia->cupos,
                'cupos_disponibles' => $pasantia->cupos_disponibles,
                'pasantes_inscritos' => $pasantia->inscripciones->map(function ($inscripcion) {
                    return [
                        'id' => $inscripcion->pasante->idU_pasante,
                        'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                        'estado_inscripcion' => $inscripcion->estado,
                    ];
                }),
            ];
        });

        return Inertia::render('Jefe/MisPasantias', [
            'pasantias' => $pasantias,
        ]);
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
    // public function asignarSubactividad(Request $request)
    // {
    //     $user = Auth::user();
    //     $jefe = $user->jefePas;
        
    //     $request->validate([
    //         'idU_pasante' => 'required|exists:pasante,idU_pasante',
    //         'id_actividad' => 'required|exists:actividad,id_actividad',
    //         'descripcion' => 'required|string',
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
    //         'nota' => null,
    //         'observacion' => null,
    //         'recomendacion' => null,
    //         'estado' => 'pendiente',
    //         'idU_pasante' => $request->idU_pasante,
    //         'id_actividad' => $request->id_actividad,
    //         'idU_jefe' => $jefe->idU_jefe,
    //         'fecha' => null,
    //         'hora' => null,
    //     ]);
        
    //     return response()->json(['message' => 'Subactividad asignada', 'data' => $bitacora], 201);
    // }

    // =============================================
    // EVALUAR SUBACTIVIDAD EXISTENTE 
    // =============================================
    // public function evaluarBitacora(Request $request)
    // {
    //     $user = Auth::user();
    //     $jefe = $user->jefePas;
        
    //     $request->validate([
    //         'idBitacora' => 'required|exists:bitacora_eva,id_bitacora',
    //         'nota' => 'required|integer|min:0|max:100',
    //         'observacion' => 'nullable|string',
    //         'recomendacion' => 'nullable|string',
    //         //'estado' => 'requiered|string|in:pendiente,realizada,no realizada',           
    //     ]);
        
    //     $bitacora = BitacoraEva::where('idU_jefe', $jefe->idU_jefe)
    //         ->findOrFail($request->idBitacora);
        
    //     $bitacora->update([
    //         'nota' => $request->nota,
    //         'observacion' => $request->observacion,
    //         'recomendacion' => $request->recomendacion,
    //         'estado' => 'realizada',
    //         'fecha' => now()->toDateString(),
    //         'hora' => now()->toTimeString(),
    //     ]);
        
    //     return response()->json(['message' => 'Evaluación guardada', 'data' => $bitacora]);
    // }
    
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
    // public function enviarMensaje(Request $request)
    // {
    //     $user = Auth::user();
    //     $jefe = $user->jefePas;
        
    //     $request->validate([
    //         'idU_pasante' => 'required|exists:pasante,idU_pasante',
    //         'mensaje' => 'required|string',
    //     ]);
        
    //     // Verificar que el pasante está asignado a este jefe
    //     Inscripcion::where('idU_pasante', $request->idU_pasante)
    //         ->where('idU_jefe', $jefe->idU_jefe)
    //         ->firstOrFail();
        
    //     $mensaje = Mensaje::create([
    //         'descripcion' => $request->mensaje,
    //         'fecha' => now()->toDateString(),
    //         'hora' => now()->toTimeString(),
    //         'idU_pasante' => $request->idU_pasante,
    //         'idU_jefe' => $jefe->idU_jefe,
    //     ]);
        
    //     return response()->json(['message' => 'Mensaje enviado', 'data' => $mensaje]);
    // }
    
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

       /**
     * Muestra las bitácoras pendientes de revisión
     */
    public function bitacoras(Request $request)
    {
        $jefe = Auth::user()->jefePas;
        $bitacoras = BitacoraEva::with(['pasante.user', 'actividad'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(function ($bitacora) {
                return [
                    'id' => $bitacora->id_bitacora,
                    'pasante' => $bitacora->pasante->user->nombre . ' ' . $bitacora->pasante->user->ap_paterno,
                    'actividad' => $bitacora->actividad->nombre_act,
                    'estado' => $bitacora->estado,
                    'nota' => $bitacora->nota,
                    // enviar fecha y hora en formato legible para el frontend (ej: 15/09/2024)
                    'fecha' => $bitacora->fecha->format('d/m/Y'),
                    // 'hora' => $bitacora->hora->format('H:i'),
                    'observacion' => $bitacora->observacion,
                ];
            });

        return Inertia::render('Jefe/Evaluaciones/Bitacoras', [
            'bitacoras' => $bitacoras,
        ]);
    }

    /**
     * Evalúa o actualiza una bitácora
     */
    public function evaluarBitacora(Request $request)
    {
        $request->validate([
            'id_bitacora' => 'required|exists:bitacora_eva,id_bitacora',
            'nota' => 'required|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            // el estado deber ser: no realizada, completada, completada parcialmente, sin calificar
            'estado' => 'required|in: no realizada,completada,completada parcialmente,sin calificar',
        ]);

        $bitacora = BitacoraEva::findOrFail($request->id_bitacora);
        $bitacora->update($request->only(['nota', 'observacion', 'estado']));

        return back()->with('success', 'Evaluación guardada correctamente.');
    }

    /**
     * Subactividades: lista de actividades del jefe y posibilidad de asignar/crear
     */
    public function subactividades()
    {
        $jefe = Auth::user()->jefePas;
        $actividades = Actividad::with('pasantia')
            ->whereHas('pasantia.inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(function ($act) {
                return [
                    'id' => $act->id_actividad,
                    'nombre' => $act->nombre_act,
                    'pasantia' => $act->pasantia->nombre_pas,
                    // mandamos también fechas para mostrar en el frontend si es necesario
                    'fecha_ini' => $act->fecha_ini,
                    'fecha_fin' => $act->fecha_fin,
                    'tipo' => $act->tipo,
                ];
            });

        // También necesitamos lista de pasantes para asignar
        $pasantes = Pasante::with('user')
            ->whereHas('inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(fn($p) => [
                'id' => $p->idU_pasante,
                'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
            ]);

        return Inertia::render('Jefe/Evaluaciones/Subactividades', [
            'actividades' => $actividades,
            'pasantes' => $pasantes,
        ]);
    }

    /**
     * Asigna una subactividad (crea registro en bitacora_eva)
     */
    public function asignarSubactividad(Request $request)
    {
        $request->validate([
            'id_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'descripcion' => 'required|string',
        ]);

        BitacoraEva::create([
            'descripcion' => $request->descripcion,
            'estado' => 'no realizada',
            'nota' => null,
            'observacion' => null,
            'recomendacion' => null,
            'fecha' => now(),
            'hora' => now(),
            'idU_pasante' => $request->id_pasante,
            'id_actividad' => $request->id_actividad,
            'idU_jefe' => Auth::user()->jefePas->idU_jefe,
        ]);

        return back()->with('success', 'Subactividad asignada.');
    }

    /**
     * Formulario para enviar mensaje
     */
    public function crearMensaje()
    {
        $jefe = Auth::user()->jefePas;
        $pasantes = Pasante::with('user')
            ->whereHas('inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(fn($p) => [
                'id' => $p->idU_pasante,
                'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
            ]);

        return Inertia::render('Jefe/Comunicacion/CrearMensaje', [
            'pasantes' => $pasantes,
        ]);
    }

    /**
     * Guarda el mensaje enviado
     */
    public function enviarMensaje(Request $request)
    {
        $request->validate([
            'id_pasante' => 'required|exists:pasante,idU_pasante',
            'descripcion' => 'required|string',
        ]);

        Mensaje::create([
            'descripcion' => $request->descripcion,
            'idU_pasante' => $request->id_pasante,
            'idU_jefe' => Auth::user()->jefePas->idU_jefe,
            'fecha' => now(),
            'hora' => now(),
        ]);

        return redirect()->route('jefe.mensajes.enviados')->with('success', 'Mensaje enviado.');
    }

    /**
     * Historial de mensajes enviados
     */
    public function mensajesEnviados()
    {
        $jefe = Auth::user()->jefePas;
        $mensajes = Mensaje::with('pasante.user')
            ->where('idU_jefe', $jefe->idU_jefe)
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(fn($m) => [
                'id' => $m->id_mensaje,
                'pasante' => $m->pasante->user->nombre . ' ' . $m->pasante->user->ap_paterno,
                'descripcion' => $m->descripcion,
                'fecha' => $m->fecha->format('d/m/Y'),
                'hora' => $m->hora,
            ]);

        return Inertia::render('Jefe/Comunicacion/MensajesEnviados', [
            'mensajes' => $mensajes,
        ]);
    }

    /**
     * Historial de informes finales
     */
    public function informesHistorial()
    {
        $jefe = Auth::user()->jefePas;
        $informes = InformeFin::with(['inscripcion.pasante.user', 'inscripcion.pasantia'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(fn($inf) => [
                'id' => $inf->id_informe,
                'pasante' => $inf->inscripcion->pasante->user->nombre . ' ' . $inf->inscripcion->pasante->user->ap_paterno,
                'pasantia' => $inf->inscripcion->pasantia->nombre_pas,
                'promedio' => $inf->promedio,
                'resultado' => $inf->resultado,
                'fecha' => $inf->fecha->format('d/m/Y'),
                'id_inscripcion' => $inf->id_inscripcion,
            ]);

        return Inertia::render('Jefe/Informes/Historial', [
            'informes' => $informes,
        ]);
    }

    /**
     * Formulario para redactar/generar informe final
     */
    public function redactarInforme(Request $request)
    {
        $jefe = Auth::user()->jefePas;
        $inscripcionId = $request->query('inscripcion'); // opcional

        $inscripciones = Inscripcion::with('pasante.user', 'pasantia')
            ->where('idU_jefe', $jefe->idU_jefe)
            ->where('estado', 'Inscrito') // solo activas
            ->get()
            ->map(fn($ins) => [
                'id' => $ins->id_inscripcion,
                'pasante' => $ins->pasante->user->nombre . ' ' . $ins->pasante->user->ap_paterno,
                'pasantia' => $ins->pasantia->nombre_pas,
            ]);

        $inscripcionSeleccionada = null;
        if ($inscripcionId) {
            $inscripcionSeleccionada = Inscripcion::with('pasante.user', 'pasantia')
                ->find($inscripcionId);
            if ($inscripcionSeleccionada) {
                $inscripcionSeleccionada = [
                    'id' => $inscripcionSeleccionada->id_inscripcion,
                    'pasante' => $inscripcionSeleccionada->pasante->user->nombre . ' ' . $inscripcionSeleccionada->pasante->user->ap_paterno,
                    'pasantia' => $inscripcionSeleccionada->pasantia->nombre_pas,
                ];
            }
        }

        return Inertia::render('Jefe/Informes/Redactar', [
            'inscripciones' => $inscripciones,
            'inscripcionSeleccionada' => $inscripcionSeleccionada,
        ]);
    }

    /**
     * Genera el informe final (calcula promedio y guarda)
     */
    public function generarInforme(Request $request)
    {
        $request->validate([
            'id_inscripcion' => 'required|exists:inscripcion,id_inscripcion',
        ]);

        $inscripcion = Inscripcion::findOrFail($request->id_inscripcion);
        // Verificar que el jefe esté asignado
        if ($inscripcion->idU_jefe !== Auth::user()->jefePas->idU_jefe) {
            abort(403);
        }

        // Calcular promedio de las bitácoras de esta inscripción
        $promedio = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
            ->whereIn('id_actividad', function ($q) use ($inscripcion) {
                $q->select('id_actividad')
                  ->from('actividad')
                  ->where('id_pasantia', $inscripcion->id_pasantia);
            })
            ->where('idU_jefe', Auth::user()->jefePas->idU_jefe)
            ->avg('nota') ?? 0;

        $resultado = $promedio >= 51 ? 'aprobado' : 'reprobado';

        $informe = InformeFin::updateOrCreate(
            ['id_inscripcion' => $inscripcion->id_inscripcion],
            [
                'promedio' => $promedio,
                'resultado' => $resultado,
                'fecha' => now(),
                'idU_jefe' => Auth::user()->jefePas->idU_jefe,
            ]
        );

        return back()->with('success', 'Informe final generado exitosamente.');
    }

    /**
     * Muestra formulario para crear bitácora
     */
    public function crearBitacora()
    {
        $jefe = Auth::user()->jefePas;

        // Pasantías donde el jefe tiene pasantes asignados
        $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
            $q->where('idU_jefe', $jefe->idU_jefe);
        })->get()->map(fn($p) => [
            'id' => $p->id_pasantia,
            'nombre' => $p->nombre_pas,
        ]);

        // Pasantes bajo la supervisión del jefe (inscripciones activas)
        $pasantes = Pasante::with('user')
            ->whereHas('inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(fn($p) => [
                'id' => $p->idU_pasante,
                'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
            ]);

        // Actividades de esas pasantías
        $actividades = Actividad::whereIn('id_pasantia', $pasantias->pluck('id'))
            ->get()
            ->map(fn($a) => [
                'id' => $a->id_actividad,
                'nombre' => $a->nombre_act,
                'pasantia_id' => $a->id_pasantia,
            ]);

        return Inertia::render('Jefe/Bitacora/Form', [
            'pasantias' => $pasantias,
            'pasantes' => $pasantes,
            'actividades' => $actividades,
            'bitacora' => null, // modo creación
        ]);
    }

    /**
     * Muestra formulario para editar bitácora
     */
    public function editarBitacora($id)
    {
        $bitacora = BitacoraEva::with('actividad.pasantia', 'pasante.user')
            ->findOrFail($id);

        $jefe = Auth::user()->jefePas;

        $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
            $q->where('idU_jefe', $jefe->idU_jefe);
        })->get()->map(fn($p) => [
            'id' => $p->id_pasantia,
            'nombre' => $p->nombre_pas,
        ]);

        $pasantes = Pasante::with('user')
            ->whereHas('inscripciones', function ($q) use ($jefe) {
                $q->where('idU_jefe', $jefe->idU_jefe);
            })
            ->get()
            ->map(fn($p) => [
                'id' => $p->idU_pasante,
                'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
            ]);

        $actividades = Actividad::whereIn('id_pasantia', $pasantias->pluck('id'))
            ->get()
            ->map(fn($a) => [
                'id' => $a->id_actividad,
                'nombre' => $a->nombre_act,
                'pasantia_id' => $a->id_pasantia,
            ]);

        $bitacoraData = [
            'id' => $bitacora->id_bitacora,
            'descripcion' => $bitacora->descripcion,
            'estado' => $bitacora->estado,
            'nota' => $bitacora->nota,
            'observacion' => $bitacora->observacion,
            'recomendacion' => $bitacora->recomendacion,
            'id_pasante' => $bitacora->idU_pasante,
            'id_actividad' => $bitacora->id_actividad,
            'id_pasantia' => $bitacora->actividad->id_pasantia,
        ];

        return Inertia::render('Jefe/Bitacora/Form', [
            'pasantias' => $pasantias,
            'pasantes' => $pasantes,
            'actividades' => $actividades,
            'bitacora' => $bitacoraData,
        ]);
    }

    /**
     * Guarda bitácora (crea o actualiza)
     */
    public function guardarBitacora(Request $request)
    {
        $request->validate([
            'id_bitacora' => 'nullable|exists:bitacora_eva,id_bitacora',
            'descripcion' => 'required|string',
            'estado' => 'required|in:no realizada,completada,completada parcialmente,sin calificar',
            'nota' => 'nullable|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
            'id_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
        ]);

        $jefe = Auth::user()->jefePas;

        if ($request->filled('id_bitacora')) {
            // Editar
            $bitacora = BitacoraEva::findOrFail($request->id_bitacora);
            $bitacora->update($request->only('descripcion', 'estado', 'nota', 'observacion', 'recomendacion'));
        } else {
            // Crear
            BitacoraEva::create([
                'descripcion' => $request->descripcion,
                'estado' => $request->estado,
                'nota' => $request->nota,
                'observacion' => $request->observacion,
                'recomendacion' => $request->recomendacion,
                'fecha' => now(),
                'hora' => now(),
                'idU_pasante' => $request->id_pasante,
                'id_actividad' => $request->id_actividad,
                'idU_jefe' => $jefe->idU_jefe,
            ]);
        }

        return redirect()->route('jefe.bitacoras')->with('success', 'Bitácora guardada correctamente.');
    }

    public function verInforme($id)
    {
        $informe = InformeFin::with('inscripcion.pasante.user', 'inscripcion.pasantia', 'jefe.user')
            ->findOrFail($id);
        return response()->json([
            'id' => $informe->id_informe,
            'pasante' => $informe->inscripcion->pasante->user->nombre . ' ' . $informe->inscripcion->pasante->user->ap_paterno,
            'pasantia' => $informe->inscripcion->pasantia->nombre_pas,
            'promedio' => $informe->promedio,
            'resultado' => $informe->resultado,
            'fecha' => $informe->fecha->format('d/m/Y'),
            'observaciones' => $informe->observacion ?? 'Sin observaciones',
            'jefe' => $informe->jefe->user->nombre . ' ' . $informe->jefe->user->ap_paterno,
        ]);
    }

    public function descargarInforme($id)
    {
        // Implementación básica: devolver un PDF generado o redirigir a una vista de descarga
        // Por ahora, podemos generar un PDF simple con los datos o devolver un mensaje
        // Usaremos la facade PDF si está disponible, sino retornamos un texto.
        // Asumiremos que tenemos una biblioteca PDF (barryvdh/laravel-dompdf) instalada; si no, la agregamos.
        $informe = InformeFin::with('inscripcion.pasante.user', 'inscripcion.pasantia', 'jefe.user')->findOrFail($id);
        // PASO DE DEPURACIÓN: Si ves los datos aquí, el problema es el Blade.
        // dd($informe->toArray()); 

        $pdf = \PDF::loadView('informes.pdf', compact('informe'));
        
        // Agrega esta opción para mejorar la compatibilidad con HTML5
        $pdf->setOption(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true]);

        return $pdf->stream("informe_{$id}.pdf", ["Attachment" => false]);
        // return $pdf->download("informe_{$informe->id_informe}.pdf");
    }
    
    public function generarCertificado($id)
    {
        // 1. Obtener los datos con sus relaciones
        $informe = InformeFin::with(['inscripcion.pasante.user', 'inscripcion.pasantia.empresa', 'jefe.user'])
                    ->findOrFail($id);

        // 2. Preparar los datos para la vista
        $data = [
            'pasante'    => $informe->inscripcion->pasante->user->nombre . ' ' . $informe->inscripcion->pasante->user->ap_paterno . ' ' . $informe->inscripcion->pasante->user->ap_materno,
            'cedula'     => $informe->inscripcion->pasante->user->ci ?? 'S/N',
            'empresa'    => $informe->inscripcion->pasantia->empresa->nombre,
            'pasantia'   => $informe->inscripcion->pasantia->nombre_pas,
            'promedio'   => $informe->promedio,
            'cargahoraria' => $informe->inscripcion->pasantia->carga_horaria,
            'fecha'      => now(),
            'jefe'       => $informe->jefe->user->nombre,
            'resultado'  => $informe->resultado,
        ];

        // 3. Cargar la vista Blade y generar el PDF
        // 'landscape' para que el certificado sea horizontal
        $pdf = Pdf::loadView('informes.certificado', $data)->setPaper('letter', 'landscape');

        $pdf->setOption(['isHtml5ParserEnabled' => true, 'isRemoteEnabled' => true]);

        // 4. abrir el archivo en otra pestaña del navegador (stream) en lugar de descargarlo
        return $pdf->stream("certificado_{$informe->id_informe}.pdf", ["Attachment" => false]);
    }
}