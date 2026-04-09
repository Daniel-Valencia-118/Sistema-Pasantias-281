<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasante', function (Blueprint $table) {
            $table->integer('idU_pasante')->primary();
            $table->string('ru', 20)->unique();
            $table->string('matricula', 20)->unique();
            $table->integer('semestre');
            $table->string('mencion', 100)->nullable();
            $table->integer('idU_tutor')->nullable();
            $table->foreign('idU_pasante')->references('idUser')->on('usuario')->onDelete('cascade');
            $table->foreign('idU_tutor')->references('idU_tutor')->on('tutor_aca')->onDelete('set null');
        });

        // Agregar CHECK constraint para semestre
        DB::statement('ALTER TABLE pasante ADD CONSTRAINT check_semestre CHECK (semestre > 0 AND semestre <= 10)');
    }

    public function down(): void
    {
        Schema::dropIfExists('pasante');
    }
};