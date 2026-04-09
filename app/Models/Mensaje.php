<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model
{
    protected $table = 'mensaje';
    protected $primaryKey = 'id_mensaje';
    public $timestamps = false;
    
    protected $fillable = [
        'descripcion',
        'fecha',
        'hora',
        'idU_pasante',
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
    
    public function jefe()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
}