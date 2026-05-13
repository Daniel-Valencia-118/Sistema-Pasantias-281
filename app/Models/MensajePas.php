<?php
// app/Models/MensajePas.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MensajePas extends Model
{
    protected $table = 'mensaje_pas';
    protected $primaryKey = 'id_mensajepas';
    
    protected $fillable = [
        'descripcion',
        'fecha',
        'hora',
        'idU_pasanteA',
        'idU_pasanteB',
        'leido',
    ];
    
    protected $casts = [
        'fecha' => 'date',
        'hora' => 'string',
        'leido' => 'boolean',
    ];
    
    // Relaciones
    public function emisor()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasanteA', 'idU_pasante');
    }
    
    public function receptor()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasanteB', 'idU_pasante');
    }
}