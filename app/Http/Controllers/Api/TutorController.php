<?php
// app/Http/Controllers/Api/TutorController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pasante;
use App\Models\BitacoraEva;
use App\Models\InformeFin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TutorController extends Controller
{
    // Ver mis pasantes asignados
    public function misPasantes()
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $pasantes = Pasante::with('user')
            ->where('idU_tutor', $tutor->idU_tutor)
            ->get();
        
        return response()->json(['data' => $pasantes]);
    }
    
    // Ver bitácora de un pasante (solo lectura)
    public function verBitacoraPasante($idPasante)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        // Verificar que el pasante está asignado a este tutor
        $pasante = Pasante::where('idU_pasante', $idPasante)
            ->where('idU_tutor', $tutor->idU_tutor)
            ->firstOrFail();
        
        $bitacora = BitacoraEva::with(['actividad', 'jefe.user'])
            ->where('idU_pasante', $idPasante)
            ->get();
        
        return response()->json(['data' => $bitacora]);
    }
    
    // Ver informe final de un pasante
    public function verInformeFinal($idPasante)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $pasante = Pasante::where('idU_pasante', $idPasante)
            ->where('idU_tutor', $tutor->idU_tutor)
            ->firstOrFail();
        
        $informe = InformeFin::whereHas('inscripcion', function($q) use ($idPasante) {
            $q->where('idU_pasante', $idPasante);
        })->first();
        
        return response()->json(['data' => $informe]);
    }
    
    // Generar informe final (el tutor también puede hacerlo)
    public function generarInformeFinal(Request $request)
    {
        $user = Auth::user();
        $tutor = $user->tutorAca;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
        ]);
        
        $pasante = Pasante::where('idU_pasante', $request->idU_pasante)
            ->where('idU_tutor', $tutor->idU_tutor)
            ->firstOrFail();
        
        $promedio = BitacoraEva::where('idU_pasante', $request->idU_pasante)
            ->whereNotNull('nota')
            ->avg('nota');
        
        $resultado = $promedio >= 60 ? 'aprobado' : 'reprobado';
        
        $informe = InformeFin::updateOrCreate(
            ['id_inscripcion' => $this->getInscripcionId($request->idU_pasante)],
            [
                'promedio' => $promedio,
                'resultado' => $resultado,
                'fecha' => now()->toDateString(),
                'idU_jefe' => null,
            ]
        );
        
        return response()->json(['message' => 'Informe final generado', 'data' => $informe]);
    }
    
    private function getInscripcionId($idPasante)
    {
        $inscripcion = \App\Models\Inscripcion::where('idU_pasante', $idPasante)
            ->where('estado', 'activo')
            ->first();
        
        return $inscripcion ? $inscripcion->id_inscripcion : null;
    }
}