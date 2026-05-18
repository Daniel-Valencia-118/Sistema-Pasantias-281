<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Actividad;
use App\Models\ProgresoAct;
use App\Models\AutoEva;
use App\Models\ComActividad;
use App\Models\BitacoraEva;
use App\Traits\SincronizaEstadosInscripciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ActividadController extends Controller
{
    use SincronizaEstadosInscripciones;

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

    /**
     * Muestra las tarjetas de las pasantías a cargo del jefe con inscripciones 'iniciado' o 'finalizado'.
     */
    public function tarjetas()
    {
        // 1. Obtener el Jefe de Pasantía autenticado
        $user = Auth::user();
        $jefe = $user->jefePas; // Relación idU_jefe

        if (!$jefe) {
            return redirect()->back()->with('error', 'No se encontró un perfil de Supervisor/Jefe asociado a este usuario.');
        }

        // 2. Traer todas las inscripciones asignadas a este jefe
        $inscripciones = Inscripcion::with(['pasantia.empresa'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->get();

        // Sincronizar estados (reutilizando tu trait si aplica al flujo del jefe)
        if (method_exists($this, 'sincronizarEstadosInscripciones')) {
            $inscripciones = $this->sincronizarEstadosInscripciones($inscripciones);
        }

        // 3. AGRUPAR POR PASANTÍA: El jefe debe ver UNA sola tarjeta por programa, no por alumno
        $tarjetas = $inscripciones->groupBy('id_pasantia')->map(function ($grupoInscripciones) {
            // Tomamos la primera inscripción del grupo para extraer los metadatos de la Pasantía
            $primeraInscripcion = $grupoInscripciones->first();
            $pasantia = $primeraInscripcion->pasantia;

            return [
                'id' => $pasantia->id_pasantia, // ID necesario para la ruta parametrizada
                'nombre' => $pasantia->nombre_pas,
                'codigo' => $pasantia->codigo_pas ?? $pasantia->codigo ?? 'PAS-GEN',
                'anio' => $pasantia->fecha_ini ? date('Y', strtotime($pasantia->fecha_ini)) : date('Y'),
                'fecha_ini' => $pasantia->fecha_ini,
                'fecha_fin' => $pasantia->fecha_fin,
                'empresa_nombre' => $pasantia->empresa ? $pasantia->empresa->nombre : 'Institución / Empresa Externa',
                'cantidad_pasantes' => $grupoInscripciones->count(), // Muestra cuántos alumnos tiene aquí
                'estado_inscripcion' => $pasantia->estado, // Estado de control del grupo
            ];
        })->values();

        // 4. Ordenar las tarjetas: fecha_ini ASC, fecha_fin ASC, nombre ASC
        $tarjetas = $tarjetas->sortBy([
            ['fecha_ini', 'asc'],
            ['fecha_fin', 'asc'],
            ['nombre', 'asc'],
        ])->values();

        // 5. Renderizar la vista Index del panel del Jefe
        return Inertia::render('Jefe/Index', [
            'tarjetas' => $tarjetas,
        ]);
    }
}