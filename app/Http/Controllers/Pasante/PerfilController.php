<?php
// app/Http/Controllers/Pasante/PerfilController.php
namespace App\Http\Controllers\Pasante;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Pasante;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class PerfilController extends Controller
{
    // Vista del perfil
    public function perfil()
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        return Inertia::render('Pasante/Perfil/Index', [
            'user' => [
                'id' => $user->idUser,
                'nombre' => $user->nombre,
                'ap_paterno' => $user->ap_paterno,
                'ap_materno' => $user->ap_materno,
                'ci' => $user->ci,
                'numero_cel' => $user->numero_cel,
                'fecha_nac' => $user->fecha_nac ? $user->fecha_nac->format('Y-m-d') : null,
                'correo' => $user->correo,
                'nombre_user' => $user->nombre_user,
            ],
            'pasante' => [
                'ru' => $pasante->ru,
                'matricula' => $pasante->matricula,
                'semestre' => $pasante->semestre,
                'mencion' => $pasante->mencion,
            ]
        ]);
    }
    
    // Actualizar perfil (datos personales + académicos)
    public function updatePerfil(Request $request)
    {
        $user = Auth::user();
        $pasante = $user->pasante;
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'ap_paterno' => 'required|string|max:255',
            'ap_materno' => 'required|string|max:255',
            'ci' => [
                'required',
                'string',
                'max:50',
                Rule::unique('usuario', 'ci')->ignore($user->idUser, 'idUser')
            ],
            'numero_cel' => 'required|string|max:20',
            'fecha_nac' => 'required|date',
            'ru' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pasante', 'ru')->ignore($pasante->idU_pasante, 'idU_pasante')
            ],
            'matricula' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pasante', 'matricula')->ignore($pasante->idU_pasante, 'idU_pasante')
            ],
            'semestre' => 'required|integer|min:1|max:10',
            'mencion' => 'required|string|max:255',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Actualizar User
            $user->update([
                'nombre' => $request->nombre,
                'ap_paterno' => $request->ap_paterno,
                'ap_materno' => $request->ap_materno,
                'ci' => $request->ci,
                'numero_cel' => $request->numero_cel,
                'fecha_nac' => $request->fecha_nac,
            ]);
            
            // Actualizar Pasante
            $pasante->update([
                'ru' => $request->ru,
                'matricula' => $request->matricula,
                'semestre' => $request->semestre,
                'mencion' => $request->mencion,
            ]);
            
            DB::commit();
            
            return redirect()->back()->with('success', 'Perfil actualizado correctamente.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Error al actualizar: ' . $e->getMessage()]);
        }
    }
    
    // Vista de cuenta
    public function cuenta()
    {
        $user = Auth::user();
        
        return Inertia::render('Pasante/Cuenta/Index', [
            'user' => [
                'id' => $user->idUser,
                'nombre_user' => $user->nombre_user,
                'correo' => $user->correo,
            ]
        ]);
    }
    
    // Actualizar datos de cuenta (nombre_user, correo)
    public function updateCuenta(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'nombre_user' => [
                'required',
                'string',
                'max:255',
                Rule::unique('usuario', 'nombre_user')->ignore($user->idUser, 'idUser')
            ],
            'correo' => [
                'required',
                'email',
                'max:255',
                Rule::unique('usuario', 'correo')->ignore($user->idUser, 'idUser')
            ],
        ]);
        
        $user->update([
            'nombre_user' => $request->nombre_user,
            'correo' => $request->correo,
        ]);
        
        return redirect()->back()->with('success', 'Datos de cuenta actualizados correctamente.');
    }
    
    // Cambiar contraseña
    public function updatePassword(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'current_password' => 'required|string|min:6',
            'password' => 'required|string|min:6|confirmed',
        ]);
        
        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'La contraseña actual es incorrecta.']);
        }
        
        $user->update([
            'password' => Hash::make($request->password),
        ]);
        
        return redirect()->back()->with('success', 'Contraseña actualizada correctamente.');
    }
}