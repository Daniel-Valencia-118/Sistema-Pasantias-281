<?php
// app/Http/Controllers/Pasante/InscripcionController.php

namespace App\Http\Controllers\Pasante;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\Actividad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InscripcionController extends Controller
{
    // Vista de pasantías disponibles para inscribirse
    public function index()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Obtener todas las pasantías ABIERTAS
        $pasantias = Pasantia::with(['empresa.gerente.user', 'actividades'])
            ->where('estado', 'ABIERTA')
            ->get()
            ->map(function($pasantia) use ($pasante) {
                // Calcular cupos disponibles reales
                $inscritosActivos = $pasantia->inscripciones()
                    ->whereIn('estado', ['inscrito', 'activo'])
                    ->count();
                $cuposDisponibles = max(0, $pasantia->cupos - $inscritosActivos);
                
                // Verificar si el pasante ya está inscrito
                $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                    ->where('id_pasantia', $pasantia->id_pasantia)
                    ->exists();
                
                // Verificar si la mención coincide
                $mencionCoincide = ($pasante->mencion === $pasantia->mencion);
                
                // Obtener actividades ordenadas
                $actividades = $pasantia->actividades
                    ->sortBy([
                        ['fecha_ini', 'asc'],
                        ['fecha_fin', 'asc']
                    ])
                    ->values()
                    ->map(function($actividad) {
                        return [
                            'id' => $actividad->id_actividad,
                            'nombre_act' => $actividad->nombre_act,
                            'tipo' => $actividad->tipo,
                            'descripcion' => $actividad->descripcion,
                            'fecha_ini' => $actividad->fecha_ini,
                            'fecha_fin' => $actividad->fecha_fin,
                        ];
                    });
                
                // Nombre del gerente
                $gerenteNombre = '';
                if ($pasantia->empresa && $pasantia->empresa->gerente && $pasantia->empresa->gerente->user) {
                    $gerente = $pasantia->empresa->gerente->user;
                    $gerenteNombre = $gerente->nombre . ' ' . $gerente->ap_paterno . ' ' . ($gerente->ap_materno ?? '');
                }
                
                return [
                    'id' => $pasantia->id_pasantia,
                    'nombre' => $pasantia->nombre_pas,
                    'mencion' => $pasantia->mencion,
                    'turno' => $pasantia->turno,
                    'carga_horaria' => $pasantia->carga_horaria,
                    'fecha_ini' => $pasantia->fecha_ini,
                    'fecha_fin' => $pasantia->fecha_fin,
                    'cupos_disponibles' => $cuposDisponibles,
                    'ya_inscrito' => $yaInscrito,
                    'mencion_coincide' => $mencionCoincide,
                    'actividades' => $actividades,
                    'empresa' => [
                        'id' => $pasantia->empresa->id_empresa,
                        'nombre' => $pasantia->empresa->nombre,
                        'nit' => $pasantia->empresa->nit,
                        'direccion' => $pasantia->empresa->direccion,
                        'telefono' => $pasantia->empresa->telefono,
                        'email' => $pasantia->empresa->email,
                        'gerente_nombre' => $gerenteNombre,
                    ],
                ];
            });
        
        // Obtener menciones existentes
        $mencionesExistentes = Pasantia::where('estado', 'ABIERTA')
            ->distinct()
            ->pluck('mencion')
            ->filter()
            ->values()
            ->toArray();
        
        // Mención por defecto: la del pasante si existe, sino 'Todos'
        $mencionPorDefecto = in_array($pasante->mencion, $mencionesExistentes) 
            ? $pasante->mencion 
            : 'Todos';
        
        return Inertia::render('Pasante/Inscribirse', [
            'pasantias' => $pasantias,
            'menciones' => $mencionesExistentes,
            'mencionPorDefecto' => $mencionPorDefecto,
            'mencionPasante' => $pasante->mencion,
        ]);
    }
    
    // Acción de inscribirse a una pasantía
    public function store($idPasantia)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        DB::beginTransaction();
        
        try {
            // 1. Obtener la pasantía
            $pasantia = Pasantia::with(['empresa'])
                ->where('estado', 'ABIERTA')
                ->findOrFail($idPasantia);
            
            // 2. Verificar cupos disponibles
            $inscritosActivos = $pasantia->inscripciones()
                ->whereIn('estado', ['inscrito', 'activo'])
                ->count();
            $cuposDisponibles = $pasantia->cupos - $inscritosActivos;
            
            if ($cuposDisponibles <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay cupos disponibles en esta pasantía.'
                ], 400);
            }
            
            // 3. Verificar que no esté ya inscrito
            $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_pasantia', $idPasantia)
                ->exists();
            
            if ($yaInscrito) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya estás inscrito en esta pasantía.'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 3: La mención debe coincidir
            // =============================================
            if ($pasante->mencion !== $pasantia->mencion) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a esta pasantía porque tu mención (' . $pasante->mencion . ') no coincide con la mención de la pasantía (' . $pasantia->mencion . ').'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 1: Máximo 2 pasantías activas
            // =============================================
            $pasantiasActivas = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->whereIn('estado', ['inscrito', 'iniciado'])
                ->count();
            
            if ($pasantiasActivas >= 2) {
                return response()->json([
                    'success' => false,
                    'message' => 'No puedes inscribirte a más pasantías. Tienes ' . $pasantiasActivas . ' pasantía(s) activa(s). El máximo es 2.'
                ], 400);
            }
            
            // =============================================
            // RESTRICCIÓN 2: No tener otra pasantía activa de la misma empresa
            // =============================================
            $pasantiaMismaEmpresaActiva = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
                ->whereIn('estado', ['inscrito', 'iniciado'])
                ->whereHas('pasantia', function($query) use ($pasantia) {
                    $query->where('id_empresa', $pasantia->id_empresa);
                })
                ->exists();
            
            if ($pasantiaMismaEmpresaActiva) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ya tienes una pasantía activa de esta empresa. Debes finalizarla primero para inscribirte a otra.'
                ], 400);
            }
            
            // 4. Crear la inscripción
            $inscripcion = Inscripcion::create([
                'fecha_insc' => now()->format('Y-m-d'),
                'hora_insc' => now()->format('H:i:s'),
                'estado' => 'inscrito',
                'idU_pasante' => $pasante->idU_pasante,
                'id_pasantia' => $idPasantia,
                'idU_jefe' => null,
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => '¡Te has inscrito correctamente a la pasantía!',
                'inscripcion' => $inscripcion
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al inscribirse: ' . $e->getMessage()
            ], 500);
        }
    }
}