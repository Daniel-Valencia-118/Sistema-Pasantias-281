// resources/js/Pages/Admin/Usuarios/Administradores.jsx
import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { Search, Edit, ToggleLeft, ToggleRight, UserPlus } from 'lucide-react';

export default function Administradores({ administradores, auth }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    // Formulario adaptado incluyendo correo_secundario
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre_user: '',
        correo: '',
        correo_secundario: '', // Campo específico de Administrador
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        password: '',
        password_confirmation: '',
        ci: '',
        numero_cel: '',
        fecha_nac: '',
    });

    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Administradores' },
    ];

    const columns = [
        { key: 'nombre_completo', label: 'Nombre Completo' },
        { key: 'correo', label: 'Correo' },
        { key: 'correo_secundario', label: 'Correo Secundario' },
        { 
            key: 'estado_label', 
            label: 'Estado', 
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${val === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {val}
                </span>
            )
        },
    ];

    // Mapeo de datos considerando la estructura anidada u.user
    const processedData = useMemo(() => {
        return administradores.map(admi => {
            const u = admi.user;
            return {
                id: u.idUser, // Usamos el ID del usuario para las acciones de cuenta
                id_admin: admi.idU_admi,
                nombre_completo: `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim(),
                correo: u.correo,
                correo_secundario: admi.correo_secundario || 'N/A',
                estado: u.estado_cuenta,
                estado_label: u.estado_cuenta ? 'Activo' : 'Inactivo',
                nombre_user: u.nombre_user,
                ci: u.ci,
                numero_cel: u.numero_cel,
                fecha_nac: u.fecha_nac ? u.fecha_nac.split('T')[0] : '', // Limpiar formato de fecha para input
                nombre: u.nombre,
                ap_paterno: u.ap_paterno,
                ap_materno: u.ap_materno,
            };
        });
    }, [administradores]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(user =>
            user.nombre_completo.toLowerCase().includes(lowerSearch) ||
            user.correo.toLowerCase().includes(lowerSearch) ||
            user.nombre_user.toLowerCase().includes(lowerSearch)
        );
    }, [processedData, search]);

    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditUser(user);
        setData({
            nombre_user: user.nombre_user || '',
            correo: user.correo || '',
            correo_secundario: user.correo_secundario === 'N/A' ? '' : user.correo_secundario,
            nombre: user.nombre || '',
            ap_paterno: user.ap_paterno || '',
            ap_materno: user.ap_materno || '',
            password: '',
            password_confirmation: '',
            ci: user.ci || '',
            numero_cel: user.numero_cel || '',
            fecha_nac: user.fecha_nac || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('admin.usuarios.update', editUser.id), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        } else {
            post(route('admin.administradores.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        }
    };

    const toggleEstado = (user) => {
        setConfirmState({ show: true, user: user });
    };

    const confirmToggleEstado = () => {
        if (confirmState.user) {
            router.patch(route('admin.usuarios.estado', confirmState.user.id), {}, {
                preserveScroll: true,
                onSuccess: () => setConfirmState({ show: false, user: null }),
            });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Administradores" />
            {/* <Breadcrumbs items={breadcrumbs} /> */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary-navy">Gestión de Administradores</h1>
                <PrimaryButton onClick={openCreateModal}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Administrador
                </PrimaryButton>
            </div>

            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar administrador..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-sky-blue/20 focus:border-primary-blue transition-colors text-sm"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredData}
                actionsRender={(row) => (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => openEditModal(row)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            title="Editar"
                        >
                            <Edit className="h-5 w-5" />
                        </button>
                        {/* Si el administrador es el actual usuario autenticado no mostrar el botón de toggle */}
                        {auth.user.idUser !== row.id && ( 
                            <button
                                onClick={() => toggleEstado(row)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                    row.estado
                                        ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                        : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                }`}
                                title={row.estado ? 'Desactivar' : 'Activar'}
                            >
                                {row.estado ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                            </button>
                        )}
                        {/* </div> */}

                    </div>
                )}
            />

            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Editar Administrador' : 'Crear Administrador'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} className="w-full" required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_paterno" value="Apellido Paterno" />
                            <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} className="w-full" required />
                            <InputError message={errors.ap_paterno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_materno" value="Apellido Materno" />
                            <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} className="w-full" />
                            <InputError message={errors.ap_materno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="nombre_user" value="Nombre de Usuario" />
                            <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full" required />
                            <InputError message={errors.nombre_user} />
                        </div>
                        <div>
                            <InputLabel htmlFor="correo" value="Correo Principal" />
                            <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} className="w-full" required />
                            <InputError message={errors.correo} />
                        </div>
                        <div>
                            <InputLabel htmlFor="correo_secundario" value="Correo Secundario" />
                            <TextInput id="correo_secundario" type="email" value={data.correo_secundario} onChange={e => setData('correo_secundario', e.target.value)} className="w-full" />
                            <InputError message={errors.correo_secundario} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ci" value="CI" />
                            <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full" required />
                            <InputError message={errors.ci} />
                        </div>
                        <div>
                            <InputLabel htmlFor="numero_cel" value="Celular" />
                            <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} className="w-full" />
                            <InputError message={errors.numero_cel} />
                        </div>
                        <div>
                            <InputLabel htmlFor="fecha_nac" value="Fecha de Nacimiento" />
                            <TextInput id="fecha_nac" type="date" value={data.fecha_nac} onChange={e => setData('fecha_nac', e.target.value)} className="w-full" />
                            <InputError message={errors.fecha_nac} />
                        </div>
                        {!editUser && (
                            <>
                                <div>
                                    <InputLabel htmlFor="password" value="Contraseña" />
                                    <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full" required />
                                    <InputError message={errors.password} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} className="w-full" required />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : editUser ? 'Actualizar' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado ? 'Desactivar Administrador' : 'Activar Administrador'}
                message={`¿Estás seguro de que deseas cambiar el estado de ${confirmState.user?.nombre_completo}?`}
                confirmText={confirmState.user?.estado ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}