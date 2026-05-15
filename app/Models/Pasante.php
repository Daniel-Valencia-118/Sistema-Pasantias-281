<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pasante extends Model
{
    protected $table = 'pasante';
    protected $primaryKey = 'idU_pasante';
    public $incrementing = false;
    public $timestamps = false;
    
    protected $fillable = [
        'idU_pasante',
        'ru',
        'matricula',
        'semestre',
        'mencion',
        'idU_tutor',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'idU_pasante', 'idUser');
    }
    
    public function tutor()
    {
        return $this->belongsTo(TutorAca::class, 'idU_tutor', 'idU_tutor');
    }
    
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function bitacora()
    {
        return $this->hasMany(BitacoraEva::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function mensajes()
    {
        return $this->hasMany(Mensaje::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function comentarios()
    {
        return $this->hasMany(Comentario::class, 'idU_pasante', 'idU_pasante');
    }
    // Agregar estas relaciones al modelo Pasante

    // Comentarios de actividad (como pasante)
    public function comentariosActividad()
    {
        return $this->hasMany(ComActividad::class, 'idU_pasante', 'idU_pasante');
    }

    // Progresos de actividad
    public function progresosActividad()
    {
        return $this->hasMany(ProgresoAct::class, 'idU_pasante', 'idU_pasante');
    }

    // Autoevaluaciones
    public function autoevaluaciones()
    {
        return $this->hasMany(AutoEva::class, 'idU_pasante', 'idU_pasante');
    }

    // Mensajes enviados
    public function mensajesEnviados()
    {
        return $this->hasMany(MensajePas::class, 'idU_pasanteA', 'idU_pasante');
    }

    // Mensajes recibidos
    public function mensajesRecibidos()
    {
        return $this->hasMany(MensajePas::class, 'idU_pasanteB', 'idU_pasante');
    }
}