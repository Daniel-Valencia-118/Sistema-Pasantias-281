<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JefePas extends Model
{
    protected $table = 'jefe_pas';
    protected $primaryKey = 'idU_jefe';
    public $incrementing = false;
    public $timestamps = false;
    
    protected $fillable = [
        'idU_jefe',
        'cargo',
        'area',
        'id_empresa',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'idU_jefe', 'idUser');
    }
    
    public function empresa()
    {
        return $this->belongsTo(Empresa::class, 'id_empresa', 'id_empresa');
    }
    
    public function pasantesAsignados()
    {
        return $this->hasMany(Inscripcion::class, 'idU_jefe', 'idU_jefe');
    }
    
    public function evaluaciones()
    {
        return $this->hasMany(BitacoraEva::class, 'idU_jefe', 'idU_jefe');
    }
}