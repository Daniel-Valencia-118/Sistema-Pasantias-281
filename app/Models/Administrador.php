<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Administrador extends Model
{
    protected $table = 'administrador';
    protected $primaryKey = 'idU_admi';
    public $incrementing = false;
    public $timestamps = false;
    
    protected $fillable = [
        'idU_admi',
        'correo_secundario',
    ];
    
    // Relación inversa con User
    public function user()
    {
        return $this->belongsTo(User::class, 'idU_admi', 'idUser');
    }
}