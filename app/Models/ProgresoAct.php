<?php
// app/Models/ProgresoAct.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProgresoAct extends Model
{
    protected $table = 'progreso_act';
    protected $primaryKey = 'id_progresoact';
    
    protected $fillable = [
        'descripcion',
        'porcentaje',
        'fecha',
        'hora',
        'idU_pasante',
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
    
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'id_actividad', 'id_actividad');
    }
}