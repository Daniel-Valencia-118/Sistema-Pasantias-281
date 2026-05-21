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

    // public function share(Request $request): array
    // {
    //     $user = $request->user();
        
    //     $userData = null;
    //     if ($user) {
    //         // Calcular avatar_url directamente aquí
    //         $avatarUrl = null;
    //         if ($user->avatar) {
    //             $avatarUrl = asset('storage/' . $user->avatar->ruta);
    //         }
            
    //         $userData = [
    //             'idUser' => $user->idUser,
    //             'nombre' => $user->nombre,
    //             'ap_paterno' => $user->ap_paterno,
    //             'ap_materno' => $user->ap_materno,
    //             'correo' => $user->correo,
    //             'nombre_user' => $user->nombre_user,
    //             'estado_cuenta' => $user->estado_cuenta,
    //             'estado_aprobacion' => $user->estado_aprobacion,
    //             'avatar_url' => $avatarUrl,
    //             'rol' => $user->rol,
    //         ];
    //     }

    //     // return array_merge(parent::share($request), [
    //     //     'auth' => [
    //     //         'user' => function () use ($request) {
    //     //             $user = $request->user();
    //     //             if ($user) {
    //     //                 $user->load('administrador','gerente','jefePas','tutorAca','pasante');
    //     //                 $user->append('rol');
    //     //             }
    //     //             return $user;
    //     //         },
    //     //     ],
    //     //     'flash' => [
    //     //         'message' => fn () => $request->session()->get('message'),
    //     //         'error' => fn () => $request->session()->get('error'),
    //     //         'success' => fn () => $request->session()->get('success'),
    //     //         'warning' => fn () => $request->session()->get('warning'),
    //     //         'info' => fn () => $request->session()->get('info'),
    //     //     ],
    //     // ]);
        
    //     return array_merge(parent::share($request), [
    //         'auth' => ['user' => $userData],
    //         'flash' => [
    //             'message' => fn () => $request->session()->get('message'),
    //             'error' => fn () => $request->session()->get('error'),
    //             'success' => fn () => $request->session()->get('success'),
    //             'warning' => fn () => $request->session()->get('warning'),
    //             'info' => fn () => $request->session()->get('info'),
    //         ],
    //     ]);
    // }

       /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        
        $userData = null;
        if ($user) {
            // 1. Cargar relaciones y appends necesarios para tus módulos
            $user->load('administrador', 'gerente', 'jefePas', 'tutorAca', 'pasante');
            $user->append('rol');

            // 2. Calcular la URL del avatar del usuario
            $avatarUrl = null;
            if ($user->avatar) {
                $avatarUrl = asset('storage/' . $user->avatar->ruta);
            }
            
            // 3. Estructurar el objeto del usuario combinando ambas lógicas
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
                'rol' => $user->rol,
                // Conservamos relaciones mapeadas si tu frontend las requiere directamente:
                'administrador' => $user->administrador,
                'gerente' => $user->gerente,
                'jefe_pas' => $user->jefePas,
                'tutor_aca' => $user->tutorAca,
                'pasante' => $user->pasante,
                'rol_personalizado' => $user->rol, 
            ];
        }
        
        return array_merge(parent::share($request), [
            // Datos compartidos globales para autenticación
            'auth' => [
                'user' => $userData
            ],
            // Los 5 canales completos listos para escuchar en tu Toast.jsx
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
                'success' => fn () => $request->session()->get('success'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
        ]);
    }
}
