<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pasantia;
use App\Models\Empresa;
use Faker\Factory as Faker;

class PasantiaSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');
        $empresas = Empresa::all();

        if ($empresas->isEmpty()) {
            $this->command->warn('No hay empresas disponibles. Ejecuta primero GerenteSeeder.');
            return;
        }

        $titulos = [
            'Desarrollador Web Junior', 
            'Pasante de Redes y Telecomunicaciones', 
            'Analista de Datos', 
            'Auxiliar de Soporte Técnico', 
            'Desarrollador Backend PHP',
            'Pasante de Seguridad Informática'
        ];

        $menciones = ['Sistemas', 'Redes', 'Ciencia de Datos', 'Software'];
        $turnos = ['mañana', 'tarde', 'tiempo completo'];

        foreach ($empresas as $empresa) {
            // Creamos 2 o 3 ofertas de pasantía por empresa
            for ($i = 0; $i < rand(2, 3); $i++) {
                $cuposTotal = rand(2, 5);
                $fechaInicio = $faker->dateTimeBetween('now', '+1 month');
                $fechaFin = $faker->dateTimeBetween($fechaInicio, '+6 months');

                Pasantia::create([
                    'nombre_pas' => $faker->randomElement($titulos),
                    'estado' => $faker->randomElement(['disponible', 'activo', 'finalizado']),
                    'mencion' => $faker->randomElement($menciones),
                    'fecha_ini' => $fechaInicio->format('Y-m-d'),
                    'fecha_fin' => $fechaFin->format('Y-m-d'),
                    'cupos' => $cuposTotal,
                    'cupos_disponibles' => $cuposTotal, // Al iniciar, todos están disponibles
                    'carga_horaria' => $faker->randomElement([20, 30, 40]), // Horas semanales
                    'turno' => $faker->randomElement($turnos),
                    'id_empresa' => $empresa->id_empresa,
                ]);
            }
        }

        $this->command->info('Pasantías creadas exitosamente asociadas a las empresas.');
    }
}
