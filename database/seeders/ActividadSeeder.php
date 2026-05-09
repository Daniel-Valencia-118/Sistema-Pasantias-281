<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Actividad;
use App\Models\Pasantia;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;

class ActividadSeeder extends Seeder
{
    public function run(): void
    {
        // CUIDADO: Esto borra solo los registros de 'actividad'
        // Si tienes llaves foráneas apuntando aquí, usa DB::statement('TRUNCATE actividad CASCADE');
        // \App\Models\Actividad::truncate(); 
        $faker = Faker::create('es_ES');
        
        // Obtener todas las pasantías para asignarles actividades
        // $pasantias = Pasantia::all();
        // Para asignar a una pasantia específica, por ejemplo la de ID 1:
        $pasantias = Pasantia::where('id_pasantia', 3)->get();

        if ($pasantias->isEmpty()) {
            $this->command->warn('No hay pasantías en la base de datos. Crea pasantías primero.');
            return;
        }

    // 1. Títulos que suenan a trabajo real
        $actividadesReales = [
            'Análisis de requerimientos', 'Desarrollo de módulos v1', 'Pruebas unitarias',
            'Documentación técnica', 'Reunión de seguimiento', 'Optimización de base de datos',
            'Corrección de errores críticos', 'Capacitación de personal', 'Diseño de interfaces',
            'Migración de servicios', 'Implementación de seguridad', 'Revisión de código'
        ];

        // 2. Solo los tipos permitidos por tu CONSTRAINT de Postgres
        $tiposPermitidos = ['colectiva', 'individual'];

        // Diccionarios para descripciones realistas
        $verbos = ['Finalización de', 'Avance en el', 'Revisión del', 'Optimización del', 'Soporte técnico para el'];
        $contextos = ['sistema de gestión', 'módulo de inventario', 'servidor de pruebas', 'área de soporte técnico', 'departamento de desarrollo'];

        // Iniciamos la transacción
        DB::beginTransaction();

        try {
            foreach ($pasantias as $pasantia) {
                $cantidad = rand(3, 6);

                for ($i = 1; $i <= $cantidad; $i++) {
                    $fechaInicio = $faker->dateTimeBetween('-2 months', 'now');
                    $fechaFin = $faker->dateTimeBetween($fechaInicio, '+1 month');

                    $descripcionReal = $faker->randomElement($verbos) . " " . 
                                    $faker->randomElement($contextos) . ". " ;
                                    // "Se cumplieron los objetivos establecidos en el cronograma.";

                    Actividad::create([
                        'nombre_act'  => $faker->randomElement($actividadesReales), 
                        'tipo'        => $faker->randomElement($tiposPermitidos),
                        'fecha_ini'   => $fechaInicio->format('Y-m-d'),
                        'fecha_fin'   => $fechaFin->format('Y-m-d'),
                        'descripcion' => $descripcionReal,
                        'id_pasantia' => $pasantia->id_pasantia,
                    ]);
                }
            }

            // Si todo salió bien, guardamos los cambios definitivamente
            DB::commit();
            $this->command->info('Actividades generadas exitosamente con transacciones.');

        } catch (\Exception $e) {
            // Si ocurre CUALQUIER error (como el CHECK violation), deshacemos todo
            DB::rollBack();
            $this->command->error('Error al generar actividades: ' . $e->getMessage());
        }
    }
}
