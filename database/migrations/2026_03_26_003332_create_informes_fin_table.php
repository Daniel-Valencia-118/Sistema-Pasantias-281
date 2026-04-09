<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('informe_fin', function (Blueprint $table) {
            $table->id('id_informe');
            $table->decimal('promedio', 5, 2)->nullable();
            $table->string('resultado', 50)->nullable();
            $table->date('fecha')->default(DB::raw('CURRENT_DATE'));
            $table->unsignedBigInteger('id_inscripcion')->unique();
            $table->integer('idU_jefe');
            $table->foreign('id_inscripcion')->references('id_inscripcion')->on('inscripcion')->onDelete('cascade');
            $table->foreign('idU_jefe')->references('idU_jefe')->on('jefe_pas')->onDelete('cascade');
        });

        // Agregar CHECK constraint para promedio
        DB::statement('ALTER TABLE informe_fin ADD CONSTRAINT check_promedio CHECK (promedio >= 0 AND promedio <= 100)');
    }

    public function down(): void
    {
        Schema::dropIfExists('informe_fin');
    }
};