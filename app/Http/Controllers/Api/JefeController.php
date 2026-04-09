<?php
// app/Http/Controllers/Api/JefeController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Mensaje;
use App\Models\InformeFin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class JefeController extends Controller
{
    // Ver mis pasantes asignados
    public function misPasantes()
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $pasantes = Inscripcion::with(['pasante.user', 'pasantia'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->get();
        
        return response()->json(['data' => $pasantes]);
    }
    
    // Ver bitácora de un pasante específico
    public function verBitacoraPasante($idPasante)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        // Verificar que el pasante está asignado a este jefe
        $inscripcion = Inscripcion::where('idU_pasante', $idPasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        $bitacora = BitacoraEva::with(['actividad'])
            ->where('idU_pasante', $idPasante)
            ->get();
        
        return response()->json(['data' => $bitacora]);
    }
    
    // Evaluar actividad (crear o actualizar bitácora)
    public function evaluarActividad(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'id_actividad' => 'required|exists:actividad,id_actividad',
            'nota' => 'required|integer|min:0|max:100',
            'observacion' => 'nullable|string',
            'recomendacion' => 'nullable|string',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        $bitacora = BitacoraEva::updateOrCreate(
            [
                'idU_pasante' => $request->idU_pasante,
                'id_actividad' => $request->id_actividad,
            ],
            [
                'descripcion' => 'Evaluación de actividad',
                'nota' => $request->nota,
                'observacion' => $request->observacion,
                'recomendacion' => $request->recomendacion,
                'idU_jefe' => $jefe->idU_jefe,
                'estado' => 'realizada',
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
            ]
        );
        
        return response()->json(['message' => 'Evaluación guardada', 'data' => $bitacora]);
    }
    
    // Enviar mensaje a pasante
    public function enviarMensaje(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'mensaje' => 'required|string',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        $mensaje = Mensaje::create([
            'descripcion' => $request->mensaje,
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
            'idU_pasante' => $request->idU_pasante,
            'idU_jefe' => $jefe->idU_jefe,
        ]);
        
        return response()->json(['message' => 'Mensaje enviado', 'data' => $mensaje]);
    }
    
    // Generar informe final de un pasante
    public function generarInformeFinal(Request $request)
    {
        $user = Auth::user();
        $jefe = $user->jefePas;
        
        $request->validate([
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
        ]);
        
        // Verificar que el pasante está asignado a este jefe
        $inscripcion = Inscripcion::where('idU_pasante', $request->idU_pasante)
            ->where('idU_jefe', $jefe->idU_jefe)
            ->firstOrFail();
        
        // Calcular promedio de notas
        $promedio = BitacoraEva::where('idU_pasante', $request->idU_pasante)
            ->whereNotNull('nota')
            ->avg('nota');
        
        $resultado = $promedio >= 60 ? 'aprobado' : 'reprobado';
        
        $informe = InformeFin::updateOrCreate(
            ['id_inscripcion' => $inscripcion->id_inscripcion],
            [
                'promedio' => $promedio,
                'resultado' => $resultado,
                'fecha' => now()->toDateString(),
                'idU_jefe' => $jefe->idU_jefe,
            ]
        );
        
        // Actualizar estado de inscripción
        $inscripcion->update(['estado' => 'finalizado']);
        
        return response()->json(['message' => 'Informe final generado', 'data' => $informe]);
    }
}