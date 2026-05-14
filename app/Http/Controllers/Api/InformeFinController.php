<?php

namespace App\Http\Controllers\Api;

use App\Models\InformeFin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;

class InformeFinController extends Controller
{
    public function index()
    {
        $informes = InformeFin::with(['inscripcion.pasante.usuario', 'inscripcion.pasantia', 'jefe.usuario'])->get();
        return response()->json($informes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'promedio' => 'required|numeric|min:0|max:100',
            'resultado' => 'required|in:aprobado,reprobado',
            'fecha' => 'sometimes|date',
            'id_inscripcion' => 'required|exists:INSCRIPCION,id_inscripcion|unique:INFORME_FIN,id_inscripcion',
            'idU_jefe' => 'required|exists:JEFE_PAS,idU_jefe',
        ]);

        $informe = InformeFin::create($validated);
        return response()->json($informe, 201);
    }

    public function show($id)
    {
        $informe = InformeFin::with(['inscripcion', 'jefe.usuario'])->findOrFail($id);
        return response()->json($informe);
    }

    public function update(Request $request, $id)
    {
        $informe = InformeFin::findOrFail($id);
        $validated = $request->validate([
            'promedio' => 'sometimes|numeric|min:0|max:100',
            'resultado' => 'sometimes|in:aprobado,reprobado',
            'fecha' => 'sometimes|date',
            'id_inscripcion' => 'sometimes|exists:INSCRIPCION,id_inscripcion|unique:INFORME_FIN,id_inscripcion,'.$id.',id_informe',
            'idU_jefe' => 'sometimes|exists:JEFE_PAS,idU_jefe',
        ]);

        $informe->update($validated);
        return response()->json($informe);
    }

    public function destroy($id)
    {
        $informe = InformeFin::findOrFail($id);
        $informe->delete();
        return response()->json(null, 204);
    }
}