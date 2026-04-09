<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mensaje', function (Blueprint $table) {
            $table->id('id_mensaje');
            $table->text('descripcion');
            $table->date('fecha')->default(DB::raw('CURRENT_DATE'));
            $table->time('hora')->default(DB::raw('CURRENT_TIME'));
            $table->integer('idU_pasante');
            $table->integer('idU_jefe');
            $table->foreign('idU_pasante')->references('idU_pasante')->on('pasante')->onDelete('cascade');
            $table->foreign('idU_jefe')->references('idU_jefe')->on('jefe_pas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mensaje');
    }
};