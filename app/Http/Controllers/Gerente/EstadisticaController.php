<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\JefePas;
use App\Models\BitacoraEva;
use App\Models\Comentario;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class EstadisticaController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $empresa = $user->gerente->empresa;
        
        // =============================================
        // 1. TARJETAS KPI
        // =============================================
        
        // Total de pasantías
        $totalPasantias = Pasantia::where('id_empresa', $empresa->id_empresa)->count();
        
        // Total de pasantes únicos inscritos
        $totalPasantes = Inscripcion::whereHas('pasantia', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->distinct('idU_pasante')->count('idU_pasante');
        
        // Total de jefes activos
        $totalJefes = JefePas::where('id_empresa', $empresa->id_empresa)
            ->whereHas('user', function($q) {
                $q->where('estado_cuenta', true);
            })->count();
        
        // Calificación promedio general (de comentarios)
        $calificacionPromedio = Comentario::whereHas('pasantia', function($q) use ($empresa) {
            $q->where('id_empresa', $empresa->id_empresa);
        })->avg('calificacion') ?? 0;
        
        // =============================================
        // 2. GRÁFICO: Inscripciones por mes (últimos 12 meses)
        // =============================================
        
        $inscripcionesPorMes = [];
        for ($i = 11; $i >= 0; $i--) {
            $mes = now()->subMonths($i);
            $nombreMes = $mes->translatedFormat('M');
            
            $cantidad = Inscripcion::whereHas('pasantia', function($q) use ($empresa) {
                $q->where('id_empresa', $empresa->id_empresa);
            })->whereYear('fecha_insc', $mes->year)
              ->whereMonth('fecha_insc', $mes->month)
              ->count();
            
            $inscripcionesPorMes[] = [
                'mes' => $nombreMes,
                'inscripciones' => $cantidad,
            ];
        }
        
        // =============================================
        // 3. GRÁFICO: Rendimiento de pasantías finalizadas
        // =============================================
        
        $pasantiasFinalizadas = Pasantia::with(['actividades', 'inscripciones.pasante', 'comentarios'])
            ->where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'FINALIZADO')
            ->get()
            ->map(function($pasantia) {
                $inscritos = $pasantia->inscripciones->count();
                $totalActividades = $pasantia->actividades->count();
                
                // Calcular promedio de notas de todos los pasantes
                $totalNotas = 0;
                $totalEvaluaciones = 0;
                $totalCompletitud = 0;
                
                foreach ($pasantia->inscripciones as $inscripcion) {
                    $evaluacionesPasante = BitacoraEva::where('idU_pasante', $inscripcion->pasante->idU_pasante)
                        ->whereIn('id_actividad', $pasantia->actividades->pluck('id_actividad'))
                        ->whereIn('estado', ['COMPLETADA', 'COMPLETADA PARCIALMENTE', 'NO REALIZADA'])
                        ->get();
                    
                    $notas = $evaluacionesPasante->pluck('nota')->filter();
                    if ($notas->count() > 0) {
                        $totalNotas += $notas->avg();
                        $totalEvaluaciones++;
                    }
                    
                    // Completitud: actividades completadas vs total
                    $completadas = $evaluacionesPasante->whereIn('estado', ['COMPLETADA', 'COMPLETADA PARCIALMENTE'])->count();
                    $totalCompletitud += $totalActividades > 0 ? ($completadas / $totalActividades) * 100 : 0;
                }
                
                $promedioNotas = $totalEvaluaciones > 0 ? round($totalNotas / $totalEvaluaciones, 1) : 0;
                $tasaCompletitud = $inscritos > 0 ? round($totalCompletitud / $inscritos, 1) : 0;
                $calificacionEstrellas = $pasantia->comentarios->avg('calificacion') ?? 0;
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'promedio_notas' => $promedioNotas,
                    'tasa_completitud' => $tasaCompletitud,
                    'calificacion' => round($calificacionEstrellas, 1),
                    'inscritos' => $inscritos,
                ];
            })
            ->sortByDesc('fecha_fin')
            ->take(10)
            ->values();
        
        // =============================================
        // 4. PRÓXIMAS PASANTÍAS
        // =============================================
        
        $proximasPasantias = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->where('estado', 'ABIERTA')
            ->where('fecha_ini', '>=', now())
            ->orderBy('fecha_ini', 'asc')
            ->take(5)
            ->get()
            ->map(function($pasantia) {
                $diasRestantes = now()->diffInDays($pasantia->fecha_ini, false);
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'dias_restantes' => max(0, $diasRestantes),
                    'cupos_disponibles' => $pasantia->cupos - $pasantia->inscripciones->count(),
                ];
            });
        
        return Inertia::render('Gerente/Estadisticas/Index', [
            'kpis' => [
                'total_pasantias' => $totalPasantias,
                'total_pasantes' => $totalPasantes,
                'total_jefes' => $totalJefes,
                'calificacion_promedio' => round($calificacionPromedio, 1),
            ],
            'inscripciones_por_mes' => $inscripcionesPorMes,
            'pasantias_rendimiento' => $pasantiasFinalizadas,
            'proximas_pasantias' => $proximasPasantias,
        ]);
    }
}