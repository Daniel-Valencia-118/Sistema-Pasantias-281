<?php
// app/Http/Controllers/Api/NotificacionController.php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificacionController extends Controller
{
    /**
     * Obtener notificaciones del usuario autenticado
     */
    public function index()
    {
        $user = Auth::user();
        $rol = $this->getRolUsuario($user);
        
        $notificaciones = Notificacion::where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->limit(30)
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
    
    /**
     * Marcar notificación como leída
     */
    public function marcarLeida($id)
    {
        $user = Auth::user();
        $rol = $this->getRolUsuario($user);
        
        $notificacion = Notificacion::where('id', $id)
            ->where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->firstOrFail();
        
        $notificacion->update(['leido' => true]);
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Marcar todas como leídas
     */
    public function marcarTodasLeidas()
    {
        $user = Auth::user();
        $rol = $this->getRolUsuario($user);
        
        Notificacion::where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->where('leido', false)
            ->update(['leido' => true]);
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Eliminar notificación
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $rol = $this->getRolUsuario($user);
        
        $notificacion = Notificacion::where('id', $id)
            ->where('id_usuario', $user->idUser)
            ->where('rol_usuario', $rol)
            ->firstOrFail();
        
        $notificacion->delete();
        
        return response()->json(['success' => true]);
    }
    
    /**
     * Obtener el rol del usuario
     */
    private function getRolUsuario($user)
    {
        if ($user->pasante) return 'pasante';
        if ($user->jefePas) return 'jefe';
        if ($user->gerente) return 'gerente';
        if ($user->tutorAca) return 'tutor';
        if ($user->administrador) return 'admin';
        return null;
    }
}