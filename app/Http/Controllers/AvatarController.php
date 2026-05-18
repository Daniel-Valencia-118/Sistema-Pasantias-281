<?php
// app/Http/Controllers/AvatarController.php

namespace App\Http\Controllers;

use App\Models\Avatar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AvatarController extends Controller
{
    public function update(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png|max:2048', // 2MB, solo JPG y PNG
        ]);
        
        $user = Auth::user();
        
        // Eliminar avatar anterior si existe
        if ($user->avatar) {
            if (Storage::disk('public')->exists($user->avatar->ruta)) {
                Storage::disk('public')->delete($user->avatar->ruta);
            }
            $user->avatar->delete();
        }
        
        // Guardar nueva foto
        $path = $request->file('avatar')->store('avatars', 'public');
        $nombreOriginal = $request->file('avatar')->getClientOriginalName();
        
        Avatar::create([
            'id_usuario' => $user->idUser,
            'ruta' => $path,
            'nombre_original' => $nombreOriginal,
        ]);
        
        return redirect()->back()->with('success', 'Foto de perfil actualizada correctamente.');
    }
}