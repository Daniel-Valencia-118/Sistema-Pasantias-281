<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Actividad;
use App\Models\Inscripcion;
use App\Models\JefePas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PasantiaPublicadaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'ABIERTA')
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $cuposDisponibles = $pasantia->cupos - $inscritos;
                $todosConJefe = $pasantia->inscripciones->every(function($insc) {
                    return $insc->idU_jefe !== null;
                });
                
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
            'fecha_fin' => 'required|date|before_or_equal:' . $pasantia->fecha_fin . '|after:fecha_ini',
        ]);
        
        $actividad = Actividad::create([
            'nombre_act' => $request->nombre_act,
            'tipo' => $request->tipo,
            'descripcion' => $request->descripcion ?? 'sin descripción',
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'id_pasantia' => $pasantia->id_pasantia,
        ]);
        
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
            'fecha_fin' => 'required|date|before_or_equal:' . $pasantia->fecha_fin . '|after:fecha_ini',
        ]);
        
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
        
        return response()->json(['message' => 'Jefe desasignado correctamente']);
    }    


}