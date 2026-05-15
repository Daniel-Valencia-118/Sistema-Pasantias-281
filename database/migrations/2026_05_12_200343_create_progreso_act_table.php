<?php
// database/migrations/[timestamp]_create_progreso_act_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('progreso_act', function (Blueprint $table) {
            $table->id('id_progresoact');
            $table->text('descripcion')->nullable();
            $table->integer('porcentaje')->default(0);
            $table->date('fecha');
            $table->time('hora');
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
                  
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('progreso_act');
    }
};