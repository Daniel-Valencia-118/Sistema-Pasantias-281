<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use App\Models\Pasantia;
use App\Models\Empresa;
use App\Models\Inscripcion;
use App\Traits\Notificable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class PasanteController extends Controller
{   
    use Notificable;
    
    public function perfil()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No se encontró información del pasante'], 404);
        }
        
        return response()->json([
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'ci' => $user->ci,
            'numero_cel' => $user->numero_cel,
            'correo' => $user->correo,
            'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
            'ru' => $pasante->ru,
            'matricula' => $pasante->matricula,
            'semestre' => $pasante->semestre,
            'mencion' => $pasante->mencion,
        ]);
    }
    
    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No se encontró información del pasante'], 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'required|string|max:50',
            'ci' => 'required|string|max:20',
            'numero_cel' => 'required|string|max:20',
            'correo' => 'required|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'fecha_nac' => 'required|date',
            'ru' => 'required|string|unique:pasante,ru,' . $pasante->idU_pasante . ',idU_pasante',
            'matricula' => 'required|string|unique:pasante,matricula,' . $pasante->idU_pasante . ',idU_pasante',
            'semestre' => 'required|integer|min:1|max:10',
            'mencion' => 'required|string|max:100',
        ]);
        
        // Actualizar usuario
        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'correo', 'fecha_nac']));
        
        // Actualizar pasante
        $pasante->update($request->only(['ru', 'matricula', 'semestre', 'mencion']));
        
        return response()->json(['message' => 'Perfil actualizado correctamente']);
    }

    public function getInfo()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        return response()->json([
            'ru' => $pasante->ru,
            'matricula' => $pasante->matricula,
            'semestre' => $pasante->semestre,
            'mencion' => $pasante->mencion,
        ]);
    }

    // =============================================
    // PASANTÍAS DISPONIBLES PARA INSCRIBIRSE
    // =============================================
    public function pasantiasDisponibles()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Obtener IDs de pasantías donde ya está inscrito
        $inscritoIds = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->pluck('id_pasantia')
            ->toArray();
        
        // Contar pasantías activas (inscrito o iniciado)
        $pasantiasActivas = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->whereIn('estado', ['inscrito', 'iniciado'])
            ->count();
        
        // Obtener empresas con pasantías activas del pasante
        $empresasActivas = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->whereIn('estado', ['inscrito', 'iniciado'])
            ->with('pasantia')
            ->get()
            ->pluck('pasantia.id_empresa')
            ->unique()
            ->toArray();
        
        $pasantias = Pasantia::with(['empresa', 'actividades'])
            ->where('estado', 'ABIERTA')
            //->where('fecha_ini', '>=', now()->toDateString())
            ->orderBy('fecha_ini', 'asc')
            ->get()
            ->map(function($pasantia) use ($pasante, $inscritoIds, $pasantiasActivas, $empresasActivas) {
                // Calcular cupos disponibles
                $inscritosActivos = $pasantia->inscripciones()
                    ->whereIn('estado', ['inscrito', 'iniciado','finalizado'])
                    ->count();
                $cuposDisponibles = $pasantia->cupos - $inscritosActivos;
                
                // Verificar si ya está inscrito
                $yaInscrito = in_array($pasantia->id_pasantia, $inscritoIds);
                
                // Verificar si la mención coincide
                $mencionCoincide = ($pasante->mencion === $pasantia->mencion);
                
                // Verificar si ya tiene pasantía activa de esta empresa
                $mismaEmpresaActiva = in_array($pasantia->id_empresa, $empresasActivas);
                
                // Verificar si alcanzó el límite de 2 pasantías activas
                $maximoAlcanzado = $pasantiasActivas >= 2;
                
                // Determinar si puede inscribirse
                $puedeInscribirse = !$yaInscrito && 
                                    $cuposDisponibles > 0 && 
                                    $mencionCoincide && 
                                    !$maximoAlcanzado && 
                                    !$mismaEmpresaActiva;
                
                // Determinar mensaje del botón
                $botonMensaje = 'INSCRIBIRSE';
                $botonHabilitado = true;
                
                if ($yaInscrito) {
                    $botonMensaje = 'YA INSCRITO';
                    $botonHabilitado = false;
                } elseif ($cuposDisponibles <= 0) {
                    $botonMensaje = 'SIN CUPOS';
                    $botonHabilitado = false;
                } elseif (!$mencionCoincide) {
                    $botonMensaje = 'MENCIÓN NO HABILITA';
                    $botonHabilitado = false;
                } elseif ($maximoAlcanzado) {
                    $botonMensaje = 'LÍMITE DE INSCRIPCIÓN';
                    $botonHabilitado = false;
                } elseif ($mismaEmpresaActiva) {
                    $botonMensaje = 'LÍMITE POR EMPRESA';
                    $botonHabilitado = false;
                }
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
                    'detalles_horario' => $pasantia->detalles_horario,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos' => $pasantia->cupos,
                    'cupos_disponibles' => $cuposDisponibles,
                    'ya_inscrito' => $yaInscrito,
                    'mencion_coincide' => $mencionCoincide,
                    'maximo_alcanzado' => $maximoAlcanzado,
                    'misma_empresa_activa' => $mismaEmpresaActiva,
                    'puede_inscribirse' => $puedeInscribirse,
                    'boton_mensaje' => $botonMensaje,
                    'boton_habilitado' => $botonHabilitado,
                    'actividades' => $pasantia->actividades && $pasantia->actividades->count() > 0 
                    ? $pasantia->actividades->sortBy([
                        ['fecha_ini', 'asc'],
                        ['fecha_fin', 'asc']
                    ])->map(function($act) {
                        return [
                            'id' => $act->id_actividad,
                            'nombre' => $act->nombre_act,
                            'tipo' => $act->tipo,
                            'descripcion' => $act->descripcion,
                            'fecha_ini' => $act->fecha_ini,
                            'fecha_fin' => $act->fecha_fin,
                        ];
                    })->values() // ← IMPORTANTE: reindexar el array
                    : [], // ← Si no hay actividades, devolver array vacío
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
        
        // Obtener menciones disponibles para el filtro
        $menciones = Pasantia::where('estado', 'ABIERTA')
            ->distinct()
            ->pluck('mencion')
            ->filter()
            ->values();
        
        return response()->json([
            'pasantias' => $pasantias,
            'menciones' => $menciones,
            'mencion_pasante' => $pasante->mencion,
        ]);
    }

    // =============================================
    // INSCRIBIRSE A UNA PASANTÍA
    // =============================================
    public function inscribirse($id)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        DB::beginTransaction();
        
        try {
            // 1. Obtener la pasantía con su empresa
            $pasantia = Pasantia::with(['empresa.gerente.user'])
                ->where('estado', 'ABIERTA')
                ->findOrFail($id);
            
            // 2. Verificar cupos disponibles
            $inscritosActivos = $pasantia->inscripciones()
                ->whereIn('estado', ['inscrito', 'iniciado'])
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
                ->where('id_pasantia', $id)
                ->exists();
            
            if ($yaInscrito) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya estás inscrito en esta pasantía.'
                ], 400);
            }
            
            // RESTRICCIÓN: La mención debe coincidir
            if ($pasante->mencion !== $pasantia->mencion) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a esta pasantía porque tu mención (' . $pasante->mencion . ') no coincide con la mención de la pasantía (' . $pasantia->mencion . ').'
                ], 400);
            }
            
            // RESTRICCIÓN: Máximo 2 pasantías activas
            $pasantiasActivas = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->whereIn('estado', ['inscrito', 'iniciado'])
                ->count();
            
            if ($pasantiasActivas >= 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a más pasantías. Tienes ' . $pasantiasActivas . ' pasantía(s) activa(s). El máximo es 2.'
                ], 400);
            }
            
            // RESTRICCIÓN: No tener otra pasantía activa de la misma empresa
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
            $idU_jefe_inscripcion = $pasantia->idU_jefe ?? null;
            
            $inscripcion = Inscripcion::create([
                'fecha_insc' => now()->format('Y-m-d'),
                'hora_insc' => now()->format('H:i:s'),
                'estado' => 'inscrito',
                'idU_pasante' => $pasante->idU_pasante,
                'id_pasantia' => $id,
                'idU_jefe' => $idU_jefe_inscripcion,
            ]);
            
            // 5. Verificar si con esta inscripción se llenaron los cupos
            $totalInscritos = Inscripcion::where('id_pasantia', $id)
                ->whereIn('estado', ['inscrito', 'iniciado', 'finalizado'])
                ->count();
            
            $cambioEstado = false;
            if ($totalInscritos >= $pasantia->cupos) {
                $pasantia->estado = 'INICIADO';
                $pasantia->save();
                $cambioEstado = true;
            }
            
            DB::commit();
            
            // =============================================
            // NOTIFICACIÓN: Nuevo inscrito para el GERENTE
            // =============================================
            $gerente = $pasantia->empresa->gerente;
            if ($gerente) {
                $this->crearNotificacion(
                    $gerente->idU_gerente,
                    'gerente',
                    'Nuevo pasante inscrito',
                    "El Pasante {$pasante->user->nombre} {$pasante->user->ap_paterno} se ha inscrito en la pasantía \"{$pasantia->nombre_pas}\".",
                    'inscripcion',
                    '/gerente/pasantias/'
                );
            }
            
            // =============================================
            // NOTIFICACIÓN: Cupos completados (si aplica)
            // =============================================
            if ($totalInscritos == $pasantia->cupos && $gerente) {
                $this->crearNotificacion(
                    $gerente->idU_gerente,
                    'gerente',
                    '¡Cupos completados!',
                    "La pasantía \"{$pasantia->nombre_pas}\" ha completado todos sus cupos ({$totalInscritos}/{$pasantia->cupos}).",
                    'cupos_completados',
                    '/gerente/pasantias/'
                );
            }
            
            return response()->json([
                'success' => true,
                'message' => '¡Te has inscrito correctamente a la pasantía!',
                'inscripcion' => $inscripcion,
                'cupos_completados' => $cambioEstado
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
    // CALIFICACIONES DE UNA EMPRESA
    // =============================================
    public function calificacionesEmpresa($id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $pasantias = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'FINALIZADO')
            ->with(['comentarios.pasante.user'])
            ->orderBy('fecha_fin', 'desc')
            ->get()
            ->map(function($pasantia) {
                $promedio = $pasantia->comentarios->avg('calificacion') ?? 0;
                
                $comentarios = $pasantia->comentarios->map(function($comentario) {
                    return [
                        'id' => $comentario->id_comentario,
                        'nombre_pasante' => $comentario->pasante->user->nombre . ' ' . $comentario->pasante->user->ap_paterno,
                        'calificacion' => $comentario->calificacion,
                        'comentario' => $comentario->descripcion,
                        'fecha' => $comentario->fecha,
                    ];
                });
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'promedio' => round($promedio, 1),
                    'total_comentarios' => $comentarios->count(),
                    'comentarios' => $comentarios,
                ];
            });
        
        return response()->json([
            'empresa_nombre' => $empresa->nombre,
            'pasantias' => $pasantias,
        ]);
    }

}