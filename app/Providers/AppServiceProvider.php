<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
//use Laravel\Sanctum\Sanctum; 

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Solo fuerza HTTPS si la petición NO viene de localhost directo
    // Evaluamos el dominio exacto que está haciendo la petición actual
    // $host = request()->getHost();

    // if ($host === '127.0.0.1' || $host === 'localhost') {
    //     URL::forceScheme('http'); // Fuerza HTTP sin seguridad para tu entorno local
    // } elseif (str_contains($host, 'loca.lt')) {
    //     URL::forceScheme('https'); // Fuerza HTTPS únicamente para el túnel de tu equipo
    // }
    //         //Sanctum::ignoreMigrations(); //
    }
}
