<?php
// database/migrations/[timestamp]_create_mensaje_pas_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mensaje_pas', function (Blueprint $table) {
            $table->id('id_mensajepas');
            $table->text('descripcion');
            $table->date('fecha');
            $table->time('hora');
            $table->unsignedBigInteger('idU_pasanteA'); // Emisor
            $table->unsignedBigInteger('idU_pasanteB'); // Receptor
            $table->boolean('leido')->default(false);
            
            // Índices
            $table->index('idU_pasanteA');
            $table->index('idU_pasanteB');
            $table->index('leido');
            
            // Llaves foráneas
            $table->foreign('idU_pasanteA')
                  ->references('idU_pasante')
                  ->on('pasante')
                  ->onDelete('cascade');
                  
            $table->foreign('idU_pasanteB')
                  ->references('idU_pasante')
                  ->on('pasante')
                  ->onDelete('cascade');
                  
            $table->timestamps();
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('mensaje_pas');
    }
};