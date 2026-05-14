<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Pasante;
use App\Models\JefePas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BitacoraEvaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Monitoreo/Bitacoras', [
            'bitacoras' => BitacoraEva::with(['pasante.user', 'actividad', 'jefe.user'])
                ->orderBy('fecha', 'desc')
                ->get(),
            'pasantes' => Pasante::with('user')->get(),
            'actividades' => Actividad::all(),
            'jefes' => JefePas::with('user')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'estado' => 'required|string',
            'nota' => 'nullable|numeric|min:0|max:100',
            'fecha' => 'required|date',
            'hora' => 'required',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'idU_jefe' => 'required|exists:jefe_pas,idU_jefe',
        ]);

        BitacoraEva::create($validated);

        return redirect()->back()->with('message', 'Bitácora creada exitosamente.');
    }

    public function update(Request $request, $id)
    {
        $bitacora = BitacoraEva::findOrFail($id);
        
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'estado' => 'required|string',
            'nota' => 'nullable|numeric|min:0|max:100',
            'fecha' => 'required|date',
            'hora' => 'required',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'idU_jefe' => 'required|exists:jefe_pas,idU_jefe',
        ]);

        $bitacora->update($validated);

        return redirect()->back()->with('message', 'Bitácora actualizada correctamente.');
    }

    public function destroy($id)
    {
        $bitacora = BitacoraEva::findOrFail($id);
        $bitacora->delete();

        return redirect()->back()->with('message', 'Bitácora eliminada.');
    }
}