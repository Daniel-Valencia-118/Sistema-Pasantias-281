<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
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

<<<<<<< HEAD
        // Regenerar sesión por seguridad (Previene fijación de sesión)
        $request->session()->regenerate();

        // Redirigir según el rol
        $role = $this->getUserRole($user);
        
        return redirect()->intended($this->redirectTo($role));
=======
        // Redirigir según el rol
        $role = $this->getUserRole($user);
        
        return redirect($this->redirectTo($role));
>>>>>>> yooy33
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

    private function redirectTo($role)
    {
        return match($role) {
<<<<<<< HEAD
            'admin' => '/admin' ,
=======
            'admin' => '/admin',
>>>>>>> yooy33
            'gerente' => '/gerente',
            'jefe' => '/jefe',
            'pasante' => '/pasante',
            'tutor' => '/tutor',
            default => '/dashboard',
        };
    }
}