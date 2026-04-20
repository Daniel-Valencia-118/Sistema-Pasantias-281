<?php
// app/Http/Controllers/Api/RegistroPublicoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Administrador;
use App\Models\Pasante;
use App\Models\Gerente;
use App\Models\Empresa;
use App\Models\TutorAca;
use App\Models\JefePas;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Mail\SolicitudRegistroMail;
use App\Mail\RegistroAprobadoMail;
use App\Mail\RegistroRechazadoMail;

class RegistroPublicoController extends Controller
{
    // =============================================
    // REGISTRO PÚBLICO DE PASANTE
    // =============================================
    public function registrarPasante(Request $request)
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
                'estado_cuenta' => false,
                'estado_aprobacion' => 'pendiente',
                
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

            // Enviar correo al administrador
            $admins = Administrador::with('user')->get();
            foreach ($admins as $admin) {
                Mail::to($admin->user->correo)->send(new SolicitudRegistroMail($user, 'pasante', null));
            }

            return response()->json([
                'message' => 'Solicitud de registro enviada. Espera la aprobación del administrador.',
                'status' => 'pending'
            ], 202);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // =============================================
    // REGISTRO PÚBLICO DE TUTOR
    // =============================================
    public function registrarTutor(Request $request)
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
                'estado_cuenta' => false,
                'estado_aprobacion' => 'pendiente',
                
            ]);

            $tutor = TutorAca::create([
                'idU_tutor' => $user->idUser,
                'especialidad' => $request->especialidad,
                'grado_aca' => $request->grado_aca,
            ]);

            DB::commit();

            $admins = Administrador::with('user')->get();
            foreach ($admins as $admin) {
                Mail::to($admin->user->correo)->send(new SolicitudRegistroMail($user, 'tutor', null));
            }

            return response()->json([
                'message' => 'Solicitud de registro enviada. Espera la aprobación del administrador.',
                'status' => 'pending'
            ], 202);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // =============================================
    // REGISTRO PÚBLICO DE GERENTE + EMPRESA
    // =============================================
    public function registrarGerente(Request $request)
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
                'estado_cuenta' => false,
                'estado_aprobacion' => 'pendiente',
                
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

            $admins = Administrador::with('user')->get();
            foreach ($admins as $admin) {
                Mail::to($admin->user->correo)->send(new SolicitudRegistroMail($user, 'gerente', $empresa));
            }

            return response()->json([
                'message' => 'Solicitud de registro enviada. Espera la aprobación del administrador.',
                'status' => 'pending'
            ], 202);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    // =============================================
    // REGISTRO DE JEFE (con empresa existente - aprobado por gerente)
    // =============================================
    public function registrarJefe(Request $request)
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
            'empresa_id' => 'required|exists:empresa,id_empresa',
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
                'estado_cuenta' => false,
                'estado_aprobacion' => 'pendiente',
                
            ]);

            $jefe = JefePas::create([
                'idU_jefe' => $user->idUser,
                'cargo' => $request->cargo,
                'area' => $request->area,
                'id_empresa' => $request->empresa_id,
            ]);

            DB::commit();

            // Enviar correo al gerente de la empresa
            $empresa = Empresa::find($request->empresa_id);
            $gerente = $empresa->gerente;
            
            Mail::to($gerente->user->correo)->send(new SolicitudRegistroMail($user, 'jefe', $empresa));

            return response()->json([
                'message' => 'Solicitud de registro enviada al gerente de la empresa. Espera su aprobación.',
                'status' => 'pending'
            ], 202);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}