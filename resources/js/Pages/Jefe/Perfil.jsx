import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { User, Lock, Save, X } from 'lucide-react';

export default function Perfil({ usuario, jefe, auth }) {
    const [editando, setEditando] = useState(false);
    const [cambiandoPassword, setCambiandoPassword] = useState(false);

    console.log(usuario, jefe);
    

    const { data, setData, put, processing, errors, reset } = useForm({
        nombre: usuario.nombre,
        ap_paterno: usuario.ap_paterno,
        ap_materno: usuario.ap_materno || '',
        ci: usuario.ci || '',
        numero_cel: usuario.numero_cel || '',
        correo: usuario.correo,
        cargo: jefe.cargo || '',
        area: jefe.area || '',
        password_actual: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/jefe/perfil', {
            onSuccess: () => {
                setEditando(false);
                setCambiandoPassword(false);
                reset();
            },
        });
    };

    const breadcrumbs = [
        { label: 'Inicio', href: '/jefe' },
        { label: 'Perfil' },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mi Perfil" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-primary-navy">Mi Perfil</h1>
                    {!editando ? (
                        <PrimaryButton onClick={() => setEditando(true)} className="gap-2">
                            <User size={18} /> Editar Perfil
                        </PrimaryButton>
                    ) : (
                        <SecondaryButton onClick={() => setEditando(false)} className="gap-2">
                            <X size={18} /> Cancelar
                        </SecondaryButton>
                    )}
                </div>

                {/* Datos personales */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-primary-navy mb-4">Información Personal</h2>
                    {!editando ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="Nombre" value={`${usuario.nombre} ${usuario.ap_paterno} ${usuario.ap_materno}`} />
                            <InfoItem label="Usuario" value={usuario.nombre_user} />
                            <InfoItem label="Correo" value={usuario.correo} />
                            <InfoItem label="Carnet" value={usuario.ci} />
                            <InfoItem label="Celular" value={usuario.numero_cel} />
                            <InfoItem label="Empresa" value={jefe.empresa} />
                            <InfoItem label="Cargo" value={jefe.cargo || 'No definido'} />
                            <InfoItem label="Área" value={jefe.area || 'No definida'} />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="nombre" value="Nombre" />
                                    <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} required />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_paterno" value="Ap. Paterno" />
                                    <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} required />
                                    <InputError message={errors.ap_paterno} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_materno" value="Ap. Materno" />
                                    <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} />
                                    <InputError message={errors.ap_materno} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ci" value="CI" />
                                    <TextInput id="ci" type="number" value={data.ci} onChange={e => setData('ci', e.target.value)} required />
                                    <InputError message={errors.ci} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="numero_cel" value="Celular" />
                                    <TextInput id="numero_cel" type="number" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} required />
                                    <InputError message={errors.numero_cel} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="correo" value="Correo" />
                                    <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} required />
                                    <InputError message={errors.correo} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="cargo" value="Cargo" />
                                    <TextInput id="cargo" value={data.cargo} onChange={e => setData('cargo', e.target.value)} />
                                    <InputError message={errors.cargo} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="area" value="Área" />
                                    <TextInput id="area" value={data.area} onChange={e => setData('area', e.target.value)} />
                                    <InputError message={errors.area} />
                                </div>
                            </div>

                            {/* Cambio de contraseña */}
                            <div className="border-t pt-4 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setCambiandoPassword(!cambiandoPassword)}
                                    className="flex items-center gap-2 text-primary-blue hover:text-primary-sky-blue font-medium"
                                >
                                    <Lock size={16} /> {cambiandoPassword ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
                                </button>
                                {cambiandoPassword && (
                                    <div className="space-y-3 mt-3">
                                        <div>
                                            <InputLabel htmlFor="password_actual" value="Contraseña actual" />
                                            <TextInput id="password_actual" type="password" value={data.password_actual} onChange={e => setData('password_actual', e.target.value)} />
                                            <InputError message={errors.password_actual} />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="password" value="Nueva contraseña" />
                                            <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
                                            <InputError message={errors.password} />
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="password_confirmation" value="Confirmar nueva contraseña" />
                                            <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                                            <InputError message={errors.password_confirmation} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4">
                                <PrimaryButton type="submit" disabled={processing}>
                                    <Save size={18} className="mr-2" /> Guardar cambios
                                </PrimaryButton>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoItem({ label, value }) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-gray-900">{value || '—'}</p>
        </div>
    );
}