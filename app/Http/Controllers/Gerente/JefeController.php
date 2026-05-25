<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\JefePas;
use App\Models\User;
use App\Models\Inscripcion;
use App\Models\Pasantia;
use App\Traits\Notificable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JefeController extends Controller
{
    use Notificable;
    // Lista de jefes
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefes = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->whereHas('user', function($q) {
                $q->where('estado_aprobacion', 'aprobado');
            })
            ->get()
            ->map(function($jefe) use ($empresa) {
                // Contar pasantes asignados a este jefe
                $pasantesAsignados = Inscripcion::where('idU_jefe', $jefe->idU_jefe)
                    ->whereHas('pasantia', function($q) use ($empresa) {
                        $q->where('id_empresa', $empresa->id_empresa)
                        ->whereNotIn('estado', ['FINALIZADO', 'CANCELADO']);
                    })
                    ->count();
                
                return [
                    'id' => $jefe->idU_jefe,
                    'nombre' => $jefe->user->nombre,
                    'ap_paterno' => $jefe->user->ap_paterno,
                    'ap_materno' => $jefe->user->ap_materno,
                    'ci' => $jefe->user->ci,
                    'numero_cel' => $jefe->user->numero_cel,
                    'correo' => $jefe->user->correo,
                    'nombre_user' => $jefe->user->nombre_user,
                    'fecha_nac' => $jefe->user->fecha_nac ? $jefe->user->fecha_nac->format('Y-m-d') : null,
                    'fecha_registro' => $jefe->user->fecha_registro ? $jefe->user->fecha_registro->format('Y-m-d') : null,
                    'cargo' => $jefe->cargo,
                    'area' => $jefe->area,
                    'estado_cuenta' => $jefe->user->estado_cuenta,
                    'avatar_url' => $jefe->user->avatar_url, 
                    'pasantes_asignados' => $pasantesAsignados,
                    
                ];
            });
        
        return Inertia::render('Gerente/Jefes/Index', [
            'jefes' => $jefes,
            'empresa_id' => $empresa->id_empresa,
        ]);
    }
    
    // Obtener perfil de un jefe específico
    public function show($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $id)
            ->firstOrFail();
        
        return response()->json([
            'id' => $jefe->idU_jefe,
            'nombre' => $jefe->user->nombre,
            'ap_paterno' => $jefe->user->ap_paterno,
            'ap_materno' => $jefe->user->ap_materno,
            'ci' => $jefe->user->ci,
            'numero_cel' => $jefe->user->numero_cel,
            'fecha_nac' => $jefe->user->fecha_nac,
            'correo' => $jefe->user->correo,
            'nombre_user' => $jefe->user->nombre_user,
            'fecha_registro' => $jefe->user->created_at,
            'cargo' => $jefe->cargo,
            'area' => $jefe->area,
            'estado_cuenta' => $jefe->user->estado_cuenta,
        ]);
    }
    
    // Actualizar jefe
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $id)
            ->firstOrFail();
        
        $request->validate([
            'nombre' => 'required|string',
            'ap_paterno' => 'required|string',
            'ap_materno' => 'required|string',
            'ci' => 'required|string|unique:usuario,ci,' . $jefe->idU_jefe . ',idUser',
            'numero_cel' => 'required|string',
            'fecha_nac' => 'required|date',
            'correo' => 'required|email|unique:usuario,correo,' . $jefe->idU_jefe . ',idUser',
            'nombre_user' => 'required|string|unique:usuario,nombre_user,' . $jefe->idU_jefe . ',idUser',
            'cargo' => 'required|string',
            'area' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Actualizar usuario
            $userData = $request->only(['nombre', 'ap_paterno', 'ap_materno', 'ci', 'numero_cel', 'fecha_nac', 'correo', 'nombre_user']);
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $jefe->user->update($userData);
            
            // Actualizar datos de jefe
            $jefe->update($request->only(['cargo', 'area']));
            
            DB::commit();
            
            return response()->json(['message' => 'Jefe actualizado correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }
    
    // Activar/Desactivar cuenta del jefe
    public function toggleEstado($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $jefe = JefePas::with('user')
            ->where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $id)
            ->firstOrFail();
        
        $nuevoEstado = !$jefe->user->estado_cuenta;
        $jefe->user->update(['estado_cuenta' => $nuevoEstado]);
        
        return response()->json([
            'message' => $nuevoEstado ? 'Cuenta activada correctamente' : 'Cuenta desactivada correctamente',
            'estado' => $nuevoEstado
        ]);
    }
    
    // Obtener lista de pasantes asignados y no asignados para un jefe
    public function getPasantesAsignacion($idJefe)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que el jefe pertenece a la empresa
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $idJefe)
            ->firstOrFail();
        
        // Obtener todas las inscripciones de pasantes en pasantías de esta empresa
        $inscripciones = Inscripcion::with(['pasante.user', 'pasantia'])
            ->join('pasantia', 'inscripcion.id_pasantia', '=', 'pasantia.id_pasantia')
            ->where('pasantia.id_empresa', $empresa->id_empresa)
            ->whereIn('pasantia.estado', ['ABIERTA', 'INICIADO'])
            ->select('inscripcion.*')
            ->get();
            
        $pasantesAsignados = [];
        $pasantesSinAsignar = [];
        
        foreach ($inscripciones as $inscripcion) {
            $pasanteData = [
                'id' => $inscripcion->pasante->idU_pasante,
                'nombre' => $inscripcion->pasante->user->nombre,
                'ap_paterno' => $inscripcion->pasante->user->ap_paterno,
                'ap_materno' => $inscripcion->pasante->user->ap_materno,
                'ci' => $inscripcion->pasante->user->ci,
                'numero_cel' => $inscripcion->pasante->user->numero_cel,
                'fecha_nac' => $inscripcion->pasante->user->fecha_nac ? $inscripcion->pasante->user->fecha_nac->format('Y-m-d') : null,
                'correo' => $inscripcion->pasante->user->correo,
                'matricula' => $inscripcion->pasante->matricula,
                'semestre' => $inscripcion->pasante->semestre,
                'mencion' => $inscripcion->pasante->mencion,
                'pasantia_id' => $inscripcion->pasantia->id_pasantia,
                'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
                'pasantia_estado' => $inscripcion->pasantia->estado,
                'avatar_url' => $inscripcion->pasante->user->avatar_url, 
                'fecha_ini' => $inscripcion->pasantia->fecha_ini ? \Carbon\Carbon::parse($inscripcion->pasantia->fecha_ini)->format('Y-m-d') : null,
                'fecha_fin' => $inscripcion->pasantia->fecha_fin ? \Carbon\Carbon::parse($inscripcion->pasantia->fecha_fin)->format('Y-m-d') : null,
                'jefe_asignado_id' => $inscripcion->idU_jefe,
            ];
            
            if ($inscripcion->idU_jefe == $idJefe) {
                $pasantesAsignados[] = $pasanteData;
            } elseif ($inscripcion->idU_jefe === null) {
                $pasantesSinAsignar[] = $pasanteData;
            }
        }
        
        return response()->json([
            'asignados' => $pasantesAsignados,
            'sin_asignar' => $pasantesSinAsignar,
        ]);
    }
    
    // Asignar o desasignar un pasante a un jefe
    public function asignarPasante(Request $request)
    {
        $request->validate([
            'idJefe' => 'required|exists:jefe_pas,idU_jefe',
            'idPasante' => 'required|exists:pasante,idU_pasante',
            'accion' => 'required|in:asignar,designar',
        ]);
        
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // Verificar que el jefe pertenece a la empresa
        $jefe = JefePas::where('id_empresa', $empresa->id_empresa)
            ->where('idU_jefe', $request->idJefe)
            ->firstOrFail();
        
        // Verificar que el jefe está activo
        if (!$jefe->user->estado_cuenta) {
            return response()->json(['message' => 'No se puede asignar. El jefe tiene cuenta inactiva.'], 400);
        }
        
        // Buscar la inscripción del pasante
        $inscripcion = Inscripcion::where('idU_pasante', $request->idPasante)
            ->whereHas('pasantia', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa)
                ->whereIn('estado', ['ABIERTA', 'INICIADO']);
            })
            ->first();
        
        if (!$inscripcion) {
            return response()->json(['message' => 'Pasante no encontrado en ninguna pasantía de esta empresa'], 404);
        }
        
        // Verificar que la pasantía permite asignaciones (no FINALIZADO ni CANCELADO)
        if (!in_array($inscripcion->pasantia->estado, ['ABIERTA', 'INICIADO'])) {
            return response()->json([
                'message' => 'No se puede asignar. La pasantía está ' . $inscripcion->pasantia->estado
            ], 400);
        }
        
        if ($request->accion == 'asignar') {
            $inscripcion->update(['idU_jefe' => $request->idJefe]);
            
            $this->crearNotificacion(
                $request->idPasante,  // id del pasante
                'pasante',
                'Jefe asignado',
                "Te han asignado un nuevo jefe: {$jefe->user->nombre} {$jefe->user->ap_paterno}",
                'inscripcion',
                '/pasante/inscripciones/activas'
            );            
            
            return response()->json(['message' => 'Pasante asignado correctamente']);
                    
        } else {
        
            $inscripcion->update(['idU_jefe' => null]);
            
            return response()->json(['message' => 'Pasante desasignado correctamente']);
        }
    }

    // Mostrar formulario de registro
    public function create()
    {
        return Inertia::render('Gerente/Jefes/Create');
    }

    // Registrar nuevo jefe
    public function store(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'ap_paterno' => 'required|string|max:255',
            'ap_materno' => 'required|string|max:255',
            'nombre' => 'required|string|max:255',
            'ci' => 'required|string|max:50|unique:usuario,ci',
            'numero_cel' => 'required|string|max:20',
            'fecha_nac' => 'required|date',
            'area' => 'nullable|string|max:255',
            'cargo' => 'required|string|max:255',
            'nombre_user' => 'required|string|max:255|unique:usuario,nombre_user',
            'correo' => 'required|email|max:255|unique:usuario,correo',
            'password' => 'required|string|min:6',
            'password_confirmation' => 'required|same:password',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Crear usuario
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
            
            // Crear jefe
            JefePas::create([
                'idU_jefe' => $nuevoUser->idUser,
                'cargo' => $request->cargo,
                'area' => $request->area,
                'id_empresa' => $empresa->id_empresa,
            ]);
            
            DB::commit();
            
            return redirect()->route('gerente.jefes')
                ->with('success', 'Jefe registrado exitosamente.');
                
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar: ' . $e->getMessage()]);
        }
    }

    // Listar solicitudes pendientes y rechazadas
    public function solicitudes()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $solicitudes = User::where('estado_aprobacion', '!=', 'aprobado')
            ->whereHas('jefePas', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->with('jefePas')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->idUser,
                    'nombre' => $user->nombre,
                    'ap_paterno' => $user->ap_paterno,
                    'ap_materno' => $user->ap_materno,
                    'ci' => $user->ci,
                    'numero_cel' => $user->numero_cel,
                    'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
                    'correo' => $user->correo,
                    'nombre_user' => $user->nombre_user,
                    'fecha_registro' => $user->fecha_registro ? $user->fecha_registro ->format('Y-m-d') : null,
                    'cargo' => $user->jefePas->cargo,
                    'area' => $user->jefePas->area,
                    'estado_aprobacion' => $user->estado_aprobacion,
                    'estado_cuenta' => $user->estado_cuenta,

                ];
            });
        
        return Inertia::render('Gerente/Jefes/Solicitudes', [
            'solicitudes' => $solicitudes
        ]);
    }

    // Aprobar solicitud
    public function aprobarSolicitud($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $solicitante = User::whereHas('jefePas', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->findOrFail($id);
        
        if ($solicitante->estado_aprobacion !== 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }
        
        $solicitante->update([
            'estado_cuenta' => true,
            'estado_aprobacion' => 'aprobado',
        ]);
        
        return response()->json(['message' => 'Solicitud aprobada correctamente']);
    }

    // Rechazar solicitud
    public function rechazarSolicitud($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $solicitante = User::whereHas('jefePas', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->findOrFail($id);
        
        if ($solicitante->estado_aprobacion !== 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }
        
        $solicitante->update([
            'estado_aprobacion' => 'rechazado',
            'estado_cuenta' => false,
        ]);
        
        return response()->json(['message' => 'Solicitud rechazada correctamente']);
    }
    

}