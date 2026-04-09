<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresa', function (Blueprint $table) {
            $table->id('id_empresa');
            $table->string('nombre', 100)->unique();
            $table->string('direccion', 200)->nullable();
            $table->string('email', 100);
            $table->string('nit', 20)->unique();
            $table->string('telefono', 20)->nullable();
            $table->integer('idU_gerente')->unique();
            $table->foreign('idU_gerente')->references('idU_gerente')->on('gerente')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresa');
    }
};