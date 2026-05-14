<?php
// app/Http/Controllers/Pasante/InscripcionController.php

namespace App\Http\Controllers\Pasante;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\Actividad;
use App\Models\User;
use App\Models\JefePas;
use App\Models\BitacoraEva;
use App\Models\Comentario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    // Vista de pasantías disponibles para inscribirse
    public function index()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Obtener todas las pasantías ABIERTAS
        $pasantias = Pasantia::with(['empresa.gerente.user', 'actividades'])
            ->where('estado', 'ABIERTA')
            ->get()
            ->map(function($pasantia) use ($pasante) {
                // Calcular cupos disponibles reales
                $inscritosActivos = $pasantia->inscripciones()
                    ->whereIn('estado', ['inscrito', 'activo'])
                    ->count();
                $cuposDisponibles = max(0, $pasantia->cupos - $inscritosActivos);
                
                // Verificar si el pasante ya está inscrito
                $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                    ->where('id_pasantia', $pasantia->id_pasantia)
                    ->exists();
                
                // Verificar si la mención coincide
                $mencionCoincide = ($pasante->mencion === $pasantia->mencion);
                
                // Obtener actividades ordenadas
                $actividades = $pasantia->actividades
                    ->sortBy([
                        ['fecha_ini', 'asc'],
                        ['fecha_fin', 'asc']
                    ])
                    ->values()
                    ->map(function($actividad) {
                        return [
                            'id' => $actividad->id_actividad,
                            'nombre_act' => $actividad->nombre_act,
                            'tipo' => $actividad->tipo,
                            'descripcion' => $actividad->descripcion,
                            'fecha_ini' => $actividad->fecha_ini,
                            'fecha_fin' => $actividad->fecha_fin,
                        ];
                    });
                
                // Nombre del gerente
                $gerenteNombre = '';
                if ($pasantia->empresa && $pasantia->empresa->gerente && $pasantia->empresa->gerente->user) {
                    $gerente = $pasantia->empresa->gerente->user;
                    $gerenteNombre = $gerente->nombre . ' ' . $gerente->ap_paterno . ' ' . ($gerente->ap_materno ?? '');
                }
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos_disponibles' => $cuposDisponibles,
                    'ya_inscrito' => $yaInscrito,
                    'mencion_coincide' => $mencionCoincide,
                    'actividades' => $actividades,
                    'empresa' => [
                        'id' => $pasantia->empresa->id_empresa,
                        'nombre' => $pasantia->empresa->nombre,
                        'nit' => $pasantia->empresa->nit,
                        'direccion' => $pasantia->empresa->direccion,
                        'telefono' => $pasantia->empresa->telefono,
                        'email' => $pasantia->empresa->email,
                        'gerente_nombre' => $gerenteNombre,
                    ],
                ];
            });
        
        // Obtener menciones existentes
        $mencionesExistentes = Pasantia::where('estado', 'ABIERTA')
            ->distinct()
            ->pluck('mencion')
            ->filter()
            ->values()
            ->toArray();
        
        // Mención por defecto: la del pasante si existe, sino 'Todos'
        $mencionPorDefecto = in_array($pasante->mencion, $mencionesExistentes) 
            ? $pasante->mencion 
            : 'Todos';
        
        return Inertia::render('Pasante/Inscribirse', [
            'pasantias' => $pasantias,
            'menciones' => $mencionesExistentes,
            'mencionPorDefecto' => $mencionPorDefecto,
            'mencionPasante' => $pasante->mencion,
        ]);
    }
    
    // Acción de inscribirse a una pasantía
    public function store($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        DB::beginTransaction();
        
        try {
            // 1. Obtener la pasantía
            $pasantia = Pasantia::with(['empresa'])
                ->where('estado', 'ABIERTA')
                ->findOrFail($idPasantia);
            
            // 2. Verificar cupos disponibles
            $inscritosActivos = $pasantia->inscripciones()
                ->whereIn('estado', ['inscrito', 'activo'])
                ->count();
            $cuposDisponibles = $pasantia->cupos - $inscritosActivos;
            
            if ($cuposDisponibles <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay cupos disponibles en esta pasantía.'
                ], 400);
            }
            
            // 3. Verificar que no esté ya inscrito
            $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_pasantia', $idPasantia)
                ->exists();
            
            if ($yaInscrito) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya estás inscrito en esta pasantía.'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 3: La mención debe coincidir
            // =============================================
            if ($pasante->mencion !== $pasantia->mencion) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a esta pasantía porque tu mención (' . $pasante->mencion . ') no coincide con la mención de la pasantía (' . $pasantia->mencion . ').'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 1: Máximo 2 pasantías activas
            // =============================================
            $pasantiasActivas = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->whereIn('estado', ['inscrito', 'iniciado'])
                ->count();
            
            if ($pasantiasActivas >= 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a más pasantías. Tienes ' . $pasantiasActivas . ' pasantía(s) activa(s). El máximo es 2.'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 2: No tener otra pasantía activa de la misma empresa
            // =============================================
            $pasantiaMismaEmpresaActiva = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->whereIn('estado', ['inscrito', 'iniciado'])
                ->whereHas('pasantia', function($query) use ($pasantia) {
                    $query->where('id_empresa', $pasantia->id_empresa);
                })
                ->exists();
            
            if ($pasantiaMismaEmpresaActiva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya tienes una pasantía activa de esta empresa. Debes finalizarla primero para inscribirte a otra.'
                ], 400);
            }
            
            // 4. Crear la inscripción
            $inscripcion = Inscripcion::create([
                'fecha_insc' => now()->format('Y-m-d'),
                'hora_insc' => now()->format('H:i:s'),
                'estado' => 'inscrito',
                'idU_pasante' => $pasante->idU_pasante,
                'id_pasantia' => $idPasantia,
                'idU_jefe' => null,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => '¡Te has inscrito correctamente a la pasantía!',
                'inscripcion' => $inscripcion
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al inscribirse: ' . $e->getMessage()
            ], 500);
        }
    }

    // =============================================
    // MÉTODO DE SINCRONIZACIÓN DE ESTADOS (REUTILIZABLE)
    // =============================================
    /**
     * Sincroniza los estados de las inscripciones según el estado de la pasantía
     * 
     * Reglas:
     * - Si Pasantía.estado === 'ABIERTA' y Inscripcion.estado != 'inscrito' → actualiza a 'inscrito'
     * - Si Pasantía.estado === 'INICIADO' y Inscripcion.estado != 'iniciado' → actualiza a 'iniciado'
     * - Si Pasantía.estado === 'FINALIZADO' y Inscripcion.estado === 'inscrito' → actualiza a 'iniciado'
     * 
     * @param \Illuminate\Database\Eloquent\Collection $inscripciones
     * @return \Illuminate\Database\Eloquent\Collection (inscripciones actualizadas)
     */
    private function sincronizarEstadosInscripciones($inscripciones)
    {
        foreach ($inscripciones as $inscripcion) {
            $estadoPasantia = $inscripcion->pasantia->estado;
            $estadoInscripcion = $inscripcion->estado;
            $actualizado = false;
            
            // Regla 1: Si la pasantía está ABIERTA, la inscripción debe estar 'inscrito'
            if ($estadoPasantia === 'ABIERTA' && $estadoInscripcion !== 'inscrito') {
                $inscripcion->estado = 'inscrito';
                $actualizado = true;
            }
            
            // Regla 2: Si la pasantía está INICIADO, la inscripción debe estar 'iniciado'
            if ($estadoPasantia === 'INICIADO' && $estadoInscripcion == 'inscrito') {
                $inscripcion->estado = 'iniciado';
                $actualizado = true;
            }
            
            // Regla 3: Si la pasantía está FINALIZADO y la inscripción está 'inscrito', pasa a 'iniciado'
            if ($estadoPasantia === 'FINALIZADO' && $estadoInscripcion === 'inscrito') {
                $inscripcion->estado = 'iniciado';
                $actualizado = true;
            }
            
            // Guardar cambios si es necesario
            if ($actualizado) {
                $inscripcion->save();
            }
        }
        
        // Refrescar la colección con los datos actualizados
        return $inscripciones->fresh();
    }    

// =============================================
    // PASANTÍAS INSCRITAS (inscrito o iniciado)
    // =============================================
    public function pasantiasInscritas()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Obtener todas las inscripciones del pasante con sus relaciones
        $inscripciones = Inscripcion::with([
            'pasantia.empresa.gerente.user',
            'pasantia.actividades',
            'jefe.user'
        ])
        ->where('idU_pasante', $pasante->idU_pasante)
        ->get();
        
        // =============================================
        // SINCRONIZAR ESTADOS (llamada al método reutilizable)
        // =============================================
        $inscripciones = $this->sincronizarEstadosInscripciones($inscripciones);
        
        // Filtrar solo las que están en estado 'inscrito' o 'iniciado'
        $inscripciones = $inscripciones->filter(function($inscripcion) {
            return in_array($inscripcion->estado, ['inscrito', 'iniciado']);
        });
        
        // Formatear los datos para la vista
        $data = $inscripciones->map(function($inscripcion) use ($pasante) {
            $pasantia = $inscripcion->pasantia;
            $jefe = $inscripcion->jefe;
            
            // Calcular cupos disponibles reales
            $inscritosActivos = $pasantia->inscripciones()
                ->whereIn('estado', ['inscrito', 'activo'])
                ->count();
            $cuposDisponibles = max(0, $pasantia->cupos - $inscritosActivos);
            
            // Total de inscritos (activos + inscritos)
            $totalInscritos = $pasantia->inscripciones()
                ->whereIn('estado', ['inscrito', 'activo', 'iniciado'])
                ->count();
            
            // Actividades ordenadas
            $actividades = $pasantia->actividades
                ->sortBy([
                    ['fecha_ini', 'asc'],
                    ['fecha_fin', 'asc']
                ])
                ->values()
                ->map(function($actividad) {
                    return [
                        'id' => $actividad->id_actividad,
                        'nombre_act' => $actividad->nombre_act,
                        'tipo' => $actividad->tipo,
                        'descripcion' => $actividad->descripcion,
                        'fecha_ini' => $actividad->fecha_ini,
                        'fecha_fin' => $actividad->fecha_fin,
                    ];
                });
            
            // Nombre del gerente
            $gerenteNombre = '';
            if ($pasantia->empresa && $pasantia->empresa->gerente && $pasantia->empresa->gerente->user) {
                $gerente = $pasantia->empresa->gerente->user;
                $gerenteNombre = $gerente->nombre . ' ' . $gerente->ap_paterno . ' ' . ($gerente->ap_materno ?? '');
            }
            
            // Datos del jefe asignado
            $jefeData = null;
            if ($jefe && $jefe->user) {
                $jefeData = [
                    'id' => $jefe->idU_jefe,
                    'nombre' => $jefe->user->nombre,
                    'ap_paterno' => $jefe->user->ap_paterno,
                    'ap_materno' => $jefe->user->ap_materno ?? '',
                ];
            }
            
            return [
                'id_inscripcion' => $inscripcion->id_inscripcion,
                'estado_inscripcion' => $inscripcion->estado,
                'pasantia' => [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos_disponibles' => $cuposDisponibles,
                    'total_inscritos' => $totalInscritos,
                    'actividades' => $actividades,
                    'empresa' => [
                        'id' => $pasantia->empresa->id_empresa,
                        'nombre' => $pasantia->empresa->nombre,
                        'nit' => $pasantia->empresa->nit,
                        'direccion' => $pasantia->empresa->direccion,
                        'telefono' => $pasantia->empresa->telefono,
                        'email' => $pasantia->empresa->email,
                        'gerente_nombre' => $gerenteNombre,
                    ],
                ],
                'jefe_asignado' => $jefeData,
            ];
        });
        
        return Inertia::render('Pasante/Inscripciones/Activas', [
            'inscripciones' => $data->sortBy('pasantia.nombre')->values(),
        ]);
    }
    
    
    // =============================================
    // OBTENER COMPAÑEROS DE UNA PASANTÍA
    // =============================================
    public function getCompaneros($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Verificar que el pasante está inscrito en esta pasantía
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $idPasantia)
            ->firstOrFail();
        
        // Obtener todas las inscripciones de esta pasantía
        $inscripciones = Inscripcion::with(['pasante.user', 'jefe.user'])
            ->where('id_pasantia', $idPasantia)
            ->whereIn('estado', ['inscrito', 'activo', 'iniciado'])
            ->get();
        
        $companeros = $inscripciones->map(function($insc) use ($pasante) {
            $pasanteData = $insc->pasante;
            $esYo = ($pasanteData->idU_pasante === $pasante->idU_pasante);
            
            $jefeData = null;
            if ($insc->jefe && $insc->jefe->user) {
                $jefeData = $insc->jefe->user->ap_paterno . ' ' . 
                           ($insc->jefe->user->ap_materno ?? '') . ' ' . 
                           $insc->jefe->user->nombre;
            }
            
            return [
                'id' => $pasanteData->idU_pasante,
                'ap_paterno' => $pasanteData->user->ap_paterno,
                'ap_materno' => $pasanteData->user->ap_materno ?? '',
                'nombre' => $pasanteData->user->nombre,
                'es_yo' => $esYo,
                'jefe_nombre' => $jefeData ?? 'No Asignado',
            ];
        });
        
        // Ordenar por apellido paterno (A-Z)
        $companeros = $companeros->sortBy('ap_paterno')->values();
        
        // Obtener la pasantía para el título del modal
        $pasantia = Pasantia::findOrFail($idPasantia);
        
        return response()->json([
            'pasantia_nombre' => $pasantia->nombre_pas,
            'companeros' => $companeros,
        ]);
    }

    /**
     * Muestra las pasantías finalizadas (inscripciones con estado 'finalizado')
     */
    public function pasantiasFinalizadas()
    {
        $user = Auth::user();
        $pasante = $user->pasante;

        // Obtener inscripciones con estado 'finalizado'
        $inscripciones = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->where('estado', 'finalizado')
            ->get();

        // Calcular promedio y abandono para cada inscripción
        $data = $inscripciones->map(function ($inscripcion) use ($pasante) {
            $pasantia = $inscripcion->pasantia;
            
            // Calcular promedio usando la misma lógica del gerente
            $actividades = $pasantia->actividades;
            $totalNota = 0;
            $actividadesComputadas = 0;
            
            foreach ($actividades as $actividad) {
                $evaluacion = BitacoraEva::where('idU_pasante', $pasante->idU_pasante)
                    ->where('id_actividad', $actividad->id_actividad)
                    ->first();
                
                if ($evaluacion && in_array($evaluacion->estado, ['COMPLETADA', 'COMPLETADA PARCIALMENTE', 'NO REALIZADA'])) {
                    $actividadesComputadas++;
                    $totalNota += $evaluacion->nota ?? 0;
                }
            }
            
            $abandono = $actividadesComputadas === 0;
            $promedio = !$abandono ? round($totalNota / $actividadesComputadas, 2) : 0;
            
            // Verificar si ya calificó la pasantía
            $yaCalifico = Comentario::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_pasantia', $pasantia->id_pasantia)
                ->exists();
            
            // Obtener calificación existente (si la hay)
            $calificacionExistente = null;
            if ($yaCalifico) {
                $comentario = Comentario::where('idU_pasante', $pasante->idU_pasante)
                    ->where('id_pasantia', $pasantia->id_pasantia)
                    ->first();
                $calificacionExistente = [
                    'calificacion' => $comentario->calificacion,
                    'descripcion' => $comentario->descripcion,
                    'fecha' => $comentario->fecha,
                ];
            }
            
            return [
                'id_inscripcion' => $inscripcion->id_inscripcion,
                'pasantia' => [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'mencion' => $pasantia->mencion,
                    'empresa' => [
                        'id' => $pasantia->empresa->id_empresa,
                        'nombre' => $pasantia->empresa->nombre,
                        'nit' => $pasantia->empresa->nit,
                        'direccion' => $pasantia->empresa->direccion,
                        'telefono' => $pasantia->empresa->telefono,
                        'email' => $pasantia->empresa->email,
                        'gerente_nombre' => $pasantia->empresa->gerente && $pasantia->empresa->gerente->user
                            ? $pasantia->empresa->gerente->user->ap_paterno . ' ' . $pasantia->empresa->gerente->user->ap_materno . ' ' . $pasantia->empresa->gerente->user->nombre
                            : 'No asignado',
                    ],
                ],
                'abandono' => $abandono,
                'promedio' => $promedio,
                'ya_califico' => $yaCalifico,
                'calificacion_existente' => $calificacionExistente,
            ];
        });
        
        // Ordenar por fecha inicio ascendente
        $data = $data->sortBy('pasantia.fecha_ini')->values();
        
        return Inertia::render('Pasante/Inscripciones/Finalizadas', [
            'inscripciones' => $data,
        ]);
    }

    /**
     * Obtener detalle de actividades con notas para el modal VER EVALUACIÓN
     */
    public function getDetallePromedio($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Verificar que el pasante esté inscrito en esta pasantía
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $idPasantia)
            ->where('estado', 'finalizado')
            ->firstOrFail();
        
        $pasantia = $inscripcion->pasantia;
        
        // Obtener actividades ordenadas
        $actividades = $pasantia->actividades()
            ->orderBy('fecha_ini', 'asc')
            ->orderBy('fecha_fin', 'asc')
            ->get();
        
        $actividadesData = $actividades->map(function ($actividad) use ($pasante) {
            $evaluacion = BitacoraEva::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->first();
            
            $estado = $evaluacion ? $evaluacion->estado : 'PENDIENTE';
            $nota = ($estado === 'COMPLETADA' || $estado === 'COMPLETADA PARCIALMENTE' || $estado === 'NO REALIZADA') 
                ? $evaluacion->nota 
                : null;
            
            // Mapear estado para mostrar bonito
            $estadoMostrar = [
                'COMPLETADA' => ['label' => 'Completado', 'color' => 'bg-green-100 text-green-800'],
                'COMPLETADA PARCIALMENTE' => ['label' => 'Realizado', 'color' => 'bg-yellow-100 text-yellow-800'],
                'NO REALIZADA' => ['label' => 'No Realizado', 'color' => 'bg-red-100 text-red-800'],
                'SIN CALIFICAR' => ['label' => 'No asignado', 'color' => 'bg-blue-100 text-blue-800'],
                'PENDIENTE' => ['label' => 'No Asignado', 'color' => 'bg-blue-100 text-blue-800'],
            ][$estado];
            
            return [
                'id' => $actividad->id_actividad,
                'nombre' => $actividad->nombre_act,
                'descripcion' => $actividad->descripcion ?? 'Sin descripción',
                'fecha_ini' => $actividad->fecha_ini,
                'fecha_fin' => $actividad->fecha_fin,
                'estado_label' => $estadoMostrar['label'],
                'estado_color' => $estadoMostrar['color'],
                'nota' => $nota,
            ];
        });
        
        // Calcular promedio general
        $totalNota = 0;
        $actividadesComputadas = 0;
        foreach ($actividadesData as $act) {
            if ($act['nota'] !== null) {
                $actividadesComputadas++;
                $totalNota += $act['nota'];
            }
        }
        $promedio = $actividadesComputadas > 0 ? round($totalNota / $actividadesComputadas, 2) : 0;
        $abandono = $actividadesComputadas === 0;
        
        return response()->json([
            'pasantia_nombre' => $pasantia->nombre_pas,
            'actividades' => $actividadesData,
            'promedio' => $promedio,
            'abandono' => $abandono,
        ]);
    }

    /**
     * Guardar calificación (comentario + estrellas) de una pasantía finalizada
     */
    public function storeCalificacion(Request $request)
    {
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'calificacion' => 'required|integer|min:1|max:5',
            'opinion' => 'required|string|min:5',
        ]);
        
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Verificar que la inscripción existe y está finalizada
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->where('estado', 'finalizado')
            ->firstOrFail();
        
        // Verificar que no haya calificado antes
        $yaCalifico = Comentario::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->exists();
        
        if ($yaCalifico) {
            return response()->json(['success' => false, 'message' => 'Ya has calificado esta pasantía.'], 403);
        }
        
        $comentario = Comentario::create([
            'descripcion' => $request->opinion,
            'calificacion' => $request->calificacion,
            'fecha' => now()->toDateString(),
            'idU_pasante' => $pasante->idU_pasante,
            'id_pasantia' => $request->id_pasantia,
        ]);
        
        return response()->json(['success' => true, 'comentario' => $comentario]);
    }

    /**
     * Obtener calificación existente de una pasantía
     */
    public function getCalificacion($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $comentario = Comentario::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $idPasantia)
            ->first();
        
        if (!$comentario) {
            return response()->json(['success' => false, 'message' => 'No has calificado esta pasantía.'], 404);
        }
        
        return response()->json([
            'success' => true,
            'calificacion' => $comentario->calificacion,
            'opinion' => $comentario->descripcion,
            'fecha' => $comentario->fecha,
        ]);
    }
}