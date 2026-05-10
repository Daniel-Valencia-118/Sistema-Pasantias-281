<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actividad', function (Blueprint $table) {
            $table->id('id_actividad');
            $table->string('nombre_act', 150);
            $table->string('tipo', 50)->nullable();
            $table->date('fecha_ini');
            $table->date('fecha_fin');
            $table->text('descripcion')->nullable();
            $table->unsignedBigInteger('id_pasantia');
            $table->foreign('id_pasantia')->references('id_pasantia')->on('pasantia')->onDelete('cascade');
        });

        // Agregar CHECK constraint después de crear la tabla
        //DB::statement("ALTER TABLE actividad ADD CONSTRAINT check_tipo_actividad CHECK (tipo IN ('colectiva', 'individual'))");
        DB::statement('ALTER TABLE actividad ADD CONSTRAINT check_fechas_actividad CHECK (fecha_fin >= fecha_ini)');
    }

    public function down(): void
    {
        Schema::dropIfExists('actividad');
    }
};