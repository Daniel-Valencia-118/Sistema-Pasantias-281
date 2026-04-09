<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasantia', function (Blueprint $table) {
            $table->id('id_pasantia');
            $table->string('nombre_pas', 150);
            $table->string('estado', 20)->default('activo');
            $table->string('mencion', 100);
            $table->date('fecha_ini');
            $table->date('fecha_fin');
            $table->integer('cupos');
            $table->integer('cupos_disponibles');
            $table->integer('carga_horaria')->nullable();
            $table->string('turno', 20)->nullable();
            $table->unsignedBigInteger('id_empresa');
            $table->foreign('id_empresa')->references('id_empresa')->on('empresa')->onDelete('cascade');
        });

        // Agregar CHECK constraints después de crear la tabla
        DB::statement('ALTER TABLE pasantia ADD CONSTRAINT check_cupos_positivos CHECK (cupos > 0)');
        DB::statement('ALTER TABLE pasantia ADD CONSTRAINT check_cupos_disponibles CHECK (cupos_disponibles >= 0 AND cupos_disponibles <= cupos)');
        DB::statement('ALTER TABLE pasantia ADD CONSTRAINT check_fechas_pasantia CHECK (fecha_fin > fecha_ini)');
    }

    public function down(): void
    {
        Schema::dropIfExists('pasantia');
    }
};