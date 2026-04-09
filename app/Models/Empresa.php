<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    protected $table = 'empresa';
    protected $primaryKey = 'id_empresa';
    public $timestamps = false;
    
    protected $fillable = [
        'nombre',
        'direccion',
        'email',
        'nit',
        'telefono',
        'idU_gerente',
    ];
    
    public function gerente()
    {
        return $this->belongsTo(Gerente::class, 'idU_gerente', 'idU_gerente');
    }
    
    public function jefes()
    {
        return $this->hasMany(JefePas::class, 'id_empresa', 'id_empresa');
    }
    
    public function pasantias()
    {
        return $this->hasMany(Pasantia::class, 'id_empresa', 'id_empresa');
    }
}