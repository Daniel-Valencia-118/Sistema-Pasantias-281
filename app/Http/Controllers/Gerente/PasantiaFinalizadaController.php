<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PasantiaFinalizadaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user', 'comentarios'])
            ->where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'FINALIZADO')
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $promedioCalificaciones = $pasantia->comentarios->avg('calificacion') ?? 0;
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos' => $pasantia->cupos,
                    'cupos_disponibles' => $pasantia->cupos_disponibles,
                    'inscritos' => $inscritos,
                    'promedio_calificaciones' => round($promedioCalificaciones, 1),
                    'total_calificaciones' => $pasantia->comentarios->count(),
                ];
            });
        
        return Inertia::render('Gerente/Pasantias/Finalizadas', [
            'pasantias' => $pasantias
        ]);
    }
    
    public function getActividadesConRealizados($idPasantia)
    {
        try {
            $pasantia = Pasantia::findOrFail($idPasantia);
            
            // Obtener todos los pasantes inscritos en esta pasantía
            $pasantesIds = Inscripcion::where('id_pasantia', $idPasantia)
                ->pluck('idU_pasante')
                ->toArray();
            
            $actividades = $pasantia->actividades->sortBy([
                ['fecha_ini', 'asc'],
                ['fecha_fin', 'asc']
            ])->map(function($actividad) use ($pasantesIds) {
                // Contar pasantes que completaron esta actividad
                $realizados = BitacoraEva::where('id_actividad', $actividad->id_actividad)
                    ->whereIn('idU_pasante', $pasantesIds)
                    ->whereIn('estado', ['COMPLETADA', 'COMPLETADA PARCIALMENTE'])
                    ->count();
                
                return [
                    'id' => $actividad->id_actividad,
                    'nombre_act' => $actividad->nombre_act,
                    'tipo' => $actividad->tipo,
                    'descripcion' => $actividad->descripcion,
                    'fecha_ini' => $actividad->fecha_ini,
                    'fecha_fin' => $actividad->fecha_fin,
                    'realizados' => $realizados,
                ];
            });
            
            return response()->json(['actividades' => $actividades->values()]);
            
        } catch (\Exception $e) {
            \Log::error('Error en getActividadesConRealizados: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPasantesConPromedio($idPasantia)
    {
        try {
            $pasantia = Pasantia::with('actividades')->findOrFail($idPasantia);
            
            $actividades = $pasantia->actividades->sortBy([
                ['fecha_ini', 'asc'],
                ['fecha_fin', 'asc']
            ])->map(function($actividad) {
                return [
                    'id' => $actividad->id_actividad,
                    'nombre_act' => $actividad->nombre_act,
                    'tipo' => $actividad->tipo,
                    'descripcion' => $actividad->descripcion,
                    'fecha_ini' => $actividad->fecha_ini,
                    'fecha_fin' => $actividad->fecha_fin,
                ];
            });
            
            $inscritos = Inscripcion::with(['pasante.user', 'jefe.user'])
                ->where('id_pasantia', $idPasantia)
                ->get()
                ->map(function($inscripcion) use ($pasantia) {
                    $totalNota = 0;
                    $actividadesComputadas = 0;
                    $evaluaciones = [];
                    
                    foreach ($pasantia->actividades as $actividad) {
                        $bitacora = BitacoraEva::where('idU_pasante', $inscripcion->pasante->idU_pasante)
                            ->where('id_actividad', $actividad->id_actividad)
                            ->first();
                        
                        $estado = $bitacora ? $bitacora->estado : null;
                        $nota = $bitacora ? $bitacora->nota : null;
                        
                        // Solo contar actividades con estado específico
                        if ($estado === 'COMPLETADA' || $estado === 'COMPLETADA PARCIALMENTE' || $estado === 'NO REALIZADA') {
                            $actividadesComputadas++;
                            $totalNota += $nota ?? 0;
                        }
                        
                        $evaluaciones[] = [
                            'id_actividad' => $actividad->id_actividad,
                            'evaluacion' => $bitacora ? [
                                'id' => $bitacora->id_bitacora,
                                'estado' => $bitacora->estado,
                                'nota' => $bitacora->nota,
                                'descripcion' => $bitacora->descripcion,
                                'observacion' => $bitacora->observacion,
                                'recomendacion' => $bitacora->recomendacion,
                                'fecha' => $bitacora->fecha ?  $bitacora->fecha->format('Y-m-d') : null,
                                'hora' => $bitacora->hora,
                                'jefe_nombre' => $bitacora->jefe ? $bitacora->jefe->user->nombre . ' ' . $bitacora->jefe->user->ap_paterno : null,
                                'jefe_ci' => $bitacora->jefe ? $bitacora->jefe->user->ci : null,
                            ] : null
                        ];
                    }
                    
                    $abandono = $actividadesComputadas === 0;
                    $promedio = !$abandono && $actividadesComputadas > 0 ? round($totalNota / $actividadesComputadas, 2) : 0;
                    
                    if ($abandono) {
                        $color = 'bg-orange-100 text-orange-800 border-orange-200';
                    } elseif ($promedio >= 80) {
                        $color = 'bg-green-100 text-green-800 border-green-200';
                    } elseif ($promedio >= 60) {
                        $color = 'bg-blue-100 text-blue-800 border-blue-200';
                    } elseif ($promedio >= 40) {
                        $color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                    } else {
                        $color = 'bg-red-100 text-red-800 border-red-200';
                    }
                    
                    return [
                        'id' => $inscripcion->id_inscripcion,
                        'idU_pasante' => $inscripcion->pasante->idU_pasante,
                        'ap_paterno' => $inscripcion->pasante->user->ap_paterno,
                        'ap_materno' => $inscripcion->pasante->user->ap_materno,
                        'nombre' => $inscripcion->pasante->user->nombre,
                        'ci' => $inscripcion->pasante->user->ci,
                        'numero_cel' => $inscripcion->pasante->user->numero_cel,
                        'correo' => $inscripcion->pasante->user->correo,
                        'fecha_nac' => $inscripcion->pasante->user->fecha_nac ? $inscripcion->pasante->user->fecha_nac->format('Y-m-d') : null,
                        'matricula' => $inscripcion->pasante->matricula,
                        'semestre' => $inscripcion->pasante->semestre,
                        'mencion' => $inscripcion->pasante->mencion,
                        'jefe' => $inscripcion->jefe ? [
                            'id' => $inscripcion->jefe->idU_jefe,
                            'ap_paterno' => $inscripcion->jefe->user->ap_paterno,
                            'ap_materno' => $inscripcion->jefe->user->ap_materno,
                            'nombre' => $inscripcion->jefe->user->nombre,
                            'ci' => $inscripcion->jefe->user->ci,
                            'numero_cel' => $inscripcion->jefe->user->numero_cel,
                            'fecha_nac' => $inscripcion->jefe->user->fecha_nac ? $inscripcion->jefe->user->fecha_nac->format('Y-m-d') : null,
                            'correo' => $inscripcion->jefe->user->correo,
                            'cargo' => $inscripcion->jefe->cargo,
                            'area' => $inscripcion->jefe->user->jefePas->area,
                        ] : null,
                        'promedio' => $promedio,
                        'color_promedio' => $color,
                        'abandono' => $abandono,
                        'evaluaciones' => $evaluaciones
                    ];
                })
                ->sortByDesc('promedio')
                ->values();
            
            return response()->json([
                'pasantia' => [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                ],
                'actividades' => $actividades->values(),
                'inscritos' => $inscritos
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error en getPasantesConPromedio: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function getCalificaciones($idPasantia)
    {
        try {
            $calificaciones = Comentario::with('pasante.user')
                ->where('id_pasantia', $idPasantia)
                ->get()
                ->map(function($comentario) {
                    return [
                        'id' => $comentario->id_comentario,
                        'ap_paterno' => $comentario->pasante->user->ap_paterno,
                        'ap_materno' => $comentario->pasante->user->ap_materno,
                        'nombre' => $comentario->pasante->user->nombre,
                        'ci' => $comentario->pasante->user->ci,
                        'descripcion' => $comentario->descripcion,
                        'calificacion' => $comentario->calificacion,
                        'fecha' => $comentario->fecha,
                    ];
                });
            
            $promedio = $calificaciones->avg('calificacion') ?? 0;
            
            return response()->json([
                'calificaciones' => $calificaciones,
                'promedio' => round($promedio, 1),
                'total' => $calificaciones->count()
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Error en getCalificaciones: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function clonarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantiaOriginal = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->with('actividades')
            ->firstOrFail();
        
        // Preparar datos para la copia (sin fechas)
        $datosPasantia = [
            'nombre_pas' => $pasantiaOriginal->nombre_pas,
            'mencion' => $pasantiaOriginal->mencion,
            'turno' => $pasantiaOriginal->turno,
            'carga_horaria' => $pasantiaOriginal->carga_horaria,
            'cupos' => $pasantiaOriginal->cupos,
            // Las fechas se dejan vacías
            'fecha_ini' => null,
            'fecha_fin' => null,
        ];
        
        // Preparar actividades (sin fechas)
        $actividades = [];
        foreach ($pasantiaOriginal->actividades as $actividad) {
            $actividades[] = [
                'nombre_act' => $actividad->nombre_act,
                'tipo' => $actividad->tipo,
                'descripcion' => $actividad->descripcion,
                // Las fechas se dejan vacías
                'fecha_ini' => null,
                'fecha_fin' => null,
            ];
        }
        
        return response()->json([
            'pasantia' => $datosPasantia,
            'actividades' => $actividades
        ]);
    }
}