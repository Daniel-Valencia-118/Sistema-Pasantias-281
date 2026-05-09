<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Gerente;
use App\Models\Empresa;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class GerenteSeeder extends Seeder
{
    public function run()
    {
        // Usamos una transacción para asegurar que se cree todo o nada
        DB::beginTransaction();

        try {
            // 1. Crear el Usuario base para el Gerente
            $user = User::create([
                'nombre_user' => 'gerente_central',
                'password' => Hash::make('password123'),
                'numero_cel' => '70012345',
                'ci' => '12345-LP',
                'correo' => 'gerente@empresa.com',
                'nombre' => 'Juan',
                'ap_paterno' => 'Perez',
                'ap_materno' => 'Rodriguez',
                'fecha_nac' => '1980-01-01',
                'estado_cuenta' => true,
                'estado_aprobacion' => 'aprobado',
            ]);

            // 2. Crear el perfil de Gerente vinculado al Usuario
            $gerente = Gerente::create([
                'idU_gerente' => $user->idUser, // Usando tu primaryKey personalizada
                'nro_secun' => '70098765',
            ]);

            // 3. Crear la Empresa vinculada al Gerente
            Empresa::create([
                'nombre' => 'Tecnology S.A.',
                'direccion' => 'Av. Arce, Edificio Tower, Piso 5',
                'email' => 'contacto@tecnologia.com',
                'nit' => '102030',
                'telefono' => '22446688',
                'idU_gerente' => $gerente->idU_gerente,
            ]);

            DB::commit();
            $this->command->info('Gerente y Empresa creados exitosamente.');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error("Error en el seeder: " . $e->getMessage());
        }
    }
}
