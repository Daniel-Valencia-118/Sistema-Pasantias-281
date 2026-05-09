<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BitacoraEva;
use App\Models\Actividad;
use App\Models\Inscripcion;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class BitacoraEvaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        
        // Obtenemos las actividades que tienen pasantes inscritos
        // a través de la relación actividad -> pasantia -> inscripciones
        // $actividades = Actividad::with('pasantia.inscripciones')->get();
        // o obtener actividades específicas de una pasantia especifica:
        $actividades = Actividad::where('id_pasantia', 1)->get();


        if ($actividades->isEmpty()) {
            $this->command->warn('No hay actividades para evaluar. Ejecuta ActividadSeeder primero.');
            return;
        }

        foreach ($actividades as $actividad) {
            // Obtenemos las inscripciones para la pasantía de esta actividad
            $inscripciones = $actividad->pasantia->inscripciones;

            foreach ($inscripciones as $inscripcion) {
                // Solo creamos evaluación si el pasante tiene un jefe asignado
                if ($inscripcion->idU_jefe) {
                    
                    $estado = $faker->randomElement(['completada', 'completada parcialmente', 'no realizada', 'sin calificar']);
                    $nota = ($estado === 'evaluado') ? $faker->numberBetween(70, 100) : ($estado === 'observado' ? $faker->numberBetween(10, 60) : 0);

                    BitacoraEva::create([
                        'descripcion'    => 'Evaluación de la actividad: ' . $actividad->nombre_act,
                        'estado'         => $estado,
                        'nota'           => $nota,
                        'fecha'          => $faker->dateTimeBetween($actividad->fecha_ini, $actividad->fecha_fin)->format('Y-m-d'),
                        'hora'           => $faker->time('H:i'),
                        'observacion'    => $estado === 'observado' ? $faker->sentence() : null,
                        'recomendacion'  => $estado === 'evaluado' ? $faker->sentence() : 'Seguir las instrucciones del manual técnico.',
                        'idU_pasante'    => $inscripcion->idU_pasante,
                        'id_actividad'   => $actividad->id_actividad,
                        'idU_jefe'       => $inscripcion->idU_jefe,
                    ]);
                }
            }
        }

        $this->command->info('Bitácoras de evaluación generadas correctamente.');
    }
}
