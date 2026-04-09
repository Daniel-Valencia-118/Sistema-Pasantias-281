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
    
    protected $casts = [
        'fecha_ini' => 'date',
        'fecha_fin' => 'date',
    ];
    
    public function pasantia()
    {
        return $this->belongsTo(Pasantia::class, 'id_pasantia', 'id_pasantia');
    }
    
    public function evaluaciones()
    {
        return $this->hasMany(BitacoraEva::class, 'id_actividad', 'id_actividad');
    }
}