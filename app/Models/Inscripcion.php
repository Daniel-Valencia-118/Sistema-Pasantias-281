<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    protected $table = 'inscripcion';
    protected $primaryKey = 'id_inscripcion';
    public $timestamps = false;
    
    protected $fillable = [
        'fecha_insc',
        'hora_insc',
        'estado',
        'idU_pasante',
        'id_pasantia',
        'idU_jefe',
    ];
    
    protected $casts = [
        'fecha_insc' => 'date',
        'hora_insc' => 'string',
    ];
    
    public function pasante()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function pasantia()
    {
        return $this->belongsTo(Pasantia::class, 'id_pasantia', 'id_pasantia');
    }
    
    public function jefe()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
    
    public function informeFinal()
    {
        return $this->hasOne(InformeFin::class, 'id_inscripcion', 'id_inscripcion');
    }
}