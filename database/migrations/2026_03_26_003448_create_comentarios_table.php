<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comentario', function (Blueprint $table) {
            $table->id('id_comentario');
            $table->text('descripcion');
            $table->integer('calificacion');
            $table->date('fecha')->default(DB::raw('CURRENT_DATE'));
            $table->integer('idU_pasante');
            $table->unsignedBigInteger('id_pasantia');
            $table->foreign('idU_pasante')->references('idU_pasante')->on('pasante')->onDelete('cascade');
            $table->foreign('id_pasantia')->references('id_pasantia')->on('pasantia')->onDelete('cascade');
            $table->unique(['idU_pasante', 'id_pasantia']);
        });

        // Agregar CHECK constraint para calificación
        DB::statement('ALTER TABLE comentario ADD CONSTRAINT check_calificacion CHECK (calificacion >= 1 AND calificacion <= 5)');
    }

    public function down(): void
    {
        Schema::dropIfExists('comentario');
    }
};