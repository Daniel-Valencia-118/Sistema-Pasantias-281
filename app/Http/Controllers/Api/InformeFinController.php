<?php

namespace App\Http\Controllers\Api;

use App\Models\InformeFin;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Pasantia;
use Illuminate\Support\Facades\Auth;
use App\Models\Inscripcion;
use App\Models\Pasante;
use App\Models\JefePas;
use App\Models\User;

class InformeFinController extends Controller
{
    public function index()
    {
        $informes = InformeFin::with(['inscripcion.pasante.user', 'inscripcion.pasantia', 'jefe.user'])->get();
        return response()->json($informes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'promedio' => 'required|numeric|min:0|max:100',
            'resultado' => 'required|in:APROBADO,REPROBADO',
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
            'resultado' => 'sometimes|in:APROBADO,REPROBADO',
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

    /**
     * Paso 1: Muestra las tarjetas con las pasantías a cargo del Jefe
     */
    public function indexHistorialPasantias()
    {
        $jefe = Auth::user()->jefePas;

        // Obtener pasantías que tienen alumnos inscritos bajo la supervisión de este jefe
        $pasantias = Pasantia::whereIn('id_pasantia', function ($query) use ($jefe) {
            $query->select('id_pasantia')
                  ->from('inscripcion')
                  ->where('idU_jefe', $jefe->idU_jefe);
        })->get()->map(function($p) use ($jefe) {
            
            // Contamos cuántos informes ya fueron generados para esta pasantía específica
            $totalInformes = InformeFin::where('idU_jefe', $jefe->idU_jefe)
                ->whereHas('inscripcion', function($q) use ($p) {
                    $q->where('id_pasantia', $p->id_pasantia);
                })->count();

            return [
                'id' => $p->id_pasantia,
                'nombre' => $p->nombre_pas,
                'total_informes' => $totalInformes,
            ];
        });

        return Inertia::render('Jefe/Informes/Index', [
            'pasantias' => $pasantias,
        ]);
    }

    /**
     * Paso 2: Muestra la tabla histórica filtrada por la pasantía seleccionada
     */
    public function informesHistorial($id_pasantia)
    {
        $jefe = Auth::user()->jefePas;
        
        // Validamos la existencia de la pasantía
        $pasantia = Pasantia::findOrFail($id_pasantia);

        // Consultamos los informes finales filtrando por jefe e id_pasantia
        $informes = InformeFin::with(['inscripcion.pasante.user', 'inscripcion.pasantia'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->whereHas('inscripcion', function($q) use ($id_pasantia) {
                $q->where('id_pasantia', $id_pasantia);
            })
            ->orderBy('fecha', 'desc')
            ->get()
            ->map(fn($inf) => [
                'id' => $inf->id_informe,
                // Concatenación completa del nombre del pasante
                'pasante' => $inf->inscripcion->pasante->user->nombre . ' ' . $inf->inscripcion->pasante->user->ap_paterno . ' ' . $inf->inscripcion->pasante->user->ap_materno,
                'pasantia' => $inf->inscripcion->pasantia->nombre_pas,
                'promedio' => $inf->promedio,
                'nota_final' => $inf->nota_final, // Nota definitiva solicitada
                'resultado' => $inf->resultado,
                'fecha' => $inf->fecha->format('d/m/Y'),
                'id_inscripcion' => $inf->id_inscripcion,
            ]);

        return Inertia::render('Jefe/Informes/Historial', [
            'pasantia' => [
                'id' => $pasantia->id_pasantia,
                'nombre' => $pasantia->nombre_pas,
            ],
            'informes' => $informes,
        ]);
    }
}