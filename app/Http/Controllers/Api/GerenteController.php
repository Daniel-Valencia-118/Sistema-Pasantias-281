<?php
// app/Http/Controllers/Api/GerenteController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Pasantia;
use App\Models\JefePas;
use App\Models\User;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GerenteController extends Controller
{
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
    
    public function listarPasantias()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantias = Pasantia::where('id_empresa', $empresa->id_empresa)->get();
        
        return response()->json(['data' => $pasantias]);
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
            'estado' => 'sometimes|string|in:activo,inactivo,completado',
            'fecha_ini' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_ini',
            'cupos' => 'sometimes|integer|min:1',
            'turno' => 'nullable|string|in:mañana,tarde,noche,tiempo completo',
        ]);
        
        $pasantia->update($request->only([
            'nombre_pas', 'estado', 'fecha_ini', 'fecha_fin', 'cupos', 'turno'
        ]));
        
        return response()->json(['message' => 'Pasantía actualizada', 'data' => $pasantia]);
    }
    
    public function eliminarPasantia($id)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)->findOrFail($id);
        
        $pasantia->update(['estado' => 'inactivo']);
        
        return response()->json(['message' => 'Pasantía desactivada']);
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
    
    // =============================================
    // ASIGNAR JEFE A PASANTES
    // =============================================
    
    public function asignarJefeAPasantes(Request $request)
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'idU_jefe' => 'required|exists:jefe_pas,idU_jefe',
        ]);
        
        // Verificar que la pasantía pertenece a la empresa
        $pasantia = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->findOrFail($request->id_pasantia);
        
        // Asignar jefe a todos los pasantes de esa pasantía
        Inscripcion::where('id_pasantia', $request->id_pasantia)
            ->whereNull('idU_jefe')
            ->update(['idU_jefe' => $request->idU_jefe]);
        
        return response()->json(['message' => 'Jefe asignado a los pasantes']);
    }
    
    // =============================================
    // LISTAR PASANTES DE MI EMPRESA
    // =============================================
    
    public function listarPasantes()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        $pasantes = Inscripcion::with(['pasante.user', 'pasantia'])
            ->whereHas('pasantia', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })
            ->get();
        
        return response()->json(['data' => $pasantes]);
    }
}