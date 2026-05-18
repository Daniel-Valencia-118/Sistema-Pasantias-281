<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();
        
        $userData = null;
        if ($user) {
            // Calcular avatar_url directamente aquí
            $avatarUrl = null;
            if ($user->avatar) {
                $avatarUrl = asset('storage/' . $user->avatar->ruta);
            }
            
            $userData = [
                'idUser' => $user->idUser,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'correo' => $user->correo,
                'nombre_user' => $user->nombre_user,
                'estado_cuenta' => $user->estado_cuenta,
                'estado_aprobacion' => $user->estado_aprobacion,
                'avatar_url' => $avatarUrl,
                'role' => $user->role,
            ];
        }

        // return array_merge(parent::share($request), [
        //     'auth' => [
        //         'user' => function () use ($request) {
        //             $user = $request->user();
        //             if ($user) {
        //                 $user->load('administrador','gerente','jefePas','tutorAca','pasante');
        //                 $user->append('rol');
        //             }
        //             return $user;
        //         },
        //     ],
        //     'flash' => [
        //         'message' => fn () => $request->session()->get('message'),
        //         'error' => fn () => $request->session()->get('error'),
        //         'success' => fn () => $request->session()->get('success'),
        //         'warning' => fn () => $request->session()->get('warning'),
        //         'info' => fn () => $request->session()->get('info'),
        //     ],
        // ]);
        
        return array_merge(parent::share($request), [
            'auth' => ['user' => $userData],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
            ],
        ]);
    }
}