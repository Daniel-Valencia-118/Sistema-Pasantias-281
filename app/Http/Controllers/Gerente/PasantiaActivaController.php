<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\Actividad;
use App\Models\BitacoraEva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PasantiaActivaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'INICIADO')
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $cuposDisponibles = $pasantia->cupos - $inscritos;
                
                // Calcular si todos los inscritos tienen jefe asignado
                $todosConJefe = $pasantia->inscripciones->every(fn($insc) => $insc->idU_jefe !== null);
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos' => $pasantia->cupos,
                    'cupos_disponibles' => $cuposDisponibles,
                    'inscritos' => $inscritos,
                    'todos_con_jefe' => $todosConJefe,
                    'actividades_count' => $pasantia->actividades->count(),
                ];
            });
        
        return Inertia::render('Gerente/Pasantias/Activas', [
            'pasantias' => $pasantias
        ]);
    }
    
    public function getInscritosConEvaluaciones($idPasantia)
    {
        $pasantia = Pasantia::findOrFail($idPasantia);
        
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
            ->map(function($inscripcion) use ($actividades) {
                // Para cada actividad, buscar la evaluación del pasante
                $evaluaciones = [];
                foreach ($actividades as $actividad) {
                    $bitacora = BitacoraEva::where('idU_pasante', $inscripcion->pasante->idU_pasante)
                        ->where('id_actividad', $actividad['id'])
                        ->first();
                    
                    $evaluaciones[] = [
                        'id_actividad' => $actividad['id'],
                        'evaluacion' => $bitacora ? [
                            'id' => $bitacora->id_bitacora,
                            'estado' => $bitacora->estado,
                            'nota' => $bitacora->nota,
                            'descripcion' => $bitacora->descripcion,
                            'observacion' => $bitacora->observacion,
                            'recomendacion' => $bitacora->recomendacion,
                            'fecha' => $bitacora->fecha ? $bitacora->fecha ->format('Y-m-d') : null,
                            'hora' => $bitacora->hora,
                            'jefe_nombre' => $bitacora->jefe ? $bitacora->jefe->user->nombre . ' ' . $bitacora->jefe->user->ap_paterno : null,
                            'jefe_ci' => $bitacora->jefe ? $bitacora->jefe->user->ci : null,
                        ] : null
                    ];
                }
                
                return [
                    'id' => $inscripcion->id_inscripcion,
                    'idU_pasante' => $inscripcion->pasante->idU_pasante,
                    'ap_paterno' => $inscripcion->pasante->user->ap_paterno,
                    'ap_materno' => $inscripcion->pasante->user->ap_materno,
                    'nombre' => $inscripcion->pasante->user->nombre,
                    'ci' => $inscripcion->pasante->user->ci,
                    'numero_cel' => $inscripcion->pasante->user->numero_cel,
                    'fecha_nac' => $inscripcion->pasante->user->fecha_nac ? $inscripcion->pasante->user->fecha_nac -> format('Y-m-d') : null,
                    'correo' => $inscripcion->pasante->user->correo,
                    'matricula' => $inscripcion->pasante->matricula,
                    'semestre' => $inscripcion->pasante->semestre,
                    'mencion' => $inscripcion->pasante->mencion,
                    'jefe' => $inscripcion->jefe ? [
                        'id' => $inscripcion->jefe->idU_jefe,
                        'nombre' => $inscripcion->jefe->user->nombre,
                        'ap_paterno' => $inscripcion->jefe->user->ap_paterno,
                        'ap_materno' => $inscripcion->jefe->user->ap_materno,
                        'fecha_nac' => $inscripcion->jefe->user->fecha_nac ? $inscripcion->jefe->user->fecha_nac ->format('Y-m-d') : null,
                        'ci' => $inscripcion->jefe->user->ci,
                        'numero_cel' => $inscripcion->jefe->user->numero_cel,
                        'correo' => $inscripcion->jefe->user->correo,
                        'cargo' => $inscripcion->jefe->cargo,
                        'area' => $inscripcion->jefe->area,

                    ] : null,
                    'evaluaciones' => $evaluaciones
                ];
            });
        
        return response()->json([
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
            ],
            'actividades' => $actividades->values(),            
            'inscritos' => $inscritos->values()
        ]);
    }
    // Método para verificar si una actividad tiene evaluaciones
    public function actividadTieneEvaluaciones($idActividad)
    {
        $hasEvaluaciones = BitacoraEva::where('id_actividad', $idActividad)->exists();
        return response()->json(['hasEvaluaciones' => $hasEvaluaciones]);
    }

    // Agrega este método
    public function finalizarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        // Verificar que está en estado INICIADO
        if ($pasantia->estado !== 'INICIADO') {
            return response()->json(['message' => 'La pasantía no está en estado INICIADO'], 400);
        }
        
        $inscritos = $pasantia->inscripciones;
        
        // Condición: Todos los inscritos tienen jefe asignado
        $sinJefe = $inscritos->filter(function($inscripcion) {
            return $inscripcion->idU_jefe === null;
        });
        
        if ($sinJefe->count() > 0) {
            return response()->json(['message' => 'Existen pasantes sin tener un jefe de pasante asignado'], 400);
        }
        
        // Verificar si hay inscripciones que no están en estado 'finalizado'
        $inscripcionesNoFinalizadas = $inscritos->filter(function($inscripcion) {
            return $inscripcion->estado !== 'finalizado';
        });
        
        $hayInscripcionesNoFinalizadas = $inscripcionesNoFinalizadas->count() > 0;
        
        // Cambiar estado de la pasantía a FINALIZADO
        $pasantia->update(['estado' => 'FINALIZADO']);
        
        return response()->json(['message' => 'Pasantía finalizada correctamente']);
    }

    // Método auxiliar para obtener información de fechas
    public function getInfoInicio($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $fechaActual = now();
        $fechaInicio = \Carbon\Carbon::parse($pasantia->fecha_ini);
        $diasDiferencia = $fechaActual->diffInDays($fechaInicio, false);
        
        return response()->json([
            'fecha_actual' => $fechaActual->toDateString(),
            'fecha_inicio' => $pasantia->fecha_ini,
            'dias_restantes' => max(0, $diasDiferencia),
            'fecha_actual_es_menor' => $fechaActual->lt($fechaInicio)
        ]);
    }

    public function getInfoFin($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $inscritos = $pasantia->inscripciones;
        $hayInscripcionesNoFinalizadas = $inscritos->filter(function($inscripcion) {
            return $inscripcion->estado !== 'finalizado';
        })->count() > 0;
        
        $fechaActual = now();
        $fechaFin = \Carbon\Carbon::parse($pasantia->fecha_fin);
        $diasDiferencia = $fechaActual->diffInDays($fechaFin, false);
        
        return response()->json([
            'fecha_actual' => $fechaActual->toDateString(),
            'fecha_fin' => $pasantia->fecha_fin,
            'dias_restantes' => max(0, $diasDiferencia),
            'fecha_actual_es_menor' => $fechaActual->lt($fechaFin),
            'hay_inscripciones_no_finalizadas' => $hayInscripcionesNoFinalizadas
        ]);
    } 
    
}