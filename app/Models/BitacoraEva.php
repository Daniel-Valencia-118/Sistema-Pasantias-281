<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BitacoraEva extends Model
{
    protected $table = 'bitacora_eva';
    protected $primaryKey = 'id_bitacora';
    public $timestamps = false;
    
    protected $fillable = [
        'descripcion',
        'estado',
        'nota',
        'fecha',
        'hora',
        'observacion',
        'recomendacion',
        'idU_pasante',
        'id_actividad',
        'idU_jefe',
    ];
    
    protected $casts = [
        'fecha' => 'date',
        'hora' => 'string',
    ];
    
    public function pasante()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function actividad()
    {
        return $this->belongsTo(Actividad::class, 'id_actividad', 'id_actividad');
    }
    
    public function jefe()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
}