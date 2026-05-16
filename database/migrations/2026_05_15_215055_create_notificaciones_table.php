<?php
// database/migrations/[timestamp]_create_notificaciones_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notificaciones', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->text('mensaje');
            $table->string('tipo'); // mensaje, calificacion, pasantia, inscripcion, actividad, comentario
            $table->string('icono')->nullable(); // bell, message, star, calendar, user
            $table->string('url')->nullable();
            $table->unsignedBigInteger('id_usuario');
            $table->string('rol_usuario'); // pasante, jefe, gerente, tutor, admin
            $table->boolean('leido')->default(false);
            $table->date('fecha');
            $table->time('hora');
            $table->timestamps();
            
            $table->index(['id_usuario', 'rol_usuario', 'leido']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('notificaciones');
    }
};