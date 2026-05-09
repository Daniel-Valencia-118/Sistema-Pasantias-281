<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Inscripcion;
use App\Models\Pasante;
use App\Models\Pasantia;
use App\Models\JefePas;
use Illuminate\Support\Facades\DB; // Importante para la transacción
use Carbon\Carbon;
use Exception;

class InscripcionSeeder extends Seeder
{
    public function run(): void
    {
        DB::beginTransaction();

        try {
            // 1. Localizar los registros específicos
            // $pasante = Pasante::where('idU_pasante', 1)->first();
            // $pasantia = Pasantia::find(1);
            // $jefe = JefePas::where('idU_jefe', 1)->first();

            // // 2. Validar existencia antes de insertar
            // if (!$pasante || !$pasantia || !$jefe) {
            //     throw new Exception("No se encontraron los registros específicos para crear la inscripción.");
            // }

            // 3. Crear la inscripción - Inscribir varios pasanes a la misma pasantía o mismo jefe
            for ($i = 18; $i <= 20; $i++) {
                Inscripcion::create([
                    'fecha_insc'  => Carbon::now()->toDateString(),
                    'hora_insc'   => Carbon::now()->toTimeString(),
                    'estado'      => 'Inscrito',
                    // 'idU_pasante' => $pasante->idU_pasante,
                    // 'id_pasantia' => $pasantia->id_pasantia,
                    // 'idU_jefe'    => $jefe->idU_jefe,
                    'idU_pasante' => $i, // Usamos el ID del objeto encontrado
                    'id_pasantia' => 3,
                    'idU_jefe'    => 14,
                ]);
            }
            // Si todo sale bien, confirmamos los cambios
            DB::commit();
            $this->command->info('Inscripción creada con éxito.');

        } catch (Exception $e) {
            // Si algo falla, deshacemos cualquier cambio
            DB::rollBack();
            $this->command->error('Error en el seeder: ' . $e->getMessage());
        }
    }
}
