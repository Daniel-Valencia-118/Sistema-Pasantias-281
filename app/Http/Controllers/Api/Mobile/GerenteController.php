<?php

namespace App\Http\Controllers\Api\Mobile;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Gerente;
use App\Models\Inscripcion;
use App\Models\JefePas;
use App\Models\Comentario;
use App\Models\Pasantia;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class GerenteController extends Controller
{
    public function estadisticas()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;

        return response()->json([
            'kpis' => [
                'total_pasantias' => Pasantia::where('id_empresa', $empresa->id_empresa)->count(),
                'total_pasantes' => Inscripcion::whereHas('pasantia', function($q) use ($empresa) {
                    $q->where('id_empresa', $empresa->id_empresa);
                })->distinct('idU_pasante')->count('idU_pasante'),
                'total_jefes' => JefePas::where('id_empresa', $empresa->id_empresa)->count(),
                'calificacion_promedio' => round(Comentario::whereHas('pasantia', function($q) use ($empresa) {
                    $q->where('id_empresa', $empresa->id_empresa);
                })->avg('calificacion') ?? 0, 1),
            ]
        ]);
    }

    public function perfil()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        if (!$gerente) {
            return response()->json(['message' => 'No se encontró información del gerente'], 404);
        }
        
        return response()->json([
            'nombre' => $user->nombre,
            'ap_paterno' => $user->ap_paterno,
            'ap_materno' => $user->ap_materno,
            'ci' => $user->ci,
            'numero_cel' => $user->numero_cel,
            'correo' => $user->correo,
            'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
            'nro_secun' => $gerente->nro_secun,
        ]);
    }

    public function actualizarPerfil(Request $request)
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        
        $request->validate([
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'required|string|max:50',
            'ci' => 'required|string|max:20',
            'numero_cel' => 'required|string|max:20',
            'correo' => 'required|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'fecha_nac' => 'required|date',
            'nro_secun' => 'nullable|string|max:20',
        ]);
        
        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'correo', 'fecha_nac']));
        $gerente->update(['nro_secun' => $request->nro_secun]);
        
        return response()->json(['message' => 'Perfil actualizado correctamente']);
    }

    public function empresa()
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        $empresa = $gerente->empresa;
        
        if (!$empresa) {
            return response()->json(['message' => 'No se encontró información de la empresa'], 404);
        }
        
        return response()->json([
            'id_empresa' => $empresa->id_empresa,
            'nombre' => $empresa->nombre,
            'nit' => $empresa->nit,
            'direccion' => $empresa->direccion,
            'telefono' => $empresa->telefono,
            'email' => $empresa->email,
        ]);
    }

    public function actualizarEmpresa(Request $request)
    {
        $user = Auth::user();
        $gerente = $user->gerente;
        $empresa = $gerente->empresa;
        
        if (!$empresa) {
            return response()->json(['message' => 'No se encontró información de la empresa'], 404);
        }
        
        $request->validate([
            'nombre' => 'required|string|max:100',
            'direccion' => 'nullable|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
        ]);
        
        $empresa->update($request->only(['nombre', 'direccion', 'telefono', 'email']));
        
        return response()->json(['message' => 'Empresa actualizada correctamente']);
    }

    public function crearPasantia(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre_pas' => 'required|string|max:255',
            'mencion' => 'required|string',
            'cupos' => 'required|integer|min:1|max:20',
            'turno' => 'required|string',
            'carga_horaria' => 'nullable|integer|min:0',
            'detalles_horario' => 'nullable|string',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_ini',
            'actividades' => 'required|array|min:1',
            'actividades.*.nombre_act' => 'required|string|max:255',
            'actividades.*.tipo' => 'required|string|in:OPERATIVA,TECNICA',
            'actividades.*.descripcion' => 'nullable|string',
            'actividades.*.fecha_ini' => 'required|date',
            'actividades.*.fecha_fin' => 'required|date|after_or_equal:actividades.*.fecha_ini',
        ]);
        
        $pasantia = Pasantia::create([
            'nombre_pas' => $request->nombre_pas,
            'estado' => 'ABIERTA',
            'mencion' => $request->mencion,
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'cupos' => $request->cupos,
            'cupos_disponibles' => $request->cupos,
            'carga_horaria' => $request->carga_horaria ?? 0,
            'detalles_horario' => $request->detalles_horario,
            'turno' => $request->turno,
            'id_empresa' => $empresa->id_empresa,
        ]);
        
        foreach ($request->actividades as $actividad) {
            Actividad::create([
                'nombre_act' => $actividad['nombre_act'],
                'tipo' => $actividad['tipo'],
                'fecha_ini' => $actividad['fecha_ini'],
                'fecha_fin' => $actividad['fecha_fin'],
                'descripcion' => $actividad['descripcion'] ?? 'sin descripción',
                'id_pasantia' => $pasantia->id_pasantia,
            ]);
        }
        
        return response()->json(['message' => 'Pasantía publicada exitosamente'], 201);
    }

    // =============================================
    // LISTAR PASANTÍAS
    // =============================================
    public function listarPasantias()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
                
        $pasantias = Pasantia::with(['inscripciones', 'jefeResponsable.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->orderBy('fecha_ini', 'desc')
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $cuposDisponibles = $pasantia->cupos - $inscritos;
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'estado' => $pasantia->estado,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'detalles_horario' => $pasantia->detalles_horario,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos' => $pasantia->cupos,
                    'cupos_disponibles' => $cuposDisponibles,
                    'inscritos' => $inscritos,
                    'jefe_asignado' => $pasantia->jefeResponsable && $pasantia->jefeResponsable->user ? [
                        'id' => $pasantia->jefeResponsable->idU_jefe,
                        'nombre' => $pasantia->jefeResponsable->user->nombre,
                        'ap_paterno' => $pasantia->jefeResponsable->user->ap_paterno,
                        'ap_materno' => $pasantia->jefeResponsable->user->ap_materno,
                        'ci' => $pasantia->jefeResponsable->user->ci,
                        'numero_cel' => $pasantia->jefeResponsable->user->numero_cel,
                        'correo' => $pasantia->jefeResponsable->user->correo,
                        'cargo' => $pasantia->jefeResponsable->cargo,
                        'area' => $pasantia->jefeResponsable->area,
                    ] : null,  
                    
                ];
            });
        
        return response()->json($pasantias);
    }

    // =============================================
    // ACTUALIZAR CUPOS
    // =============================================
    public function actualizarCupos(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        $inscritos = $pasantia->inscripciones()->count();
        
        $request->validate([
            'cupos' => 'required|integer|min:' . $inscritos . '|max:100'
        ]);
        
        $nuevosCupos = $request->cupos;
        $nuevosCuposDisponibles = $nuevosCupos - $inscritos;
        
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

    // =============================================
    // ABRIR PASANTÍA (habilitar inscripciones)
    // =============================================
    public function abrirPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        if ($pasantia->estado !== 'INICIADO') {
            return response()->json(['message' => 'La pasantía no está en estado INICIADO'], 400);
        }
        
        $inscritosCount = $pasantia->inscripciones()->count();
        $cuposDisponibles = $pasantia->cupos - $inscritosCount;
        
        if ($cuposDisponibles == 0) {
            return response()->json(['message' => 'Debe existir al menos un cupo disponible'], 400);
        }
        
        $pasantia->update(['estado' => 'ABIERTA']);
        
        return response()->json(['message' => 'Pasantía abierta correctamente']);
    }

    // =============================================
    // INICIAR PASANTÍA (cerrar inscripciones)
    // =============================================
    public function iniciarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        if ($pasantia->estado !== 'ABIERTA') {
            return response()->json(['message' => 'La pasantía no está en estado ABIERTA'], 400);
        }
        
        $pasantia->update(['estado' => 'INICIADO']);
        
        return response()->json(['message' => 'Inscripciones cerradas correctamente']);
    }

    // =============================================
    // OBTENER INSCRITOS DE UNA PASANTÍA
    // =============================================
    public function obtenerInscritos($id)
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
                    'correo' => $inscripcion->pasante->user->correo,
                    'matricula' => $inscripcion->pasante->matricula,
                    'semestre' => $inscripcion->pasante->semestre,
                    'mencion' => $inscripcion->pasante->mencion,
                    'fecha_insc' => $inscripcion->fecha_insc ? $inscripcion->fecha_insc ->format('Y-m-d') : null,
                    'hora_insc' => $inscripcion->hora_insc,
                    'jefe' => $inscripcion->jefe ? [
                        'id' => $inscripcion->jefe->idU_jefe,
                        'ap_paterno' => $inscripcion->jefe->user->ap_paterno,
                        'ap_materno' => $inscripcion->jefe->user->ap_materno,
                        'nombre' => $inscripcion->jefe->user->nombre,
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

    // =============================================
    // OBTENER ACTIVIDADES DE UNA PASANTÍA
    // =============================================
    public function obtenerActividades($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $actividades = Actividad::where('id_pasantia', $id)
            ->orderBy('fecha_ini', 'asc')
            ->get()
            ->map(function($actividad) {
                return [
                    'id_actividad' => $actividad->id_actividad,
                    'nombre_act' => $actividad->nombre_act,
                    'tipo' => $actividad->tipo,
                    'descripcion' => $actividad->descripcion,
                    'fecha_ini' => $actividad->fecha_ini,
                    'fecha_fin' => $actividad->fecha_fin,
                ];
            });
        
        return response()->json([
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
            ],
            'actividades' => $actividades
        ]);
    }

    // =============================================
    // JEFES DISPONIBLES PARA ASIGNAR
    // =============================================
    public function jefesDisponibles()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
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
                    'correo' => $jefe->user->correo,
                    'cargo' => $jefe->cargo,
                    'area' => $jefe->area,
                ];
            });
        
        return response()->json(['jefes' => $jefes]);
    }

    // =============================================
    // ASIGNAR JEFE A UNA PASANTÍA
    // =============================================
    public function asignarJefePasantia(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'idU_jefe' => 'required|exists:jefe_pas,idU_jefe'
        ]);
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $request->idU_jefe)
            ->firstOrFail();
        
        $pasantia->update(['idU_jefe' => $request->idU_jefe]);
        
        return response()->json([
            'message' => 'Jefe asignado correctamente',
            'jefe' => [
                'id' => $jefe->idU_jefe,
                'ap_paterno' => $jefe->user->ap_paterno,
                'ap_materno' => $jefe->user->ap_materno,
                'nombre' => $jefe->user->nombre,
            ]
        ]);
    }

    // =============================================
    // DESASIGNAR JEFE DE UNA PASANTÍA
    // =============================================
    public function designarJefePasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
        $pasantia->update(['idU_jefe' => null]);
        
        return response()->json(['message' => 'Jefe desasignado correctamente']);
    }

    // =============================================
    // CREAR ACTIVIDAD
    // =============================================
    public function crearActividad(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('id_pasantia', $id)
            ->firstOrFail();
        
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
        
        return response()->json([
            'message' => 'Actividad creada correctamente',
            'actividad' => $actividad
        ]);
    }

    // =============================================
    // ACTUALIZAR ACTIVIDAD
    // =============================================
    public function actualizarActividad(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $actividad = Actividad::with('pasantia')->findOrFail($id);
        
        if ($actividad->pasantia->id_empresa != $empresa->id_empresa) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $pasantia = $actividad->pasantia;
        
        $request->validate([
            'nombre_act' => 'sometimes|string|max:255',
            'tipo' => 'sometimes|string|in:OPERATIVA,TECNICA',
            'descripcion' => 'nullable|string',
            'fecha_ini' => 'sometimes|date|after_or_equal:' . $pasantia->fecha_ini,
            'fecha_fin' => 'sometimes|date|before_or_equal:' . $pasantia->fecha_fin . '|after_or_equal:fecha_ini',
        ]);
        
        $actividad->update($request->only(['nombre_act', 'tipo', 'descripcion', 'fecha_ini', 'fecha_fin']));
        
        return response()->json(['message' => 'Actividad actualizada correctamente']);
    }

    // =============================================
    // ELIMINAR ACTIVIDAD
    // =============================================
    public function eliminarActividad($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $actividad = Actividad::with('pasantia')->findOrFail($id);
        
        if ($actividad->pasantia->id_empresa != $empresa->id_empresa) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $actividad->delete();
        
        return response()->json(['message' => 'Actividad eliminada correctamente']);
    }    

    // =============================================
    // ASIGNAR JEFE A UN PASANTE ESPECÍFICO
    // =============================================
    public function asignarJefePasante(Request $request, $idPasantia, $idPasante)
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

    // =============================================
    // DESASIGNAR JEFE DE UN PASANTE ESPECÍFICO
    // =============================================
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