<?php
// app/Models/Avatar.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avatar extends Model
{
    protected $table = 'avatars';
    
    protected $fillable = [
        'id_usuario',
        'ruta',
        'nombre_original',
    ];
    
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'idUser');
    }
}