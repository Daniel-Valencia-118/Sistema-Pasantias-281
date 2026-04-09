<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gerente', function (Blueprint $table) {
            $table->integer('idU_gerente')->primary();
            $table->string('nro_secun', 50)->nullable();
            $table->foreign('idU_gerente')->references('idUser')->on('usuario')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gerente');
    }
};