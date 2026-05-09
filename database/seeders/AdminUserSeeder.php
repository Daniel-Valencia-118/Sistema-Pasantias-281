<?php
// database/seeders/AdminUserSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Administrador;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Verificar si ya existe
        $exists = User::where('nombre_user', 'superadmin')->exists();
        
        if (!$exists) {
            $user = User::create([
                'nombre_user' => 'superadmin',
                'password' => Hash::make('12345678'),
                'numero_cel' => '00000000',
                'ci' => '9999999',
                'correo' => 'dvalenciat@fcpn.edu.bo',
                'nombre' => 'Super',
                'ap_paterno' => 'Administrador',
                'ap_materno' => 'Sistema',
                'fecha_nac' => '1980-01-01',
                'estado_cuenta' => true,
            ]);
            
            Administrador::create([
                'idU_admi' => $user->idUser,
                'correo_secundario' => 'dvalenciat@fcpn.edu.bo',
            ]);
            
            $this->command->info('Administrador creado:');
            $this->command->info('Usuario: superadmin');
            $this->command->info('Contraseña: 12345678');
        }
    }
}

// <?php

// namespace Database\Seeders;

// use Illuminate\Database\Seeder;
// use App\Models\User;
// use App\Models\Administrador;
// use Illuminate\Support\Facades\Hash;
// use Faker\Factory as Faker;

// class AdminUserSeeder extends Seeder
// {
//     public function run(): void
//     {
//         $faker = Faker::create('es_ES');
        
//         // Datos fijos para el Admin Principal
//         $adminUser = 'superadmin';

//         if (!User::where('nombre_user', $adminUser)->exists()) {
//             // 1. Crear el Usuario con Faker para los apellidos/celular
//             $user = User::create([
//                 'nombre_user' => $adminUser,
//                 'password' => Hash::make('12345678'),
//                 'numero_cel' => $faker->numerify('7#######'), // Genera un celular de 8 dígitos que empieza con 7
//                 'ci' => '9999999',
//                 'correo' => 'dvalenciat@fcpn.edu.bo',
//                 'nombre' => 'Diego', // Nombre real o "Super"
//                 'ap_paterno' => 'Valencia',
//                 'ap_materno' => 'Ticona',
//                 'fecha_nac' => '1985-05-20',
//                 'estado_cuenta' => true,
//                 'estado_aprobacion' => 'aprobado',
//             ]);
            
//             // 2. Crear el perfil de Administrador
//             Administrador::create([
//                 'idU_admi' => $user->idUser,
//                 'correo_secundario' => $faker->unique()->safeEmail,
//             ]);
            
//             $this->command->info('-----------------------------------');
//             $this->command->info(' Administrador Principal Creado');
//             $this->command->info(" Usuario: {$adminUser}");
//             $this->command->info(' Password:  12345678');
//             $this->command->info('-----------------------------------');
//         } else {
//             $this->command->warn("El administrador {$adminUser} ya existe. Saltando...");
//         }
//     }
// }