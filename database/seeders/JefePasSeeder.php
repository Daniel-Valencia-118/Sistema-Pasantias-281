<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\JefePas;
use App\Models\Empresa; // Necesario para obtener el ID de la empresa
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class JefePasSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES');

        // 1. Verificar si hay empresas, si no, crear una de prueba
        $empresa = Empresa::first() ?? Empresa::create([
            'nombre_empresa' => 'Tecnología Global S.A.',
            'nit' => '123456789',
            'direccion' => 'Av. Principal #123'
            // Añade aquí los campos obligatorios de tu tabla Empresa
        ]);

        $cargos = ['Gerente de RRHH', 'Jefe de Proyectos', 'Director Técnico', 'Supervisor de Planta'];
        $areas = ['Sistemas', 'Administración', 'Producción', 'Innovación'];

        for ($i = 0; $i < 3; $i++) {
            DB::beginTransaction();
            try {
                // 2. Crear el Usuario base
                $user = User::create([
                    'nombre_user' => $faker->unique()->userName,
                    'password' => Hash::make('jefe123'),
                    'numero_cel' => $faker->phoneNumber,
                    'ci' => $faker->unique()->dni,
                    'correo' => $faker->unique()->safeEmail,
                    'nombre' => $faker->firstName,
                    'ap_paterno' => $faker->lastName,
                    'ap_materno' => $faker->lastName,
                    'fecha_nac' => $faker->date('Y-m-d', '1985-01-01'),
                    'estado_cuenta' => true,
                    'estado_aprobacion' => 'aprobado',
                ]);

                // 3. Crear el JefePas asociado
                JefePas::create([
                    'idU_jefe' => $user->idUser,
                    'cargo' => $faker->randomElement($cargos),
                    'area' => $faker->randomElement($areas),
                    'id_empresa' => $empresa->id_empresa, // Relación con la empresa
                    // 'id_empresa' => 5, // ID directo de la empresa existente
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error("Error al crear JefePas: " . $e->getMessage());
            }
        }
    }
}
