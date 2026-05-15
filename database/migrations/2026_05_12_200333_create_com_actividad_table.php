<?php
// database/migrations/[timestamp]_create_com_actividad_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('com_actividad', function (Blueprint $table) {
            $table->id('id_comactividad');
            $table->text('com_pasante')->nullable();
            $table->text('com_jefe')->nullable();
            $table->date('fecha');
            $table->time('hora');
            $table->unsignedBigInteger('idU_pasante');
            $table->unsignedBigInteger('idU_jefe')->nullable();
            $table->unsignedBigInteger('id_actividad');
            
            // Índices
            $table->index('idU_pasante');
            $table->index('idU_jefe');
            $table->index('id_actividad');
            
            // Llaves foráneas
            $table->foreign('idU_pasante')
                  ->references('idU_pasante')
                  ->on('pasante')
                  ->onDelete('cascade');
                  
            $table->foreign('idU_jefe')
                  ->references('idU_jefe')
                  ->on('jefe_pas')
                  ->onDelete('set null');
                  
            $table->foreign('id_actividad')
                  ->references('id_actividad')
                  ->on('actividad')
                  ->onDelete('cascade');
                  
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('com_actividad');
    }
};