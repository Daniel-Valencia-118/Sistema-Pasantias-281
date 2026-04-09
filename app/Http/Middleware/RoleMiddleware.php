<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  ...$roles  // Los roles permitidos
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        
        // Verificar que el usuario está autenticado
        if (!$user) {
            return response()->json([
                'message' => 'No autenticado. Por favor, inicie sesión.'
            ], 401);
        }
        
        // Determinar el rol del usuario
        $userRole = $this->getUserRole($user);
        
        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!in_array($userRole, $roles)) {
            return response()->json([
                'message' => 'No autorizado. No tienes permiso para acceder a este recurso.',
                'required_roles' => $roles,
                'your_role' => $userRole
            ], 403);
        }
        
        return $next($request);
    }
    
    /**
     * Determinar el rol del usuario basado en qué perfil tiene
     */
    private function getUserRole($user)
    {
        if ($user->administrador) {
            return 'admin';
        }
        if ($user->pasante) {
            return 'pasante';
        }
        if ($user->gerente) {
            return 'gerente';
        }
        if ($user->jefePas) {
            return 'jefe';
        }
        if ($user->tutorAca) {
            return 'tutor';
        }
        return null;
    }
}