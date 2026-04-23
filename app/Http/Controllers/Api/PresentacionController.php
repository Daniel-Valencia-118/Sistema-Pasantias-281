<?php

namespace App\Http\Controllers\Api;

use App\Models\Presentacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;

class PresentacionController extends Controller
{
    /**
     * Obtener la configuración de presentación (público)
     */
    public function show()
    {
        $presentacion = Presentacion::getConfiguracion();
        
        return response()->json([
            'mision' => $presentacion->mision,
            'vision' => $presentacion->vision,
            'url_logo' => $presentacion->logo_url, // Usa el accessor
            'nombre_sistema' => $presentacion->nombre_sistema,
            'descripcion_corta' => $presentacion->descripcion_corta,
        ]);
    }

    /**
     * Actualizar la configuración de presentación (admin)
     */
    public function update(Request $request)
    {
        $request->validate([
            'mision' => 'nullable|string',
            'vision' => 'nullable|string',
            'nombre_sistema' => 'nullable|string|max:255',
            'descripcion_corta' => 'nullable|string|max:255',
            'logo' => 'nullable|image|max:2048', // Máximo 2MB
        ]);

        $presentacion = Presentacion::getConfiguracion();
        
        $data = $request->only(['mision', 'vision', 'nombre_sistema', 'descripcion_corta']);
        
        // Manejar la subida del logo
        if ($request->hasFile('logo')) {
            // Eliminar logo anterior si existe
            if ($presentacion->url_logo) {
                Storage::disk('public')->delete($presentacion->url_logo);
            }
            
            // Guardar nuevo logo
            $path = $request->file('logo')->store('logos', 'public');
            $data['url_logo'] = $path;
        }
        
        $presentacion->update($data);
        
        return response()->json([
            'message' => 'Configuración actualizada exitosamente',
            'presentacion' => $presentacion->fresh()
        ]);
    }
}