<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Actividad;
use App\Models\ProgresoAct;
use App\Models\AutoEva;
use App\Models\ComActividad;
use App\Models\BitacoraEva;
use App\Models\Pasantia;
use App\Models\Pasante;
use App\Traits\SincronizaEstadosInscripciones;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class ActividadController extends Controller
{
    use SincronizaEstadosInscripciones;

    public function index()
    {
        return Inertia::render('Admin/Monitoreo/Actividades', [
            'actividades' => Actividad::with('pasantia.empresa')->orderBy('id_actividad', 'desc')->get(),
            'pasantias' => Pasantia::with('empresa')->where('estado', 'INICIADO')->orWhere('estado', 'ABIERTA')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nombre_act' => 'required|string|max:255',
            'tipo' => 'required|string|in:TECNICA,OPERATIVA',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_ini',
            'descripcion' => 'nullable|string',
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);

        try {
            DB::transaction(function () use ($validated) {
                Actividad::create($validated);
            });

            return redirect()->back()->with('success', 'Actividad creada con éxito');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al crear la actividad: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $actividad = Actividad::findOrFail($id);
        
        $validated = $request->validate([
            'nombre_act' => 'required|string|max:255',
            'tipo' => 'required|string|in:TECNICA,OPERATIVA',
            'fecha_ini' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_ini',
            'descripcion' => 'nullable|string',
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);

        try {
            DB::transaction(function () use ($actividad, $validated) {
                $actividad->update($validated);
            });

            return redirect()->back()->with('success', 'Actividad actualizada con éxito');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al actualizar la actividad: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        try {
            $actividad = Actividad::findOrFail($id);

            DB::transaction(function () use ($actividad) {
                $actividad->delete();
            });

            return redirect()->back()->with('success', 'Actividad eliminada correctamente');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'Error al eliminar la actividad: ' . $e->getMessage()]);
        }
    }


    /**
     * Muestra las actividades correspondientes a la pasantía seleccionada
     */
    public function actividadesPasantia($id_pasantia)
    {
        $jefe = Auth::user()->jefePas;
        $pasantia = Pasantia::findOrFail($id_pasantia);
        $ahora = Carbon::now();

        $actividades = Actividad::where('id_pasantia', $id_pasantia)
            ->get()
            ->map(function ($act) use ($ahora) {
                $inicio = Carbon::parse($act->fecha_ini);
                $fin = Carbon::parse($act->fecha_fin);
                $tiempo_restante = '';

                if ($ahora->lt($inicio)) {
                    // diffInDays con false como segundo parámetro puede traer decimales, usamos float y redondeamos
                    $dias = (int) ceil($ahora->diffInDays($inicio, false)); 
                    $tiempo_restante = $dias === 0 ? 'Inicia hoy' : "Inicia en {$dias} " . ($dias == 1 ? 'día' : 'días');
                } elseif ($ahora->gte($inicio) && $ahora->lte($fin)) {
                    // ceil() asegura que si quedan 5.1 días, se muestre como "Finaliza en 6 días" (redondeo hacia arriba)
                    $dias = (int) ceil($ahora->diffInDays($fin, false)); 
                    $tiempo_restante = $dias === 0 ? 'Finaliza hoy' : "Finaliza en {$dias} " . ($dias == 1 ? 'día' : 'días');
                } else {
                    $tiempo_restante = 'Finalizada';
                }

                return [
                    'id' => $act->id_actividad,
                    'nombre' => $act->nombre_act,
                    'pasantia' => $act->pasantia->nombre_pas,
                    'fecha_ini' => $inicio->format('d/m/Y'),
                    'fecha_fin' => $fin->format('d/m/Y'),
                    'tipo' => $act->tipo,
                    'tiempo_restante' => $tiempo_restante,
                ];
            });

        // Pasantes inscritos en esta pasantía específica asignados a este jefe
        $pasantes = Pasante::with('user')
            ->whereHas('inscripciones', function ($q) use ($jefe, $id_pasantia) {
                $q->where('idU_jefe', $jefe->idU_jefe)
                  ->where('id_pasantia', $id_pasantia);
            })->get()->map(fn($p) => [
                'id' => $p->idU_pasante,
                'nombre' => $p->user->nombre . ' ' . $p->user->ap_paterno,
            ]);

        return Inertia::render('Jefe/Evaluaciones/Actividades', [
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas
            ],
            'actividades' => $actividades,
            'pasantes' => $pasantes,
        ]);
    }

    /**
     * Endpoint asíncrono: Obtiene la descripción detallada de la actividad
     */
    public function obtenerDetalle($id)
    {
        $actividad = Actividad::findOrFail($id);
        return response()->json($actividad);
    }

    /**
     * Endpoint asíncrono: Obtiene los progresos de los pasantes junto con su nota de bitácora
     */
    public function obtenerProgresos($id)
    {
        $actividad = Actividad::findOrFail($id);

        // Obtenemos solo los progresos vinculados a esta actividad
        // solo el progreso más reciente por pasante para esta actividad
        $progresos = ProgresoAct::where('id_actividad', $id)
            ->with(['pasante.user'])
            ->get()
            ->map(function($progreso) use ($actividad) {
                
                // Buscamos si el pasante tiene una bitácora calificada para la inscripción de esta pasantía con id_pasante y id_pasantia
                // BITACORA_EVA(id_bitacora, descripcion, estado, nota, fecha, hora, observacion, recomendacion, idU_pasante, id_actividad, idU_jefe)
                $bitacora = BitacoraEva::where('idU_pasante', $progreso->idU_pasante)
                    ->where('id_actividad', $actividad->id_actividad)
                    ->whereHas('pasante.inscripciones', function($q) use ($actividad) {
                        $q->where('id_pasantia', $actividad->id_pasantia);
                    })
                    ->first();

                return [
                    'id_progreso' => $progreso->id_progresoact,
                    'id_pasante' => $progreso->idU_pasante,
                    'pasante' => $progreso->pasante->user->nombre . ' ' . $progreso->pasante->user->ap_paterno,
                    'descripcion' => $progreso->descripcion,
                    'porcentaje' => $progreso->porcentaje,
                    'fecha_hora' => Carbon::parse($progreso->fecha)->setTimeFromTimeString($progreso->hora)->format('d/m/Y H:i:s'),
                    'nota_bitacora' => $bitacora ? $bitacora->nota : null, // Muestra la nota si existe
                ];
            });

        // mandar solo el progreso más reciente por pasante para esta actividad
        $progresos = $progresos->groupBy('id_pasante')->map(function($grupo) {
            return $grupo->sortByDesc('fecha_hora')->first();
        })->values();

        return response()->json($progresos);
    }
}