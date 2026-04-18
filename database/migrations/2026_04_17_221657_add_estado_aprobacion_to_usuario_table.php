<?php
// database/migrations/xxxx_add_estado_aprobacion_to_usuario_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->enum('estado_aprobacion', ['pendiente', 'aprobado', 'rechazado'])
                  ->default('aprobado')
                  ->after('estado_cuenta');
        });
    }

    public function down(): void
    {
        Schema::table('usuario', function (Blueprint $table) {
            $table->dropColumn('estado_aprobacion');
        });
    }
};