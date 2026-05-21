<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use App\Models\Gerente;
use App\Models\Empresa;
use App\Models\TutorAca;
use App\Models\JefePas;
use App\Models\Administrador;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudRegistroMail;
use App\Mail\RegistroRechazadoMail;
// importar inertia render
use Inertia\Inertia;
// rule
use Illuminate\Validation\Rule;


class AdminController extends Controller
{

    public function perfil()
    {
        $user = auth()->user()->load('administrador'); // Cargamos la relación definida como 'admi' o 'administrador'
        
        return Inertia::render('Admin/Perfil', [
            'usuario' => [
                'idUser' => $user->idUser,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'nombre_user' => $user->nombre_user,
                'correo' => $user->correo,
                'numero_cel' => $user->numero_cel,
                'ci' => $user->ci,
                'correo_secundario' => $user->administrador->correo_secundario ?? '',
            ]
        ]);
    }

public function updatePerfil(Request $request)
{
    $user = auth()->user();
    $admin = $user->administrador;

    $request->validate([
        'nombre' => 'required|string|max:255',
        'ap_paterno' => 'required|string|max:255',
        'correo' => 'required|email|unique:usuario,correo,' . $user->idUser . ',idUser',
        'numero_cel' => 'required|numeric',
        'correo_secundario' => 'nullable|email',
        // Validación de contraseña solo si se envía
        'password_actual' => 'required_with:password',
        'password' => 'nullable|confirmed|min:8',
    ]);

    // echo "Datos validados correctamente. Procediendo a actualizar..." . json_encode($request->all());

    try {
        DB::beginTransaction();

        // Verificar contraseña actual si se intenta cambiar
        if ($request->filled('password')) {
            if (!Hash::check($request->password_actual, $user->password)) {
                return response()->json(['errors' => ['password_actual' => ['La contraseña actual es incorrecta.']]], 422);
            }
            $user->password = Hash::make($request->password);
        }

        // Actualizar Usuario
        $user->update($request->only(['nombre', 'ap_paterno', 'ap_materno', 'correo', 'numero_cel', 'ci', 'nombre_user']));

        // Actualizar Admin
        $admin->update([
            'correo_secundario' => $request->correo_secundario
        ]);
        DB::commit();
       
        // El Toast detectará esto automáticamente
        return back()->with('success', '¡Perfil de Administrador actualizado con éxito!');

    } catch (\Exception $e) {
        DB::rollback();
        return back()->with('error', 'Hubo un problema al actualizar el perfil.');
    }
}

/**
     * Almacena un usuario recién creado.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_user' => ['required', 'string', 'max:255', Rule::unique('usuario', 'nombre_user')],
            'correo'      => ['required', 'string', 'email', 'max:255', Rule::unique('usuario', 'correo')],
            'nombre'      => ['required', 'string', 'max:255'],
            'ap_paterno'  => ['required', 'string', 'max:255'],
            'ap_materno'  => ['nullable', 'string', 'max:255'],
            'ci'          => ['required', 'string', 'max:20'],
            'numero_cel'  => ['nullable', 'string', 'max:20'],
            'fecha_nac'   => ['nullable', 'date'],
            'password'    => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Cifrado de contraseña y estado inicial activo
        $validated['password'] = Hash::make($validated['password']);
        $validated['estado_cuenta'] = true; 

        User::create($validated);

        return back()->with('success', 'Usuario registrado correctamente.');
    }

    // Store para administradores con try y rollback
        public function storeAdmin(Request $request)
        {
            $validated = $request->validate([
                'nombre_user' => ['required', 'string', 'max:255', Rule::unique('usuario', 'nombre_user')],
                'correo'      => ['required', 'string', 'email', 'max:255', Rule::unique('usuario', 'correo')],
                'nombre'      => ['required', 'string', 'max:255'],
                'ap_paterno'  => ['required', 'string', 'max:255'],
                'ap_materno'  => ['nullable', 'string', 'max:255'],
                'ci'          => ['required', 'string', 'max:20'],
                'numero_cel'  => ['nullable', 'string', 'max:20'],
                'fecha_nac'   => ['nullable', 'date'],
                'password'    => ['required', 'string', 'min:8', 'confirmed'],
                'correo_secundario' => ['nullable', 'email'],
            ]);
    
            try {
                DB::beginTransaction();
    
                // Cifrado de contraseña y estado inicial activo
                $validated['password'] = Hash::make($validated['password']);
                $validated['estado_cuenta'] = true; 
    
                $user = User::create($validated);
                Administrador::create(['idU_admi' => $user->idUser, 'correo_secundario' => $validated['correo_secundario']]);
    
                DB::commit();
                return back()->with('success', 'Administrador registrado correctamente.');
            } catch (\Exception $e) {
                DB::rollBack();
                return back()->with('error', 'Error al registrar el administrador: ' . $e->getMessage());
            }
        }   
        

    /**
     * Actualiza el usuario existente en base a su idUser.
     */
    public function updateUser(Request $request, $idUser)
    {
        $user = User::findOrFail($idUser);

        $validated = $request->validate([
            // Laravel exige definir explícitamente el nombre de la clave primaria en la regla unique si no es 'id'
            'nombre_user' => ['required', 'string', 'max:255', Rule::unique('usuario', 'nombre_user')->ignore($user->idUser, 'idUser')],
            'correo'      => ['required', 'string', 'email', 'max:255', Rule::unique('usuario', 'correo')->ignore($user->idUser, 'idUser')],
            'nombre'      => ['required', 'string', 'max:255'],
            'ap_paterno'  => ['required', 'string', 'max:255'],
            'ap_materno'  => ['nullable', 'string', 'max:255'],
            'ci'          => ['required', 'string', 'max:20'],
            'numero_cel'  => ['nullable', 'string', 'max:20'],
            'fecha_nac'   => ['nullable', 'date'],
            'password'    => ['nullable', 'string', 'min:8', 'confirmed'], // Opcional en edición
        ]);

        // Gestionar el cambio opcional de contraseña (Reseteo)
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return back()->with('success', 'Usuario actualizado con éxito.');
    }

    /**
     * Modifica el estado_cuenta del usuario (Activación/Desactivación).
     */
    public function toggleEstado($idUser)
    {
        $user = User::findOrFail($idUser);
        
        // Invierte el valor booleano gracias al casting configurado en tu modelo
        $user->estado_cuenta = !$user->estado_cuenta;
        $user->save();

        return back()->with('success', 'El estado del usuario se ha modificado.');
    }

    /**
     * Procesar la aprobación o rechazo de un usuario pendiente.
     */
        public function procesarAprobacion(Request $request, User $user)
        {
            // 1. Validar que el estado enviado sea estrictamente 'aprobado' o 'rechazado'
            $request->validate([
                'estado' => 'required|in:aprobado,rechazado',
            ]);

            // 2. Validar regla de negocio: El usuario DEBE estar en estado 'pendiente'
            if ($user->estado_aprobacion !== 'pendiente') {
                return redirect()->back()->with('error', 'El usuario ya no se encuentra en estado pendiente.');
            }

            // 3. Actualizar el estado
            $user->update([
                'estado_aprobacion' => $request->estado,
                'estado_cuenta' => $request->estado === 'aprobado' ? true : false, // Solo activar si es aprobado
            ]);

            // 4. Redireccionar con un mensaje de éxito
            $mensaje = $request->estado === 'aprobado' 
                ? 'El usuario ha sido aprobado correctamente.' 
                : 'El usuario ha sido rechazado.';

            return redirect()->back()->with('success', $mensaje);
        }

    // ============================================
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
                    'nombre' => $user->nombre . ' ' . $user->ap_paterno . ' ' . $user->ap_materno,
                    'correo' => $user->correo,
                    'estado_aprobacion' => $user->estado_aprobacion,
                    'rol' => $this->getUserRole($user),
                ];
            });
        return Inertia::render('Admin/Usuarios/Solicitudes', ['usuarios' => $solicitudes]);
    }
    // crear usuario
    public function crearUsuario(Request $request)
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
            'rol' => 'required|in:admin,gerente,jefe,tutor,pasante',
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
            
            // Crear el rol específico según el tipo seleccionado
            switch ($request->rol) {
                case 'admin':
                    Administrador::create(['idU_admin' => $user->idUser]);
                    break;
                case 'gerente':
                    Gerente::create(['idU_gerente' => $user->idUser]);
                    break;
                case 'jefe':
                    JefePas::create(['idU_jefe' => $user->idUser]);
                    break;
                case 'tutor':
                    TutorAca::create(['idU_tutor' => $user->idUser]);
                    break;
                case 'pasante':
                    Pasante::create(['idU_pasante' => $user->idUser]);
                    break;
            }
            
            DB::commit();
            
            return back()->with('success', 'Usuario creado exitosamente');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
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
                    'ap_paterno' => $pasante->user->ap_paterno,
                    'ap_materno' => $pasante->user->ap_materno,
                    'ci' => $pasante->user->ci,
                    'numero_cel' => $pasante->user->numero_cel,
                    'fecha_nac' => $pasante->user->fecha_nac->format('Y-m-d'),
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
        
        // return response()->json(['data' => $pasantes]);
        return Inertia::render('Admin/Usuarios/Pasantes', ['pasantes' => $pasantes]);
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
    
    public function updatePasante(Request $request, $id)
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
            'ci' => 'sometimes|string|unique:usuario,ci,' . $user->idUser . ',idUser',
            'fecha_nac' => 'sometimes|date',
        ]);
        
        try {
            // Iniciamos la transacción para enlazar la actualización de usuario y pasante
            DB::beginTransaction();

            // 1. Actualizar datos en la tabla 'usuario'
            $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno', 'ci', 'fecha_nac']));
            
            // 2. Actualizar datos específicos en la tabla del pasante
            $pasante->update($request->only(['semestre', 'mencion']));
            
            // Confirmamos de forma permanente los cambios en la BD
            DB::commit();
            
            return back()->with('success', 'Pasante actualizado exitosamente');

        } catch (\Exception $e) {
            // Si ocurre un error (ej. base de datos inaccesible, fallo de integridad), deshacemos todo
            DB::rollBack();
            
            return back()->with('error', 'Error al actualizar el pasante: ' . $e->getMessage());
        }
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
    // CRUD de JEFES DE PASANTIAS
    // =============================================

    // FUNCION PARA LISTAR TODOS LOS JEFES DE PASANTIAS
    public function listarJefes(Request $request)
    {
        // traer jefes como lo gerentes
        $jefes = JefePas::with(['user', 'empresa'])->get();
        return Inertia::render('Admin/Usuarios/JefesPas', ['jefes' => $jefes]);
    }

    // FUNCION PARA CREAR UN JEFE DE PASANTIAS
    public function crearJefe(Request $request)
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
            'cargo' => 'required|string',
            'area' => 'nullable|string',
            // El Admin debe especificar a qué empresa pertenece este jefe
            'id_empresa' => 'required|exists:empresa,id_empresa', 
        ]);

        try {
            DB::beginTransaction();

            // 1. Crear el Usuario
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

            // 2. Crear el JefePas asociado a la empresa enviada en el request
            $jefe = JefePas::create([
                'idU_jefe' => $nuevoUser->idUser,
                'cargo' => $request->cargo,
                'area' => $request->area,
                'id_empresa' => $request->id_empresa,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Jefe de Pasantes creado exitosamente',
                'data' => [
                    'user' => $nuevoUser,
                    'jefe' => $jefe
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el jefe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Actualizar un jefe de pasantias
    public function updateJefe(Request $request, $id)
    {
        $jefe = JefePas::findOrFail($id);
        $user = $jefe->user;

        $request->validate([
            'nombre_user' => 'sometimes|string|unique:usuario,nombre_user,' . $user->idUser . ',idUser',
            'numero_cel' => 'sometimes|string',
            'correo' => 'sometimes|email|unique:usuario,correo,' . $user->idUser . ',idUser',
            'nombre' => 'sometimes|string',
            'ap_paterno' => 'sometimes|string',
            'ap_materno' => 'sometimes|string',
            'cargo' => 'sometimes|string',
            'area' => 'sometimes|string',
            'ci' => 'sometimes|string|unique:usuario,ci,' . $user->idUser . ',idUser',
            'fecha_nac' => 'sometimes|date',
        ]);

        try {
            DB::beginTransaction();

            // Actualizar datos del usuario
            $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno', 'ci', 'fecha_nac']));

            // Actualizar datos específicos del jefe
            $jefe->update($request->only(['cargo', 'area']));

            DB::commit();

            return back()->with('success', 'Jefe de Pasantes actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al actualizar el jefe: ' . $e->getMessage());
        }
    }

    public function verJefe($id)
    {
        // Buscamos directamente por ID sin filtrar por empresa del Auth
        $jefe = JefePas::with('user')->findOrFail($id);
        
        return response()->json([
            'data' => [
                'id' => $jefe->idU_jefe,
                'id_empresa' => $jefe->id_empresa, // Añadido para que el Admin sepa de qué empresa es
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

    public function cambiarEstadoJefe($id)
    {
        $jefe = JefePas::findOrFail($id);
        
        $nuevoEstado = !$jefe->user->estado_cuenta;
        $jefe->user->update(['estado_cuenta' => $nuevoEstado]);
        
        $estado = $nuevoEstado ? 'habilitado' : 'deshabilitado';
        return response()->json(['message' => "Jefe {$estado} exitosamente"]);
    }

    public function eliminarJefe($id)
    {
        $jefe = JefePas::findOrFail($id);
        
        // El admin también debe respetar si hay pasantes activos para no romper la integridad
        $tienePasantes = Inscripcion::where('idU_jefe', $jefe->idU_jefe)
            ->whereIn('estado', ['inscrito', 'activo'])
            ->exists();
        
        if ($tienePasantes) {
            return response()->json([
                'message' => 'No se puede eliminar el jefe porque tiene pasantes asignados activos'
            ], 400);
        }
        
        $jefe->user->update(['estado_cuenta' => false]);
        
        return response()->json(['message' => 'Jefe deshabilitado por el administrador']);
    }

    public function asignarJefeAPasantes(Request $request)
    {
        $request->validate([
            'asignaciones' => 'required|array',
            'asignaciones.*.id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'asignaciones.*.idU_pasante' => 'required|exists:pasante,idU_pasante',
            'asignaciones.*.idU_jefe' => 'required|exists:jefe_pas,idU_jefe',
        ]);
        
        try {
            DB::beginTransaction();
            
            foreach ($request->asignaciones as $asignacion) {
                $pasantia = Pasantia::findOrFail($asignacion['id_pasantia']);
                $jefe = JefePas::findOrFail($asignacion['idU_jefe']);
                
                // Validación de integridad: ¿Pertenecen a la misma empresa?
                if ($pasantia->id_empresa !== $jefe->id_empresa) {
                    throw new \Exception("El jefe y la pasantía no pertenecen a la misma empresa.");
                }
                
                Inscripcion::where('idU_pasante', $asignacion['idU_pasante'])
                    ->where('id_pasantia', $asignacion['id_pasantia'])
                    ->update(['idU_jefe' => $asignacion['idU_jefe']]);
            }
            
            DB::commit();
            return response()->json(['message' => 'Asignaciones realizadas por Admin correctamente']);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }



    // =============================================
    // CRUD de GERENTES + EMPRESA
    // =============================================
    
    public function listarGerentes(Request $request)
    {
        $gerentes = Gerente::with(['user', 'empresa'])->get();
        // return response()->json(['data' => $gerentes]);
        return Inertia::render('Admin/Usuarios/Gerentes', ['gerentes' => $gerentes]);
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
    public function updateGerente(Request $request, $id)
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
            'ci' => 'sometimes|string|unique:usuario,ci,' . $user->idUser . ',idUser',
                // Datos de la empresa (si se va a actualizar)
            'empresa_nombre' => 'sometimes|string|unique:empresa,nombre,' . ($gerente->empresa ? $gerente->empresa->id_empresa : 'null') . ',id_empresa',
            'empresa_direccion' => 'sometimes|string',
            'empresa_email' => 'sometimes|email',
            'empresa_nit' => 'sometimes|string|unique:empresa,nit,' . ($gerente->empresa ? $gerente->empresa->id_empresa : 'null') . ',id_empresa',
            'empresa_telefono' => 'sometimes|string',
        ]);

        try {
            // Iniciamos la transacción para proteger las tres tablas
            DB::beginTransaction();

            // 1. Actualizar datos de la empresa (si existe)
            if ($gerente->empresa) {
                $gerente->empresa->update($request->only(['nombre', 'direccion', 'email', 'nit', 'telefono']));
            }

            // 2. Actualizar datos del usuario base
            $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno', 'ci', 'fecha_nac']));
            
            // 3. Actualizar datos específicos del gerente
            $gerente->update($request->only(['nro_secun']));
            
            // Si todo sale bien, guardamos los cambios definitivamente
            DB::commit();

            return back()->with('success', 'Gerente actualizado con éxito');

        } catch (\Exception $e) {
            // Si algo falla, revertimos todos los cambios de las tres tablas
            DB::rollBack();

            return back()->with('error', 'Error al actualizar el gerente: ' . $e->getMessage());
        }
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
        // return response()->json(['data' => $tutores]);
        return Inertia::render('Admin/Usuarios/Tutores', ['tutores' => $tutores]);
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
    
    public function updateTutor(Request $request, $id)
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
            'ci' => 'sometimes|string|unique:usuario,ci,' . $user->idUser . ',idUser',
            'fecha_nac' => 'sometimes|date',
            'especialidad' => 'sometimes|string',
            'grado_aca' => 'sometimes|string',
        ]);
        
        try {
            // Iniciamos la transacción para proteger ambas tablas
            DB::beginTransaction();

            // 1. Actualizar datos en la tabla 'usuario'
            $user->update($request->only(['nombre_user', 'numero_cel', 'correo', 'nombre', 'ap_paterno', 'ap_materno', 'ci', 'fecha_nac']));
            
            // 2. Actualizar datos específicos en la tabla 'tutor_aca'
            $tutor->update($request->only(['especialidad', 'grado_aca']));
            
            // Confirmamos los cambios de manera segura
            DB::commit();
            
            return back()->with('success', 'Tutor actualizado exitosamente');

        } catch (\Exception $e) {
            // Cancelamos cualquier cambio si ocurre un error inesperado
            DB::rollBack();
            return back()->with('error', 'Error al actualizar el tutor: ' . $e->getMessage());
        }
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
        // return response()->json(['data' => $admins]);
        return Inertia::render('Admin/Usuarios/Administradores', ['administradores' => $admins]);
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
                    'ap_paterno' => $user->ap_paterno,
                    'ap_materno' => $user->ap_materno,
                    'correo' => $user->correo,
                    'estado' => $user->estado_cuenta,
                    'rol' => $this->getUserRole($user),
                    'perfil' => $this->getPerfilData($user),
                    'ci' => $user->ci,
                    'estado_aprobacion' => $user->estado_aprobacion,
                    'numero_cel' => $user->numero_cel,
                    'fecha_nac' => $user->fecha_nac
                ];
            });
        
        // return response()->json(['data' => $usuarios]);
        return Inertia::render('Admin/Usuarios/Index', ['usuarios' => $usuarios]);
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