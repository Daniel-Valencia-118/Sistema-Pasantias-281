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
        'detalles_horario',
        'id_empresa',
        'idU_jefe',
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
    public function jefeResponsable()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
   
}