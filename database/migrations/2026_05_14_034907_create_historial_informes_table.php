<?php
// database/migrations/[timestamp]_create_historial_informes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historial_informes', function (Blueprint $table) {
            $table->id('id_historial');
            $table->unsignedBigInteger('id_inscripcion');
            $table->date('fecha_generacion');
            $table->time('hora_generacion');
            $table->string('nombre_archivo', 255);
            $table->timestamps();
            
            // Foreign key
            $table->foreign('id_inscripcion')
                  ->references('id_inscripcion')
                  ->on('inscripcion')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historial_informes');
    }
};