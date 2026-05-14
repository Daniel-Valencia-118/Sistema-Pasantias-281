<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\Pasante;
use App\Models\JefePas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MensajeController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Comunicacion/Mensajes', [
            'mensajes' => Mensaje::with(['pasante.user', 'jefe.user'])
                ->orderBy('fecha', 'desc')
                ->orderBy('hora', 'desc')
                ->get(),
            'pasantes' => Pasante::with('user')->get(),
            'jefes' => JefePas::with('user')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'idU_jefe'    => 'required|exists:jefe_pas,idU_jefe',
            'fecha'       => 'nullable|date',
            'hora'        => 'nullable',
        ]);

        // Si no se envía fecha/hora, usamos la actual del sistema
        $validated['fecha'] = $validated['fecha'] ?? Carbon::now()->format('Y-m-d');
        $validated['hora']  = $validated['hora'] ?? Carbon::now()->format('H:i:s');

        Mensaje::create($validated);

        return redirect()->back()->with('message', 'Mensaje registrado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $mensaje = Mensaje::findOrFail($id);
        
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'idU_jefe'    => 'required|exists:jefe_pas,idU_jefe',
            'fecha'       => 'required|date',
            'hora'        => 'required',
        ]);

        $mensaje->update($validated);

        return redirect()->back()->with('message', 'Mensaje actualizado.');
    }

    public function destroy($id)
    {
        Mensaje::findOrFail($id)->delete();
        return redirect()->back()->with('message', 'Mensaje eliminado del historial.');
    }
}