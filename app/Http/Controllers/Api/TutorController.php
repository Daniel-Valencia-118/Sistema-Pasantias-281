<?php
// app/Http/Controllers/Api/TutorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasante;
use App\Models\BitacoraEva;
use App\Models\InformeFin;
use App\Models\Inscripcion;
use App\Models\Pasantia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TutorController extends Controller
{
    // Ver mis pasantes asignados (con detalles de pasantía)
    public function misPasantes()
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $pasantes = Pasante::with(['user', 'inscripciones.pasantia.empresa', 'inscripciones.jefe.user'])
            ->where('idU_tutor', $tutor->idU_tutor)
            ->get()
            ->map(function($pasante) {
                return [
                    'pasante' => [
                        'id' => $pasante->idU_pasante,
                        'nombre' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno,
                        'ru' => $pasante->ru,
                        'matricula' => $pasante->matricula,
                    ],
                    'inscripciones' => $pasante->inscripciones->map(function($inscripcion) {
                        return [
                            'id_inscripcion' => $inscripcion->id_inscripcion,
                            'estado' => $inscripcion->estado,
                            'pasantia' => [
                                'id' => $inscripcion->pasantia->id_pasantia,
                                'nombre' => $inscripcion->pasantia->nombre_pas,
                                'fecha_ini' => $inscripcion->pasantia->fecha_ini,
                                'fecha_fin' => $inscripcion->pasantia->fecha_fin,
                                'empresa' => $inscripcion->pasantia->empresa->nombre,
                            ],
                            'jefe_asignado' => $inscripcion->jefe ? [
                                'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                                'cargo' => $inscripcion->jefe->cargo,
                            ] : null,
                        ];
                    }),
                ];
            });
        
        return response()->json(['data' => $pasantes]);
    }

    // =============================================
    // VER DATOS DE UN PASANTE ESPECÍFICO
    // =============================================
    public function verPasante($idPasante)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $pasante = Pasante::with(['user', 'inscripciones.pasantia.actividades', 'inscripciones.jefe.user'])
            ->where('idU_tutor', $tutor->idU_tutor)
            ->findOrFail($idPasante);
        
        return response()->json([
            'data' => [
                'pasante' => [
                    'id' => $pasante->idU_pasante,
                    'nombre' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno,
                    'correo' => $pasante->user->correo,
                    'ci' => $pasante->user->ci,
                    'ru' => $pasante->ru,
                    'matricula' => $pasante->matricula,
                    'semestre' => $pasante->semestre,
                    'mencion' => $pasante->mencion,
                ],
                'inscripciones' => $pasante->inscripciones->map(function($inscripcion) {
                    return [
                        'id_inscripcion' => $inscripcion->id_inscripcion,
                        'estado' => $inscripcion->estado,
                        'pasantia' => [
                            'id' => $inscripcion->pasantia->id_pasantia,
                            'nombre' => $inscripcion->pasantia->nombre_pas,
                            'fecha_ini' => $inscripcion->pasantia->fecha_ini,
                            'fecha_fin' => $inscripcion->pasantia->fecha_fin,
                            'actividades' => $inscripcion->pasantia->actividades->map(function($actividad) {
                                return [
                                    'id' => $actividad->id_actividad,
                                    'nombre' => $actividad->nombre_act,
                                    'descripcion' => $actividad->descripcion,
                                ];
                            }),
                        ],
                        'jefe' => $inscripcion->jefe ? [
                            'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                            'cargo' => $inscripcion->jefe->cargo,
                        ] : null,
                    ];
                }),
            ]
        ]);
    }
    

    // Ver bitácora de un pasante (agrupada por actividad)
    public function verBitacoraPasante($idPasante)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        // Verificar que el pasante está asignado a este tutor
        $pasante = Pasante::where('idU_pasante', $idPasante)
            ->where('idU_tutor', $tutor->idU_tutor)
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
    // OBTENER ESTADO DE UNA PASANTÍA
    // =============================================
    public function obtenerEstadoPasantia(Request $request)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
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
    
    // =============================================
    // MODIFICAR RESULTADO DEL INFORME POR ID_INSCRIPCION
    // =============================================
    public function modificarResultadoInformePorInscripcion(Request $request, $idInscripcion)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $informe = InformeFin::with('inscripcion.pasante')
            ->where('id_inscripcion', $idInscripcion)
            ->firstOrFail();
        
        // Verificar que el pasante está asignado a este tutor
        if ($informe->inscripcion->pasante->idU_tutor != $tutor->idU_tutor) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $request->validate([
            'resultado' => 'required|string|in:aprobado,reprobado,aprobado_con_merito',
        ]);
        
        $informe->update(['resultado' => $request->resultado]);
        
        return response()->json(['message' => 'Resultado actualizado', 'data' => $informe]);
    }

}