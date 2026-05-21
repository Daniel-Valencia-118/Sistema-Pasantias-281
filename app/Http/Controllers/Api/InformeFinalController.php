<?php
// app/Http/Controllers/Api/InformeFinalController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\InformeFin;
use App\Models\BitacoraEva;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\Pasante;
use App\Models\JefePas;
use App\Models\User;


class InformeFinalController extends Controller
{
    public function index()
    {
        // Se asume la existencia de relaciones hacia el usuario final en inscripcion y jefe
        $informes = InformeFin::with([
            'inscripcion.pasante.user', 
            'jefe.user'
        ])->get();

        return Inertia::render('Admin/Monitoreo/InformesFinales', [
            'informes' => $informes
        ]);
    }

    public function update(Request $request, $id_informe)
    {
        $informe = InformeFin::findOrFail($id_informe);

        $validated = $request->validate([
            'nota_final' => ['required', 'numeric', 'min:0', 'max:100'],
            'promedio'   => ['required', 'numeric', 'min:0', 'max:100'],
            'resultado'  => ['required', 'string', 'max:50'],
        ]);

        $informe->update($validated);

        return back()->with('success', 'Informe final modificado con éxito.');
    }

    public function destroy($id_informe)
    {
        $informe = InformeFin::findOrFail($id_informe);
        $informe->delete();

        return back()->with('success', 'Informe eliminado permanentemente.');
    }
    // GET /api/informe-final/{idInscripcion}
    // Puede verlo: GERENTE, JEFE, TUTOR (sin necesidad de resultado)
    public function verInformeFinal($idInscripcion)
    {
        $user = Auth::user();
        
        $inscripcion = Inscripcion::with(['pasante.user', 'pasantia.empresa', 'pasantia.actividades', 'jefe.user', 'pasante.tutor.user'])
            ->findOrFail($idInscripcion);
        
        // Verificar permisos según rol
        $hasAccess = false;
        
        if ($user->gerente) {
            // Gerente: verificar que la pasantía es de su empresa
            $empresa = $user->gerente->empresa;
            $hasAccess = $inscripcion->pasantia->id_empresa == $empresa->id_empresa;
        } elseif ($user->jefePas) {
            // Jefe: verificar que el pasante está asignado a él
            $hasAccess = $inscripcion->idU_jefe == $user->jefePas->idU_jefe;
        } elseif ($user->tutorAca) {
            // Tutor: verificar que el pasante está asignado a él
            $hasAccess = $inscripcion->pasante->idU_tutor == $user->tutorAca->idU_tutor;
        } else {
            $hasAccess = false;
        }
        
        if (!$hasAccess) {
            return response()->json(['message' => 'No autorizado'], 403);
        }
        
        $informe = InformeFin::where('id_inscripcion', $idInscripcion)->first();
        
        if (!$informe) {
            return response()->json(['message' => 'Informe no generado aún'], 404);
        }
        
        // Obtener subactividades por actividad
        $actividadesConSubactividades = [];
        foreach ($inscripcion->pasantia->actividades as $actividad) {
            $subactividades = BitacoraEva::where('idU_pasante', $inscripcion->idU_pasante)
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
                        'observacion' => $sub->observacion,
                    ];
                }),
                'promedio_actividad' => round($subactividades->avg('nota'), 2),
            ];
        }
        
        return response()->json([
            'data' => [
                'pasante' => [
                    'nombre' => $inscripcion->pasante->user->nombre . ' ' . $inscripcion->pasante->user->ap_paterno,
                    'ci' => $inscripcion->pasante->user->ci,
                    'matricula' => $inscripcion->pasante->matricula,
                    'ru' => $inscripcion->pasante->ru,
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
}