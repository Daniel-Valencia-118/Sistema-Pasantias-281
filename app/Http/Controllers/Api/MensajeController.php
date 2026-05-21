<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\Pasante;
use App\Models\JefePas;
use Inertia\Inertia;

class MensajeController extends Controller
{
    public function index()
    {
        $mensajes = Mensaje::with([
            'pasante.user', 
            'jefe.user'
        ])->orderBy('fecha', 'desc')->get();

        $jefes = JefePas::with('user')->get();
        $pasantes = Pasante::with('user')->get();

        return Inertia::render('Admin/Comunicacion/Mensajes', [
            'mensajes' => $mensajes,
            'jefes' => $jefes,
            'pasantes' => $pasantes
        ]);
    }

    public function destroy($id_mensaje)
    {
        $mensaje = Mensaje::findOrFail($id_mensaje);
        $mensaje->delete();

        return back()->with('success', 'Mensaje purgado del historial.');
    }
}