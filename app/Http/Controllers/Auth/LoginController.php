<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Pasantia;
use App\Models\Inscripcion;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        // Buscar usuario por nombre_user o correo
        $user = User::where('nombre_user', $request->login)
            ->orWhere('correo', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors([
                'login' => 'Credenciales incorrectas.',
            ]);
        }

        // Verificar estado de aprobación
        if ($user->estado_aprobacion != 'aprobado') {
            $mensaje = $user->estado_aprobacion == 'pendiente' 
                ? 'Tu cuenta está pendiente de aprobación.'
                : 'Tu cuenta fue rechazada.';
            return back()->withErrors(['login' => $mensaje]);
        }

        // Verificar si la cuenta está activa
        if (!$user->estado_cuenta) {
            return back()->withErrors(['login' => 'Cuenta deshabilitada por el administrador.']);
        }

        // Iniciar sesión
        Auth::login($user, $request->remember ?? false);

        // Redirigir según el rol
        $role = $this->getUserRole($user);
        
        //return redirect($this->redirectTo($role));
         // Redirigir según el rol
        return redirect($this->redirectTo($user, $role)); //NUEVO
    }

    private function getUserRole($user)
    {
        if ($user->administrador) return 'admin';
        if ($user->pasante) return 'pasante';
        if ($user->gerente) return 'gerente';
        if ($user->jefePas) return 'jefe';
        if ($user->tutorAca) return 'tutor';
        return null;
    }

    //REDIRECCIONAMIENTOS AL INICIAR SESION:
    
     private function redirectTo($user, $role)
    {
        // Redirección por defecto según rol
        $baseRedirect = match($role) {
            'admin' => '/admin',
            'gerente' => $this->getGerenteRedirect($user),
            'jefe' => '/jefe',
            'pasante' => $this->getPasanteRedirect($user),
            'tutor' => '/tutor',
            default => '/dashboard',
        };
        
        return $baseRedirect;
    }
 
    /**
     * Redirección personalizada para el gerente
     */
    private function getGerenteRedirect($user)
    {
        // Obtener la empresa del gerente
        $empresa = $user->gerente->empresa;
        
        if (!$empresa) {
            return '/gerente/pasantias/crear';
        }
        
        // Verificar si existe al menos una pasantía en estado ABIERTA o INICIADO
        $tienePasantiasActivas = Pasantia::where('id_empresa', $empresa->id_empresa)
            ->whereIn('estado', ['ABIERTA', 'INICIADO'])
            ->exists();
        
        if ($tienePasantiasActivas) {
            return '/gerente/pasantias';
        }
        
        return '/gerente/pasantias/crear';
    }


    /**
     * Redirección personalizada para el pasante
     */
    private function getPasanteRedirect($user)
    {
        $pasante = $user->pasante;
        
        if (!$pasante) {
            return '/pasante';
        }
        
        // Verificar si tiene al menos una inscripción en estado 'inscrito' o 'iniciado'
        $tieneInscripcionActiva = Inscripcion::where('idU_pasante', $pasante->idU_pasante)
            ->whereIn('estado', ['inscrito', 'iniciado'])
            ->exists();
        
        if ($tieneInscripcionActiva) {
            return '/pasante/inscripciones/activas';
        }
        
        return '/pasante/inscribirse';
    }
}