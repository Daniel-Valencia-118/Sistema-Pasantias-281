<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User; // CORRECCIÓN: Asegurar el nombre correcto del modelo
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RegisterController extends Controller
{
    public function store(Request $request)
    {
        // 1. Validaciones base compartidas por todos los usuarios
        $rules = [
            'role' => ['required', Rule::in(['pasante', 'jefe', 'tutor', 'gerente'])],
            'nombre_user' => 'required|string|max:50|unique:usuario,nombre_user',
            'correo' => 'required|string|email|max:100|unique:usuario,correo',
            'password' => 'required|string|min:8|confirmed',
            'nombre' => 'required|string|max:50',
            'ap_paterno' => 'required|string|max:50',
            'ap_materno' => 'required|string|max:50',
            'ci' => 'required|string|max:20|unique:usuario,ci',
            'numero_cel' => 'required|string|max:20',
            'fecha_nac' => 'required|date',
        ];

        // 2. Validaciones específicas según el rol seleccionado
        if ($request->role === 'pasante') {
            $rules = array_merge($rules, [
                // CORRECCIÓN: 'PASANTE' cambiado a 'pasante'
                'ru' => 'required|string|unique:pasante,ru',
                'matricula' => 'required|string',
                'semestre' => 'required|integer|between:1,10',
                'mencion' => 'required|string',
            ]);
        } elseif ($request->role === 'jefe') {
            $rules = array_merge($rules, [
                'cargo' => 'required|string|max:100',
                'area' => 'required|string|max:100',
                // Validamos que el ID exista realmente en la tabla 'empresas'
                'id_empresa' => 'required|exists:empresa,id_empresa',
            ]);
        } elseif ($request->role === 'tutor') {
            $rules = array_merge($rules, [
                'especialidad' => 'required|string|max:100',
                'grado_aca' => 'required|string|max:20',
            ]);
        } elseif ($request->role === 'gerente') {
            $rules = array_merge($rules, [
                'nro_secun' => 'nullable|string|max:20',
                // para los datos de la empresa
                'empresa_nombre' => 'nullable|string|max:100',
                'empresa_direccion' => 'nullable|string|max:200',
                'empresa_telefono' => 'nullable|string|max:20',
                'empresa_email' => 'nullable|email|max:100',
                'empresa_nit' => 'nullable|string|max:20',
            ]);
        }

        $request->validate($rules);

        // 3. Procesamiento seguro de datos en Base de Datos
        DB::beginTransaction();
        try {
            // CORRECCIÓN: Se cambió 'Usuario' por 'User' para coincidir con tu modelo real
            $usuario = User::create([
                'nombre_user' => $request->nombre_user,
                'password' => Hash::make($request->password),
                'numero_cel' => $request->numero_cel,
                'ci' => $request->ci,
                'correo' => $request->correo,
                'nombre' => $request->nombre,
                'ap_paterno' => $request->ap_paterno,
                'ap_materno' => $request->ap_materno,
                'fecha_nac' => $request->fecha_nac,
                'fecha_registro' => now(),
                // 'estado_cuenta' => false,        
                'estado_cuenta' => true, // Para pruebas, luego cambiar a false para requerir aprobación
                // 'estado_aprobacion' => 'pendiente',
                'estado_aprobacion' => 'aprobado', // Para pruebas, luego cambiar a 'pendiente'
            ]);

            // Insertar en las tablas hijas según la herencia
            switch ($request->role) {
                case 'pasante':
                    // CORRECCIÓN: 'PASANTE' cambiado a 'pasante'
                    DB::table('pasante')->insert([
                        'idU_pasante' => $usuario->idUser,
                        'ru' => $request->ru,
                        'matricula' => $request->matricula,
                        'semestre' => $request->semestre,
                        'mencion' => $request->mencion,
                        'idU_tutor' => null 
                    ]);
                    break;

                case 'jefe':
                    // CORRECCIÓN: 'JEFE_PAS' cambiado a 'jefe_pas'
                    DB::table('jefe_pas')->insert([
                        'idU_jefe' => $usuario->idUser,
                        'cargo' => $request->cargo,
                        'area' => $request->area,
                        'id_empresa' => $request->id_empresa, // El ID que seleccionó del SelectInput
                    ]);
                    break;

                case 'tutor':
                    // CORRECCIÓN: 'TUTOR_ACA' cambiado a 'tutor_aca'
                    DB::table('tutor_aca')->insert([
                        'idU_tutor' => $usuario->idUser,
                        'especialidad' => $request->especialidad,
                        'grado_aca' => $request->grado_aca,
                    ]);
                    break;

                case 'gerente':
                    // CORRECCIÓN: 'GERENTE' cambiado a 'gerente'
                    DB::table('gerente')->insert([
                        'idU_gerente' => $usuario->idUser,
                        'nro_secun' => $request->nro_secun,
                    ]);
                    // empresa EMPRESA(id_empresa, nombre, direccion, email, nit, telefono, idU_gerente)
                    DB::table('empresa')->insert([
                        'idU_gerente' => $usuario->idUser,
                        'nombre' => $request->empresa_nombre ?? $request->nombre_user . ' Empresa',
                        'direccion' => $request->empresa_direccion ?? 'Dirección por defecto',
                        'telefono' => $request->empresa_telefono ?? $request->numero_cel,
                        'email' => $request->empresa_email ?? $request->correo,
                        'nit' => $request->empresa_nit ?? $request->ci,
                    ]);
                    break;
            }

            DB::commit();

            return redirect()->route('registro.pendiente');

        } catch (\Exception $e) {
            DB::rollBack();
            // Recomendable durante desarrollo para ver qué falló exactamente:
            return back()->withErrors(['error' => 'Error en el servidor: ' . $e->getMessage()]);
        }
    }
}
