<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('presentacion', function (Blueprint $table) {
            $table->id('id_presentacion');
            $table->text('mision')->nullable();
            $table->text('vision')->nullable();
            $table->string('url_logo')->nullable();
            $table->string('nombre_sistema')->default('Sistema de Gestión de Pasantías');
            $table->string('descripcion_corta')->nullable();
            $table->timestamps();
        });

        // Insertar un registro inicial con valores por defecto
        DB::table('presentacion')->insert([
            'mision' => 'Facilitar la conexión entre estudiantes, empresas y la universidad, optimizando el proceso de pasantías para formar profesionales competentes y comprometidos con la excelencia.',
            'vision' => 'Ser el sistema líder en gestión de pasantías universitarias, reconocido por su innovación y eficiencia en la vinculación academia-empresa.',
            'url_logo' => null, // Se usará el logo por defecto del sistema
            'nombre_sistema' => 'Sistema de Gestión de Pasantías',
            'descripcion_corta' => 'Conectando talento con oportunidades',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presentacion');
    }
};