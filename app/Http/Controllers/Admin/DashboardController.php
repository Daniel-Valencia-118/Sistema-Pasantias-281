<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'usuarios' => \App\Models\User::count(),
                'pasantes' => \App\Models\Pasante::count(),
                'empresas' => \App\Models\Empresa::count(),
                'pasantias_activas' => \App\Models\Pasantia::where('estado', 'activo')->count(),
            ]
        ]);
    }

    public function alertas()
    {
        return Inertia::render('Admin/Alertas');
    }
}