<?php

namespace App\Http\Controllers\Api;

use App\Models\Pasantia;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;


class PasantiaController extends Controller
{
    public function index()
    {
        $pasantias = Pasantia::with('empresa')->get();
        return Inertia::render('Admin/Pasantias/Publicadas', ['pasantias' => $pasantias]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_pas' => 'required|string|max:150',
            'estado' => 'sometimes|in:activo,inactivo,completado',
            'mencion' => 'required|string|max:100',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after:fecha_ini',
            'cupos' => 'required|integer|min:1',
            'cupos_disponibles' => 'required|integer|min:0|lte:cupos',
            'carga_horaria' => 'nullable|integer',
            'turno' => 'nullable|in:mañana,tarde,noche,tiempo completo',
            'id_empresa' => 'required|exists:EMPRESA,id_empresa',
        ]);

        $pasantia = Pasantia::create($validated);
        return response()->json($pasantia, 201);
    }

    public function show($id)
    {
        $pasantia = Pasantia::with(['empresa', 'inscripciones.pasante.usuario', 'actividades', 'comentarios.pasante.usuario'])->findOrFail($id);
        return response()->json($pasantia);
    }

    public function update(Request $request, $id)
    {
        $pasantia = Pasantia::findOrFail($id);
        $validated = $request->validate([
            'nombre_pas' => 'sometimes|string|max:150',
            'estado' => 'sometimes|in:activo,inactivo,completado',
            'mencion' => 'sometimes|string|max:100',
            'fecha_ini' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_ini',
            'cupos' => 'sometimes|integer|min:1',
            'cupos_disponibles' => 'sometimes|integer|min:0|lte:cupos',
            'carga_horaria' => 'nullable|integer',
            'turno' => 'nullable|in:mañana,tarde,noche,tiempo completo',
            'id_empresa' => 'sometimes|exists:EMPRESA,id_empresa',
        ]);

        $pasantia->update($validated);
        return response()->json($pasantia);
    }

    public function destroy($id)
    {
        $pasantia = Pasantia::findOrFail($id);
        // Verificar si tiene inscripciones activas antes de eliminar
        if ($pasantia->inscripciones()->where('estado', '!=', 'finalizado')->count() > 0) {
            return response()->json(['message' => 'No se puede eliminar porque tiene inscripciones activas'], 422);
        }
        $pasantia->delete();
        return response()->json(null, 204);
    }
}