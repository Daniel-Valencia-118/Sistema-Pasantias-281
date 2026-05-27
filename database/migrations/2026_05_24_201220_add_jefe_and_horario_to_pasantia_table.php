<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('pasantia', function (Blueprint $table) {
            // Agregar columna idU_jefe como clave foránea (nullable)
            $table->unsignedBigInteger('idU_jefe')->nullable()->after('id_empresa');
            $table->foreign('idU_jefe')
                  ->references('idU_jefe')
                  ->on('jefe_pas')
                  ->onDelete('set null');
            
            // Agregar columna detalles_horario
            $table->text('detalles_horario')->nullable()->after('turno');
        });
    }

    public function down()
    {
        Schema::table('pasantia', function (Blueprint $table) {
            $table->dropForeign(['idU_jefe']);
            $table->dropColumn(['idU_jefe', 'detalles_horario']);
        });
    }
};