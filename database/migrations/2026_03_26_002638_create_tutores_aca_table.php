<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_aca', function (Blueprint $table) {
            $table->integer('idU_tutor')->primary();
            $table->string('especialidad', 100)->nullable();
            $table->string('grado_aca', 100)->nullable();
            $table->foreign('idU_tutor')->references('idUser')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_aca');
    }
};