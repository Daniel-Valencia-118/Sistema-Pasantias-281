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