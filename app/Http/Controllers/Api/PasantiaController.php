<?php

namespace App\Http\Controllers\Api;

use App\Models\Pasantia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PasantiaController extends Controller
{
    public function index()
    {
        try {
            $pasantias = Pasantia::with('empresa')->orderBy('fecha_ini', 'asc')->get();
            // ordenar pasantias por fecha de inicio ascendente
            
            return Inertia::render('Admin/Pasantias/Publicadas', ['pasantias' => $pasantias]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al cargar las pasantías: ' . $e->getMessage());
        }
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
            // CORRECCIÓN: 'EMPRESA' cambiado a 'empresa' para PostgreSQL
            'id_empresa' => 'required|exists:empresa,id_empresa',
        ]);

        try {
            DB::beginTransaction();

            $pasantia = Pasantia::create($validated);

            DB::commit();
            return back()->with('success', 'Pasantía creada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al crear la pasantía: ' . $e->getMessage());
        }
    }

    public function show($id)
    {
        try {
            $pasantia = Pasantia::with(['empresa', 'inscripciones.pasante.usuario', 'actividades', 'comentarios.pasante.usuario'])->findOrFail($id);
            return response()->json($pasantia);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'No se encontró la pasantía o sus relaciones',
                'details' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $pasantia = Pasantia::findOrFail($id);

        // dd($request->all());

        $validated = $request->validate([
            'nombre_pas' => 'sometimes|string|max:150',
            'estado' => 'sometimes|in:ABIERTA,FINALIZADO,INICIADO',
            'mencion' => 'sometimes|string|max:100',
            'fecha_ini' => 'sometimes|date',
            'fecha_fin' => 'sometimes|date|after:fecha_ini',
            'cupos' => 'sometimes|integer|min:1',
            'cupos_disponibles' => 'sometimes|integer|min:0|lte:cupos',
            'carga_horaria' => 'nullable|integer',
            'turno' => 'nullable|in:Mañana,Tarde,Noche,Tiempo completo,Medio tiempo',
        ]);
        
        // dd($validated);

        try {
            DB::beginTransaction();

            $pasantia->update($validated);

            DB::commit();
            return back()->with('success', 'Pasantía actualizada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al actualizar la pasantía: ' . $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $pasantia = Pasantia::findOrFail($id);
            
            // Verificar si tiene inscripciones activas antes de eliminar
            if ($pasantia->inscripciones()->where('estado', '!=', 'finalizado')->count() > 0) {
                return back()->with('error', 'No se puede eliminar porque tiene inscripciones activas.');
            }

            DB::beginTransaction();
            $pasantia->delete();
            DB::commit();

            return back()->with('success', 'Pasantía eliminada exitosamente.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error al eliminar la pasantía: ' . $e->getMessage());
        }
    }

    /**
     * Muestra las tarjetas de las pasantías a cargo del jefe con inscripciones 'iniciado' o 'finalizado'.
     */
    public function tarjetas(Request $request)
    {
        try {
            // 1. Obtener el Jefe de Pasantía autenticado
            $user = Auth::user();
            $jefe = $user->jefePas; // Relación idU_jefe
            $origen = $request->query('origen', 'bitacoras'); // 'bitacoras' por defecto si no viene parámetro

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
                $primeraInscripcion = $grupoInscripciones->first();
                $pasantia = $primeraInscripcion->pasantia;

                return [
                    'id' => $pasantia->id_pasantia, 
                    'nombre' => $pasantia->nombre_pas,
                    'codigo' => $pasantia->codigo_pas ?? $pasantia->codigo ?? 'PAS-GEN',
                    'anio' => $pasantia->fecha_ini ? date('Y', strtotime($pasantia->fecha_ini)) : date('Y'),
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'empresa_nombre' => $pasantia->empresa ? $pasantia->empresa->nombre : 'Institución / Empresa Externa',
                    'amount_pasantes' => $grupoInscripciones->count(), 
                    'estado_inscripcion' => $pasantia->estado, 
                ];
            })->values();

            // 4. Ordenar las tarjetas: fecha_ini ASC, fecha_fin ASC, nombre ASC
            $tarjetas = $tarjetas->sortBy([
                ['fecha_ini', 'asc'],
                ['fecha_fin', 'asc'],
                ['nombre', 'asc'],
            ])->values();

            // Configuración dinámica de la UI según la opción seleccionada
            $uiConfig = match ($origen) {
                'pasantes' => [
                    'titulo' => 'Control de Pasantes',
                    'descripcion' => 'Seleccione una pasantía para auditar la nómina de alumnos inscritos.',
                ],
                'actividades' => [
                    'titulo' => 'Cronograma de Actividades',
                    'descripcion' => 'Seleccione una pasantía para gestionar y evaluar las actividades obligatorias.',
                ],
                'historial' => [
                    'titulo' => 'Historial de Informes Finales',
                    'descripcion' => 'Seleccione una pasantía para revisar los expedientes y actas de calificación archivadas.',
                ],
                default => [ 
                    'titulo' => 'Evaluación de Bitácoras',
                    'descripcion' => 'Seleccione una pasantía para supervisar y calificar los reportes diarios de los pasantes.',
                ],
            };

            return Inertia::render('Jefe/Index', [
                'tarjetas' => $tarjetas,
                'origen' => $origen,
                'ui' => $uiConfig,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error al procesar las tarjetas del supervisor: ' . $e->getMessage());
        }
    }
}
