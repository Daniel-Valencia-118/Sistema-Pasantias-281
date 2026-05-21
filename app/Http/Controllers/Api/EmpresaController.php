<?php

namespace App\Http\Controllers\Api;

use App\Models\Empresa;
use App\Models\Gerente;
use App\Models\JefePas;
use App\Models\Pasantia;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

// auth


class EmpresaController extends Controller
{
    // Listar todos las empresas y sus gerentes
    public function index()
    {
        $empresas = Empresa::with('gerente.user')->get();
        $gerentes = Gerente::with('user')->get();
        return Inertia::render('Admin/Empresas/Index', ['empresas' => $empresas, 'gerentesDisponibles' => $gerentes]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // CAMBIO: 'EMPRESA' por 'empresa'
            'nombre' => 'required|string|max:100|unique:empresa,nombre',
            'direccion' => 'nullable|string|max:200',
            'email' => 'required|email|max:100',
            // CAMBIO: 'EMPRESA' por 'empresa'
            'nit' => 'required|string|max:20|unique:empresa,nit',
            'telefono' => 'nullable|string|max:20',
            // CAMBIO: 'GERENTE' por 'gerente'
            'idU_gerente' => 'required|exists:gerente,idU_gerente',
        ]);

        try {
            DB::beginTransaction();

            $empresa = Empresa::create($validated);

            DB::commit();
            return back()->with('success', 'Empresa creada exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al crear la empresa: ' . $e->getMessage());
        }
    }

    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $validated = $request->validate([
            // CAMBIO: 'EMPRESA' por 'empresa'
            'nombre' => 'sometimes|string|max:100|unique:empresa,nombre,'.$id.',id_empresa',
            'direccion' => 'nullable|string|max:200',
            'email' => 'sometimes|email|max:100',
            // CAMBIO: 'EMPRESA' por 'empresa'
            'nit' => 'sometimes|string|max:20|unique:empresa,nit,'.$id.',id_empresa',
            // CAMBIO: 'GERENTE' por 'gerente'
            'idU_gerente' => 'sometimes|exists:gerente,idU_gerente',
        ]);

        try {
            DB::beginTransaction();

            $empresa->update($validated);

            DB::commit();
            return back()->with('success', 'Empresa actualizada exitosamente.');    

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al actualizar la empresa: ' . $e->getMessage());
        }
    }


    public function show($id)
    {
        try {
            // Carga la empresa con todas sus relaciones anidadas de forma óptima
            $empresa = Empresa::with(['gerente.user', 'jefesPas.user', 'pasantias'])->findOrFail($id);
            
            // Retorna la vista de Inertia pasando la información como "props"
            return Inertia::render('Admin/Empresas/Detalles', [
                'empresa' => $empresa
            ]);

        } catch (\Exception $e) {
            return back()->with('error', 'No se pudo cargar la información de la empresa.');
        }
    }

    public function destroy($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->delete();
        return response()->json(null, 204);
    }
}