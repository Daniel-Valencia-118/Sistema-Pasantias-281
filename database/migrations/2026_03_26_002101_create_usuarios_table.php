<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->id('idUser');
            $table->string('nombre_user', 100)->unique();
            $table->string('password', 255);
            $table->string('numero_cel', 20);
            $table->string('ci', 20)->unique();
            $table->string('correo', 100)->unique();
            $table->string('nombre', 50);
            $table->string('ap_paterno', 50);
            $table->string('ap_materno', 50);
            $table->date('fecha_nac');
            $table->boolean('estado_cuenta')->default(true);
            $table->timestamp('fecha_registro')->default(DB::raw('CURRENT_TIMESTAMP'));
            $table->timestamps(); // created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};