<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inscripcion', function (Blueprint $table) {
            $table->id('id_inscripcion');
            $table->date('fecha_insc')->default(DB::raw('CURRENT_DATE'));
            $table->time('hora_insc')->default(DB::raw('CURRENT_TIME'));
            $table->string('estado', 20)->default('inscrito');
            $table->integer('idU_pasante');
            $table->unsignedBigInteger('id_pasantia');
            $table->integer('idU_jefe')->nullable();
            $table->foreign('idU_pasante')->references('idU_pasante')->on('pasante')->onDelete('cascade');
            $table->foreign('id_pasantia')->references('id_pasantia')->on('pasantia')->onDelete('cascade');
            $table->foreign('idU_jefe')->references('idU_jefe')->on('jefe_pas')->onDelete('set null');
            $table->unique(['idU_pasante', 'id_pasantia']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inscripcion');
    }
};