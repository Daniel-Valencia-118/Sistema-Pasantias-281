<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bitacora_eva', function (Blueprint $table) {
            $table->id('id_bitacora');
            $table->text('descripcion');
            $table->string('estado', 50)->default('pendiente');
            $table->integer('nota')->nullable();
            $table->date('fecha')->nullable();
            $table->time('hora')->nullable();
            $table->text('observacion')->nullable();
            $table->text('recomendacion')->nullable();
            $table->integer('idU_pasante');
            $table->unsignedBigInteger('id_actividad');
            $table->integer('idU_jefe');
            $table->foreign('idU_pasante')->references('idU_pasante')->on('pasante')->onDelete('cascade');
            $table->foreign('id_actividad')->references('id_actividad')->on('actividad')->onDelete('cascade');
            $table->foreign('idU_jefe')->references('idU_jefe')->on('jefe_pas')->onDelete('cascade');
        });

        // Agregar CHECK constraint para nota
        DB::statement('ALTER TABLE bitacora_eva ADD CONSTRAINT check_nota CHECK (nota >= 0 AND nota <= 100)');
    }

    public function down(): void
    {
        Schema::dropIfExists('bitacora_eva');
    }
};