<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comentario extends Model
{
    protected $table = 'comentario';
    protected $primaryKey = 'id_comentario';
    public $timestamps = false;
    
    protected $fillable = [
        'descripcion',
        'calificacion',
        'fecha',
        'idU_pasante',
        'id_pasantia',
    ];
    
    protected $casts = [
        'fecha' => 'date',
    ];
    
    public function pasante()
    {
        return $this->belongsTo(Pasante::class, 'idU_pasante', 'idU_pasante');
    }
    
    public function pasantia()
    {
        return $this->belongsTo(Pasantia::class, 'id_pasantia', 'id_pasantia');
    }
}