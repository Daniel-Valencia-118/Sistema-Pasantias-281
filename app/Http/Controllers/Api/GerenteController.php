<?php
// app/Http/Controllers/Api/GerenteController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pasantia;
use App\Models\JefePas;
use App\Models\User;
use App\Models\Inscripcion;
use App\Models\InformeFin;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudRegistroMail;
use App\Mail\RegistroAprobadoMail;
use App\Mail\RegistroRechazadoMail;

class GerenteController extends Controller
{
    // =============================================
    // LISTAR SOLICITUDES DE JEFES PENDIENTES
    // =============================================
    public function listarSolicitudesJefes()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $solicitudes = User::where('estado_aprobacion', 'pendiente')
            ->whereHas('jefePas', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->with('jefePas')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->idUser,
                    'nombre_user' => $user->nombre_user,
                    'nombre' => $user->nombre,
                    'correo' => $user->correo,
                    'cargo' => $user->jefePas->cargo,
                    'area' => $user->jefePas->area,
                    'estado_aprobacion' => $user->estado_aprobacion,
                ];
            });
        
        return response()->json(['data' => $solicitudes]);
    }

    // =============================================
    // APROBAR SOLICITUD DE JEFE
    // =============================================
    public function aprobarJefe($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefeSolicitante = User::where('estado_aprobacion', 'pendiente')
            ->whereHas('jefePas', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->findOrFail($id);
        
        $user->update([
            'estado_cuenta' => true,  // Activar cuenta
            'estado_aprobacion' => 'aprobado',
        ]);
        
        // Enviar correo de aprobación
        Mail::to($jefeSolicitante->correo)->send(new RegistroAprobadoMail($jefeSolicitante, 'jefe'));
        
        return response()->json(['message' => 'Jefe aprobado correctamente']);
    }

    // =============================================
    // RECHAZAR SOLICITUD DE JEFE
    // =============================================
    public function rechazarJefe($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefeSolicitante = User::where('estado_aprobacion', 'pendiente')
            ->whereHas('jefePas', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->findOrFail($id);
        
        $user->update([
            'estado_aprobacion' => 'rechazado',
        ]);
        
        return response()->json(['message' => 'Solicitud de jefe rechazada']);
    }
    // =============================================
    // CRUD de MI EMPRESA
    // =============================================
    
    public function miEmpresa()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        return response()->json(['data' => $empresa]);
    }
    
    public function actualizarEmpresa(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre' => 'sometimes|string|unique:empresa,nombre,' . $empresa->id_empresa . ',id_empresa',
            'direccion' => 'nullable|string',
            'email' => 'sometimes|email',
            'telefono' => 'nullable|string',
        ]);
        
        $empresa->update($request->only(['nombre', 'direccion', 'email', 'telefono']));
        
        return response()->json(['message' => 'Empresa actualizada', 'data' => $empresa]);
    }
    
    // =============================================
    // CRUD de PASANTÍAS (ofertas)
    // =============================================
    
    // listar Pasantias con sus actividades
    public function listarPasantias()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->get()
            ->map(function($pasantia) {
                return [
                    'id_pasantia' => $pasantia->id_pasantia,
                    'nombre_pas' => $pasantia->nombre_pas,
                    'estado' => $pasantia->estado,
                    'mencion' => $pasantia->mencion,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos' => $pasantia->cupos,
                    'cupos_disponibles' => $pasantia->cupos_disponibles,
                    'turno' => $pasantia->turno,
                    'actividades' => $pasantia->actividades->map(function($actividad) {
                        return [
                            'id_actividad' => $actividad->id_actividad,
                            'nombre_act' => $actividad->nombre_act,
                            'descripcion' => $actividad->descripcion,
                            'fecha_ini' => $actividad->fecha_ini,
                            'fecha_fin' => $actividad->fecha_fin,
                        ];
                    }),
                    'inscripciones' => $pasantia->inscripciones->map(function($inscripcion) {
                        return [
                            'pasante' => [
                                'id' => $inscripcion->pasante->idU_pasante,
                                'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                                'ru' => $inscripcion->pasante->ru,
                            ],
                            'jefe_asignado' => $inscripcion->jefe ? [
                                'id' => $inscripcion->jefe->idU_jefe,
                                'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                                'cargo' => $inscripcion->jefe->cargo,
                            ] : null,
                            'estado' => $inscripcion->estado,
                        ];
                    }),
                ];
            });
        
        return response()->json(['data' => $pasantias]);
    }
 
    // Ver una pasantía específica con actividades e inscripciones
    public function verPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::with(['actividades', 'inscripciones.pasante.user', 'inscripciones.jefe.user'])
            ->where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'nombre_pas' => $pasantia->nombre_pas,
                'estado' => $pasantia->estado,
                'mencion' => $pasantia->mencion,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
                'cupos' => $pasantia->cupos,
                'cupos_disponibles' => $pasantia->cupos_disponibles,
                'turno' => $pasantia->turno,
                'actividades' => $pasantia->actividades->map(function($actividad) {
                    return [
                        'id_actividad' => $actividad->id_actividad,
                        'nombre_act' => $actividad->nombre_act,
                        'descripcion' => $actividad->descripcion,
                        'fecha_ini' => $actividad->fecha_ini,
                        'fecha_fin' => $actividad->fecha_fin,
                    ];
                }),
                'inscripciones' => $pasantia->inscripciones->map(function($inscripcion) {
                    return [
                        'pasante' => [
                            'id' => $inscripcion->pasante->idU_pasante,
                            'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                            'ru' => $inscripcion->pasante->ru,
                        ],
                        'jefe_asignado' => $inscripcion->jefe ? [
                            'id' => $inscripcion->jefe->idU_jefe,
                            'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                            'cargo' => $inscripcion->jefe->cargo,
                        ] : null,
                        'estado' => $inscripcion->estado,
                    ];
                }),
            ]
        ]);
    }    

    public function crearPasantia(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre_pas' => 'required|string|max:150',
            'mencion' => 'required|string|max:100',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_ini',
            'cupos' => 'required|integer|min:1',
            'carga_horaria' => 'nullable|integer',
            'turno' => 'nullable|string|in:mañana,tarde,noche,tiempo completo',
            'estado' => 'required|string|in:activo,inactivo,finalizado,cancelado',
        ]);
        
        $pasantia = Pasantia::create([
            'nombre_pas' => $request->nombre_pas,
            'estado' => 'activo',
            'mencion' => $request->mencion,
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'cupos' => $request->cupos,
            'cupos_disponibles' => $request->cupos,
            'carga_horaria' => $request->carga_horaria,
            'turno' => $request->turno,
            'id_empresa' => $empresa->id_empresa,
        ]);
        
        return response()->json(['message' => 'Pasantía creada', 'data' => $pasantia], 201);
    }
    
    public function actualizarPasantia(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)->findOrFail($id);
        
        $request->validate([
            'nombre_pas' => 'sometimes|string|max:150',
            'fecha_ini' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_ini',
            'cupos' => 'sometimes|integer|min:1',
            'turno' => 'nullable|string|in:mañana,tarde,noche,tiempo completo',
        ]); 
        
        $pasantia->update($request->only([
            'nombre_pas','fecha_ini', 'fecha_fin', 'cupos', 'turno'
        ]));
        
        return response()->json(['message' => 'Pasantía actualizada', 'data' => $pasantia]);
    }
  
    // =============================================
    // CAMBIAR ESTADO DE UNA PASANTÍA (GERENTE) - VERSIÓN CON ID EN URL
    // =============================================
    public function cambiarEstadoPasantia(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'estado' => 'required|string|in:activo,inactivo,finalizado,cancelado',
        ]);
        
        // Verificar que la pasantía pertenece a su empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        $pasantia->update(['estado' => $request->estado]);
        
        return response()->json([
            'message' => 'Estado de la pasantía actualizado',
            'data' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'estado' => $pasantia->estado
            ]
        ]);
    }    

    public function eliminarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)->findOrFail($id);
        
        $pasantia->update(['estado' => 'inactivo']);
        
        return response()->json(['message' => 'Pasantía desactivada']);
    }
    
    // Obtener estado de una pasantía
    public function obtenerEstadoPasantia(Request $request)
    {
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);
        
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($request->id_pasantia);
        
        return response()->json([
            'data' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'estado' => $pasantia->estado,
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
            ]
        ]);
    }

    // =============================================
    // CRUD de ACTIVIDADES (dentro de una pasantía)
    // =============================================

    // Crear actividad (asociada a una pasantía existente)
    public function crearActividad(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'nombre_act' => 'required|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_ini',
            'tipo' => 'nullable|string|in:colectiva,individual',
        ]);
        
        // Verificar que la pasantía pertenece a esta empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($request->id_pasantia);
        
        $actividad = Actividad::create([
            'nombre_act' => $request->nombre_act,
            'descripcion' => $request->descripcion,
            'fecha_ini' => $request->fecha_ini,
            'fecha_fin' => $request->fecha_fin,
            'tipo' => $request->tipo,
            'id_pasantia' => $pasantia->id_pasantia,
        ]);
        
        return response()->json(['message' => 'Actividad creada', 'data' => $actividad], 201);
    }

    // Actualizar actividad
    public function actualizarActividad(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $actividad = Actividad::whereHas('pasantia', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->findOrFail($id);
        
        $request->validate([
            'nombre_act' => 'sometimes|string|max:150',
            'descripcion' => 'nullable|string',
            'fecha_ini' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after_or_equal:fecha_ini',
            'tipo' => 'nullable|string|in:colectiva,individual',
        ]);
        
        $actividad->update($request->only(['nombre_act', 'descripcion', 'fecha_ini', 'fecha_fin', 'tipo']));
        
        return response()->json(['message' => 'Actividad actualizada', 'data' => $actividad]);
    }

    // Eliminar actividad (soft delete o desactivar)
    public function eliminarActividad($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $actividad = Actividad::whereHas('pasantia', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->findOrFail($id);
        
        $actividad->delete();
        
        return response()->json(['message' => 'Actividad eliminada']);
    } 


    // =============================================
    // CRUD de JEFES DE PASANTE
    // =============================================
    
    public function listarJefes()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefes = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->get();
        
        return response()->json(['data' => $jefes]);
    }

    // Ver un jefe específico
    public function verJefe($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $jefe->idU_jefe,
                'nombre' => $jefe->user->nombre,
                'ap_paterno' => $jefe->user->ap_paterno,
                'ap_materno' => $jefe->user->ap_materno,
                'nombre_user' => $jefe->user->nombre_user,
                'correo' => $jefe->user->correo,
                'numero_cel' => $jefe->user->numero_cel,
                'ci' => $jefe->user->ci,
                'estado_cuenta' => $jefe->user->estado_cuenta,
                'cargo' => $jefe->cargo,
                'area' => $jefe->area,
            ]
        ]);
    }

    public function crearJefe(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'nombre_user' => 'required|string|unique:usuario,nombre_user',
            'password' => 'required|string|min:6',
            'numero_cel' => 'required|string',
            'ci' => 'required|string|unique:usuario,ci',
            'correo' => 'required|email|unique:usuario,correo',
            'nombre' => 'required|string',
            'ap_paterno' => 'required|string',
            'ap_materno' => 'required|string',
            'fecha_nac' => 'required|date',
            'cargo' => 'required|string',
            'area' => 'nullable|string',
        ]);
        
        try {
            DB::beginTransaction();
            
            $nuevoUser = User::create([
                'nombre_user' => $request->nombre_user,
                'password' => Hash::make($request->password),
                'numero_cel' => $request->numero_cel,
                'ci' => $request->ci,
                'correo' => $request->correo,
                'nombre' => $request->nombre,
                'ap_paterno' => $request->ap_paterno,
                'ap_materno' => $request->ap_materno,
                'fecha_nac' => $request->fecha_nac,
                'estado_cuenta' => true,
                'estado_aprobacion' => 'aprobado',
            ]);
            
            $jefe = JefePas::create([
                'idU_jefe' => $nuevoUser->idUser,
                'cargo' => $request->cargo,
                'area' => $request->area,
                'id_empresa' => $empresa->id_empresa,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Jefe creado exitosamente',
                'data' => ['user' => $nuevoUser, 'jefe' => $jefe]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // Deshabilitar/Habilitar jefe (PATCH)
    public function cambiarEstadoJefe($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        $nuevoEstado = !$jefe->user->estado_cuenta;
        $jefe->user->update(['estado_cuenta' => $nuevoEstado]);
        
        $estado = $nuevoEstado ? 'habilitado' : 'deshabilitado';
        return response()->json(['message' => "Jefe {$estado}"]);
    }

    // Eliminar jefe (DELETE) - solo si no tiene pasantes asignados activos
    public function eliminarJefe($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($id);
        
        // Verificar si tiene pasantes asignados con inscripciones activas
        $tienePasantes = Inscripcion::where('idU_jefe', $jefe->idU_jefe)
            ->whereIn('estado', ['inscrito', 'activo'])
            ->exists();
        
        if ($tienePasantes) {
            return response()->json([
                'message' => 'No se puede eliminar el jefe porque tiene pasantes asignados activos'
            ], 400);
        }
        
        // Deshabilitar en lugar de eliminar
        $jefe->user->update(['estado_cuenta' => false]);
        
        return response()->json(['message' => 'Jefe deshabilitado']);
    }

    
    // =============================================
    // ASIGNAR JEFE A PASANTES
    // =============================================
    //asignación individual o masiva
    public function asignarJefeAPasantes(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'asignaciones' => 'required|array',
            'asignaciones.*.id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'asignaciones.*.idU_pasante' => 'required|exists:pasante,idU_pasante',
            'asignaciones.*.idU_jefe' => 'required|exists:jefe_pas,idU_jefe',
        ]);
        
        try {
            DB::beginTransaction();
            
            foreach ($request->asignaciones as $asignacion) {
                // Verificar que la pasantía pertenece a la empresa
                $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
                    ->findOrFail($asignacion['id_pasantia']);
                
                // Verificar que el jefe pertenece a la empresa
                $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
                    ->findOrFail($asignacion['idU_jefe']);
                
                // Actualizar la inscripción
                Inscripcion::where('idU_pasante', $asignacion['idU_pasante'])
                    ->where('id_pasantia', $asignacion['id_pasantia'])
                    ->update(['idU_jefe' => $asignacion['idU_jefe']]);
            }
            
            DB::commit();
            
            return response()->json(['message' => 'Jefes asignados correctamente']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    // =============================================
    // LISTAR PASANTES DE MI EMPRESA
    // =============================================
    
    public function listarPasantes()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $inscripciones = Inscripcion::with(['pasante.user', 'pasantia', 'jefe.user'])
            ->whereHas('pasantia', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->get()
            ->map(function($inscripcion) {
                return [
                    'pasante' => [
                        'id' => $inscripcion->pasante->idU_pasante,
                        'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                        'ru' => $inscripcion->pasante->ru,
                        'matricula' => $inscripcion->pasante->matricula,
                        'semestre' => $inscripcion->pasante->semestre,
                    ],
                    'pasantia' => [
                        'id' => $inscripcion->pasantia->id_pasantia,
                        'nombre' => $inscripcion->pasantia->nombre_pas,
                        'fecha_ini' => $inscripcion->pasantia->fecha_ini,
                        'fecha_fin' => $inscripcion->pasantia->fecha_fin,
                    ],
                    'jefe_asignado' => $inscripcion->jefe ? [
                        'id' => $inscripcion->jefe->idU_jefe,
                        'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                        'cargo' => $inscripcion->jefe->cargo,
                    ] : null,
                    'estado_inscripcion' => $inscripcion->estado,
                ];
            });
        
        return response()->json(['data' => $inscripciones]);
    }
}