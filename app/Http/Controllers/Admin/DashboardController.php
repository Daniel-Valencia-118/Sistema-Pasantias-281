<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use App\Models\Empresa;
use App\Models\Pasantia;
use App\Models\Comentario;
use App\Models\JefePas;
use App\Models\Gerente;
use App\Models\TutorAca;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{

    public function index()
    {
        // 1. Estadísticas Globales (KPIs)
        $stats = [
            'usuarios' => User::count(),
            'pasantes' => Pasante::count(),
            'empresas' => Empresa::count(),
            'pasantias_activas' => Pasantia::where('estado', 'activo')->count(),
            // Agregamos solicitudes pendientes (ejemplo: usuarios sin rol o estado específico)
            'solicitudes_pendientes' => User::whereDoesntHave('pasante')
                                        ->whereDoesntHave('jefePas')
                                        ->whereDoesntHave('gerente')
                                        ->whereDoesntHave('tutorAca')
                                        ->whereDoesntHave('administrador')
                                        ->count(),
        ];

        // 2. Distribución de Usuarios por Rol (Para Gráfico de Torta)
        $distribucion_roles = [
            ['name' => 'Pasantes', 'value' => Pasante::count()],
            ['name' => 'Jefes', 'value' => JefePas::count()],
            ['name' => 'Gerentes', 'value' => Gerente::count()],
            ['name' => 'Tutores', 'value' => TutorAca::count()],
        ];

        // 3. Últimos Comentarios del Muro (Monitoreo de comunicación)
        $ultimos_comentarios = Comentario::with(['pasante.user'])
            ->orderBy('fecha', 'desc')
            ->take(5)
            ->get()
            ->map(fn($c) => [
                'id' => $c->id_comentario,
                'autor' => $c->pasante->user->nombre . ' ' . $c->pasante->user->ap_paterno,
                'texto' => $c->descripcion,
                'calificacion' => $c->calificacion,
                'fecha' => $c->fecha,
            ]);

        // 4. Usuarios Recientes (Solicitudes o últimos registrados)
        $usuarios_recientes = User::orderBy('fecha_registro', 'desc')
            ->take(6)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'distribucion_roles' => $distribucion_roles,
            'ultimos_comentarios' => $ultimos_comentarios,
            'usuarios_recientes' => $usuarios_recientes,
        ]);
    }

    public function alertas()
    {
        return Inertia::render('Admin/Alertas');
    }
}