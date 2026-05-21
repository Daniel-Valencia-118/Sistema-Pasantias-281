<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('informe_fin', function (Blueprint $table) {
            // Lo creamos nullable por si ya existen registros en la tabla
            $table->integer('nota_final')->nullable()->after('resultado');
        });

        // Agregar CHECK constraint para nota_final en PostgreSQL
        DB::statement('ALTER TABLE informe_fin ADD CONSTRAINT check_nota_final CHECK (nota_final >= 0 AND nota_final <= 100)');
    }

    public function down(): void
    {
        // En reversa eliminamos primero la restricción y luego la columna
        DB::statement('ALTER TABLE informe_fin DROP CONSTRAINT IF EXISTS check_nota_final');
        
        Schema::table('informe_fin', function (Blueprint $table) {
            $table->dropColumn('nota_final');
        });
    }
};
