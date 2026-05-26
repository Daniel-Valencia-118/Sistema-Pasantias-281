<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\Pasante;
use App\Models\JefePas;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class MensajeController extends Controller
{
    public function index()
    {
        try {
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
        } catch (Exception $e) {
            // Log::error('Error al cargar mensajes: ' . $e->getMessage());
            return back()->with('error', 'No se pudieron cargar los datos de comunicación.');
        }
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

        $validated['fecha'] = $validated['fecha'] ?? Carbon::now()->format('Y-m-d');
        $validated['hora']  = $validated['hora'] ?? Carbon::now()->format('H:i:s');

        try {
            DB::beginTransaction();

            Mensaje::create($validated);

            DB::commit();
            return redirect()->back()->with('success', 'Mensaje registrado correctamente.');
        } catch (Exception $e) {
            DB::rollBack();
            // Log::error('Error al guardar mensaje: ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudo registrar el mensaje.');
        }
    }

    public function update(Request $request, $id)
    {
        // dd($request->all(), $id);
        try {
            $mensaje = Mensaje::findOrFail($id);
            
            $validated = $request->validate([
                'descripcion' => 'required|string',
                'idU_pasante' => 'required|exists:pasante,idU_pasante',
                'idU_jefe'    => 'required|exists:jefe_pas,idU_jefe',
                'fecha'       => 'required|date',
                'hora'        => 'required',
            ]);


            DB::beginTransaction();

            $mensaje->update($validated);

            DB::commit();
            return redirect()->back()->with('success', 'Mensaje actualizado.');
        } catch (Exception $e) {
            DB::rollBack();
            // Log::error('Error al actualizar mensaje ID ' . $id . ': ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudo actualizar el mensaje.');
        }
    }

    public function destroy($id)
    {
        try {
            $mensaje = Mensaje::findOrFail($id);

            DB::beginTransaction();

            $mensaje->delete();

            DB::commit();
            return redirect()->back()->with('success', 'Mensaje eliminado del historial.');
        } catch (Exception $e) {
            DB::rollBack();
            // Log::error('Error al eliminar mensaje ID ' . $id . ': ' . $e->getMessage());
            return redirect()->back()->with('error', 'No se pudo eliminar el mensaje.');
        }
    }
}
