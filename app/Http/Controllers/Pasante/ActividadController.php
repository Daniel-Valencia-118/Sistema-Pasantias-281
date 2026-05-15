<?php
// app/Http/Controllers/Pasante/ActividadController.php

namespace App\Http\Controllers\Pasante;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Actividad;
use App\Models\ProgresoAct;
use App\Models\AutoEva;
use App\Models\ComActividad;
use App\Models\BitacoraEva;
use App\Traits\SincronizaEstadosInscripciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActividadController extends Controller
{
    use SincronizaEstadosInscripciones;

    /**
     * Muestra las tarjetas de las pasantías donde el pasante tiene inscripción 'iniciado' o 'finalizado'.
     */
    public function index()
    {
        $user = Auth::user();
        $pasante = $user->pasante;

        // Obtener todas las inscripciones del pasante
        $inscripciones = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->get();

        // Sincronizar estados (reutilizando el trait)
        $inscripciones = $this->sincronizarEstadosInscripciones($inscripciones);

        // Filtrar solo las que están en estado 'iniciado' o 'finalizado'
        $inscripciones = $inscripciones->filter(function ($ins) {
            return in_array($ins->estado, ['iniciado', 'finalizado']);
        });

        // Formatear datos para las tarjetas
        $tarjetas = $inscripciones->map(function ($inscripcion) {
            $pasantia = $inscripcion->pasantia;
            $jefe = $inscripcion->jefe;

            return [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'anio' => date('Y', strtotime($pasantia->fecha_ini)),
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
                'empresa_nombre' => $pasantia->empresa->nombre,
                'jefe_nombre' => $jefe && $jefe->user 
                    ? $jefe->user->ap_paterno . ' ' . $jefe->user->ap_materno . ' ' . $jefe->user->nombre
                    : 'No asignado',
                'estado_inscripcion' => $inscripcion->estado, // 'iniciado' o 'finalizado'
            ];
        });

        // Orden: fecha_ini ASC, fecha_fin ASC, nombre ASC
        $tarjetas = $tarjetas->sortBy([
            ['fecha_ini', 'asc'],
            ['fecha_fin', 'asc'],
            ['nombre', 'asc'],
        ])->values();

        return Inertia::render('Pasante/Actividades/Index', [
            'tarjetas' => $tarjetas,
        ]);
    }

    /**
     * Muestra el detalle de una pasantía (actividades, evaluaciones, comentarios, etc.)
     */
    public function show($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;

        // Verificar que el pasante esté inscrito en esta pasantía
        $inscripcion = Inscripcion::with(['pasantia.empresa', 'jefe.user', 'pasantia.actividades'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $idPasantia)
            ->firstOrFail();

        // Sincronizar estado (por si acaso)
        $inscripcion = $this->sincronizarEstadosInscripciones(collect([$inscripcion]))->first();

        $pasantia = $inscripcion->pasantia;
        $jefe = $inscripcion->jefe;

        // Información del header
        $headerData = [
            'nombre' => $pasantia->nombre_pas,
            'anio' => date('Y', strtotime($pasantia->fecha_ini)),
            'empresa_nombre' => $pasantia->empresa->nombre,
            'jefe_nombre' => $jefe && $jefe->user 
                ? $jefe->user->ap_paterno . ' ' . $jefe->user->ap_materno . ' ' . $jefe->user->nombre
                : 'No asignado',
            'tutor_nombre' => $pasante->tutor && $pasante->tutor->user
                ? $pasante->tutor->user->ap_paterno . ' ' . $pasante->tutor->user->ap_materno . ' ' . $pasante->tutor->user->nombre
                : 'No asignado',
        ];

        // Obtener actividades ordenadas
        $actividades = $pasantia->actividades()
            ->orderBy('fecha_ini', 'asc')
            ->orderBy('fecha_fin', 'asc')
            ->get();

        // Para cada actividad, obtener información complementaria
        $actividadesData = $actividades->map(function ($actividad) use ($pasante, $inscripcion) {
            // Evaluación del jefe (BitacoraEva)
            $evaluacion = BitacoraEva::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->first();

            // Progresos (apuntes) del pasante
            $progresos = ProgresoAct::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->orderBy('fecha', 'asc')
                ->orderBy('hora', 'asc')
                ->get();

            // Autoevaluación (solo una por actividad)
            $autoevaluacion = AutoEva::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->first();

           // Comentarios (solo del pasante actual, con su jefe)
        // Comentarios (solo del pasante actual, con su jefe)
        $comentarios = ComActividad::where('id_actividad', $actividad->id_actividad)
            ->where('idU_pasante', $pasante->idU_pasante)  // Solo sus comentarios
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get()
            ->map(function ($com) use ($pasante) {
                // Autor del comentario (siempre será el pasante)
                $autorNombre = $pasante->user->ap_paterno . ' ' . $pasante->user->ap_materno . ' ' . $pasante->user->nombre;
                
                // Si hay respuesta del jefe, obtener su nombre
                $respuestaJefe = null;
                if ($com->com_jefe) {
                    $jefe = $com->jefe;
                    $respuestaJefe = [
                        'comentario' => $com->com_jefe,
                        'fecha' => $com->fecha,
                        'hora' => $com->hora,
                        'jefe_nombre' => $jefe && $jefe->user 
                            ? $jefe->user->ap_paterno . ' ' . $jefe->user->ap_materno . ' ' . $jefe->user->nombre
                            : 'Jefe',
                    ];
                }
                
                return [
                    'id' => $com->id_comactividad,
                    'comentario' => $com->com_pasante,
                    'fecha' => $com->fecha,
                    'hora' => $com->hora,
                    'autor_nombre' => $autorNombre,
                    'puede_editar' => $com->com_jefe === null, // Puede editar si no ha sido respondido
                    'respuesta_jefe' => $respuestaJefe,
                ];
            });

            // Estado de evaluación para mostrar
            $estadoEvaluacion = $evaluacion ? $evaluacion->estado : 'PENDIENTE';
            $notaEvaluacion = $evaluacion ? $evaluacion->nota : null;

            return [
                'id' => $actividad->id_actividad,
                'nombre' => $actividad->nombre_act,
                'descripcion' => $actividad->descripcion,
                'fecha_ini' => $actividad->fecha_ini,
                'fecha_fin' => $actividad->fecha_fin,
                'evaluacion' => $evaluacion ? [
                    'estado' => $evaluacion->estado,
                    'nota' => $evaluacion->nota,
                    'descripcion' => $evaluacion->descripcion,
                    'observacion' => $evaluacion->observacion,
                    'recomendacion' => $evaluacion->recomendacion,
                    'fecha' => $evaluacion->fecha,
                    'hora' => $evaluacion->hora,
                    'jefe_nombre' => $evaluacion->jefe && $evaluacion->jefe->user
                        ? $evaluacion->jefe->user->ap_paterno . ' ' . $evaluacion->jefe->user->ap_materno . ' ' . $evaluacion->jefe->user->nombre
                        : null,
                ] : null,
                'estado_evaluacion' => $estadoEvaluacion,
                'nota_evaluacion' => $notaEvaluacion,
                'progresos' => $progresos,
                'autoevaluacion' => $autoevaluacion,
                'comentarios' => $comentarios,
            ];
        });

        // Indicar si la pasantía está finalizada para controlar si se puede comentar
        $puedeComentar = $inscripcion->estado !== 'finalizado';

        return Inertia::render('Pasante/Actividades/Show', [
            'pasantia' => $headerData,
            'actividades' => $actividadesData,
            'puedeComentar' => $puedeComentar,
        ]);
    }

    /**
     * Guardar o actualizar un progreso (apunte). Solo se permite editar el último progreso.
     */
    public function storeProgreso(Request $request)
    {
        $request->validate([
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'descripcion' => 'nullable|string',
            'porcentaje' => 'required|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $pasante = $user->pasante;

        // Siempre crear un nuevo progreso (apunte)
        $progreso = ProgresoAct::create([
            'descripcion' => $request->descripcion,
            'porcentaje' => $request->porcentaje,
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
            'idU_pasante' => $pasante->idU_pasante,
            'id_actividad' => $request->id_actividad,
        ]);

        return response()->json(['success' => true, 'progreso' => $progreso]);
    }

    /**
     * Guardar o actualizar autoevaluación (solo una por actividad, solo se puede editar el comentario)
     */
    public function storeAutoEva(Request $request)
    {
        $request->validate([
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'comentario' => 'required|string',
            'nota' => 'required|integer|min:0|max:100',
        ]);

        $user = Auth::user();
        $pasante = $user->pasante;

        $autoeva = AutoEva::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_actividad', $request->id_actividad)
            ->first();

        if ($autoeva) {
            // Solo actualizar comentario, la nota no se modifica
            $autoeva->comentario = $request->comentario;
            $autoeva->save();
        } else {
            $autoeva = AutoEva::create([
                'comentario' => $request->comentario,
                'nota' => $request->nota,
                'fecha' => now()->toDateString(),
                'idU_pasante' => $pasante->idU_pasante,
                'id_actividad' => $request->id_actividad,
            ]);
        }

        return response()->json(['success' => true, 'autoeva' => $autoeva]);
    }

   /**
     * Guardar un comentario del pasante en COM_ACTIVIDAD
     */
    public function storeComentario(Request $request)
    {
        $request->validate([
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'comentario' => 'required|string',
        ]);

        $user = Auth::user();
        $pasante = $user->pasante;

        // Obtener la inscripción del pasante para esta actividad (y su jefe)
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->whereHas('pasantia.actividades', function ($q) use ($request) {
                $q->where('id_actividad', $request->id_actividad);
            })->first();

        if (!$inscripcion) {
            return response()->json(['success' => false, 'message' => 'No estás inscrito en esta pasantía.'], 403);
        }

        // Verificar que la pasantía no esté finalizada (no se puede comentar si está finalizada)
        if ($inscripcion->estado === 'finalizado') {
            return response()->json(['success' => false, 'message' => 'No puedes comentar en una pasantía finalizada.'], 403);
        }

        $idU_jefe = $inscripcion->idU_jefe; // Puede ser null si no tiene jefe asignado

        $comentario = ComActividad::create([
            'com_pasante' => $request->comentario,
            'com_jefe' => null,
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
            'idU_pasante' => $pasante->idU_pasante,
            'idU_jefe' => $idU_jefe,
            'id_actividad' => $request->id_actividad,
        ]);

        return response()->json(['success' => true, 'comentario' => $comentario]);
    }
    /**
     * Obtener detalles de evaluación (BITACORA_EVA) para el modal
     */
    /**
 * Editar un comentario del pasante (solo si el jefe no ha respondido)
    */
    public function updateComentario(Request $request, $idComentario)
    {
        $request->validate([
            'comentario' => 'required|string',
        ]);

        $user = Auth::user();
        $pasante = $user->pasante;

        $comentario = ComActividad::where('id_comactividad', $idComentario)
            ->where('idU_pasante', $pasante->idU_pasante)
            ->firstOrFail();

        // Verificar si el jefe ya respondió
        if ($comentario->com_jefe !== null) {
            return response()->json([
                'success' => false,
                'message' => 'No puedes editar este comentario porque tu jefe ya ha respondido.'
            ], 403);
        }

        $comentario->com_pasante = $request->comentario;
        $comentario->save();

        return response()->json(['success' => true, 'comentario' => $comentario]);
    }
    public function getEvaluacionDetalle($idActividad)
    {
        $user = Auth::user();
        $pasante = $user->pasante;

        $evaluacion = BitacoraEva::with('jefe.user')
            ->where('idU_pasante', $pasante->idU_pasante)
            ->where('id_actividad', $idActividad)
            ->first();

        if (!$evaluacion) {
            return response()->json(['success' => false, 'message' => 'No hay evaluación para esta actividad.'], 404);
        }

        return response()->json([
            'success' => true,
            'evaluacion' => [
                'estado' => $evaluacion->estado,
                'nota' => $evaluacion->nota,
                'descripcion' => $evaluacion->descripcion,
                'observacion' => $evaluacion->observacion,
                'recomendacion' => $evaluacion->recomendacion,
                'fecha' => $evaluacion->fecha,
                'hora' => $evaluacion->hora,
                'jefe_nombre' => $evaluacion->jefe && $evaluacion->jefe->user
                    ? $evaluacion->jefe->user->ap_paterno . ' ' . $evaluacion->jefe->user->ap_materno . ' ' . $evaluacion->jefe->user->nombre
                    : null,
            ]
        ]);
    }
}