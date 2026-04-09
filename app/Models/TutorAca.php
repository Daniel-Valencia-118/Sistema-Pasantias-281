<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TutorAca extends Model
{
    protected $table = 'tutor_aca';
    protected $primaryKey = 'idU_tutor';
    public $incrementing = false;
    public $timestamps = false;
    
    protected $fillable = [
        'idU_tutor',
        'especialidad',
        'grado_aca',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class, 'idU_tutor', 'idUser');
    }
    
    public function pasantes()
    {
        return $this->hasMany(Pasante::class, 'idU_tutor', 'idU_tutor');
    }
}