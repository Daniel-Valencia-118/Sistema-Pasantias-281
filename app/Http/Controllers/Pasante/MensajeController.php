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
use App\Traits\Notificable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MensajeController extends Controller
{   
    use Notificable;
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
            ->where('estado', 'iniciado','finalizado')
            ->get();
        
        // Colección para almacenar contactos únicos
        $contactos = collect();
        
        // 1. Agregar jefes de las pasantías activas
        foreach ($inscripcionesActivas as $inscripcion) {
            if ($inscripcion->jefe && $inscripcion->jefe->user) {
                $jefe = $inscripcion->jefe;
                $contactoId = 'jefe_' . $jefe->idU_jefe;
                
                // Evitar duplicados
// --- REEMPLAZAR EN PASANTE: MensajeController.php -> index() (Bloque de Jefes) ---
if (!$contactos->has($contactoId)) {
    // Obtener último mensaje
    $ultimoMensaje = Mensaje::where('idU_pasante', $pasante->idU_pasante)
        ->where('idU_jefe', $jefe->idU_jefe)
        ->orderBy('fecha', 'desc')
        ->orderBy('hora', 'desc')
        ->first();
    
    $textoLimpio = null;
    $enviadoPorMi = null;

    if ($ultimoMensaje) {
        // Si empieza con [P], lo envió el Pasante (es_mio = true)
        $enviadoPorMi = str_starts_with($ultimoMensaje->descripcion, '[P]');
        // Remover cualquier prefijo de control ([J] o [P])
        $textoLimpio = preg_replace('/^(\[J\]|\[P\])/', '', $ultimoMensaje->descripcion);
    }
    
    $contactos->put($contactoId, [
        'tipo' => 'jefe',
        'id_contacto' => $jefe->idU_jefe,
        'nombre' => $jefe->user->nombre,
        'ap_paterno' => $jefe->user->ap_paterno,
        'ap_materno' => $jefe->user->ap_materno ?? '',
        'nombre_user' => $jefe->user->nombre_user,
        'empresa_nombre' => $inscripcion->pasantia->empresa->nombre,
        'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
        'ultimo_mensaje' => $textoLimpio, // <- Pasar texto limpio
        'ultimo_mensaje_fecha' => $ultimoMensaje ? $ultimoMensaje->fecha : null,
        'ultimo_mensaje_hora' => $ultimoMensaje ? $ultimoMensaje->hora : null,
        'ultimo_mensaje_enviado_por_mi' => $enviadoPorMi, // <- Booleano correcto
        'finalizada' => false,
        'avatar_url' => $jefe->user->avatar_url,
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
                ->where('estado', 'iniciado','finalizado')
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
                        'avatar_url' => $companero->user->avatar_url, // agregar esta línea
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
        
// --- REEMPLAZAR EN PASANTE: MensajeController.php -> getMensajes() (Bloque tipo === 'jefe') ---
if ($tipo === 'jefe') {
    // Consulta corregida sin inversión de columnas en el orWhere
    $mensajes = Mensaje::where('idU_pasante', $pasante->idU_pasante)
        ->where('idU_jefe', $idContacto)
        ->orderBy('fecha', 'asc')
        ->orderBy('hora', 'asc')
        ->get()
        ->map(function($msg) {
            // Si el texto inicia con '[P]', el mensaje pertenece al Pasante logueado
            $esMio = str_starts_with($msg->descripcion, '[P]');
            // Limpiamos la cadena para la interfaz de usuario
            $descripcionLimpia = preg_replace('/^(\[J\]|\[P\])/', '', $msg->descripcion);

            return [
                'id' => $msg->id_mensaje, // Corrección de primary key
                'descripcion' => $descripcionLimpia,
                'fecha' => $msg->fecha,
                'hora' => $msg->hora,
                'es_mio' => $esMio,
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
        'avatar_url' => $jefe->user->avatar_url,
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
                'avatar_url' => $otroPasante->user->avatar_url,
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
        // --- REEMPLAZAR EN PASANTE: MensajeController.php -> enviarMensaje() (Bloque tipo === 'jefe') ---
        if ($request->tipo === 'jefe') {
            // Buscar la información del jefe para obtener su id de usuario global
            $jefeOperacional = JefePas::with('user')->findOrFail($request->id_contacto);

            $mensaje = Mensaje::create([
                'descripcion' => '[P]' . $request->mensaje, // Inserción del prefijo de control del Pasante
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'idU_pasante' => $pasante->idU_pasante,
                'idU_jefe' => $request->id_contacto,
            ]);

            // NOTIFICACIÓN: Se envía usando el ID de la tabla USERS vinculada al jefe
            // envolver en un try-catch para evitar que falle la respuesta del chat si hay un error en la notificación, ya que no es crítico que la notificación se envíe, pero sí es crítico que el mensaje se guarde y se responda al frontend sin errores.
            try {
            $this->crearNotificacion(
                $jefeOperacional->user->idUser, // ID de usuario de la cuenta general (Evita el desajuste de registros)
                'jefe',
                'Nuevo mensaje de pasante',
                "El pasante {$pasante->user->nombre} {$pasante->user->ap_paterno} te ha enviado un mensaje.",
                'mensaje',
                '/jefe/mensajes'
            );
            } catch (\Exception $e) {
                // informar y retornar error ocurrido json
                return response()->json([
                    'success' => false,
                    'message' => 'Error al enviar la notificación: ' . $e->getMessage()
                ], 500);

            }
            
            // Devolver la estructura limpia al frontend del Pasante
            $mensajeRetorno = [
                'id' => $mensaje->id_mensaje,
                'descripcion' => $request->mensaje,
                'fecha' => $mensaje->fecha,
                'hora' => $mensaje->hora,
                'es_mio' => true,
            ];
        } else {
                $mensaje = MensajePas::create([
                    'descripcion' => $request->mensaje,
                    'fecha' => now()->toDateString(),
                    'hora' => now()->toTimeString(),
                    'idU_pasanteA' => $pasante->idU_pasante,
                    'idU_pasanteB' => $request->id_contacto,
                ]);
                 // =============================================
                 // NOTIFICACIÓN: Nuevo mensaje para el otro PASANTE
                // =============================================
                $this->crearNotificacion(
                        $request->id_contacto,  // id del otro pasante
                        'pasante',
                        'Nuevo mensaje',
                        "El pasante {$pasante->user->nombre} {$pasante->user->ap_paterno} te ha enviado un mensaje.",
                        'mensaje',
                        '/pasante/mensajes'
                 );
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

