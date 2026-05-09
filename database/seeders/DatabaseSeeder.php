<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // 1. Roles de alto nivel e infraestructura base
            AdminUserSeeder::class,    // Crea al SuperAdmin
            
            // 2. Estructura empresarial
            GerenteSeeder::class,      // Crea Gerentes y sus Empresas
            
            // 3. Personal de las empresas
            // Aquí deberías tener un JefeSeeder si no los creas dentro de GerenteSeeder
            
            // 4. Ofertas académicas
            PasantiaSeeder::class,     // Crea las ofertas de pasantía para las empresas
            
            // 5. Usuarios finales
            PasanteSeeder::class,      // Crea los pasantes con datos de Faker
            
            // 6. Relaciones y flujo de trabajo (Orden Crítico)
            InscripcionSeeder::class,  // Vincula Pasante -> Pasantía -> Jefe
            ActividadSeeder::class,    // Crea tareas dentro de las pasantías
            BitacoraEvaSeeder::class,  // Crea las evaluaciones de esas tareas
        ]);
    }
}
