<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Gerente extends Model
{
    protected $table = 'gerente';
    protected $primaryKey = 'idU_gerente';
    public $incrementing = false;
    public $timestamps = false;
    
    protected $fillable = [
        'idU_gerente',
        'nro_secun',
    ];
        
    public function user()
    {
        return $this->belongsTo(User::class, 'idU_gerente', 'idUser');
    }
    
    public function empresa()
    {
        return $this->hasOne(Empresa::class, 'idU_gerente', 'idU_gerente');
    }
}