<?php
// app/Http/Controllers/Pasante/MensajeController.php

namespace App\Http\Controllers\Pasante;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\MensajePas;
use App\Models\Inscripcion;
use App\Models\User;
use App\Models\JefePas;
use App\Models\Pasante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MensajeController extends Controller
{
    /**
     * Muestra la lista de conversaciones y el chat
     */
    public function index()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        // Obtener todas las inscripciones activas (INICIADO) del pasante
        $inscripcionesActivas = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->where('estado', 'iniciado')
            ->get();
        
        // Colección para almacenar contactos únicos
        $contactos = collect();
        
        // 1. Agregar jefes de las pasantías activas
        foreach ($inscripcionesActivas as $inscripcion) {
            if ($inscripcion->jefe && $inscripcion->jefe->user) {
                $jefe = $inscripcion->jefe;
                $contactoId = 'jefe_' . $jefe->idU_jefe;
                
                // Evitar duplicados
                if (!$contactos->has($contactoId)) {
                    // Obtener último mensaje
                    $ultimoMensaje = Mensaje::where('idU_pasante', $pasante->idU_pasante)
                        ->where('idU_jefe', $jefe->idU_jefe)
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->first();
                    
                    $enviadoPorMi = $ultimoMensaje ? $ultimoMensaje->idU_pasante === $pasante->idU_pasante : null;
                    
                    $contactos->put($contactoId, [
                        'tipo' => 'jefe',
                        'id_contacto' => $jefe->idU_jefe,
                        'nombre' => $jefe->user->nombre,
                        'ap_paterno' => $jefe->user->ap_paterno,
                        'ap_materno' => $jefe->user->ap_materno ?? '',
                        'nombre_user' => $jefe->user->nombre_user,
                        'empresa_nombre' => $inscripcion->pasantia->empresa->nombre,
                        'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
                        'ultimo_mensaje' => $ultimoMensaje ? $ultimoMensaje->descripcion : null,
                        'ultimo_mensaje_fecha' => $ultimoMensaje ? $ultimoMensaje->fecha : null,
                        'ultimo_mensaje_hora' => $ultimoMensaje ? $ultimoMensaje->hora : null,
                        'ultimo_mensaje_enviado_por_mi' => $enviadoPorMi,
                        'finalizada' => false,
                    ]);
                }
            }
        }
        
        // 2. Agregar compañeros pasantes de las pasantías activas
        foreach ($inscripcionesActivas as $inscripcion) {
            // Obtener otros pasantes inscritos en la misma pasantía
            $otrosPasantes = Inscripcion::with('pasante.user')
                ->where('id_pasantia', $inscripcion->id_pasantia)
                ->where('idU_pasante', '!=', $pasante->idU_pasante)
                ->where('estado', 'iniciado')
                ->get();
            
            foreach ($otrosPasantes as $otro) {
                $companero = $otro->pasante;
                $contactoId = 'pasante_' . $companero->idU_pasante;
                
                if (!$contactos->has($contactoId)) {
                    // Obtener último mensaje (de ambas direcciones)
                    $ultimoMensaje = MensajePas::where(function($q) use ($pasante, $companero) {
                        $q->where('idU_pasanteA', $pasante->idU_pasante)
                        ->where('idU_pasanteB', $companero->idU_pasante);
                    })->orWhere(function($q) use ($pasante, $companero) {
                        $q->where('idU_pasanteA', $companero->idU_pasante)
                        ->where('idU_pasanteB', $pasante->idU_pasante);
                    })->orderBy('fecha', 'desc')
                    ->orderBy('hora', 'desc')
                    ->first();
                    
                    $enviadoPorMi = $ultimoMensaje ? $ultimoMensaje->idU_pasanteA === $pasante->idU_pasante : null;
                    
                    $contactos->put($contactoId, [
                        'tipo' => 'pasante',
                        'id_contacto' => $companero->idU_pasante,
                        'nombre' => $companero->user->nombre,
                        'ap_paterno' => $companero->user->ap_paterno,
                        'ap_materno' => $companero->user->ap_materno ?? '',
                        'nombre_user' => $companero->user->nombre_user,
                        'empresa_nombre' => $inscripcion->pasantia->empresa->nombre,
                        'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
                        'ultimo_mensaje' => $ultimoMensaje ? $ultimoMensaje->descripcion : null,
                        'ultimo_mensaje_fecha' => $ultimoMensaje ? $ultimoMensaje->fecha : null,
                        'ultimo_mensaje_hora' => $ultimoMensaje ? $ultimoMensaje->hora : null,
                        'ultimo_mensaje_enviado_por_mi' => $enviadoPorMi,
                        'finalizada' => false,
                    ]);
                }
            }
        }
        
        // 3. Agregar pasantías finalizadas (para mostrar historial)
        $inscripcionesFinalizadas = Inscripcion::with(['pasantia.empresa', 'jefe.user'])
            ->where('idU_pasante', $pasante->idU_pasante)
            ->where('estado', 'finalizado')
            ->get();
        
        $contactosFinalizados = collect();
        
        foreach ($inscripcionesFinalizadas as $inscripcion) {
            if ($inscripcion->jefe && $inscripcion->jefe->user) {
                $jefe = $inscripcion->jefe;
                $contactoId = 'jefe_fin_' . $jefe->idU_jefe;
                
                // Solo agregar si no existe ya en contactos activos
                if (!$contactosFinalizados->has($contactoId) && !$contactos->has('jefe_' . $jefe->idU_jefe)) {
                    $ultimoMensaje = Mensaje::where('idU_pasante', $pasante->idU_pasante)
                        ->where('idU_jefe', $jefe->idU_jefe)
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->first();
                    
                    $enviadoPorMi = $ultimoMensaje ? $ultimoMensaje->idU_pasante === $pasante->idU_pasante : null;
                    
                    $contactosFinalizados->put($contactoId, [
                        'tipo' => 'jefe',
                        'id_contacto' => $jefe->idU_jefe,
                        'nombre' => $jefe->user->nombre,
                        'ap_paterno' => $jefe->user->ap_paterno,
                        'ap_materno' => $jefe->user->ap_materno ?? '',
                        'nombre_user' => $jefe->user->nombre_user,
                        'empresa_nombre' => $inscripcion->pasantia->empresa->nombre,
                        'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
                        'ultimo_mensaje' => $ultimoMensaje ? $ultimoMensaje->descripcion : null,
                        'ultimo_mensaje_fecha' => $ultimoMensaje ? $ultimoMensaje->fecha : null,
                        'ultimo_mensaje_hora' => $ultimoMensaje ? $ultimoMensaje->hora : null,
                        'ultimo_mensaje_enviado_por_mi' => $enviadoPorMi,
                        'finalizada' => true,
                    ]);
                }
            }
        }
        
        // 4. Unir contactos activos y finalizados
        $contactos = $contactos->merge($contactosFinalizados);
        
        // 5. Ordenar por último mensaje (más reciente primero)
        $contactos = $contactos->sortByDesc(function ($contacto) {
            if ($contacto['ultimo_mensaje_fecha'] && $contacto['ultimo_mensaje_hora']) {
                $hora = $contacto['ultimo_mensaje_hora'];
                if (strlen($hora) === 5) {
                    $hora = $hora . ':00';
                }
                return $contacto['ultimo_mensaje_fecha'] . ' ' . $hora;
            }
            return '0000-00-00 00:00:00';
        })->values();
        
        // 6. Filtrar contactos inválidos (solo los que no tengan datos básicos)
        // IMPORTANTE: NO filtramos por mensaje, solo por datos básicos
        $contactos = $contactos->filter(function ($contacto) {
            return !empty($contacto['ap_paterno']) && !empty($contacto['nombre']) && !empty($contacto['tipo']);
        })->values();
        
        return Inertia::render('Pasante/Mensajes/Index', [
            'contactos' => $contactos,
        ]);
    }
        
    /**
     * Obtener historial de mensajes con un contacto
     */
    public function getMensajes($tipo, $idContacto)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $mensajes = [];
        
        if ($tipo === 'jefe') {
            // Obtener mensajes con el jefe
            $mensajes = Mensaje::where(function($q) use ($pasante, $idContacto) {
                    $q->where('idU_pasante', $pasante->idU_pasante)
                      ->where('idU_jefe', $idContacto);
                })->orWhere(function($q) use ($pasante, $idContacto) {
                    $q->where('idU_pasante', $idContacto)
                      ->where('idU_jefe', $pasante->idU_pasante);
                })->orderBy('fecha', 'asc')
                  ->orderBy('hora', 'asc')
                  ->get()
                  ->map(function($msg) use ($pasante) {
                      return [
                          'id' => $msg->id_mensaje,
                          'descripcion' => $msg->descripcion,
                          'fecha' => $msg->fecha,
                          'hora' => $msg->hora,
                          'es_mio' => $msg->idU_pasante === $pasante->idU_pasante,
                      ];
                  });
                  
            // Obtener información del jefe
            $jefe = JefePas::with('user')->find($idContacto);
            $contactoInfo = [
                'nombre' => $jefe->user->nombre,
                'ap_paterno' => $jefe->user->ap_paterno,
                'ap_materno' => $jefe->user->ap_materno ?? '',
                'nombre_user' => $jefe->user->nombre_user,
                'tipo' => 'jefe',
            ];
        } else {
            // Obtener mensajes con otro pasante
            $mensajes = MensajePas::where(function($q) use ($pasante, $idContacto) {
                    $q->where('idU_pasanteA', $pasante->idU_pasante)
                      ->where('idU_pasanteB', $idContacto);
                })->orWhere(function($q) use ($pasante, $idContacto) {
                    $q->where('idU_pasanteA', $idContacto)
                      ->where('idU_pasanteB', $pasante->idU_pasante);
                })->orderBy('fecha', 'asc')
                  ->orderBy('hora', 'asc')
                  ->get()
                  ->map(function($msg) use ($pasante) {
                      return [
                          'id' => $msg->id_mensajepas,
                          'descripcion' => $msg->descripcion,
                          'fecha' => $msg->fecha,
                          'hora' => $msg->hora,
                          'es_mio' => $msg->idU_pasanteA === $pasante->idU_pasante,
                      ];
                  });
                  
            // Obtener información del otro pasante
            $otroPasante = Pasante::with('user')->find($idContacto);
            $contactoInfo = [
                'nombre' => $otroPasante->user->nombre,
                'ap_paterno' => $otroPasante->user->ap_paterno,
                'ap_materno' => $otroPasante->user->ap_materno ?? '',
                'nombre_user' => $otroPasante->user->nombre_user,
                'tipo' => 'pasante',
            ];
        }
        
        return response()->json([
            'mensajes' => $mensajes,
            'contacto' => $contactoInfo,
        ]);
    }
    
    /**
     * Enviar un mensaje
     */
    public function enviarMensaje(Request $request)
    {
        $request->validate([
            'tipo' => 'required|in:jefe,pasante',
            'id_contacto' => 'required|integer',
            'mensaje' => 'required|string|max:1000',
        ]);
        
        $user = Auth::user();
        $pasante = $user->pasante;
        
        try {
            if ($request->tipo === 'jefe') {
                $mensaje = Mensaje::create([
                    'descripcion' => $request->mensaje,
                    'fecha' => now()->toDateString(),
                    'hora' => now()->toTimeString(),
                    'idU_pasante' => $pasante->idU_pasante,
                    'idU_jefe' => $request->id_contacto,
                ]);
            } else {
                $mensaje = MensajePas::create([
                    'descripcion' => $request->mensaje,
                    'fecha' => now()->toDateString(),
                    'hora' => now()->toTimeString(),
                    'idU_pasanteA' => $pasante->idU_pasante,
                    'idU_pasanteB' => $request->id_contacto,
                ]);
            }
            
            return response()->json([
                'success' => true,
                'mensaje' => [
                    'id' => $mensaje->id,
                    'descripcion' => $mensaje->descripcion,
                    'fecha' => $mensaje->fecha,
                    'hora' => $mensaje->hora,
                    'es_mio' => true,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el mensaje: ' . $e->getMessage()
            ], 500);
        }
    }
}