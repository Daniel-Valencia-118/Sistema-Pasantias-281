<?php
// database/migrations/[timestamp]_create_avatars_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('avatars', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_usuario');
            $table->string('ruta');
            $table->string('nombre_original');
            $table->timestamps();
            
            $table->foreign('id_usuario')
                  ->references('idUser')
                  ->on('usuario')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('avatars');
    }
};