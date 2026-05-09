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

class EmpresaController extends Controller
{
    // Listar todos las empresas y sus gerentes
    public function index()
    {
        $empresas = Empresa::with('gerente.user')->get();
        return Inertia::render('Admin/Empresas/Index', ['empresas' => $empresas]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:100|unique:EMPRESA,nombre',
            'direccion' => 'nullable|string|max:200',
            'email' => 'required|email|max:100',
            'nit' => 'required|string|max:20|unique:EMPRESA,nit',
            'telefono' => 'nullable|string|max:20',
            'idU_gerente' => 'required|exists:GERENTE,idU_gerente',
        ]);

        $empresa = Empresa::create($validated);
        return response()->json($empresa, 201);
    }

    public function show($id)
    {
        $empresa = Empresa::with(['gerente.user', 'jefesPas.user', 'pasantias'])->findOrFail($id);
        // volver a la misma pagina desde donde se llamo a la api con detalles de la empresa, incluyendo gerente, jefes y pasantías
    }

    public function update(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        $validated = $request->validate([
            'nombre' => 'sometimes|string|max:100|unique:EMPRESA,nombre,'.$id.',id_empresa',
            'direccion' => 'nullable|string|max:200',
            'email' => 'sometimes|email|max:100',
            'nit' => 'sometimes|string|max:20|unique:EMPRESA,nit,'.$id.',id_empresa',
            'telefono' => 'nullable|string|max:20',
            'idU_gerente' => 'sometimes|exists:GERENTE,idU_gerente',
        ]);

        $empresa->update($validated);
        return response()->json($empresa);
    }

    public function destroy($id)
    {
        $empresa = Empresa::findOrFail($id);
        $empresa->delete();
        return response()->json(null, 204);
    }
}