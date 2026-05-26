<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comentario;
use App\Models\Pasante;
use App\Models\Pasantia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ComentarioController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Comunicacion/Comentarios', [
            'comentarios' => Comentario::with(['pasante.user', 'pasantia.empresa'])
                ->orderBy('fecha', 'desc')
                ->get(),
            'pasantes' => Pasante::with('user')->get(),
            'pasantias' => Pasantia::with('empresa')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descripcion'  => 'required|string|min:10',
            'calificacion' => 'required|numeric|min:1|max:5',
            'idU_pasante'  => 'required|exists:pasante,idU_pasante',
            'id_pasantia'  => 'required|exists:pasantia,id_pasantia',
            'fecha'        => 'nullable|date',
        ]);

        $validated['fecha'] = $validated['fecha'] ?? Carbon::now()->format('Y-m-d');

        Comentario::create($validated);

        return redirect()->back()->with('success', 'Comentario registrado con éxito.');
    }

    public function update(Request $request, $id)
    {
        $comentario = Comentario::findOrFail($id);
        
        $validated = $request->validate([
            'descripcion'  => 'required|string|min:10',
            'calificacion' => 'required|numeric|min:1|max:5',
            'idU_pasante'  => 'required|exists:pasante,idU_pasante',
            'id_pasantia'  => 'required|exists:pasantia,id_pasantia',
            'fecha'        => 'required|date',
        ]);

        $comentario->update($validated);

        return redirect()->back()->with('success', 'Comentario actualizado correctamente.');
    }

    public function destroy($id)
    {
        Comentario::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Comentario eliminado.');
    }
}