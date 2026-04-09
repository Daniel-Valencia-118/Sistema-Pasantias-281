<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    // 1. Nombre de la tabla (en plural o como se llame)
    protected $table = 'usuario';
    
    // 2. Clave primaria (si no se llama 'id')
    protected $primaryKey = 'idUser';
    
    // 3. Si la clave primaria es autoincremental
    public $incrementing = true;
    
    // 4. Tipo de la clave primaria
    protected $keyType = 'int';
    
    // 5. Campos que se pueden llenar (mass assignment)
    protected $fillable = [
        'nombre_user',
        'password',
        'numero_cel',
        'ci',
        'correo',
        'nombre',
        'ap_paterno',
        'ap_materno',
        'fecha_nac',
        'estado_cuenta',
    ];
    
    // 6. Campos ocultos (no se muestran en JSON)
    protected $hidden = [
        'password',
    ];
    
    // 7. Casting de tipos
    protected $casts = [
        'estado_cuenta' => 'boolean',
        'fecha_nac' => 'date',
        'fecha_registro' => 'datetime',
    ];
    
    // 8. Relaciones (las agregaremos después)
    public function administrador()
    {
        return $this->hasOne(Administrador::class, 'idU_admi', 'idUser');
    }
    
    public function gerente()
    {
        return $this->hasOne(Gerente::class, 'idU_gerente', 'idUser');
    }
    
    public function jefePas()
    {
        return $this->hasOne(JefePas::class, 'idU_jefe', 'idUser');
    }
    
    public function tutorAca()
    {
        return $this->hasOne(TutorAca::class, 'idU_tutor', 'idUser');
    }
    
    public function pasante()
    {
        return $this->hasOne(Pasante::class, 'idU_pasante', 'idUser');
    }
    
    // Método para obtener el rol del usuario
    public function getRoleAttribute()
    {
        if ($this->administrador) return 'admin';
        if ($this->gerente) return 'gerente';
        if ($this->jefePas) return 'jefe';
        if ($this->tutorAca) return 'tutor';
        if ($this->pasante) return 'pasante';
        return null;
    }
}