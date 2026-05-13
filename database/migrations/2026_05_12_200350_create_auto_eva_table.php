<?php
// database/migrations/[timestamp]_create_auto_eva_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('auto_eva', function (Blueprint $table) {
            $table->id('id_autoeva');
            $table->text('comentario')->nullable();
            $table->integer('nota')->nullable();
            $table->date('fecha');
            $table->unsignedBigInteger('idU_pasante');
            $table->unsignedBigInteger('id_actividad');
            
            // Índices
            $table->index('idU_pasante');
            $table->index('id_actividad');
            
            // Llaves foráneas
            $table->foreign('idU_pasante')
                  ->references('idU_pasante')
                  ->on('pasante')
                  ->onDelete('cascade');
                  
            $table->foreign('id_actividad')
                  ->references('id_actividad')
                  ->on('actividad')
                  ->onDelete('cascade');
                  
            // Asegurar que solo haya una autoevaluación por pasante/actividad
            $table->unique(['idU_pasante', 'id_actividad'], 'auto_eva_unique');
                  
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('auto_eva');
    }
};