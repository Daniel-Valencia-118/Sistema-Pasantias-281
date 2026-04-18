<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use App\Models\Gerente;
use App\Models\Empresa;
use App\Models\TutorAca;
use App\Models\Administrador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudRegistroMail;
use App\Mail\RegistroRechazadoMail;


class AdminController extends Controller
{
    // =============================================
    // LISTAR SOLICITUDES PENDIENTES
    // =============================================
    public function listarSolicitudes()
    {
        $solicitudes = User::where('estado_aprobacion', 'pendiente')
            ->with(['pasante', 'gerente.empresa', 'tutorAca', 'jefePas.empresa'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->idUser,
                    'nombre_user' => $user->nombre_user,
                    'nombre' => $user->nombre,
                    'correo' => $user->correo,
                    'estado_aprobacion' => $user->estado_aprobacion,
                    'rol' => $this->getUserRole($user),
                ];
            });
        
        return response()->json(['data' => $solicitudes]);
    }

    // =============================================
    // APROBAR SOLICITUD
    // =============================================
    public function aprobarSolicitud($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->estado_aprobacion != 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }
        
        $user->update([
            'estado_cuenta' => true,  // Activar cuenta
            'estado_aprobacion' => 'aprobado',
        ]);
        
        $rol = $this->getUserRole($user);
        
        // Enviar correo de aprobación
        Mail::to($user->correo)->send(new RegistroAprobadoMail($user, $rol));
        
        return response()->json(['message' => 'Solicitud aprobada. Se envió correo al usuario.']);
    }

    // =============================================
    // RECHAZAR SOLICITUD
    // =============================================
    public function rechazarSolicitud($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->estado_aprobacion != 'pendiente') {
            return response()->json(['message' => 'Esta solicitud ya fue procesada'], 400);
        }
        $user->update([
            'estado_aprobacion' => 'rechazado',
        ]);
        
        // Opcional: enviar correo de rechazo
        Mail::to($user->correo)->send(new RegistroRechazadoMail($user, $request->motivo));
        
        return response()->json(['message' => 'Solicitud rechazada']);
    }

    // =============================================
    // CRUD de PASANTES (Estudiantes)
    // =============================================
    
    public function listarPasantes(Request $request)
    {
        $pasantes = Pasante::with(['user', 'tutor.user'])
            ->get()
            ->map(function($pasante) {
                return [
                    'id' => $pasante->idU_pasante,
                    'nombre' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno,
                    'nombre_user' => $pasante->user->nombre_user,
                    'correo' => $pasante->user->correo,
                    'ru' => $pasante->ru,
                    'matricula' => $pasante->matricula,
                    'semestre' => $pasante->semestre,
                    'mencion' => $pasante->mencion,
                    'estado_cuenta' => $pasante->user->estado_cuenta,
                    'tutor' => $pasante->tutor ? [
                        'id' => $pasante->tutor->idU_tutor,
                        'nombre' => $pasante->tutor->user->nombre . ' ' . $pasante->tutor->user->ap_paterno,
                        'especialidad' => $pasante->tutor->especialidad,
                    ] : null,
                ];
            });
        
        return response()->json(['data' => $pasantes]);
    } 

    // Ver un pasante específico con datos de su tutor
    public function verPasante($id)
    {
        $pasante = Pasante::with(['user', 'tutor.user'])
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'pasante' => [
                    'id' => $pasante->idU_pasante,
                    'nombre' => $pasante->user->nombre,
                    'ap_paterno' => $pasante->user->ap_paterno,
                    'ap_materno' => $pasante->user->ap_materno,
                    'nombre_user' => $pasante->user->nombre_user,
                    'correo' => $pasante->user->correo,
                    'numero_cel' => $pasante->user->numero_cel,
                    'ci' => $pasante->user->ci,
                    'fecha_nac' => $pasante->user->fecha_nac,
                    'estado_cuenta' => $pasante->user->estado_cuenta,
                    'ru' => $pasante->ru,
                    'matricula' => $pasante->matricula,
                    'semestre' => $pasante->semestre,
                    'mencion' => $pasante->mencion,
                ],
                'tutor' => $pasante->tutor ? [
                    'id' => $pasante->tutor->idU_tutor,
                    'nombre' => $pasante->tutor->user->nombre . ' ' . $pasante->tutor->user->ap_paterno,
                    'correo' => $pasante->tutor->user->correo,
                    'especialidad' => $pasante->tutor->especialidad,
                    'grado_aca' => $pasante->tutor->grado_aca,
                ] : null,
            ]
        ]);
    }    
    public function crearPasante(Request $request)
    {
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
            'ru' => 'required|string|unique:pasante,ru',
            'matricula' => 'required|string|unique:pasante,matricula',
            'semestre' => 'required|integer|min:1|max:10',
            'mencion' => 'required|string',
        ]);
        
        try {
            DB::beginTransaction();
            
            $user = User::create([
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
            
            $pasante = Pasante::create([
                'idU_pasante' => $user->idUser,
                'ru' => $request->ru,
                'matricula' => $request->matricula,
                'semestre' => $request->semestre,
                'mencion' => $request->mencion,
                'idU_tutor' => null,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Pasante creado exitosamente',
                'data' => ['user' => $user, 'pasante' => $pasante]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    public function actualizarPasante(Request $request, $id)
    {
        $pasante = Pasante::findOrFail($id);
        $user = $pasante->user;
        
        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'numero_cel' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
            'semestre' => 'sometimes|integer|min:1|max:10',
            'mencion' => 'sometimes|string',
        ]);
        
        $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno']));
        $pasante->update($request->only(['semestre', 'mencion']));
        
        return response()->json(['message' => 'Pasante actualizado']);
    }
    
    public function cambiarEstadoPasante($id)
    {
        $pasante = Pasante::findOrFail($id);
        $pasante->user->update(['estado_cuenta' => !$pasante->user->estado_cuenta]);
        
        $estado = $pasante->user->estado_cuenta ? 'habilitado' : 'deshabilitado';
        return response()->json(['message' => "Pasante {$estado}"]);
    }
    
    public function eliminarPasante($id)
    {
        $pasante = Pasante::findOrFail($id);
        $user = $pasante->user;
        
        // No eliminar físicamente, solo deshabilitar
        $user->update(['estado_cuenta' => false]);
        
        return response()->json(['message' => 'Pasante deshabilitado']);
    }
    
    // =============================================
    // CRUD de GERENTES + EMPRESA
    // =============================================
    
    public function listarGerentes(Request $request)
    {
        $gerentes = Gerente::with(['user', 'empresa'])->get();
        return response()->json(['data' => $gerentes]);
    }
    
    public function crearGerente(Request $request)
    {
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
            'nro_secun' => 'nullable|string',
            // Datos de la empresa
            'empresa_nombre' => 'required|string|unique:empresa,nombre',
            'empresa_direccion' => 'required|string',
            'empresa_email' => 'required|email',
            'empresa_nit' => 'required|string|unique:empresa,nit',
            'empresa_telefono' => 'required|string',
        ]);
        
        try {
            DB::beginTransaction();
            
            $user = User::create([
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
            
            $gerente = Gerente::create([
                'idU_gerente' => $user->idUser,
                'nro_secun' => $request->nro_secun,
            ]);
            
            $empresa = Empresa::create([
                'nombre' => $request->empresa_nombre,
                'direccion' => $request->empresa_direccion,
                'email' => $request->empresa_email,
                'nit' => $request->empresa_nit,
                'telefono' => $request->empresa_telefono,
                'idU_gerente' => $user->idUser,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Gerente y Empresa creado',
                'data' => ['user' => $user, 'gerente' => $gerente, 'empresa' => $empresa]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    // Ver un gerente específico con su empresa
    public function verGerente($id)
    {
        $gerente = Gerente::with(['user', 'empresa'])
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'gerente' => [
                    'id' => $gerente->idU_gerente,
                    'nombre' => $gerente->user->nombre,
                    'ap_paterno' => $gerente->user->ap_paterno,
                    'ap_materno' => $gerente->user->ap_materno,
                    'nombre_user' => $gerente->user->nombre_user,
                    'correo' => $gerente->user->correo,
                    'numero_cel' => $gerente->user->numero_cel,
                    'ci' => $gerente->user->ci,
                    'fecha_nac' => $gerente->user->fecha_nac,
                    'estado_cuenta' => $gerente->user->estado_cuenta,
                    'nro_secun' => $gerente->nro_secun,
                ],
                'empresa' => $gerente->empresa ? [
                    'id' => $gerente->empresa->id_empresa,
                    'nombre' => $gerente->empresa->nombre,
                    'direccion' => $gerente->empresa->direccion,
                    'email' => $gerente->empresa->email,
                    'nit' => $gerente->empresa->nit,
                    'telefono' => $gerente->empresa->telefono,
                ] : null,
            ]
        ]);
    }

    public function actualizarGerente(Request $request, $id)
    {
        $gerente = Gerente::findOrFail($id);
        $user = $gerente->user;
        
        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'numero_cel' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
            'nro_secun' => 'nullable|string',
        ]);
        
        $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno']));
        $gerente->update($request->only(['nro_secun']));
        
        return response()->json(['message' => 'Gerente actualizado']);
    }
    
    //al inactivar la cuenta de un gerente tambien de desactiva la cuenta de los pasantes de esa empresa
    public function cambiarEstadoGerente($id)
    {
        $gerente = Gerente::findOrFail($id);
        $nuevoEstado = !$gerente->user->estado_cuenta;
        
        try {
            DB::beginTransaction();
            
            // Cambiar estado del gerente
            $gerente->user->update(['estado_cuenta' => $nuevoEstado]);
            
            // Si se está deshabilitando al gerente, deshabilitar también a todos sus jefes
            if (!$nuevoEstado) {
                $empresa = $gerente->empresa;
                if ($empresa) {
                    // Obtener todos los jefes de esta empresa
                    $jefes = JefePas::where('id_empresa', $empresa->id_empresa)->get();
                    foreach ($jefes as $jefe) {
                        $jefe->user->update(['estado_cuenta' => false]);
                    }
                }
            }
            
            DB::commit();
            
            $estado = $nuevoEstado ? 'habilitado' : 'deshabilitado (incluyendo sus jefes)';
            return response()->json(['message' => "Gerente {$estado}"]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }    
    
    // =============================================
    // CRUD de TUTORES
    // =============================================
    
    public function listarTutores(Request $request)
    {
        $tutores = TutorAca::with('user')->get();
        return response()->json(['data' => $tutores]);
    }

    // Ver un tutor específico
    public function verTutor($id)
    {
        $tutor = TutorAca::with('user')
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $tutor->idU_tutor,
                'nombre' => $tutor->user->nombre,
                'ap_paterno' => $tutor->user->ap_paterno,
                'ap_materno' => $tutor->user->ap_materno,
                'nombre_user' => $tutor->user->nombre_user,
                'correo' => $tutor->user->correo,
                'numero_cel' => $tutor->user->numero_cel,
                'ci' => $tutor->user->ci,
                'fecha_nac' => $tutor->user->fecha_nac,
                'estado_cuenta' => $tutor->user->estado_cuenta,
                'especialidad' => $tutor->especialidad,
                'grado_aca' => $tutor->grado_aca,
            ]
        ]);
    }

    public function crearTutor(Request $request)
    {
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
            'especialidad' => 'required|string',
            'grado_aca' => 'required|string',
        ]);
        
        try {
            DB::beginTransaction();
            
            $user = User::create([
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
            
            $tutor = TutorAca::create([
                'idU_tutor' => $user->idUser,
                'especialidad' => $request->especialidad,
                'grado_aca' => $request->grado_aca,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Tutor creado exitosamente',
                'data' => ['user' => $user, 'tutor' => $tutor]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    public function actualizarTutor(Request $request, $id)
    {
        $tutor = TutorAca::findOrFail($id);
        $user = $tutor->user;
        
        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'numero_cel' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
            'especialidad' => 'sometimes|string',
            'grado_aca' => 'sometimes|string',
        ]);
        
        $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno']));
        $tutor->update($request->only(['especialidad', 'grado_aca']));
        
        return response()->json(['message' => 'Tutor actualizado']);
    }
    
    public function cambiarEstadoTutor($id)
    {
        $tutor = TutorAca::findOrFail($id);
        $tutor->user->update(['estado_cuenta' => !$tutor->user->estado_cuenta]);
        
        $estado = $tutor->user->estado_cuenta ? 'habilitado' : 'deshabilitado';
        return response()->json(['message' => "Tutor {$estado}"]);
    }
    
    // =============================================
    // CRUD de ADMINISTRADORES
    // =============================================
    
    public function listarAdministradores(Request $request)
    {
        $admins = Administrador::with('user')->get();
        return response()->json(['data' => $admins]);
    }
    
    public function crearAdministrador(Request $request)
    {
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
            'correo_secundario' => 'nullable|email|unique:administrador,correo_secundario',
        ]);
        
        try {
            DB::beginTransaction();
            
            $user = User::create([
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
            
            $admin = Administrador::create([
                'idU_admi' => $user->idUser,
                'correo_secundario' => $request->correo_secundario,
            ]);
            
            DB::commit();
            
            return response()->json([
                'message' => 'Administrador creado',
                'data' => ['user' => $user, 'admin' => $admin]
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
 
    // Ver un administrador específico
    public function verAdministrador($id)
    {
        $admin = Administrador::with('user')
            ->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $admin->idU_admi,
                'nombre' => $admin->user->nombre,
                'ap_paterno' => $admin->user->ap_paterno,
                'ap_materno' => $admin->user->ap_materno,
                'nombre_user' => $admin->user->nombre_user,
                'correo' => $admin->user->correo,
                'numero_cel' => $admin->user->numero_cel,
                'ci' => $admin->user->ci,
                'fecha_nac' => $admin->user->fecha_nac,
                'estado_cuenta' => $admin->user->estado_cuenta,
                'correo_secundario' => $admin->correo_secundario,
            ]
        ]);
    }    
    public function cambiarEstadoAdministrador(Request $request, $id)
    {
        $currentUser = $request->user();
        
        // No permitir auto-deshabilitarse
        if ($currentUser->idUser == $id) {
            return response()->json(['message' => 'No puedes deshabilitar tu propia cuenta'], 400);
        }
        
        $admin = Administrador::findOrFail($id);
        $admin->user->update(['estado_cuenta' => !$admin->user->estado_cuenta]);
        
        $estado = $admin->user->estado_cuenta ? 'habilitado' : 'deshabilitado';
        return response()->json(['message' => "Administrador {$estado}"]);
    }
    
    // =============================================
    // ASIGNAR PASANTE A TUTOR
    // =============================================
    
    public function asignarPasanteATutor(Request $request)
    {
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'idU_tutor' => 'required|exists:tutor_aca,idU_tutor',
        ]);
        
        $pasante = Pasante::findOrFail($request->idU_pasante);
        $pasante->update(['idU_tutor' => $request->idU_tutor]);
        
        return response()->json(['message' => 'Pasante asignado a tutor correctamente']);
    }
    
    // =============================================
    // LISTAR TODOS LOS USUARIOS POR ROL
    // =============================================
    
    public function listarTodosUsuarios(Request $request)
    {
        $usuarios = User::with(['pasante', 'gerente.empresa', 'tutorAca', 'administrador', 'jefePas'])
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->idUser,
                    'nombre_user' => $user->nombre_user,
                    'nombre' => $user->nombre,
                    'correo' => $user->correo,
                    'estado' => $user->estado_cuenta,
                    'rol' => $this->getUserRole($user),
                    'perfil' => $this->getPerfilData($user)
                ];
            });
        
        return response()->json(['data' => $usuarios]);
    }
    
    private function getUserRole($user)
    {
        if ($user->administrador) return 'admin';
        if ($user->pasante) return 'pasante';
        if ($user->gerente) return 'gerente';
        if ($user->jefePas) return 'jefe';
        if ($user->tutorAca) return 'tutor';
        return null;
    }
    
    private function getPerfilData($user)
    {
        if ($user->pasante) return ['ru' => $user->pasante->ru, 'matricula' => $user->pasante->matricula, 'semestre' => $user->pasante->semestre];
        if ($user->gerente) return ['empresa' => $user->gerente->empresa->nombre ?? null];
        if ($user->tutorAca) return ['especialidad' => $user->tutorAca->especialidad];
        if ($user->jefePas) return ['cargo' => $user->jefePas->cargo];
        return null;
    }
}