<?php

namespace App\Http\Controllers\Gerente;

use App\Http\Controllers\Controller;
use App\Models\Pasantia;
use App\Models\Actividad;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PasantiaController extends Controller
{
    public function create()
    {
        $menciones = [
            'Desarrollo de Software e Innovación Tecnológica',
            'Inteligencia Artificial y Ciencias de Datos',
            'Ciencias de la Computación',
            'Informática Industrial',
            'Ingeniería de Sistemas',
            'Redes y TIC',
            'Seguridad de la Información'
        ];
        
        $turnos = ['Tiempo completo', 'Medio tiempo', 'Mañana', 'Tarde', 'Noche'];
        $tiposActividad = ['OPERATIVA', 'TECNICA'];
        
        return Inertia::render('Gerente/Pasantias/Create', [
            'menciones' => $menciones,
            'turnos' => $turnos,
            'tiposActividad' => $tiposActividad
        ]);
    }
    



    public function store(Request $request)
    {
        // Debug: ver qué datos llegan
        \Log::info('Datos recibidos:', $request->all());
        
        try {
            $user = Auth::user();
            $empresa = $user->gerente->empresa;
            
            $validated = $request->validate([
                'nombre_pas' => 'required|string|max:255',
                'mencion' => 'required|string',
                'cupos' => 'required|integer|min:1|max:20',
                'turno' => 'required|string',
                'carga_horaria' => 'nullable|integer|min:0',
                'fecha_ini' => 'required|date',
                'fecha_fin' => 'required|date|after:fecha_ini',
                'actividades' => 'required|array|min:1',
                'actividades.*.nombre_act' => 'required|string|max:255',
                'actividades.*.tipo' => 'required|string|in:OPERATIVA,TECNICA',
                'actividades.*.descripcion' => 'nullable|string',
                'actividades.*.fecha_ini' => 'required|date',
                'actividades.*.fecha_fin' => 'required|date|after:actividades.*.fecha_ini',
            ]);
            
            \Log::info('Validación pasada');
            
            DB::beginTransaction();
            
            // Crear la pasantía
            $pasantia = Pasantia::create([
                'nombre_pas' => $request->nombre_pas,
                'estado' => 'ABIERTA',
                'mencion' => $request->mencion,
                'fecha_ini' => $request->fecha_ini,
                'fecha_fin' => $request->fecha_fin,
                'cupos' => $request->cupos,
                'cupos_disponibles' => $request->cupos,
                'carga_horaria' => $request->carga_horaria ?? 0,
                'turno' => $request->turno,
                'id_empresa' => $empresa->id_empresa,
            ]);
            
            \Log::info('Pasantía creada ID: ' . $pasantia->id_pasantia);
            
            // Crear las actividades
            foreach ($request->actividades as $actividad) {
                Actividad::create([
                    'nombre_act' => $actividad['nombre_act'],
                    'tipo' => $actividad['tipo'],
                    'fecha_ini' => $actividad['fecha_ini'],
                    'fecha_fin' => $actividad['fecha_fin'],
                    'descripcion' => $actividad['descripcion'] ?? 'sin descripción',
                    'id_pasantia' => $pasantia->id_pasantia,
                ]);
            }
            
            DB::commit();
            
            // return redirect()->route('gerente.pasantias')
            //     ->with('success', 'Pasantía publicada exitosamente.');
            return redirect()->back()->with('success', 'Pasantia crear correctamente.');    
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Error de validación:', $e->errors());
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error al publicar:', ['error' => $e->getMessage(), 'line' => $e->getLine()]);
            return back()->withErrors(['error' => 'Error al publicar: ' . $e->getMessage()]);
        }
    }

}