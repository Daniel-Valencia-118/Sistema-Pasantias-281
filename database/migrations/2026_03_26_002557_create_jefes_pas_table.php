<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jefe_pas', function (Blueprint $table) {
            $table->integer('idU_jefe')->primary();
            $table->string('cargo', 100)->nullable();
            $table->string('area', 100)->nullable();
            $table->unsignedBigInteger('id_empresa');
            $table->foreign('idU_jefe')->references('idUser')->on('usuario')->onDelete('cascade');
            $table->foreign('id_empresa')->references('id_empresa')->on('empresa')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jefe_pas');
    }
};