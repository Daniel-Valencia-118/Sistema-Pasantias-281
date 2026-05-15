<?php
// app/Models/ComActividad.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComActividad extends Model
{
    protected $table = 'com_actividad';
    protected $primaryKey = 'id_comactividad';
    
    protected $fillable = [
        'com_pasante',
        'com_jefe',
        'fecha',
        'hora',
        'idU_pasante',
        'idU_jefe',
        'id_actividad',
    ];
    
    protected $casts = [
        'fecha' => 'date',
        'hora' => 'string',
    ];
    
    // Relaciones
    public function pasante()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function jefe()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
    
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'id_actividad', 'id_actividad');
    }
}