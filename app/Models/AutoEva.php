<?php
// app/Models/AutoEva.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AutoEva extends Model
{
    protected $table = 'auto_eva';
    protected $primaryKey = 'id_autoeva';
    
    protected $fillable = [
        'comentario',
        'nota',
        'fecha',
        'idU_pasante',
        'id_actividad',
    ];
    
    protected $casts = [
        'fecha' => 'date',
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