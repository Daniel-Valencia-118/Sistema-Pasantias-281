<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InformeFin extends Model
{
    protected $table = 'informe_fin';
    protected $primaryKey = 'id_informe';
    public $timestamps = false;
    
    protected $fillable = [
        'promedio',
        'resultado',
        'fecha',
        'nota_final',
        'id_inscripcion',
        'idU_jefe',
    ];
    
    protected $casts = [
        'fecha' => 'date',
    ];
    
    public function inscripcion()
    {
        return $this->belongsTo(Inscripcion::class, 'id_inscripcion', 'id_inscripcion');
    }
    
    public function jefe()
    {
        return $this->belongsTo(JefePas::class, 'idU_jefe', 'idU_jefe');
    }
}