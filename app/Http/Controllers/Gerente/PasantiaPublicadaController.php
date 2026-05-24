<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Actividad;
use App\Models\Inscripcion;
use App\Models\JefePas;
use App\Traits\Notificable;
use App\Traits\SincronizaEstadosInscripciones; // ← Agregar
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PasantiaPublicadaController extends Controller
{
    use Notificable;
    use SincronizaEstadosInscripciones; // ← Agregar
    
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->whereIn('estado', ['ABIERTA','INICIADO'])
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $cuposDisponibles = $pasantia->cupos - $inscritos;
                $todosConJefe = $pasantia->inscripciones->every(function($insc) {
                    return $insc->idU_jefe !== null;
                });
                      
                // Condición: Si no quedan cupos y el estado actual no es INICIADO, actualizamos la BD
                if ($cuposDisponibles == 0 && $pasantia->estado !== 'INICIADO') {
                    $pasantia->estado = 'INICIADO';
                    $pasantia->save(); // <-- Esto ejecuta el UPDATE en tu base de datos automáticamente
                }
                // Calcular si todos los inscritos tienen jefe asignado
                $todosConJefe = true;
                foreach ($pasantia->inscripciones as $inscripcion) {
                    if ($inscripcion->idU_jefe === null) {
                        $todosConJefe = false;
                        break;
                    }
                }
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'estado' => $pasantia->estado,
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
        
        return Inertia::render('Gerente/Pasantias/Index', [
            'pasantias' => $pasantias
        ]);
    }
    
    public function getActividades($id)
    {
        $pasantia = Pasantia::with('actividades')->findOrFail($id);
        
        $actividades = $pasantia->actividades->sortBy([
            ['fecha_ini', 'asc'],
            ['fecha_fin', 'asc']
        ])->values();
        
        return response()->json([
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
            ],
            'actividades' => $actividades->map(function($act) {
                return [
                    'id' => $act->id_actividad,
                    'nombre_act' => $act->nombre_act,
                    'tipo' => $act->tipo,
                    'descripcion' => $act->descripcion,
                    'fecha_ini' => $act->fecha_ini,
                    'fecha_fin' => $act->fecha_fin,
                ];
            })
        ]);
    }
    
    public function storeActividad(Request $request, $id)
    {
        $pasantia = Pasantia::findOrFail($id);
        
        $request->validate([
            'nombre_act' => 'required|string|max:255',
            'tipo' => 'required|string|in:OPERATIVA,TECNICA',
            'descripcion' => 'nullable|string',
            'fecha_ini' => 'required|date|after_or_equal:' . $pasantia->fecha_ini,
            'fecha_fin' => 'required|date|before_or_equal:' . $pasantia->fecha_fin . '|after_or_equal:fecha_ini',
        ]);
        
        $actividad = Actividad::create([
            'nombre_act' => $request->nombre_act,
            'tipo' => $request->tipo,
            'descripcion' => $request->descripcion ?? 'sin descripción',
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'id_pasantia' => $pasantia->id_pasantia,
        ]);
        
        $pasantesIds = Inscripcion::where('id_pasantia', $id)
            ->whereIn('estado', ['iniciado'])
            ->pluck('idU_pasante')
            ->toArray();
        // =============================================
        // NOTIFICACIÓN: Nueva actividad
        // =============================================
        $this->crearNotificacionesMultiples(
            $pasantesIds,
            'pasante',
            'Nueva actividad',
            "Se agregó \"{$actividad->nombre_act}\" a tu pasantía \"{$pasantia->nombre_pas}\".",
            'actividad',
            "/pasante/actividades/{$pasantia->id_pasantia}"
        );


        return response()->json([
            'message' => 'Actividad agregada correctamente',
            'actividad' => $actividad
        ]);
    }
    
    public function updateActividad(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        $pasantia = $actividad->pasantia;
        
        $request->validate([
            'descripcion' => 'nullable|string',
            'fecha_ini' => 'required|date|after_or_equal:' . $pasantia->fecha_ini,
            'fecha_fin' => 'required|date|before_or_equal:' . $pasantia->fecha_fin . '|after_or_equal:fecha_ini',
        ]);
        
        $pasantesIds = Inscripcion::where('id_pasantia', $pasantia->id_pasantia)
            ->whereIn('estado', ['iniciado'])
            ->pluck('idU_pasante')
            ->toArray();

        // Si cambió fecha_ini
        if ($actividad->fecha_ini != $request->fecha_ini) {
            $this->crearNotificacionesMultiples(
                $pasantesIds,
                'pasante',
                'Fecha de actividad cambiada',
                "La actividad \"{$actividad->nombre_act}\" cambió su fecha de inicio al " . date('d/m/Y', strtotime($request->fecha_ini)),
                'actividad',
                "/pasante/actividades/{$pasantia->id_pasantia}"
            );
        }
         // Si cambió fecha_fin (similar)
        if ($actividad->fecha_fin != $request->fecha_fin) {
            $this->crearNotificacionesMultiples(
                $pasantesIds,
                'pasante',
                'Fecha de actividad cambiada',
                "La actividad \"{$actividad->nombre_act}\" cambió su fecha final al " . date('d/m/Y', strtotime($request->fecha_fin)),
                'actividad',
                "/pasante/actividades/{$pasantia->id_pasantia}"
            );
        }

        
        $actividad->update([
            'descripcion' => $request->descripcion ?? 'sin descripción',
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
        ]);
        
        return response()->json(['message' => 'Actividad actualizada correctamente']);
    }
    
    public function destroyActividad($id)
    {
        $actividad = Actividad::findOrFail($id);
        $actividad->delete();
        
        return response()->json(['message' => 'Actividad eliminada correctamente']);
    }
    
    public function updateCupos(Request $request, $id)
    {
        $pasantia = Pasantia::findOrFail($id);
        $inscritos = Inscripcion::where('id_pasantia', $id)->count();
        
        $request->validate([
            'cupos' => 'required|integer|min:' . $inscritos . '|max:100'
        ]);
        
        $nuevosCupos = $request->cupos;
        $nuevosCuposDisponibles = $nuevosCupos - $inscritos;
        
        // Actualizar ambos campos
        $pasantia->update([
            'cupos' => $nuevosCupos,
            'cupos_disponibles' => $nuevosCuposDisponibles
        ]);
        
        return response()->json([
            'message' => 'Cupos actualizados correctamente',
            'cupos' => $pasantia->cupos,
            'cupos_disponibles' => $pasantia->cupos_disponibles
        ]);
    }

    public function getInscritos($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $inscritos = Inscripcion::with(['pasante.user', 'jefe.user'])
            ->where('id_pasantia', $id)
            ->get()
            ->map(function($inscripcion) {
                return [
                    'id' => $inscripcion->id_inscripcion,
                    'idU_pasante' => $inscripcion->pasante->idU_pasante,
                    'ap_paterno' => $inscripcion->pasante->user->ap_paterno,
                    'ap_materno' => $inscripcion->pasante->user->ap_materno,
                    'nombre' => $inscripcion->pasante->user->nombre,
                    'ci' => $inscripcion->pasante->user->ci,
                    'numero_cel' => $inscripcion->pasante->user->numero_cel,
                    'fecha_nac' => $inscripcion->pasante->user->fecha_nac ? $inscripcion->pasante->user->fecha_nac ->format('Y-m-d') : null,
                    'correo' => $inscripcion->pasante->user->correo,
                    'matricula' => $inscripcion->pasante->matricula,
                    'semestre' => $inscripcion->pasante->semestre,
                    'mencion' => $inscripcion->pasante->mencion,
                    'fecha_insc' => $inscripcion->fecha_insc ? $inscripcion->fecha_insc ->format('Y-m-d') : null,
                    'hora_insc' => $inscripcion->hora_insc,
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
                ];
            });
        
        return response()->json([
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                
            ],
            'inscritos' => $inscritos
        ]);
    }

    public function getJefesDisponibles()
    {
        try {
            $user = Auth::user();
            
            // Verificar que el usuario es gerente
            if (!$user->gerente) {
                return response()->json(['error' => 'No autorizado'], 403);
            }
            
            $empresa = $user->gerente->empresa;
            
            if (!$empresa) {
                return response()->json(['jefes' => []]);
            }
            
            $jefes = JefePas::with('user')
                ->where('id_empresa', $empresa->id_empresa)
                ->whereHas('user', function($q) {
                    $q->where('estado_cuenta', true)
                    ->where('estado_aprobacion', 'aprobado');
                })
                ->get()
                ->map(function($jefe) {
                    return [
                        'id' => $jefe->idU_jefe,
                        'ap_paterno' => $jefe->user->ap_paterno,
                        'ap_materno' => $jefe->user->ap_materno,
                        'nombre' => $jefe->user->nombre,
                        'ci' => $jefe->user->ci,
                        'numero_cel' => $jefe->user->numero_cel,
                        'fecha_nac' => $jefe->user->fecha_nac ? $jefe->user->fecha_nac->format('Y-m-d') : null,
                        'correo' => $jefe->user->correo,
                        'cargo' => $jefe->cargo,
                        'area' => $jefe->user->jefePas->area,
                    ];
                });
            
            return response()->json(['jefes' => $jefes]);
            
        } catch (\Exception $e) {
            \Log::error('Error en getJefesDisponibles: ' . $e->getMessage());
            return response()->json(['jefes' => [], 'error' => $e->getMessage()], 500);
        }
    }


    public function asignarJefePasante($idPasantia, $idPasante, Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'idU_jefe' => 'required|exists:jefe_pas,idU_jefe'
        ]);
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $idPasantia)
            ->firstOrFail();
        
        // Verificar que el jefe pertenece a la empresa
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $request->idU_jefe)
            ->firstOrFail();
        
        // Actualizar la inscripción
        $inscripcion = Inscripcion::where('id_pasantia', $idPasantia)
            ->where('idU_pasante', $idPasante)
            ->firstOrFail();
        
        $inscripcion->update(['idU_jefe' => $request->idU_jefe]);
        // =============================================
        // NOTIFICACIÓN: Jefe asignado
        // =============================================
        $this->crearNotificacion(
            $idPasante,  // id del pasante
            'pasante',
            'Jefe asignado',
            "Te han asignado un jefe para \"{$pasantia->nombre_pas}\": {$jefe->user->nombre} {$jefe->user->ap_paterno}",
            'inscripcion',
            '/pasante/inscripciones/activas'
        );        
        return response()->json(['message' => 'Jefe asignado correctamente']);
    }

    public function designarJefePasante($idPasantia, $idPasante)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $idPasantia)
            ->firstOrFail();
        
        // Actualizar la inscripción
        $inscripcion = Inscripcion::where('id_pasantia', $idPasantia)
            ->where('idU_pasante', $idPasante)
            ->firstOrFail();
        
        $inscripcion->update(['idU_jefe' => null]);

        // =============================================
        // NOTIFICACIÓN: Jefe desasignado
        // =============================================
        $this->crearNotificacion(
            $idPasante,
            'pasante',
            'Jefe removido',
            "Te han desasignado el jefe para la pasantía \"{$pasantia->nombre_pas}\".",
            'inscripcion',
            '/pasante/inscripciones/activas'
        );
        
        return response()->json(['message' => 'Jefe desasignado correctamente']);
    }    

    //ABRIR INSCRIPCION 
    public function abrirPasantia($id)
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
        $inscritosCount = $inscritos->count();
        $cuposDisponibles = $pasantia-> cupos - $inscritosCount;
        
        // Condición 1: Cupos disponibles = 0
        if ($cuposDisponibles == 0) {
            return response()->json(['message' => 'Debe existir almenos un cupo disponible'], 400);
        }
        
        // Cambiar estado de la pasantía a ABIERTA
        $pasantia->update(['estado' => 'ABIERTA']);
        
        $inscripciones = Inscripcion::where('id_pasantia', $id)->get();
        $this->sincronizarEstadosInscripciones($inscripciones);
        
        return response()->json(['message' => 'Pasantía abierta correctamente']);
    }
    
    //CERRAR INSCRIPCION 
    public function iniciarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        

        // Verificar que está en estado ABIERTA
        if ($pasantia->estado !== 'ABIERTA') {
            return response()->json(['message' => 'La pasantía no está en estado ABIERTA'], 400);
        }
        
 
       
        // Condición 2: Al menos 1 inscrito
        // if ($inscritosCount === 0) {
        //     return response()->json(['message' => 'Debe existir al menos 1 inscrito'], 400);
        // }
        
        // Condición 3: Todos los inscritos tienen jefe asignado
        // $sinJefe = $inscritos->filter(function($inscripcion) {
        //     return $inscripcion->idU_jefe === null;
        // });
        
        // if ($sinJefe->count() > 0) {
        //     return response()->json(['message' => 'Existen pasantes sin tener un jefe de pasante asignado'], 400);
        // }
        

        // Cambiar estado de la pasantía a INICIADO
        $pasantia->update(['estado' => 'INICIADO']);
        
        // Sincronizar inscripciones (cambiará 'inscrito' a 'iniciado')
        $inscripciones = Inscripcion::where('id_pasantia', $id)->get();
        $this->sincronizarEstadosInscripciones($inscripciones);
        
        // Obtener IDs de pasantes para notificaciones
        // $pasantesIds = Inscripcion::where('id_pasantia', $id)
        //     ->where('estado', 'iniciado','inscrito')
        //     ->pluck('idU_pasante')
        //     ->toArray();

        // =============================================
        // NOTIFICACIÓN: Pasantía iniciada
        // =============================================
        // $this->crearNotificacionesMultiples(
        //     $pasantesIds,
        //     'pasante',
        //     '¡Pasantía comenzó!',
        //     "La pasantía \"{$pasantia->nombre_pas}\" ha comenzado. ¡Muchos éxitos!",
        //     'pasantia',
        //     "/pasante/actividades/{$pasantia->id_pasantia}"
        // );
    
        return response()->json(['message' => 'Inscripción cerrada correctamente']);
    
    }    


        public function updatePasantia(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $request->validate([
            'mencion' => 'required|string',
            'turno' => 'required|string|in:Tiempo completo,Medio tiempo,Mañana,Tarde,Noche',
            'carga_horaria' => 'nullable|integer|min:0',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_ini',
        ]);
        
        // Obtener la actividad con fecha de inicio más temprana
        $actividadMinFecha = $pasantia->actividades()
            ->orderBy('fecha_ini', 'asc')
            ->first();
        
        // Obtener la actividad con fecha de fin más tardía
        $actividadMaxFecha = $pasantia->actividades()
            ->orderBy('fecha_fin', 'desc')
            ->first();
        
        // Validar que la nueva fecha inicio no sea mayor que la fecha inicio de la actividad más temprana
        if ($actividadMinFecha && $request->fecha_ini > $actividadMinFecha->fecha_ini) {
            return response()->json([
                'message' => "La fecha de inicio no puede ser mayor a la fecha de inicio de la actividad más temprana ({$actividadMinFecha->fecha_ini})."
            ], 400);
        }
        
        // Validar que la nueva fecha fin no sea menor que la fecha fin de la actividad más tardía
        if ($actividadMaxFecha && $request->fecha_fin < $actividadMaxFecha->fecha_fin) {
            return response()->json([
                'message' => "La fecha de fin no puede ser menor a la fecha de fin de la actividad más tardía ({$actividadMaxFecha->fecha_fin})."
            ], 400);
        }
        
        $pasantia->update([
            'mencion' => $request->mencion,
            'turno' => $request->turno,
            'carga_horaria' => $request->carga_horaria ?? 0,
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
        ]);
        
         $pasantesIds = Inscripcion::where('id_pasantia', $id)
            ->whereIn('estado', ['inscrito', 'iniciado'])
            ->pluck('idU_pasante')
            ->toArray();
        
        // Si cambió fecha_ini
        $this->crearNotificacionesMultiples(
            $pasantesIds,
            'pasante',
            'Hrs/Fechas actualizadas de una Pasantia',
            "La pasantía \"{$pasantia->nombre_pas}\" actualizó sus Hrs y Fechas. ¡¡¡REVISALO!!!",
            'pasantia',
            "/pasante/inscripciones/activas"
        );
        

        return response()->json([
            'message' => 'Pasantía actualizada correctamente',
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'mencion' => $pasantia->mencion,
                'turno' => $pasantia->turno,
                'carga_horaria' => $pasantia->carga_horaria,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
            ]
        ]);

    }
}