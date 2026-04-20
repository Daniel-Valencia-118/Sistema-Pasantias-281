<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pasantia extends Model
{
    protected $table = 'pasantia';
    protected $primaryKey = 'id_pasantia';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre_pas',
        'estado',
        'mencion',
        'fecha_ini',
        'fecha_fin',
        'cupos',
        'cupos_disponibles',
        'carga_horaria',
        'turno',
        'id_empresa',
    ];
    
    protected $casts = [
        'fecha_ini' => 'date',
        'fecha_fin' => 'date',
    ];
    
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }
    
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'id_pasantia', 'id_pasantia');
    }
    
    public function actividades()
    {
        return $this->hasMany(Actividad::class, 'id_pasantia', 'id_pasantia');
    }
    
    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'id_pasantia', 'id_pasantia');
    }
    
    // // Scope para pasantías activas
    // public function scopeActivas($query)
    // {
    //     return $query->where('estado', 'activo')
    //                  ->where('fecha_ini', '<=', now())
    //                  ->where('fecha_fin', '>=', now());
    // }
}