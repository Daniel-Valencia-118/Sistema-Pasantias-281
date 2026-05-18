<?php
// app/Traits/Notificable.php

namespace App\Traits;

use App\Models\Notificacion;

trait Notificable
{
    /**
     * Crear una notificación para un usuario
     */
    protected function crearNotificacion($usuarioId, $rol, $titulo, $mensaje, $tipo, $url = null, $icono = null)
    {
        return Notificacion::create([
            'titulo' => $titulo,
            'mensaje' => $mensaje,
            'tipo' => $tipo,
            'icono' => $icono ?? $this->getIconoPorTipo($tipo),
            'url' => $url,
            'id_usuario' => $usuarioId,
            'rol_usuario' => $rol,
            'leido' => false,
            'fecha' => now()->toDateString(),
            'hora' => now()->toTimeString(),
        ]);
    }
    
    /**
     * Crear notificación para múltiples usuarios
     */
    protected function crearNotificacionesMultiples($usuarios, $rol, $titulo, $mensaje, $tipo, $url = null, $icono = null)
    {
        $notificaciones = [];
        foreach ($usuarios as $usuarioId) {
            $notificaciones[] = [
                'titulo' => $titulo,
                'mensaje' => $mensaje,
                'tipo' => $tipo,
                'icono' => $icono ?? $this->getIconoPorTipo($tipo),
                'url' => $url,
                'id_usuario' => $usuarioId,
                'rol_usuario' => $rol,
                'leido' => false,
                'fecha' => now()->toDateString(),
                'hora' => now()->toTimeString(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        return Notificacion::insert($notificaciones);
    }
    
    /**
     * Obtener icono por defecto según tipo
     */
    private function getIconoPorTipo($tipo)
    {
        return match ($tipo) {
            'mensaje' => 'message-circle',
            'calificacion' => 'star',
            'pasantia' => 'briefcase',
            'inscripcion' => 'clipboard',
            'actividad' => 'calendar',
            'comentario' => 'message-square',
            default => 'bell',
        };
    }
}