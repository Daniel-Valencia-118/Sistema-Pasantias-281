<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $rol = $this->getRol($user);
        
        $notificaciones = Notificacion::where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->limit(50)
            ->get();
        
        $noLeidas = Notificacion::where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->where('leido', false)
            ->count();
        
        return response()->json([
            'notificaciones' => $notificaciones,
            'no_leidas' => $noLeidas,
        ]);
    }
    
    public function marcarLeida($id)
    {
        $user = Auth::user();
        $rol = $this->getRol($user);
        
        $notificacion = Notificacion::where('id', $id)
            ->where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->firstOrFail();
        
        $notificacion->update(['leido' => true]);
        
        return response()->json(['success' => true]);
    }
    
    public function marcarTodasLeidas()
    {
        $user = Auth::user();
        $rol = $this->getRol($user);
        
        Notificacion::where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->where('leido', false)
            ->update(['leido' => true]);
        
        return response()->json(['success' => true]);
    }
    
    private function getRol($user)
    {
        if ($user->pasante) return 'pasante';
        if ($user->jefePas) return 'jefe';
        if ($user->gerente) return 'gerente';
        if ($user->tutorAca) return 'tutor';
        if ($user->administrador) return 'admin';
        return null;
    }
}