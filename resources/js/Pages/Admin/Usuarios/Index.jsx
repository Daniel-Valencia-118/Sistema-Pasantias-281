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

export default function Index({ usuarios, auth }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    console.log(usuarios);
    

    // Formulario principal definido en el nivel superior (cumpliendo reglas de React 19)
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre_user: '',
        correo: '',
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        password: '',
        password_confirmation: '',
        ci: '',
        numero_cel: '',
        fecha_nac: '',
    });

    // Breadcrumbs
    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Todos los Usuarios' },
    ];

    // Columnas de la tabla
    const columns = [
        { key: 'nombre_completo', label: 'Nombre Completo', sortable: true },
        { key: 'correo', label: 'Correo', sortable: true },
        { key: 'rol_display', label: 'Rol', sortable: true },
        { 
            key: 'estado_label', 
            label: 'Estado', 
            sortable: true, 
            render: (val) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${val === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {val}
                </span>
            )
        },
    ];

    // Procesar datos para la tabla basándose en el JSON del backend
    const processedData = useMemo(() => {
        return usuarios.map(u => ({
            ...u, // Mantenemos los datos originales (id, nombre_user, etc.)
            nombre_completo: `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim(),
            rol_display: u.rol === 'admin' ? 'Administrador' :
                         u.rol === 'gerente' ? 'Gerente' :
                         u.rol === 'jefe' ? 'Jefe de Pasantía' :
                         u.rol === 'tutor' ? 'Tutor Académico' :
                         u.rol === 'pasante' ? 'Pasante' : 'Usuario',
            estado_label: u.estado ? 'Activo' : 'Inactivo',
        }));
    }, [usuarios]);

    // Filtrar con useMemo
    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(user =>
            user.nombre_completo.toLowerCase().includes(lowerSearch) ||
            user.correo.toLowerCase().includes(lowerSearch) ||
            user.rol_display.toLowerCase().includes(lowerSearch)
        );
    }, [processedData, search]);

    // Lógica de Modales
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
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                preserveScroll: true,
            });
        } else {
            post(route('admin.usuarios.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                preserveScroll: true,
            });
        }
    };

    // Cambio de estado corregido (usando router.patch directamente para evitar mal uso de hooks)
    const toggleEstado = (user) => {
        setConfirmState({
            show: true,
            user: user,
        });
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
            <Head title="Todos los Usuarios" />
            {/* <Breadcrumbs items={breadcrumbs} /> */}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary-navy">Todos los Usuarios</h1>
                <PrimaryButton onClick={openCreateModal}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear Usuario
                </PrimaryButton>
            </div>

            {/* Buscador */}
            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o rol..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-sky-blue/20 focus:border-primary-blue transition-colors text-sm"
                />
            </div>

            {/* Tabla */}
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
                    </div>
                )}
            />

            {/* Modal Crear/Editar */}
{/* Modal de persistencia */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Modificar Usuario' : 'Registrar Nuevo Usuario'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_paterno" value="Apellido Paterno" />
                            <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.ap_paterno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_materno" value="Apellido Materno (Opcional)" />
                            <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} className="w-full mt-1" />
                            <InputError message={errors.ap_materno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="nombre_user" value="Nombre de Usuario" />
                            <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.nombre_user} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="correo" value="Correo Electrónico" />
                            <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.correo} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ci" value="Documento de Identidad (CI)" />
                            <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full mt-1" required />
                            <InputError message={errors.ci} />
                        </div>
                        <div>
                            <InputLabel htmlFor="numero_cel" value="Número de Celular" />
                            <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} className="w-full mt-1" />
                            <InputError message={errors.numero_cel} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="fecha_nac" value="Fecha de Nacimiento" />
                            <TextInput 
                            id="fecha_nac" 
                            type="date" 
                            value={data.fecha_nac ? data.fecha_nac.substring(0, 10) : ''} 
                            onChange={e => setData('fecha_nac', e.target.value)} 
                            className="w-full mt-1" 
                            />
                            <InputError message={errors.fecha_nac} />
                        </div>

                        {/* Campos de password adaptables */}
                        <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 md:col-span-2 space-y-4 mt-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                                {editUser ? 'Restablecer Credenciales (Opcional)' : 'Credenciales de Acceso'}
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="password" value={editUser ? "Nueva Contraseña" : "Contraseña"} />
                                    <TextInput 
                                        id="password" 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="w-full mt-1" 
                                        required={!editUser} 
                                        placeholder={editUser ? "Dejar en blanco para conservar" : "••••••••"}
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                                    <TextInput 
                                        id="password_confirmation" 
                                        type="password" 
                                        value={data.password_confirmation} 
                                        onChange={e => setData('password_confirmation', e.target.value)} 
                                        className="w-full mt-1" 
                                        required={!editUser}
                                        placeholder={editUser ? "Dejar en blanco para conservar" : "••••••••"}
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Procesando...' : editUser ? 'Guardar Cambios' : 'Registrar'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmación de cambio de estado */}
            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado ? 'Desactivar Usuario' : 'Activar Usuario'}
                message={`¿Estás seguro de que deseas ${confirmState.user?.estado ? 'desactivar' : 'activar'} a ${confirmState.user?.nombre_completo}?`}
                confirmText={confirmState.user?.estado ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}