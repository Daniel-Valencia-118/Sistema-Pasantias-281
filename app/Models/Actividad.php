<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Actividad extends Model
{
    protected $table = 'actividad';
    protected $primaryKey = 'id_actividad';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre_act',
        'tipo',
        'fecha_ini',
        'fecha_fin',
        'descripcion',
        'id_pasantia',
    ];
  
    public function pasantia()
    {
        return $this->belongsTo(Pasantia::class, 'id_pasantia', 'id_pasantia');
    }
    
    public function evaluaciones()
    {
        return $this->hasMany(BitacoraEva::class, 'id_actividad', 'id_actividad');
    }
    // Agregar estas relaciones al modelo Actividad

    // Comentarios de la actividad
    public function comentarios()
    {
        return $this->hasMany(ComActividad::class, 'id_actividad', 'id_actividad');
    }

    // Progresos de la actividad
    public function progresos()
    {
        return $this->hasMany(ProgresoAct::class, 'id_actividad', 'id_actividad');
    }

    // Autoevaluaciones de la actividad
    public function autoevaluaciones()
    {
        return $this->hasMany(AutoEva::class, 'id_actividad', 'id_actividad');
    }
}