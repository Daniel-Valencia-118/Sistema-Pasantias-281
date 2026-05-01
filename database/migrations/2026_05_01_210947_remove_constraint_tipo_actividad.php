<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE actividad DROP CONSTRAINT check_tipo_actividad');
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE actividad ADD CONSTRAINT check_tipo_actividad CHECK (tipo IN ('colectiva', 'individual'))");
    }
};