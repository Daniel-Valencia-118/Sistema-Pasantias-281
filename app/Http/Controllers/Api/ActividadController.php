<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Actividad;
use App\Models\Pasantia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActividadController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Monitoreo/Actividades', [
            'actividades' => Actividad::with('pasantia.empresa')->orderBy('id_actividad', 'desc')->get(),
            'pasantias' => Pasantia::with('empresa')->where('estado', 'disponible')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_act' => 'required|string|max:255',
            'tipo' => 'required|string',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_ini',
            'descripcion' => 'nullable|string',
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);

        Actividad::create($validated);

        return redirect()->back()->with('message', 'Actividad creada con éxito');
    }

    public function update(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        
        $validated = $request->validate([
            'nombre_act' => 'required|string|max:255',
            'tipo' => 'required|string',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_ini',
            'descripcion' => 'nullable|string',
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);

        $actividad->update($validated);

        return redirect()->back()->with('message', 'Actividad actualizada con éxito');
    }

    public function destroy($id)
    {
        $actividad = Actividad::findOrFail($id);
        $actividad->delete();

        return redirect()->back()->with('message', 'Actividad eliminada correctamente');
    }
}