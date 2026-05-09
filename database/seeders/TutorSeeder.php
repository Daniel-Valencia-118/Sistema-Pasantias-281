<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\TutorAca; // Ajustado según tu controlador
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class TutorSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_ES'); // Configurado en español

        $especialidades = ['Ingeniería de Software', 'Redes y Seguridad', 'Inteligencia Artificial', 'Base de Datos'];
        $grados = ['Licenciatura', 'Maestría', 'Doctorado', 'Postdoctorado'];

        for ($i = 0; $i < 5; $i++) {
            DB::beginTransaction();
            try {
                // 1. Crear el Usuario base con Faker
                $user = User::create([
                    'nombre_user' => $faker->unique()->userName,
                    'password' => Hash::make('tutor123'),
                    'numero_cel' => $faker->phoneNumber,
                    'ci' => $faker->unique()->dni,
                    'correo' => $faker->unique()->safeEmail,
                    'nombre' => $faker->firstName,
                    'ap_paterno' => $faker->lastName,
                    'ap_materno' => $faker->lastName,
                    'fecha_nac' => $faker->date('Y-m-d', '1990-01-01'),
                    'estado_cuenta' => true,
                    'estado_aprobacion' => 'aprobado',
                ]);

                // 2. Crear el Tutor asociado
                TutorAca::create([
                    'idU_tutor' => $user->idUser,
                    'especialidad' => $faker->randomElement($especialidades),
                    'grado_aca' => $faker->randomElement($grados),
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error("Error al crear tutor: " . $e->getMessage());
            }
        }
    }
}
