<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presentacion extends Model
{
    use HasFactory;

    protected $table = 'presentacion';
    protected $primaryKey = 'id_presentacion';
    
    protected $fillable = [
        'nombre_sistema',
        'descripcion_corta',
        'url_logo',
        'mision',
        'vision',
        // 'correo_contacto',
        // 'telefono_contacto',
        // 'direccion',
        // 'url_facebook',
        // 'url_linkedin',
        // 'copyright',
        // 'terminos_condiciones',
    ];

    // Forzar la serialización del accesor para Inertia/API
    protected $appends = ['logo_url'];

    public function getLogoUrlAttribute()
    {
        return $this->url_logo ? asset('storage/' . $this->url_logo) : null;
    }

    public static function getConfiguracion()
    {
        return self::first() ?? self::create(['nombre_sistema' => 'Sistema de Gestión de Pasantías']);
    }
}