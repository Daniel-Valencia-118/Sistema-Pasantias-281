// resources/js/Pages/Admin/Usuarios/Index.jsx
import React, { useState, useMemo } from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
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

export default function Index({ usuarios }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    // Formulario con useForm
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
        { key: 'nombre_completo', label: 'Nombre Completo' },
        { key: 'correo', label: 'Correo' },
        { key: 'rol', label: 'Rol' },
        { key: 'estado', label: 'Estado', render: (val) => (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${val === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {val}
            </span>
        )},
    ];

    // Procesar datos para la tabla
    const processedData = useMemo(() => {
        return usuarios.map(u => ({
            id: u.iduser,
            nombre_completo: `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim(),
            correo: u.correo || u.email,
            rol: u.rol == 'admin' ? 'Administrador' :
                u.rol == 'gerente' ? 'Gerente' :
                u.rol == 'jefePas' ? 'Jefe de Pasantía' :
                u.rol == 'tutorAca' ? 'Tutor Académico' :
                u.rol == 'pasante' ? 'Pasante' : 'Usuario',
            estado: u.estado ? 'Activo' : 'Inactivo',
            nombre_user: u.nombre_user,
            ci: u.ci,
            numero_cel: u.numero_cel,
            fecha_nac: u.fecha_nac,
            // Datos adicionales para edición
            // ...u
        }));
    }, [usuarios]);

    // Filtrar con useMemo
    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(user =>
            user.nombre_completo.toLowerCase().includes(lowerSearch) ||
            user.correo.toLowerCase().includes(lowerSearch) ||
            user.rol.toLowerCase().includes(lowerSearch)
        );
    }, [processedData, search]);

    // Abrir modal para crear
    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setShowModal(true);
    };

    // Abrir modal para editar
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
            // Actualizar usuario (PUT)
            put(route('admin.usuarios.update', editUser.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                preserveScroll: true,
            });
        } else {
            // Crear nuevo usuario (POST)
            post(route('admin.usuarios.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
                preserveScroll: true,
            });
        }
    };

    // Cambio de estado
    const toggleEstado = (user) => {
        setConfirmState({
            show: true,
            user: user,
        });
    };

    const confirmToggleEstado = () => {
        if (confirmState.user) {
            // Usamos Inertia.patch o useForm patch
            const form = useForm({});
            form.patch(route('admin.usuarios.estado', confirmState.user.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmState({ show: false, user: null }),
            });
        }
    };

    const acciones = [
        { label: 'Editar', icon: Edit, onClick: openEditModal, className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' },
        { label: 'Cambiar Estado', icon: ({ className }) => {
            // Necesitamos pasar el ícono dinámico según estado, mejor usamos función render
            // Simplificamos: siempre mostramos ToggleLeft con color condicional
            return <ToggleLeft className={className} />;
            // Pero no podemos cambiar el ícono fácilmente. Lo haremos en el render de la celda.
        }},
    ];

    // Para solucionar el ícono dinámico en acciones, es mejor no usar el array genérico sino renderizar directamente en el DataTable con una columna personalizada. Modificaremos DataTable para aceptar una función `renderActions` o simplemente pasaremos actions como un render.

    // Así que usaremos la prop `actions` pero con una función renderizadora.
    // Actualicemos DataTable para que actions sea una función (row) => JSX
    // Volvemos a DataTable y permitimos `actionsRender` prop.

    return (
        <DashboardLayout>
            <Head title="Todos los Usuarios" />
            <Breadcrumbs items={breadcrumbs} />

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
                    <>
                        <button
                            onClick={() => openEditModal(row)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                            title="Editar"
                        >
                            <Edit className="h-8 w-8" />
                        </button>
                        <button
                            onClick={() => toggleEstado(row)}
                            className={`p-1.5 rounded-lg transition-colors ${
                                row.estado === 'Activo'
                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            }`}
                            title={row.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                        >
                            {row.estado === 'Activo' ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                        </button>
                    </>
                )}
            />

            {/* Modal Crear/Editar */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} placeholder="Nombre" required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_paterno" value="Apellido Paterno" />
                            <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} placeholder="Apellido Paterno" required />
                            <InputError message={errors.ap_paterno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ap_materno" value="Apellido Materno" />
                            <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} placeholder="Apellido Materno" />
                            <InputError message={errors.ap_materno} />
                        </div>
                        <div>
                            <InputLabel htmlFor="nombre_user" value="Nombre de Usuario" />
                            <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} placeholder="Nombre de Usuario" required />
                            <InputError message={errors.nombre_user} />
                        </div>
                        <div>
                            <InputLabel htmlFor="correo" value="Correo Electrónico" />
                            <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} placeholder="Correo Electrónico" required />
                            <InputError message={errors.correo} />
                        </div>
                        <div>
                            <InputLabel htmlFor="ci" value="CI" />
                            <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} placeholder="CI" required />
                            <InputError message={errors.ci} />
                        </div>
                        <div>
                            <InputLabel htmlFor="numero_cel" value="Celular" />
                            <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} placeholder="Número de Celular" />
                            <InputError message={errors.numero_cel} />
                        </div>
                        <div>
                            <InputLabel htmlFor="fecha_nac" value="Fecha de Nacimiento" />
                            <TextInput id="fecha_nac" type="date" value={data.fecha_nac} onChange={e => setData('fecha_nac', e.target.value)} placeholder="Fecha de Nacimiento" />
                            <InputError message={errors.fecha_nac} />
                        </div>
                        {!editUser && (
                            <>
                                <div>
                                    <InputLabel htmlFor="password" value="Contraseña" />
                                    <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required />
                                    <InputError message={errors.password} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña" />
                                    <TextInput id="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : editUser ? 'Actualizar' : 'Crear'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Confirmación de cambio de estado */}
            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado === 'Activo' ? 'Desactivar Usuario' : 'Activar Usuario'}
                message={`¿Estás seguro de que deseas ${confirmState.user?.estado === 'Activo' ? 'desactivar' : 'activar'} a ${confirmState.user?.nombre_completo}?`}
                confirmText={confirmState.user?.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado === 'Activo' ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}