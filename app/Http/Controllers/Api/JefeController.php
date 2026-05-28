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
use App\Models\Notificacion;
use App\Models\Empresa;
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

        // 1. ESTADÍSTICAS (KPIs) - Vinculado a tus reglas de negocio
        $stats = [
            'pasantes_activos' => Inscripcion::where('idU_jefe', $idJefe)->count(),
            
            // Evaluaciones finales pendientes (vencidas o al 100% de progreso sin evaluar)
            'actividades_pendientes' => BitacoraEva::where('idU_jefe', $idJefe)
                ->whereIn('estado', ['NO REALIZADA', 'PENDIENTE'])
                ->count(),
                
            'actividades_completadas' => BitacoraEva::where('idU_jefe', $idJefe)
                ->where('estado', 'COMPLETADA')
                ->count(),
                
            // Contamos notificaciones no leídas basándonos en tu tabla NOTIFICACION
            'mensajes_no_leidos' => Notificacion::where('id_usuario', $idJefe)
                ->where('leido', 0)
                ->count(),
        ];

        // 2. RENDIMIENTO POR PASANTE (Promedio de notas de evaluaciones finales cerradas)
        $rendimiento_pasantes = BitacoraEva::query()
            ->join('usuario', 'bitacora_eva.idU_pasante', '=', 'usuario.idUser')
            ->select(
                DB::raw("CONCAT(usuario.nombre, ' ', COALESCE(usuario.ap_paterno, '')) as nombre"),
                DB::raw("ROUND(AVG(bitacora_eva.nota)::numeric, 2) as progreso")
            )
            ->where('bitacora_eva.idU_jefe', $idJefe)
            ->where('bitacora_eva.estado', 'COMPLETADA')
            ->groupBy('usuario.idUser', 'usuario.nombre', 'usuario.ap_paterno')
            ->get();


        // 3. BITÁCORAS PENDIENTES DE EVALUACIÓN
        $bitacoras_pendientes = BitacoraEva::where('bitacora_eva.idU_jefe', $idJefe) // Añadido prefijo de tabla para evitar ambigüedad
            ->whereIn('bitacora_eva.estado', ['NO REALIZADA', 'PENDIENTE'])
            ->with(['actividad']) 
            ->join('usuario', 'bitacora_eva.idU_pasante', '=', 'usuario.idUser')
            ->select(
                'bitacora_eva.id_bitacora', // Traemos solo lo necesario para el map
                'bitacora_eva.fecha',
                'bitacora_eva.id_actividad', // Requerido para la relación con 'actividad'
                DB::raw("CONCAT(usuario.nombre, ' ', COALESCE(usuario.ap_paterno, '')) as pasante_full_name")
            )
            ->orderBy('bitacora_eva.fecha', 'desc')
            ->take(5)
            ->get()
            ->map(fn($b) => [
                'id' => $b->id_bitacora,
                'id_pasantia' => $b->actividad->pasantia->id_pasantia ?? null, // Aseguramos que exista la relación
                'pasante_nombre' => $b->pasante_full_name,
                'pasantia_titulo' => $b->actividad->nombre_act ?? 'Actividad General',
                'fecha' => $b->fecha, 
            ]);

        // 4. SEGUIMIENTO DE INFORMES FINALES (Inscripciones activas de sus pasantes)
        $informes_status = Inscripcion::where('inscripcion.idU_jefe', $idJefe)
            ->join('usuario', 'inscripcion.idU_pasante', '=', 'usuario.idUser')
            ->leftJoin('informe_fin', 'inscripcion.id_inscripcion', '=', 'informe_fin.id_inscripcion') // Cambiado a informe_fin
            ->select(
                DB::raw("CONCAT(usuario.nombre, ' ', COALESCE(usuario.ap_paterno, '')) as pasante"),
                'informe_fin.id_informe', // Cambiado a informe_fin
                'inscripcion.fecha_insc',
                'inscripcion.id_pasantia'
            )
            ->get()
            ->map(fn($i) => [
                'pasante' => $i->pasante,
                'completitud' => $i->id_informe ? 100 : 0, 
                'fecha_limite' => $i->fecha_insc,
                'id_pasantia' => $i->id_pasantia,
            ]);



        return Inertia::render('Jefe/Dashboard/Dashboard', [
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

    public function misPasantes($id_pasantia)
    {
        // 1. Obtener los datos del Jefe de Pasantía autenticado
        $user = Auth::user();
        $jefe = $user->jefePas; // idU_jefe

        // 2. Validar y obtener los datos de la Pasantía actual
        $pasantia = Pasantia::findOrFail($id_pasantia);
        
        // 3. Traer solo las inscripciones asignadas a este jefe en la PASANTÍA ACTUAL
        $inscripciones = Inscripcion::with(['pasante.user', 'pasantia.actividades.evaluaciones'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->where('id_pasantia', $id_pasantia)
            ->get();

        // 4. Mapear y procesar los estudiantes inyectando progresos más recientes y bitácoras
        $listadoPasantes = $inscripciones->map(function($inscripcion) {
            
            // Obtener el listado de actividades con su progreso más reciente y notas de bitácora
            $actividadesProgreso = $inscripcion->pasantia->actividades->map(function($actividad) use ($inscripcion) {
                
                // CONDICIÓN CRÍTICA: Obtener el progreso más reciente ordenando por fecha y hora
                $progresoReciente = DB::table('progreso_act')
                    ->where('id_actividad', $actividad->id_actividad)
                    ->where('idU_pasante', $inscripcion->idU_pasante)
                    ->orderBy('fecha', 'desc')
                    ->orderBy('hora', 'desc')
                    ->first();

                // Buscar si existe un registro de evaluación (BITACORA) para este pasante en esta actividad
                $evaluacionBitacora = $actividad->evaluaciones
                    ->where('idU_pasante', $inscripcion->idU_pasante)
                    ->first();

                // Si progresoReciente es null no enviamos la actividad al frontend, ya que no tiene avances registrados
                // if (!$progresoReciente) {
                //     return [];
                // }
                
                return [
                    'id_actividad' => $actividad->id_actividad,
                    'nombre_actividad' => $actividad->nombre_act,
                    'porcentaje' => $progresoReciente ? $progresoReciente->porcentaje : 0,
                    'descripcion_progreso' => $progresoReciente ? $progresoReciente->descripcion : 'Sin reportes de avance registrados.',
                    'fecha_progreso' => $progresoReciente ? $progresoReciente->fecha : null,
                    'hora_progreso' => $progresoReciente ? $progresoReciente->hora : null,
                    // Datos de evaluación oficial (Bitácora del Jefe) si existe
                    'id_bitacora' => $evaluacionBitacora ? $evaluacionBitacora->id_bitacora : null,
                    'nota' => $evaluacionBitacora ? $evaluacionBitacora->nota : null,
                    'observacion' => $evaluacionBitacora ? $evaluacionBitacora->observacion : null,
                    'recomendacion' => $evaluacionBitacora ? $evaluacionBitacora->recomendacion : null,
                ];
            })->values()->all();

            // Retornamos la estructura optimizada para la tabla y modales
            return [
                'id' => $inscripcion->id_inscripcion,
                'idU_pasante' => $inscripcion->idU_pasante,
                'estado' => $inscripcion->estado,
                'nombre_completo' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno . ' ' . $inscripcion->pasante->user->ap_materno,
                'ru' => $inscripcion->pasante->ru,
                'ci' => $inscripcion->pasante->user->ci,
                'matricula' => $inscripcion->pasante->matricula,
                'email' => $inscripcion->pasante->user->correo,
                'telefono' => $inscripcion->pasante->user->numero_cel ?? 'No registrado',
                'mencion' => $inscripcion->pasante->mencion ?? 'No registrado',
                'matricula' => $inscripcion->pasante->matricula ?? 'No registrado',
                'semestre' => $inscripcion->pasante->semestre ?? 'No registrado',
                'actividades_progreso' => $actividadesProgreso // Inyección de datos estructurales para Modal 2
            ];
        })->values()->all();

        // 5. Renderizado único enviando los datos limpios de la pasantía actual
        return Inertia::render('Jefe/MisPasantes', [
            'pasantia' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'nombre_pasantia' => $pasantia->nombre_pas,
                'codigo' => $pasantia->codigo_pas ?? $pasantia->codigo ?? 'PAS-GEN',
            ],
            'listadoPasantes' => $listadoPasantes,
        ]);
    }

    public function misPasantias()
    {
        // 1. Obtener el jefe autenticado con su respectiva empresa
        $jefe = Auth::user()->jefePas; 
        
        // Cargamos la empresa (asumiendo la relación 'empresa' en el modelo JefePas)
        // Si la relación está en la pasantía, la rescataremos dinámicamente abajo
        $empresa = $jefe->empresa ?? null;

        // 2. Obtener las pasantías asignadas
        $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
            $q->where('idU_jefe', $jefe->idU_jefe);
        })
        ->with(['inscripciones.pasante.user', 'empresa'])
        ->get()
        ->map(function ($pasantia) use (&$empresa) {
            
            // Fallback: Si el jefe no tiene empresa directa, la extraemos de su primera pasantía
            if (!$empresa && $pasantia->empresa) {
                $empresa = $pasantia->empresa;
            }

            return [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'estado' => $pasantia->estado,
                'mencion' => $pasantia->mencion ?? 'General / No especificada',
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
                'cupos' => (int) $pasantia->cupos,
                'cupos_disponibles' => (int) $pasantia->cupos_disponibles,
                'carga_horaria' => $pasantia->carga_horaria ?? 'No asignada',
                'turno' => $pasantia->turno ?? 'Flexible',
                'total_inscritos' => $pasantia->inscripciones->count(),
                'pasantes_inscritos' => $pasantia->inscripciones->map(function ($inscripcion) {
                    return [
                        'id' => $inscripcion->pasante->idU_pasante,
                        'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno . ' ' . ($inscripcion->pasante->user->ap_materno ?? ''),
                        'estado_inscripcion' => $inscripcion->estado,
                    ];
                }),
            ];
        });

        // 3. Retornar datos estructurados a Inertia
        return Inertia::render('Jefe/MisPasantias', [
            'pasantias' => $pasantias,
            'empresa' => $empresa ? [
                'id' => $empresa->id_empresa ?? $empresa->id,
                'nombre' => $empresa->nombre ?? 'No registrado',
                'nit' => $empresa->nit ?? 'S/N',
                'direccion' => $empresa->direccion ?? 'No especificada',
                'telefono' => $empresa->telefono ?? 'S/N',
                'email' => $empresa->email ?? 'S/N',
                'rubro' => $empresa->rubro ?? 'General',
            ] : null,
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
    // public function generarInformeFinalPorInscripcion($idInscripcion)
    // {
    //     $user = Auth::user();
    //     $jefe = $user->jefePas;
        
    //     $inscripcion = Inscripcion::with(['pasante.user', 'pasantia.actividades'])
    //         ->where('idU_jefe', $jefe->idU_jefe)
    //         ->findOrFail($idInscripcion);
        
    //     $pasantia = $inscripcion->pasantia;
    //     $actividades = $pasantia->actividades;
        
    //     // CONDICIÓN 1: Por cada actividad debe existir al menos 1 subactividad
    //     foreach ($actividades as $actividad) {
    //         $subactividades = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
    //             ->where('id_actividad', $actividad->id_actividad)
    //             ->get();
            
    //         if ($subactividades->count() == 0) {
    //             return response()->json([
    //                 'message' => "La actividad '{$actividad->nombre_act}' no tiene subactividades asignadas"
    //             ], 400);
    //         }
    //     }
        
    //     // CONDICIÓN 2: No debe haber subactividades pendientes
    //     $subactividadesPendientes = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
    //         ->where('estado', 'pendiente')
    //         ->exists();
        
    //     if ($subactividadesPendientes) {
    //         return response()->json([
    //             'message' => 'Hay subactividades pendientes de evaluar'
    //         ], 400);
    //     }
        
    //     // CONDICIÓN 3: Estado de la pasantía debe ser "finalizado"
    //     if ($pasantia->estado != 'finalizado') {
    //         return response()->json([
    //             'message' => 'La pasantía no ha sido marcada como finalizada'
    //         ], 400);
    //     }
        
    //     // Calcular promedio por actividad
    //     $promediosPorActividad = [];
    //     foreach ($actividades as $actividad) {
    //         $promedio = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
    //             ->where('id_actividad', $actividad->id_actividad)
    //             ->avg('nota');
            
    //         $promediosPorActividad[] = [
    //             'actividad' => $actividad->nombre_act,
    //             'promedio' => round($promedio ?: 0, 2),
    //         ];
    //     }
        
    //     $promedioFinal = collect($promediosPorActividad)->avg('promedio');
        
    //     $informe = InformeFin::updateOrCreate(
    //         ['id_inscripcion' => $idInscripcion],
    //         [
    //             'promedio' => round($promedioFinal, 2),
    //             'resultado' => null,
    //             'fecha' => now()->toDateString(),
    //             'idU_jefe' => $jefe->idU_jefe,
    //         ]
    //     );
        
    //     return response()->json([
    //         'message' => 'Informe final generado',
    //         'data' => [
    //             'informe' => $informe,
    //             'detalle_actividades' => $promediosPorActividad,
    //             'promedio_final' => round($promedioFinal, 2),
    //         ]
    //     ]);
    // }
    

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
     * Muestra las bitácoras de las actividades de las pasantias del pasante
     */
    public function showPasantiaBitacoras($id_pasantia)
    {
        $jefe = Auth::user()->jefePas;
        if (!$jefe) {
            return redirect()->back()->with('error', 'Perfil de jefe no válido.');
        }
        $pasantia = Pasantia::with('empresa')->findOrFail($id_pasantia);
        $inscripciones = Inscripcion::with(['pasante.user'])
            ->where('id_pasantia', $id_pasantia)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->get();

        $actividadesBase = Actividad::where('id_pasantia', $id_pasantia)
            ->orderBy('id_actividad', 'asc')
            ->get();
        
        // actividades ordenadas por fecha_ini ascendente tomando en cuenta el dia y el mes.
        $actividadesBase = $actividadesBase->sortBy(function($act) {
            return strtotime(date('Y') . '-' . date('m', strtotime($act->fecha_ini)) . '-' . date('d', strtotime($act->fecha_ini)));
        })->values();

        $pasantesData = $inscripciones->map(function ($inscripcion) use ($actividadesBase, $jefe) {
            $pasante = $inscripcion->pasante; 
            $actividadesEvaluadas = $actividadesBase->map(function ($actividad) use ($pasante, $jefe) { 
                // 1. Historial de Progresos
                $progresos = \DB::table('progreso_act')
                    ->where('id_actividad', $actividad->id_actividad)
                    ->where('idU_pasante', $pasante->idU_pasante)
                    ->orderBy('fecha', 'asc')
                    ->get()
                    ->map(function($p) {
                        return [
                            'id' => $p->id_progresoact ?? $p->id,
                            'descripcion' => $p->descripcion,
                            'fecha' => isset($p->fecha) ? date('d/m/Y', strtotime($p->fecha)) : '',
                            'hora' => isset($p->hora) ? date('H:i', strtotime($p->hora)) : '',
                            'porcentaje' => $p->porcentaje ?? 0
                        ];
                    });

                $ultimoProgreso = $progresos->last();
                $porcentajeProgreso = $ultimoProgreso ? $ultimoProgreso['porcentaje'] : 0;

                // === NUEVO: 1.5. Obtener el Chat de Comentarios (COM_ACTIVIDAD) ===
                $comentarios = \DB::table('com_actividad')
                    ->where('id_actividad', $actividad->id_actividad)
                    ->where('idU_pasante', $pasante->idU_pasante)
                    ->orderBy('fecha', 'asc')
                    ->orderBy('hora', 'asc')
                    ->get()
                    ->map(function($c) {
                        return [
                            'id_comactividad' => $c->id_comactividad,
                            'fecha' => $c->fecha ? date('d/m/Y', strtotime($c->fecha)) : '',
                            'hora' => $c->hora ? date('H:i', strtotime($c->hora)) : '',
                            // Identificamos quién envió el mensaje para renderizar las burbujas
                            'remitente' => !is_null($c->com_jefe) ? 'jefe' : 'pasante',
                            'texto' => $c->com_jefe ?? $c->com_pasante ?? '',
                            // 'com_pasante' => $c->com_pasante ?? '',
                            // 'com_jefe' => $c->com_jefe ?? '',
                        ];
                    });

                // 2. Obtener la Autoevaluación del Pasante
                $autoeva = \DB::table('auto_eva')
                    ->where('id_actividad', $actividad->id_actividad)
                    ->where('idU_pasante', $pasante->idU_pasante)
                    ->first();

                // 3. Obtener Evaluación del Jefe (Bitacora)
                $bitacora = BitacoraEva::where('id_actividad', $actividad->id_actividad)
                    ->where('idU_pasante', $pasante->idU_pasante)
                    ->where('idU_jefe', $jefe->idU_jefe)
                    ->first();

                $hoy = date('Y-m-d');
                $yaEmpezo = $actividad->fecha_ini && $actividad->fecha_ini <= $hoy;
                $yaVencioPlazo = $actividad->fecha_fin && $actividad->fecha_fin < $hoy;
                $progresoAl100 = (int)$porcentajeProgreso === 100;
                $puedeEvaluar = $yaEmpezo && ($progresoAl100 || $yaVencioPlazo);

                return [
                    'id_actividad' => $actividad->id_actividad,
                    'nombre_act' => $actividad->nombre_act,
                    'fecha_ini' => $actividad->fecha_ini ? date('d/m/Y', strtotime($actividad->fecha_ini)) : 'Sin fecha',
                    'fecha_fin' => $actividad->fecha_fin ? date('d/m/Y', strtotime($actividad->fecha_fin)) : 'Sin fecha',
                    'porcentaje_progreso' => $porcentajeProgreso,
                    'historial_progresos' => $progresos,                    
                    'comentarios' => $comentarios, // <-- AGREGADO AL PAYLOAD
                    'puede_evaluar' => $puedeEvaluar,
                    'tiene_autoevaluacion' => !is_null($autoeva),
                    'autoevaluacion' => $autoeva ? [
                        'id' => $autoeva->id_autoeva,
                        'comentario' => $autoeva->comentario,
                        'nota' => $autoeva->nota,
                        'fecha' => $autoeva->fecha ? date('d/m/Y', strtotime($autoeva->fecha)) : '',
                    ] : null,
                    'tiene_bitacora' => !is_null($bitacora),
                    'bitacora' => $bitacora ? [
                        'id' => $bitacora->id_bitacora,
                        'nota' => $bitacora->nota,
                        'observacion' => $bitacora->observacion,
                        'recomendacion' => $bitacora->recomendacion,
                        'descripcion' => $bitacora->descripcion,
                        'estado' => $bitacora->estado,
                        'fecha' => $bitacora->fecha ? $bitacora->fecha->format('d/m/Y') : '',
                    ] : null,
                ];
            });

            $todasEvaluadas = $actividadesEvaluadas->every(function ($act) {
                return $act['tiene_bitacora'] === true;
            });

            return [
                'idU_pasante' => $pasante->idU_pasante,
                'nombre_completo' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno . ' ' . $pasante->user->ap_materno,
                'actividades' => $actividadesEvaluadas,
                'listo_para_informe' => $todasEvaluadas && $actividadesEvaluadas->count() > 0,
            ];
        });

        // Ordenar pasantes por nombre completo
        $pasantesData = $pasantesData->sortBy('nombre_completo')->values();

        return Inertia::render('Jefe/Evaluaciones/Bitacoras', [
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'empresa' => $pasantia->empresa ? $pasantia->empresa->nombre : 'Particular',
            ],
            'pasantesData' => $pasantesData,
        ]);
    }

    /**
     * NUEVO MÉTODO: Guarda un comentario enviado por el jefe
     */
    public function storeComentario(Request $request)
    {
        $request->validate([
            'id_actividad' => 'required|integer',
            'idU_pasante'  => 'required|integer',
            'comentario'  => 'required|string|max:1500',
        ]);

        $jefe = Auth::user()->jefePas;

        if (!$jefe) {
            return redirect()->back()->with('error', 'No autorizado.');
        }

        // Inicia la transacción de la base de datos
        DB::beginTransaction();

        try {
            // buscar si ya existe un comentario del pasante para esta actividad
            // COM_ACTIVIDAD(id_comactividad, com_pasante, com_jefe, fecha, hora, idU_pasante, idU_jefe, id_actividad)
            // $comentarioExistente = DB::table('com_actividad')
            //     ->where('id_actividad', $request->id_actividad)
            //     ->where('idU_pasante', $request->idU_pasante)
            //     ->first();
            
            // // dd($comentarioExistente);
            // // actulizar com_jefe del comentario existente o crear uno nuevo si no existe
            // if ($comentarioExistente) {
            //     DB::table('com_actividad')->where('id_comactividad', $comentarioExistente->id_comactividad)->update([
            //         'com_jefe' => $request->comentario,
            //         // 'fecha' => now()->toDateString(),
            //         // 'hora' => now()->toTimeString(),
            //     ]);
            // } else {
                DB::table('com_actividad')->insert([
                    'id_actividad' => $request->id_actividad,
                    'idU_pasante'  => $request->idU_pasante,
                    'idU_jefe'     => $jefe->idU_jefe,
                    'com_jefe'     => $request->comentario,
                    'com_pasante'  => null,
                    'fecha'        => now()->toDateString(), // Alternativa limpia de Laravel
                    'hora'         => now()->toTimeString(), // Alternativa limpia de Laravel
                ]);
            // }

            // Confirma los cambios si todo sale bien
            DB::commit();

            return redirect()->back()->with('success', 'Comentario enviado exitosamente.');

        } catch (Exception $e) {
            // Cancela los cambios en la base de datos si algo falla
            DB::rollBack();

            // Registra el error en el archivo log de Laravel para auditoría
            // Log::error('Error al guardar comentario: ' . $e->getMessage());

            return redirect()->back()->with('error', 'Ocurrió un error al procesar tu solicitud.');
        }
    }

    public function evaluarBitacora(Request $request)
    {
        $jefe = Auth::user()->jefePas;

        $request->validate([
            'id_actividad' => 'required',
            'idU_pasante' => 'required',
            'nota' => 'required|numeric|min:0|max:100',
            'descripcion' => 'required|string',
            'observacion' => 'required|string',
            'recomendacion' => 'required|string',
            'estado' => 'required|string',
        ]);

        // Iniciar la transacción
        DB::beginTransaction();

        try {
            // Crear la bitácora de evaluación
            BitacoraEva::create([
                'idU_jefe' => $jefe->idU_jefe,
                'idU_pasante' => $request->idU_pasante,
                'id_actividad' => $request->id_actividad,
                'nota' => $request->nota,
                'observacion' => $request->observacion,
                'descripcion' => $request->descripcion,
                'recomendacion' => $request->recomendacion,
                'estado' => $request->estado,
                'fecha' => now(),
                'hora' => now(),
            ]);

            // Confirmar los cambios si todo sale bien
            DB::commit();

            return redirect()->back()->with('success', 'Evaluación registrada correctamente.');

        } catch (Exception $e) {
            // Deshacer los cambios en caso de error
            DB::rollBack();

            return redirect()->back()->with('error', 'Hubo un problema al registrar la evaluación: ' . $e->getMessage());
        }
    }

    /**
     * Actividades: lista de actividades del jefe
     */
    public function actividades()
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

        return Inertia::render('Jefe/Evaluaciones/Actividades', [
            'actividades' => $actividades,
            'pasantes' => $pasantes,
        ]);
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
                'nota_final' => $inf->nota_final,
            ]);

        return Inertia::render('Jefe/Informes/Historial', [
            'informes' => $informes,
        ]);
    }

/**
     * Carga el formulario inicial de selección
     */
    public function redactarInforme(Request $request)
    {
        $jefe = Auth::user()->jefePas;

        // Obtener todas las pasantías únicas donde este jefe tiene pasantes asignados
        $pasantias = Pasantia::whereIn('id_pasantia', function ($query) use ($jefe) {
            $query->select('id_pasantia')
                  ->from('inscripcion')
                  ->where('idU_jefe', $jefe->idU_jefe);
        })->get()->map(fn($p) => [
            'id' => $p->id_pasantia,
            'nombre' => $p->nombre_pas,
        ]);

        // Obtener todos los pasantes asignados con su respectiva pasantía
        $inscripciones = Inscripcion::with(['pasante.user', 'pasantia'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->get()
            ->map(fn($ins) => [
                'id_inscripcion' => $ins->id_inscripcion,
                'id_pasantia' => $ins->id_pasantia,
                'idU_pasante' => $ins->idU_pasante,
                'pasante_nombre' => $ins->pasante->user->nombre . ' ' . $ins->pasante->user->ap_paterno . ' ' . $ins->pasante->user->ap_materno,
            ]);

        // Capturar parámetros opcionales enviados desde Bitacoras.jsx
        $preselectedPasanteId = $request->query('pasante_id');
        $preselectedPasantiaId = $request->query('pasantia_id');

        return Inertia::render('Jefe/Informes/Redactar', [
            'pasantias' => $pasantias,
            'inscripciones' => $inscripciones,
            'preselectedPasanteId' => $preselectedPasanteId ? (int)$preselectedPasanteId : null,
            'preselectedPasantiaId' => $preselectedPasantiaId ? (int)$preselectedPasantiaId : null,
        ]);
    }

    /**
     * Endpoint consultado vía AXIOS para comprobar restricciones y calcular promedios
     */
    public function verificarStatusInscripcion(Request $request)
    {
        $jefe = Auth::user()->jefePas;
        $id_pasantia = $request->query('id_pasantia');
        $idU_pasante = $request->query('idU_pasante');

        // Buscar la inscripción correspondiente
        $inscripcion = Inscripcion::where('id_pasantia', $id_pasantia)
            ->where('idU_pasante', $idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->first();

        if (!$inscripcion) {
            return response()->json(['success' => false, 'message' => 'No se encontró una inscripción válida para los datos seleccionados.'], 404);
        }

        // RESTRICCIÓN 2: El pasante no debe tener un INFORME FINAL existente
        $informeExistente = InformeFin::where('id_inscripcion', $inscripcion->id_inscripcion)->exists();
        if ($informeExistente) {
            return response()->json([
                'success' => false, 
                'error_type' => 'ALREADY_EXISTS',
                'message' => 'El pasante ya cuenta con un Informe Final registrado para esta pasantía.'
            ]);
        }

        // Obtener actividades de la pasantía
        $totalActividades = Actividad::where('id_pasantia', $id_pasantia)->count();

        // Obtener bitácoras ya evaluadas
        $bitacoras = BitacoraEva::with('actividad')
            ->where('idU_pasante', $idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->whereIn('id_actividad', function($q) use ($id_pasantia) {
                $q->select('id_actividad')->from('actividad')->where('id_pasantia', $id_pasantia);
            })->get();

        // RESTRICCIÓN 1: El pasante debe tener todas las actividades evaluadas
        if ($totalActividades === 0 || $bitacoras->count() < $totalActividades) {
            return response()->json([
                'success' => false,
                'error_type' => 'PENDING_EVALUATIONS',
                'message' => "No se puede redactar el informe. El pasante tiene actividades pendientes (" . $bitacoras->count() . " de " . $totalActividades . " evaluadas)."
            ]);
        }

        // Calcular promedio de notas de las bitácoras
        $promedioCalculado = round($bitacoras->avg('nota'), 2);

        return response()->json([
            'success' => true,
            'id_inscripcion' => $inscripcion->id_inscripcion,
            'promedio' => $promedioCalculado,
            'bitacoras' => $bitacoras->map(fn($b) => [
                'id' => $b->id_bitacora,
                'actividad' => $b->actividad->nombre_act,
                'nota' => $b->nota,
                'estado' => $b->estado
            ])
        ]);
    }

    /**
     * Guarda el registro definitivo en la base de datos
     */
    public function generarInforme(Request $request)
    {
        $jefe = Auth::user()->jefePas;

        $request->validate([
            'id_inscripcion' => 'required|exists:inscripcion,id_inscripcion',
            'promedio' => 'required|numeric',
            'nota_final' => 'required|numeric|min:0|max:100',
        ]);

        // Iniciar la transacción
        DB::beginTransaction();

        try {
            // Determinar el resultado cualitativo de la pasantía
            $resultado = $request->nota_final >= 51 ? 'APROBADO' : 'REPROBADO';

            // Guardar en la tabla INFORME_FIN
            InformeFin::create([
                'id_inscripcion' => $request->id_inscripcion,
                'promedio' => $request->promedio,
                'nota_final' => $request->nota_final,
                'resultado' => $resultado,
                'fecha' => now(),
                'idU_jefe' => $jefe->idU_jefe,
            ]);

            // Confirmar los cambios si todo sale bien
            DB::commit();

            // actualizar estado del inscripcion a 'finalizado' para que no se puedan hacer más cambios
            $inscripcion = Inscripcion::find($request->id_inscripcion);
            $inscripcion->update(['estado' => 'finalizado']);

            // obtener id_pasantia para redirigir a la vista de historial de informes
            $id_pasantia = $inscripcion->id_pasantia;

            return redirect()->route('jefe.informes.historial', ['id_pasantia' => $id_pasantia])
                ->with('success', 'El Informe Final ha sido generado y guardado exitosamente.');
            // return redirect()->route('jefe.dashboard')->with('success', 'El Informe Final ha sido generado y guardado exitosamente.');

        } catch (\Exception $e) {
            // Deshacer los cambios en caso de cualquier error
            DB::rollBack();
            // Registrar el error en los logs para auditoría
            // Log::error('Error al generar el informe final: ' . $e->getMessage());
            // dd($e->getMessage());

            return redirect()->back()
                ->withInput()
                ->with('error', 'Ocurrió un error al procesar el informe. Inténtelo de nuevo.');
        }
    }

    /**
     * Muestra formulario para crear bitácora
     */
    // public function crearBitacora()
    // {
    //     $jefe = Auth::user()->jefePas;

    //     // Pasantías donde el jefe tiene pasantes asignados
    //     $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
    //         $q->where('idU_jefe', $jefe->idU_jefe);
    //     })->get()->map(fn($p) => [
    //         'id' => $p->id_pasantia,
    //         'nombre' => $p->nombre_pas,
    //     ]);

    //     // Pasantes bajo la supervisión del jefe (inscripciones activas)
    //     $pasantes = Pasante::with('user')
    //         ->whereHas('inscripciones', function ($q) use ($jefe) {
    //             $q->where('idU_jefe', $jefe->idU_jefe);
    //         })
    //         ->get()
    //         ->map(fn($p) => [
    //             'id' => $p->idU_pasante,
    //             'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
    //         ]);

    //     // Actividades de esas pasantías
    //     $actividades = Actividad::whereIn('id_pasantia', $pasantias->pluck('id'))
    //         ->get()
    //         ->map(fn($a) => [
    //             'id' => $a->id_actividad,
    //             'nombre' => $a->nombre_act,
    //             'pasantia_id' => $a->id_pasantia,
    //         ]);

    //     return Inertia::render('Jefe/Bitacora/Form', [
    //         'pasantias' => $pasantias,
    //         'pasantes' => $pasantes,
    //         'actividades' => $actividades,
    //         'bitacora' => null, // modo creación
    //     ]);
    // }

    // /**
    //  * Muestra formulario para editar bitácora
    //  */
    // public function editarBitacora($id)
    // {
    //     $bitacora = BitacoraEva::with('actividad.pasantia', 'pasante.user')
    //         ->findOrFail($id);

    //     $jefe = Auth::user()->jefePas;

    //     $pasantias = Pasantia::whereHas('inscripciones', function ($q) use ($jefe) {
    //         $q->where('idU_jefe', $jefe->idU_jefe);
    //     })->get()->map(fn($p) => [
    //         'id' => $p->id_pasantia,
    //         'nombre' => $p->nombre_pas,
    //     ]);

    //     $pasantes = Pasante::with('user')
    //         ->whereHas('inscripciones', function ($q) use ($jefe) {
    //             $q->where('idU_jefe', $jefe->idU_jefe);
    //         })
    //         ->get()
    //         ->map(fn($p) => [
    //             'id' => $p->idU_pasante,
    //             'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
    //         ]);

    //     $actividades = Actividad::whereIn('id_pasantia', $pasantias->pluck('id'))
    //         ->get()
    //         ->map(fn($a) => [
    //             'id' => $a->id_actividad,
    //             'nombre' => $a->nombre_act,
    //             'pasantia_id' => $a->id_pasantia,
    //         ]);

    //     $bitacoraData = [
    //         'id' => $bitacora->id_bitacora,
    //         'descripcion' => $bitacora->descripcion,
    //         'estado' => $bitacora->estado,
    //         'nota' => $bitacora->nota,
    //         'observacion' => $bitacora->observacion,
    //         'recomendacion' => $bitacora->recomendacion,
    //         'id_pasante' => $bitacora->idU_pasante,
    //         'id_actividad' => $bitacora->id_actividad,
    //         'id_pasantia' => $bitacora->actividad->id_pasantia,
    //     ];

    //     return Inertia::render('Jefe/Bitacora/Form', [
    //         'pasantias' => $pasantias,
    //         'pasantes' => $pasantes,
    //         'actividades' => $actividades,
    //         'bitacora' => $bitacoraData,
    //     ]);
    // }

    // /**
    //  * Guarda bitácora (crea o actualiza)
    //  */
    // public function guardarBitacora(Request $request)
    // {
    //     $request->validate([
    //         'id_bitacora' => 'nullable|exists:bitacora_eva,id_bitacora',
    //         'descripcion' => 'required|string',
    //         'estado' => 'required|in:no realizada,completada,completada parcialmente,sin calificar',
    //         'nota' => 'nullable|integer|min:0|max:100',
    //         'observacion' => 'nullable|string',
    //         'recomendacion' => 'nullable|string',
    //         'id_pasante' => 'required|exists:pasante,idU_pasante',
    //         'id_actividad' => 'required|exists:actividad,id_actividad',
    //     ]);

    //     $jefe = Auth::user()->jefePas;

    //     if ($request->filled('id_bitacora')) {
    //         // Editar
    //         $bitacora = BitacoraEva::findOrFail($request->id_bitacora);
    //         $bitacora->update($request->only('descripcion', 'estado', 'nota', 'observacion', 'recomendacion'));
    //     } else {
    //         // Crear
    //         BitacoraEva::create([
    //             'descripcion' => $request->descripcion,
    //             'estado' => $request->estado,
    //             'nota' => $request->nota,
    //             'observacion' => $request->observacion,
    //             'recomendacion' => $request->recomendacion,
    //             'fecha' => now(),
    //             'hora' => now(),
    //             'idU_pasante' => $request->id_pasante,
    //             'id_actividad' => $request->id_actividad,
    //             'idU_jefe' => $jefe->idU_jefe,
    //         ]);
    //     }

    //     return redirect()->route('jefe.bitacoras')->with('success', 'Bitácora guardada correctamente.');
    // }

    public function verInforme($id)
    {
        $informe = InformeFin::with('inscripcion.pasante.user', 'inscripcion.pasantia', 'jefe.user')
            ->findOrFail($id);
        return response()->json([
            'id' => $informe->id_informe,
            'pasante' => $informe->inscripcion->pasante->user->nombre . ' ' . $informe->inscripcion->pasante->user->ap_paterno,
            'pasantia' => $informe->inscripcion->pasantia->nombre_pas,
            'promedio' => $informe->promedio,
            'nota_final' => $informe->nota_final,
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
            'promedio'   => $informe->nota_final,
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