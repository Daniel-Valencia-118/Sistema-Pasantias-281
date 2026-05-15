<?php
// app/Models/HistorialInforme.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HistorialInforme extends Model
{
    protected $table = 'historial_informes';
    protected $primaryKey = 'id_historial';
    
    protected $fillable = [
        'id_inscripcion',
        'fecha_generacion',
        'hora_generacion',
        'nombre_archivo',
    ];
    
    protected $casts = [
        'fecha_generacion' => 'date',
        'hora_generacion' => 'string',
    ];
    
    public function inscripcion()
    {
        return $this->belongsTo(Inscripcion::class, 'id_inscripcion', 'id_inscripcion');
    }
}