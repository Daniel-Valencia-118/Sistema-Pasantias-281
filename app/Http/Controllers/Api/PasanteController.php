<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Mensaje;
use App\Models\Comentario;
use App\Models\InformeFin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PasanteController extends Controller
{
    // Ver todas las pasantías disponibles
    public function listarPasantias(Request $request)
    {
        $query = Pasantia::with('empresa')
            ->where('estado', 'activo')
            ->where('fecha_ini', '>=', now())
            ->where('fecha_fin', '>=', now());
            //->where('cupos_disponibles', '>', 0);
        
        // Filtros
        if ($request->has('mencion') && $request->mencion) {
            $query->where('mencion', 'like', '%' . $request->mencion . '%');
        }
        
        if ($request->has('empresa_id') && $request->empresa_id) {
            $query->where('id_empresa', $request->empresa_id);
        }
        
        if ($request->has('turno') && $request->turno) {
            $query->where('turno', $request->turno);
        }
        
        $pasantias = $query->get();
        
        // Agregar calificaciones promedio de la empresa
        foreach ($pasantias as $pasantia) {
            $pasantia->empresa->calificacion_promedio = Comentario::whereHas('pasantia', function($q) use ($pasantia) {
                $q->where('id_empresa', $pasantia->id_empresa);
            })->avg('calificacion');
        }
        
        return response()->json(['data' => $pasantias]);
    }
 
    // Ver detalles de una pasantía específica
    public function verPasantia($id)
    {
        $pasantia = Pasantia::with(['empresa', 'actividades'])->findOrFail($id);
        
        // Comentarios de la empresa
        $comentarios = Comentario::with('pasante.user')
            ->whereHas('pasantia', function($q) use ($pasantia) {
                $q->where('id_empresa', $pasantia->id_empresa);
            })
            ->get();
        
        return response()->json([
            'data' => [
                'pasantia' => $pasantia,
                'actividades' => $pasantia->actividades,
            ],
            'comentarios' => $comentarios
        ]);
    }

    // =============================================
    // OBTENER ESTADO DE UNA PASANTÍA
    // =============================================
    public function obtenerEstadoPasantia(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);
        
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->first();
        
        if (!$inscripcion) {
            return response()->json(['message' => 'No estás inscrito en esta pasantía'], 404);
        }
        
        $pasantia = Pasantia::find($request->id_pasantia);
        
        return response()->json([
            'data' => [
                'id_pasantia' => $pasantia->id_pasantia,
                'estado_pasantia' => $pasantia->estado,
                'estado_inscripcion' => $inscripcion->estado,
            ]
        ]);
    }    
    // Inscribirse a una pasantía
    public function inscribirse(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
        ]);
        
        $pasantia = Pasantia::findOrFail($request->id_pasantia);
        
        // Verificar condiciones
        if ($pasantia->estado != 'activo') {
            return response()->json(['message' => 'Esta pasantía no está disponible'], 400);
        }
        
        if ($pasantia->cupos_disponibles <= 0) {
            return response()->json(['message' => 'No hay cupos disponibles'], 400);
        }
        
        if ($pasantia->fecha_ini < now()) {
            return response()->json(['message' => 'La pasantía ya ha comenzado'], 400);
        }
        
        if ($pasantia->fecha_fin < now()) {
            return response()->json(['message' => 'La pasantía ya finalizó'], 400);
        }
        
        // Verificar si ya está inscrito
        $yaInscrito = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->exists();
        
        if ($yaInscrito) {
            return response()->json(['message' => 'Ya estás inscrito en esta pasantía'], 400);
        }
        
        try {
            DB::beginTransaction();
            
            $inscripcion = Inscripcion::create([
                'fecha_insc' => now()->toDateString(),
                'hora_insc' => now()->toTimeString(),
                'estado' => 'inscrito',
                'idU_pasante' => $pasante->idU_pasante,
                'id_pasantia' => $request->id_pasantia,
                'idU_jefe' => null,
            ]);
            
            $pasantia->decrement('cupos_disponibles');
            
            DB::commit();
            
            return response()->json(['message' => 'Inscripción exitosa', 'data' => $inscripcion], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
    
    // Ver mis inscripciones
    public function misInscripciones()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        $inscripciones = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->get();
        
        return response()->json(['data' => $inscripciones]);
    }
    
    // Ver mi bitácora 
    public function verBitacora(Request $request, $idActividad = null)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return response()->json(['message' => 'No eres un estudiante pasante'], 403);
        }
        
        // Si se especifica una actividad, ver solo esa
        if ($idActividad) {
            $bitacora = BitacoraEva::with(['actividad.pasantia.empresa'])
                ->where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $idActividad)
                ->first();
            
            if (!$bitacora) {
                return response()->json(['message' => 'No hay evaluación para esta actividad'], 404);
            }
            
            return response()->json(['data' => $bitacora]);
        }
        
        // Si no, ver toda la bitácora agrupada por actividad
        $bitacora = BitacoraEva::with(['actividad.pasantia.empresa'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->get()
            ->groupBy('id_actividad')
            ->map(function($items, $actividadId) {
                $actividad = $items->first()->actividad;
                $subActividades = $items->map(function($item) {
                    return [
                        'id_bitacora' => $item->id_bitacora,
                        'descripcion' => $item->descripcion,
                        'nota' => $item->nota,
                        'observacion' => $item->observacion,
                        'recomendacion' => $item->recomendacion,
                        'fecha' => $item->fecha,
                        'hora' => $item->hora,
                    ];
                });
                
                $promedioActividad = $items->avg('nota');
                
                return [
                    'actividad' => [
                        'id' => $actividad->id_actividad,
                        'nombre' => $actividad->nombre_act,
                        'descripcion' => $actividad->descripcion,
                        'pasantia' => $actividad->pasantia->nombre_pas,
                        'empresa' => $actividad->pasantia->empresa->nombre,
                    ],
                    'promedio_actividad' => round($promedioActividad, 2),
                    'subactividades' => $subActividades
                ];
            });
        
        return response()->json(['data' => $bitacora]);
    }

    // =============================================
    // VER BITÁCORA POR ACTIVIDAD (con estado)
    // =============================================
    public function verBitacoraPorActividad($idActividad)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $subactividades = BitacoraEva::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_actividad', $idActividad)
            ->get();
        
        $actividad = Actividad::findOrFail($idActividad);
        
        $subactividadesFormateadas = $subactividades->map(function($sub) {
            if ($sub->estado == 'realizada') {
                return [
                    'id_bitacora' => $sub->id_bitacora,
                    'descripcion' => $sub->descripcion,
                    'nota' => $sub->nota,
                    'observacion' => $sub->observacion,
                    'recomendacion' => $sub->recomendacion,
                    'estado' => $sub->estado,
                    'fecha' => $sub->fecha,
                ];
            } else {
                return [
                    'id_bitacora' => $sub->id_bitacora,
                    'descripcion' => $sub->descripcion,
                    'estado' => $sub->estado,
                    'mensaje' => 'Aún no ha sido evaluada'
                ];
            }
        });
        
        return response()->json([
            'data' => [
                'actividad' => [
                    'id' => $actividad->id_actividad,
                    'nombre' => $actividad->nombre_act,
                    'descripcion' => $actividad->descripcion,
                ],
                'subactividades' => $subactividadesFormateadas,
                'promedio_actividad' => $subactividades->where('estado', 'realizada')->avg('nota'),
            ]
        ]);
    }

    // Calificar pasantía (al finalizar la pasantia)
    public function calificarPasantia(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $request->validate([
            'id_pasantia' => 'required|exists:pasantia,id_pasantia',
            'calificacion' => 'required|integer|min:1|max:5',
            'comentario' => 'required|string',
        ]);
        
        // Verificar que el pasante estuvo inscrito en esta pasantía
        $inscripcion = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->where('estado', 'finalizado')
            ->first();
        
        if (!$inscripcion) {
            return response()->json(['message' => 'No puedes calificar esta pasantía'], 403);
        }
        
        // Verificar que no haya calificado ya
        $yaCalifico = Comentario::where('idU_pasante', $pasante->idU_pasante)
            ->where('id_pasantia', $request->id_pasantia)
            ->exists();
        
        if ($yaCalifico) {
            return response()->json(['message' => 'Ya calificaste esta pasantía'], 400);
        }
        
        $comentario = Comentario::create([
            'descripcion' => $request->comentario,
            'calificacion' => $request->calificacion,
            'fecha' => now()->toDateString(),
            'idU_pasante' => $pasante->idU_pasante,
            'id_pasantia' => $request->id_pasantia,
        ]);
        
        // Actualizar promedio de la empresa
        $pasantia = Pasantia::find($request->id_pasantia);
        $promedio = Comentario::whereHas('pasantia', function($q) use ($pasantia) {
            $q->where('id_empresa', $pasantia->id_empresa);
        })->avg('calificacion');
        
        $pasantia->empresa->update(['calificacion_promedio' => $promedio]);
        
        return response()->json(['message' => 'Calificación enviada', 'data' => $comentario]);
    }
    
    // =============================================
    // VER INFORME FINAL (solo si resultado no es null)
    // =============================================
    public function verInformeFinal($idInscripcion)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $inscripcion = Inscripcion::with(['pasantia.empresa', 'pasantia.actividades', 'jefe.user', 'pasante.tutor.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->findOrFail($idInscripcion);
        
        $informe = InformeFin::where('id_inscripcion', $idInscripcion)->first();
        
        if (!$informe) {
            return response()->json(['message' => 'Informe no generado aún'], 404);
        }
        
        if ($informe->resultado === null) {
            return response()->json(['message' => 'Informe aún no disponible. Esperando resultado del tutor.'], 403);
        }
        
        // Obtener todas las subactividades por actividad
        $actividadesConSubactividades = [];
        foreach ($inscripcion->pasantia->actividades as $actividad) {
            $subactividades = BitacoraEva::where('idU_pasante', $pasante->idU_pasante)
                ->where('id_actividad', $actividad->id_actividad)
                ->get();
            
            $actividadesConSubactividades[] = [
                'actividad' => [
                    'id' => $actividad->id_actividad,
                    'nombre' => $actividad->nombre_act,
                    'descripcion' => $actividad->descripcion,
                ],
                'subactividades' => $subactividades->map(function($sub) {
                    return [
                        'descripcion' => $sub->descripcion,
                        'nota' => $sub->nota,
                        'estado' => $sub->estado,
                    ];
                }),
                'promedio_actividad' => round($subactividades->avg('nota'), 2),
            ];
        }
        
        return response()->json([
            'data' => [
                'pasante' => [
                    'nombre' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno,
                    'ci' => $pasante->user->ci,
                    'matricula' => $pasante->matricula,
                    'ru' => $pasante->ru,
                ],
                'pasantia' => [
                    'nombre' => $inscripcion->pasantia->nombre_pas,
                    'empresa' => $inscripcion->pasantia->empresa->nombre,
                    'fecha_ini' => $inscripcion->pasantia->fecha_ini,
                    'fecha_fin' => $inscripcion->pasantia->fecha_fin,
                ],
                'jefe' => $inscripcion->jefe ? [
                    'nombre' => $inscripcion->jefe->user->nombre . ' ' . $inscripcion->jefe->user->ap_paterno,
                    'cargo' => $inscripcion->jefe->cargo,
                ] : null,
                'tutor' => $inscripcion->pasante->tutor ? [
                    'nombre' => $inscripcion->pasante->tutor->user->nombre . ' ' . $inscripcion->pasante->tutor->user->ap_paterno,
                    'especialidad' => $inscripcion->pasante->tutor->especialidad,
                ] : null,
                'actividades' => $actividadesConSubactividades,
                'promedio_final' => $informe->promedio,
                'resultado' => $informe->resultado,
                'fecha_informe' => $informe->fecha,
            ]
        ]);
    }
    // =============================================
    // VER MENSAJES DEL JEFE
    // =============================================
    public function verMensajesJefe($idJefe)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $mensajes = Mensaje::where('idU_pasante', $pasante->idU_pasante)
            ->where('idU_jefe', $idJefe)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();
        
        return response()->json(['data' => $mensajes]);
    }


    //NUEVOOOO:

    // =============================================
    // BÚSQUEDA GLOBAL (para barra de búsqueda principal)
    // =============================================
    public function busquedaGlobal(Request $request)
    {
        $term = $request->get('q', '');
        
        if (strlen($term) < 2) {
            return response()->json([
                'message' => 'Ingrese al menos 2 caracteres para buscar',
                'data' => []
            ]);
        }
        
        // 1. Buscar pasantías
        $pasantias = Pasantia::with('empresa')
            ->where('estado', 'activo')
            ->where(function($query) use ($term) {
                $query->where('nombre_pas', 'LIKE', "%{$term}%")
                    ->orWhere('mencion', 'LIKE', "%{$term}%")
                    ->orWhereHas('empresa', function($q) use ($term) {
                        $q->where('nombre', 'LIKE', "%{$term}%");
                    });
            })
            ->take(5)
            ->get()
            ->map(function($pasantia) {
                return [
                    'type' => 'pasantia',
                    'id' => $pasantia->id_pasantia,
                    'title' => $pasantia->nombre_pas,
                    'subtitle' => $pasantia->empresa->nombre,
                    'description' => "{$pasantia->mencion} - {$pasantia->cupos_disponibles} cupos",
                    'url' => "/pasantias/{$pasantia->id_pasantia}",
                ];
            });
        
        // 2. Buscar empresas
        $empresas = Empresa::with('gerente.user')
            ->where('nombre', 'LIKE', "%{$term}%")
            ->orWhere('nit', 'LIKE', "%{$term}%")
            ->take(5)
            ->get()
            ->map(function($empresa) {
                return [
                    'type' => 'empresa',
                    'id' => $empresa->id_empresa,
                    'title' => $empresa->nombre,
                    'subtitle' => "NIT: {$empresa->nit}",
                    'description' => $empresa->direccion,
                    'url' => "/empresas/{$empresa->id_empresa}",
                ];
            });
        
        // 3. Si el usuario está autenticado, buscar también sus inscripciones
        $inscripciones = collect();
        if (auth()->check() && auth()->user()->pasante) {
            $inscripciones = Inscripcion::with(['pasantia.empresa'])
                ->where('idU_pasante', auth()->user()->pasante->idU_pasante)
                ->whereHas('pasantia', function($q) use ($term) {
                    $q->where('nombre_pas', 'LIKE', "%{$term}%");
                })
                ->take(3)
                ->get()
                ->map(function($inscripcion) {
                    return [
                        'type' => 'mi_inscripcion',
                        'id' => $inscripcion->id_inscripcion,
                        'title' => $inscripcion->pasantia->nombre_pas,
                        'subtitle' => $inscripcion->pasantia->empresa->nombre,
                        'description' => "Estado: {$inscripcion->estado}",
                        'url' => "/mis-inscripciones/{$inscripcion->id_inscripcion}",
                    ];
                });
        }
        
        // Combinar resultados
        $results = $pasantias->merge($empresas)->merge($inscripciones);
        
        return response()->json([
            'query' => $term,
            'total' => $results->count(),
            'data' => $results,
        ]);
    }

    // =============================================
    // OBTENER LISTA DE MENCIONES (para el frontend)
    // =============================================
    public function getMenciones()
    {
        $menciones = Pasantia::where('estado', 'activo')
            ->distinct()
            ->pluck('mencion')
            ->filter()
            ->values();
        
        return response()->json(['data' => $menciones]);
    }

    // =============================================
    // OBTENER LISTA DE EMPRESAS ACTIVAS (para el frontend)
    // =============================================
    public function getEmpresas()
    {
        $empresas = Empresa::whereHas('pasantias', function($q) {
            $q->where('estado', 'activo')
            ->where('fecha_ini', '<=', now())
            ->where('fecha_fin', '>=', now());
        })->get(['id_empresa', 'nombre']);
        
        return response()->json(['data' => $empresas]);
    }
}