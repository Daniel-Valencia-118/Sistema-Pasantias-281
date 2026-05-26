<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mensaje;
use App\Models\JefePas;
use App\Models\Pasante;
use App\Models\Inscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Traits\Notificable;


class MensajeJefeController extends Controller
{
    use Notificable;

    // public function index()
    // {
    //     return Inertia::render('Admin/Comunicacion/Mensajes', [
    //         'mensajes' => Mensaje::with(['pasante.user', 'jefe.user'])
    //             ->orderBy('fecha', 'desc')
    //             ->orderBy('hora', 'desc')
    //             ->get(),
    //         'pasantes' => Pasante::with('user')->get(),
    //         'jefes' => JefePas::with('user')->get(),
    //     ]);
    // }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'idU_jefe'    => 'required|exists:jefe_pas,idU_jefe',
            'fecha'       => 'nullable|date',
            'hora'        => 'nullable',
        ]);

        // Si no se envía fecha/hora, usamos la actual del sistema
        $validated['fecha'] = $validated['fecha'] ?? Carbon::now()->format('Y-m-d');
        $validated['hora']  = $validated['hora'] ?? Carbon::now()->format('H:i:s');

        Mensaje::create($validated);

        return redirect()->back()->with('success', 'Mensaje registrado correctamente.');
    }

    public function update(Request $request, $id)
    {
        $mensaje = Mensaje::findOrFail($id);
        
        $validated = $request->validate([
            'descripcion' => 'required|string',
            'idU_pasante' => 'required|exists:pasante,idU_pasante',
            'idU_jefe'    => 'required|exists:jefe_pas,idU_jefe',
            'fecha'       => 'required|date',
            'hora'        => 'required',
        ]);

        $mensaje->update($validated);

        return redirect()->back()->with('success', 'Mensaje actualizado.');
    }

    public function destroy($id)
    {
        Mensaje::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Mensaje eliminado del historial.');
    }

    /**
     * Lista todos los pasantes asignados al jefe (activos y finalizados)
     */
    public function index()
    {
        $user = Auth::user();
        $jefe = $user->jefePas; // Asumiendo relación en el modelo User

        // Obtener inscripciones utilizando la sintaxis correcta whereIn
        $inscripciones = Inscripcion::with(['pasante.user', 'pasantia'])
            ->where('idU_jefe', $jefe->idU_jefe)
            ->whereIn('estado', ['iniciado', 'finalizado'])
            ->get();

        $contactos = collect();

        foreach ($inscripciones as $inscripcion) {
            if ($inscripcion->pasante && $inscripcion->pasante->user) {
                $pasante = $inscripcion->pasante;
                $contactoId = $pasante->idU_pasante;

                if (!$contactos->has($contactoId)) {
                    // Obtener el último mensaje registrado entre ambos
                    $ultimoMensaje = Mensaje::where('idU_jefe', $jefe->idU_jefe)
                        ->where('idU_pasante', $pasante->idU_pasante)
                        ->orderBy('fecha', 'desc')
                        ->orderBy('hora', 'desc')
                        ->first();

                    $textoMensaje = null;
                    $enviadoPorMi = null;

                    if ($ultimoMensaje) {
                        // Detectar emisor mediante el prefijo de control
                        $enviadoPorMi = str_starts_with($ultimoMensaje->descripcion, '[J]');
                        $textoMensaje = preg_replace('/^(\[J\]|\[P\])/', '', $ultimoMensaje->descripcion);
                    }

                    $contactos->put($contactoId, [
                        'id_contacto' => $pasante->idU_pasante,
                        'nombre' => $pasante->user->nombre,
                        'ap_paterno' => $pasante->user->ap_paterno,
                        'ap_materno' => $pasante->user->ap_materno ?? '',
                        'nombre_user' => $pasante->user->nombre_user,
                        'pasantia_nombre' => $inscripcion->pasantia->nombre_pas,
                        'ultimo_mensaje' => $textoMensaje,
                        'ultimo_mensaje_fecha' => $ultimoMensaje ? $ultimoMensaje->fecha : null,
                        'ultimo_mensaje_hora' => $ultimoMensaje ? $ultimoMensaje->hora : null,
                        'ultimo_mensaje_enviado_por_mi' => $enviadoPorMi,
                        'finalizada' => $inscripcion->estado === 'finalizado',
                        'avatar_url' => $pasante->user->avatar_url,
                    ]);
                }
            }
        }

        // Ordenar las conversaciones por la fecha y hora del último mensaje enviado
        $contactosOrdenados = $contactos->sortByDesc(function ($contacto) {
            if ($contacto['ultimo_mensaje_fecha'] && $contacto['ultimo_mensaje_hora']) {
                $hora = $contacto['ultimo_mensaje_hora'];
                if (strlen($hora) === 5) { $hora .= ':00'; }
                return $contacto['ultimo_mensaje_fecha'] . ' ' . $hora;
            }
            return '0000-00-00 00:00:00';
        })->values();

        return Inertia::render('Jefe/Mensajes/Index', [
            'contactosIniciales' => $contactosOrdenados,
        ]);
    }

    /**
     * Carga el historial de chat con un pasante específico
     */
    public function getMensajes($idContacto)
    {
        $jefe = Auth::user()->jefePas;

        $mensajes = Mensaje::where('idU_jefe', $jefe->idU_jefe)
            ->where('idU_pasante', $idContacto)
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get()
            ->map(function ($msg) {
                // Evaluar propiedad de autoría mediante el prefijo de control
                $esMio = str_starts_with($msg->descripcion, '[J]');
                // Limpiar el prefijo de control antes de enviarlo al componente de la vista
                $descripcionLimpia = preg_replace('/^(\[J\]|\[P\])/', '', $msg->descripcion);

                return [
                    'id' => $msg->id_mensaje, // Corrección de clave primaria
                    'descripcion' => $descripcionLimpia,
                    'fecha' => $msg->fecha,
                    'hora' => $msg->hora,
                    'es_mio' => $esMio,
                ];
            });

        $pasante = Pasante::with('user')->findOrFail($idContacto);

        return response()->json([
            'mensajes' => $mensajes,
            'contacto' => [
                'nombre' => $pasante->user->nombre . ' ' . $pasante->user->ap_paterno,
                'avatar_url' => $pasante->user->avatar_url,
                'nombre_user' => $pasante->user->nombre_user,
            ]
        ]);
    }

    /**
     * Procesa el envío de mensajes e inserta el registro de la notificación
     */
    public function enviarMensaje(Request $request)
    {
        $request->validate([
            'id_contacto' => 'required|integer',
            'mensaje' => 'required|string|max:1000',
        ]);

        $jefe = Auth::user()->jefePas;
        $pasante = Pasante::with('user')->findOrFail($request->id_contacto);

        try {
            // 1. Inserción del mensaje (Esto ya funciona correctamente en tu BD)
            $mensaje = Mensaje::create([
                'descripcion' => '[J]' . $request->mensaje,
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'idU_pasante' => $pasante->idU_pasante,
                'idU_jefe' => $jefe->idU_jefe,
            ]);

            // 2. ENTORNO SEGURO PARA NOTIFICACIONES
            // Lo aislamos para que si el Trait falla por estructura de columnas o parámetros, 
            // NO interfiera con la respuesta HTTP del chat en tiempo real.
            try {
                // Fallback preventivo por si las columnas de la tabla de usuarios varían
                $idUsuarioDestino = $pasante->user ? ($pasante->user->id ?? $pasante->user->idUser) : null;
                $nombreEmisor = Auth::user()->nombre ?? Auth::user()->nombre ?? 'Tu Jefe de Pasantía';

                if ($idUsuarioDestino) {
                    $this->crearNotificacion(
                        $idUsuarioDestino,
                        'pasante',
                        'Nuevo mensaje de tu Jefe',
                        $nombreEmisor . " te ha enviado un mensaje.",
                        'mensaje',
                        '/pasante/mensajes'
                    );
                }
            } catch (\Throwable $eNotif) {
                // El error se registra de forma silenciosa en storage/logs/laravel.log para revisión técnica
                \Log::warning('Chat: Mensaje guardado, pero la notificación falló: ' . $eNotif->getMessage());
            }

            // 3. Respuesta Exitosa limpia (Status 200)
            return response()->json([
                'success' => true,
                'mensaje' => [
                    // Fallback por si el modelo no tiene la propiedad primaryKey definida como 'id_mensaje'
                    'id' => $mensaje->id_mensaje ?? $mensaje->id ?? time(), 
                    'descripcion' => $request->mensaje,
                    'fecha' => $mensaje->fecha,
                    'hora' => $mensaje->hora,
                    'es_mio' => true,
                ]
            ]);

        } catch (\Throwable $e) { 
            // CAMBIO CRÍTICO: \Throwable captura tanto Excepciones como Errores severos de PHP
            return response()->json([
                'success' => false,
                'message' => 'Error crítico en el flujo del servidor: ' . $e->getMessage()
            ], 500);
        }
    }
}