<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Presentacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ConfiguracionController extends Controller
{
    public function edit()
    {
        $config = Presentacion::getConfiguracion();
        return Inertia::render('Admin/Configuracion', [
            'config' => $config
        ]);
    }

    public function update(Request $request)
    {
        $config = Presentacion::getConfiguracion();

        $validated = $request->validate([
            'nombre_sistema' => 'required|string|max:255',
            'descripcion_corta' => 'nullable|string|max:255',
            'mision' => 'nullable|string',
            'vision' => 'nullable|string',
            // 'correo_contacto' => 'nullable|email|max:255',
            // 'telefono_contacto' => 'nullable|string|max:50',
            // 'direccion' => 'nullable|string|max:255',
            // 'url_facebook' => 'nullable|url|max:255',
            // 'url_linkedin' => 'nullable|url|max:255',
            // 'copyright' => 'nullable|string|max:255',
            // 'terminos_condiciones' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:2048', // 2MB Max
        ]);

        if ($request->hasFile('logo')) {
            // Eliminar logo antiguo si existe
            if ($config->url_logo) {
                Storage::disk('public')->delete($config->url_logo);
            }
            // Guardar nuevo logo
            $validated['url_logo'] = $request->file('logo')->store('config', 'public');
        }

        $config->update($validated);

        return redirect()->back()->with('success', 'Configuración del sistema actualizada correctamente.');
    }
}