<?php
// app/Models/Notificacion.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notificacion extends Model
{
    protected $table = 'notificaciones';
    
    protected $fillable = [
        'titulo', 
        'mensaje', 
        'tipo', 
        'icono', 
        'url',
        'id_usuario', 
        'rol_usuario', 
        'leido', 
        'fecha', 
        'hora'
    ];
    
    protected $casts = [
        'leido' => 'boolean',
        'fecha' => 'date',
    ];
    
    // Formatear fecha para mostrar
    public function getFechaFormateadaAttribute()
    {
        $hoy = now();
        $fechaNotif = $this->fecha;
        
        if ($fechaNotif == $hoy->toDateString()) {
            return 'Hoy';
        } elseif ($fechaNotif == $hoy->subDay()->toDateString()) {
            return 'Ayer';
        } else {
            return $fechaNotif->format('d/m/Y');
        }
    }
}