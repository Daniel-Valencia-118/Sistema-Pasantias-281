<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Pasante;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class PasanteSeeder extends Seeder
{
    public function run(): void
    {
        // Instanciamos Faker con localización en español (opcional)
        $faker = Faker::create('es_ES');
        $menciones = ['Sistemas', 'Redes', 'Ciencia de Datos', 'Software', 'AI', 'Seguridad Informática'];

        for ($i = 1; $i <= 5; $i++) {
            DB::beginTransaction();
            try {
                // Generamos datos base
                $firstName = $faker->firstName;
                $lastNameP = $faker->lastName;
                $lastNameM = $faker->lastName;
                
                // Crear el Usuario
                $user = User::create([
                    'nombre_user' => strtolower($faker->unique()->userName),
                    'password' => Hash::make('password123'),
                    'numero_cel' => $faker->phoneNumber, // O rand(60000000, 79999999) para formato local
                    'ci' => $faker->unique()->numberBetween(5000000, 9000000) . "-LP",
                    'correo' => $faker->unique()->safeEmail,
                    'nombre' => $firstName,
                    'ap_paterno' => $lastNameP,
                    'ap_materno' => $lastNameM,
                    'fecha_nac' => $faker->date('Y-m-d', '2004-01-01'), // Nacidos antes de 2004
                    'estado_cuenta' => false,
                    'estado_aprobacion' => 'aprobado',
                ]);

                // Crear el Pasante asociado
                Pasante::create([
                    'idU_pasante' => $user->idUser,
                    'ru' => $faker->unique()->numberBetween(10000, 99999),
                    'matricula' => 'MAT-' . $faker->unique()->bothify('####??'),
                    'semestre' => $faker->numberBetween(7, 10),
                    'mencion' => $faker->randomElement($menciones),
                    'idU_tutor' => null,
                ]);

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                $this->command->error("Error creando pasante $i: " . $e->getMessage());
            }
        }
        $this->command->info("$i Pasantes generados con Faker exitosamente.");
    }
}
