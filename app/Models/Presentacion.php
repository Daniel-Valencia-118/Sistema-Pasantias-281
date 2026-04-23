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
        'mision',
        'vision',
        'url_logo',
        'nombre_sistema',
        'descripcion_corta',
    ];

    /**
     * Obtener la URL completa del logo
     */
    public function getLogoUrlAttribute()
    {
        if ($this->url_logo) {
            return asset('storage/' . $this->url_logo);
        }
        
        // Retornar null para que el frontend use el logo por defecto
        return null;
    }

    /**
     * Obtener la configuración de presentación (singleton)
     */
    public static function getConfiguracion()
    {
        return self::first() ?? self::create([
            'mision' => 'Facilitar la conexión entre estudiantes, empresas y la universidad.',
            'vision' => 'Ser el sistema líder en gestión de pasantías universitarias.',
            'nombre_sistema' => 'Sistema de Gestión de Pasantías',
        ]);
    }
}