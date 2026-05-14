import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User, Lock, Save, X, ShieldCheck, Smartphone, Hash, AtSign } from 'lucide-react';

export default function Perfil({ auth, usuario, admi }) {
    const [editando, setEditando] = useState(false);
    const [cambiandoPass, setCambiandoPass] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        // Datos de la tabla 'usuario'
        nombre: usuario.nombre || '',
        ap_paterno: usuario.ap_paterno || '',
        ap_materno: usuario.ap_materno || '',
        nombre_user: usuario.nombre_user || '',
        correo: usuario.correo || '',
        numero_cel: usuario.numero_cel || '',
        ci: usuario.ci || '',
        // Datos de la tabla 'administrador'
        correo_secundario: usuario?.correo_secundario || '',
        // Contraseñas
        password: '',
        password_confirmation: '',
    });

    console.log(usuario);
    

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.perfil.update'), {
            onSuccess: () => {
                setEditando(false);
                setCambiandoPass(false);
                reset('password', 'password_confirmation');
            },
        });
    };

    const breadcrumbs = [
        { label: 'Inicio', href: route('admin.dashboard') },
        { label: 'Mi Perfil' },
    ];

    return (
        <DashboardLayout auth={auth} header="Gestión de Perfil">
            <Head title="Mi Perfil" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-5xl mx-auto mt-6 pb-12">
                {/* --- HEADER DE PERFIL --- */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 bg-primary-navy rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-100 ring-4 ring-blue-50">
                            {usuario.nombre.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {usuario.nombre} {usuario.ap_paterno}
                            </h2>
                            <p className="text-primary-blue font-semibold flex items-center gap-1.5 uppercase text-xs tracking-wider">
                                <ShieldCheck size={14} /> Administrador
                            </p>
                        </div>
                    </div>
                    {!editando ? (
                        <PrimaryButton onClick={() => setEditando(true)} className="gap-2 px-6">
                            <User size={18} /> Editar Mi Perfil
                        </PrimaryButton>
                    ) : (
                        <SecondaryButton onClick={() => { setEditando(false); reset(); }} className="gap-2 px-6">
                            <X size={18} /> Cancelar Edición
                        </SecondaryButton>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- COLUMNA IZQUIERDA: INFORMACIÓN PERSONAL --- */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <User className="text-primary-blue" size={20} />
                                <h3 className="text-lg font-bold text-gray-800">Información Personal</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div>
                                    <InputLabel htmlFor="nombre" value="Nombre(s)" />
                                    <TextInput 
                                        id="nombre"
                                        value={data.nombre} 
                                        onChange={e => setData('nombre', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="nombre_user" value="Nombre de Usuario (@)" />
                                    <TextInput 
                                        id="nombre_user"
                                        value={data.nombre_user} 
                                        onChange={e => setData('nombre_user', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.nombre_user} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_paterno" value="Apellido Paterno" />
                                    <TextInput 
                                        id="ap_paterno"
                                        value={data.ap_paterno} 
                                        onChange={e => setData('ap_paterno', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.ap_paterno} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_materno" value="Apellido Materno" />
                                    <TextInput 
                                        id="ap_materno"
                                        value={data.ap_materno} 
                                        onChange={e => setData('ap_materno', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.ap_materno} />
                                </div>
                            </div>
                        </div>

                        {/* --- SECCIÓN DE SEGURIDAD (PASSWORD) --- */}
                        {editando && (
                            <div className="bg-primary-navy/5 p-8 rounded-2xl border border-primary-navy/10">
                                <button 
                                    type="button" 
                                    onClick={() => setCambiandoPass(!cambiandoPass)}
                                    className="flex items-center gap-2 text-primary-navy font-bold hover:text-primary-blue transition-colors"
                                >
                                    <Lock size={18} /> 
                                    {cambiandoPass ? "Mantener contraseña actual" : "¿Deseas cambiar tu contraseña?"}
                                </button>
                                
                                {cambiandoPass && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in zoom-in-95 duration-300">
                                        <div>
                                            <InputLabel value="Nueva Contraseña" />
                                            <TextInput 
                                                type="password"
                                                autoComplete="new-password"
                                                onChange={e => setData('password', e.target.value)}
                                                placeholder="Mínimo 8 caracteres"
                                            />
                                            <InputError message={errors.password} />
                                        </div>
                                        <div>
                                            <InputLabel value="Confirmar Nueva Contraseña" />
                                            <TextInput 
                                                type="password"
                                                onChange={e => setData('password_confirmation', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- COLUMNA DERECHA: DATOS DE CONTACTO Y CUENTA --- */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <AtSign className="text-primary-blue" size={20} />
                                <h3 className="text-lg font-bold text-gray-800">Contacto y Cuenta</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <InputLabel value="Cédula de Identidad (CI)" />
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <TextInput 
                                            className={`pl-10 ${!editando ? 'bg-gray-50 border-transparent' : ''}`}
                                            value={data.ci} 
                                            onChange={e => setData('ci', e.target.value)}
                                            disabled={!editando}
                                        />
                                    </div>
                                    <InputError message={errors.ci} />
                                </div>

                                <div>
                                    <InputLabel value="Número de Celular" />
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 text-gray-400" size={16} />
                                        <TextInput 
                                            className={`pl-10 ${!editando ? 'bg-gray-50 border-transparent' : ''}`}
                                            value={data.numero_cel} 
                                            onChange={e => setData('numero_cel', e.target.value)}
                                            disabled={!editando}
                                        />
                                    </div>
                                    <InputError message={errors.numero_cel} />
                                </div>

                                <div>
                                    <InputLabel value="Correo Principal" />
                                    <TextInput 
                                        type="email"
                                        value={data.correo} 
                                        onChange={e => setData('correo', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.correo} />
                                </div>

                                <div>
                                    <InputLabel value="Correo de Respaldo" />
                                    <TextInput 
                                        type="email"
                                        value={data.correo_secundario} 
                                        onChange={e => setData('correo_secundario', e.target.value)}
                                        disabled={!editando}
                                        className={!editando ? 'bg-gray-50 border-transparent' : ''}
                                    />
                                    <InputError message={errors.correo_secundario} />
                                </div>
                            </div>

                            {editando && (
                                <div className="mt-8">
                                    <PrimaryButton 
                                        className="w-full justify-center py-4 rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                                        disabled={processing}
                                    >
                                        <Save size={20} className="mr-2" /> 
                                        {processing ? 'Guardando...' : 'Guardar Cambios'}
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}