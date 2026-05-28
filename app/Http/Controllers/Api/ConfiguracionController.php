<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presentacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ConfiguracionController extends Controller
{
    /**
     * Renderiza la vista de administración usando Inertia.
     */
    public function edit()
    {
        $config = Presentacion::getConfiguracion();
        return Inertia::render('Admin/Configuracion', [
            'config' => $config
        ]);
    }

    /**
     * Procesa la actualización de datos y archivos desde el panel Admin.
     */
    public function update(Request $request)
    {
        $config = Presentacion::getConfiguracion();

        $validated = $request->validate([
            'nombre_sistema'    => 'required|string|max:255',
            'descripcion_corta' => 'nullable|string|max:255',
            'mision'            => 'nullable|string',
            'vision'            => 'nullable|string',
            'logo'              => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('logo')) {
            // Eliminar logo antiguo si existe en el disco público
            if ($config->url_logo && Storage::disk('public')->exists($config->url_logo)) {
                Storage::disk('public')->delete($config->url_logo);
            }
            // Guardar nuevo logo en storage/app/public/config
            $validated['url_logo'] = $request->file('logo')->store('config', 'public');
        }

        $config->update($validated);

        return redirect()->back()->with('success', 'Configuración del sistema actualizada correctamente.');
    }

    /**
     * NUEVO MÉTODO: Retorna los datos públicos del sistema para AXIOS.
     */
    public function getPublicConfig()
    {
        $config = Presentacion::getConfiguracion();

        // Al retornar JSON, Laravel incluye automáticamente 'logo_url' por tu propiedad $appends
        return response()->json([
            'nombre_sistema'    => $config->nombre_sistema,
            'descripcion_corta' => $config->descripcion_corta,
            'mision'            => $config->mision,
            'vision'            => $config->vision,
            'logo_url'          => $config->logo_url, 
        ]);
    }
}