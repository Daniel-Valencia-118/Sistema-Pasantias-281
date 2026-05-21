// resources/js/Pages/Admin/Usuarios/Pasantes.jsx
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
import { Search, Edit, ToggleLeft, ToggleRight, UserPlus, GraduationCap } from 'lucide-react';

export default function Pasantes({ pasantes, auth }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    console.log(pasantes);
    

    // Formulario adaptado a la función crearPasante del controlador
    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Datos de Usuario
        nombre_user: '',
        password: '',
        numero_cel: '',
        ci: '',
        correo: '',
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        fecha_nac: '',
        // Datos de Pasante
        ru: '',
        matricula: '',
        semestre: '',
        mencion: '',
    });

    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Pasantes' },
    ];

    const columns = [
        { key: 'nombre', label: 'Nombre Completo' },
        { key: 'ru', label: 'RU' },
        { key: 'semestre_display', label: 'Semestre' },
        { key: 'mencion', label: 'Mención' },
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

    // Procesamiento de datos basado en el JSON recibido
    const processedData = useMemo(() => {
        return pasantes.map(p => ({
            ...p,
            semestre_display: `${p.semestre}° Semestre`,
            estado_label: p.estado_cuenta ? 'Activo' : 'Inactivo',
        }));
    }, [pasantes]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(item =>
            item.nombre.toLowerCase().includes(lowerSearch) ||
            item.ru.toLowerCase().includes(lowerSearch) ||
            item.correo.toLowerCase().includes(lowerSearch) ||
            item.mencion.toLowerCase().includes(lowerSearch)
        );
    }, [processedData, search]);

    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (pasante) => {
        setEditUser(pasante);
        // Nota: El JSON de 'pasantes' no envía todos los campos de usuario por separado (apellidos, ci, etc.)
        // Si el backend los necesita para editar, asegúrate de que el controlador los incluya.
        setData({
            nombre: pasante.nombre || '',
            nombre_user: pasante.nombre_user || '',
            correo: pasante.correo || '',
            ru: pasante.ru || '',
            matricula: pasante.matricula || '',
            semestre: pasante.semestre || '',
            mencion: pasante.mencion || '',
            ap_paterno: pasante.ap_paterno || '', 
            ap_materno: pasante.ap_materno || '',
            ci: pasante.ci || '',
            numero_cel: pasante.numero_cel || '',
            fecha_nac: pasante.fecha_nac || '',
            password: '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('admin.usuarios.pasante.update', editUser.id), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        } else {
            post(route('admin.usuarios.pasante.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        }
    };

    const toggleEstado = (pasante) => {
        setConfirmState({ show: true, user: pasante });
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
            <Head title="Pasantes Universitarios" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary-navy">Gestión de Pasantes</h1>
                {/* <PrimaryButton onClick={openCreateModal}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Pasante
                </PrimaryButton> */}
            </div>

            {/* Buscador */}
            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, RU, correo o mención..."
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
                        <button onClick={() => openEditModal(row)} className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors" title="Editar">
                            <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => toggleEstado(row)} className={`p-1.5 rounded-lg transition-colors ${row.estado_cuenta ? 'text-green-600 hover:text-green-800 hover:bg-green-50' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`} title={row.estado_cuenta ? 'Desactivar' : 'Activar'}>
                            {row.estado_cuenta ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                    </div>
                )}
            />

            {/* Modal Crear/Editar Pasante */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Editar Pasante' : 'Registrar Nuevo Pasante'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sección: Información Personal */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><UserPlus className="h-4 w-4 text-primary-blue" /></span>
                            Datos Personales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <InputLabel htmlFor="nombre" value="Nombre" />
                                <TextInput id="nombre" value={data.nombre} onChange={e => setData('nombre', e.target.value)} className="w-full" required />
                                <InputError message={errors.nombre} />
                            </div>
                            <div>
                                <InputLabel htmlFor="ap_paterno" value="Ap. Paterno" />
                                <TextInput id="ap_paterno" value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} className="w-full" required />
                                <InputError message={errors.ap_paterno} />
                            </div>
                            <div>
                                <InputLabel htmlFor="ap_materno" value="Ap. Materno" />
                                <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} className="w-full" required />
                                <InputError message={errors.ap_materno} />
                            </div>
                            <div>
                                <InputLabel htmlFor="ci" value="CI" />
                                <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full" required />
                                <InputError message={errors.ci} />
                            </div>
                            <div>
                                <InputLabel htmlFor="numero_cel" value="Celular" />
                                <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} className="w-full" required />
                                <InputError message={errors.numero_cel} />
                            </div>
                            <div>
                                <InputLabel htmlFor="fecha_nac" value="Fecha Nacimiento" />
                                <TextInput id="fecha_nac" type="date" value={data.fecha_nac} onChange={e => setData('fecha_nac', e.target.value)} className="w-full" required />
                                <InputError message={errors.fecha_nac} />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Información Académica */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><GraduationCap className="h-4 w-4 text-primary-blue" /></span>
                            Información Académica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="ru" value="Registro Universitario (RU)" />
                                <TextInput id="ru" value={data.ru} onChange={e => setData('ru', e.target.value)} className="w-full" required />
                                <InputError message={errors.ru} />
                            </div>
                            <div>
                                <InputLabel htmlFor="matricula" value="Nro. Matrícula" />
                                <TextInput id="matricula" value={data.matricula} onChange={e => setData('matricula', e.target.value)} className="w-full" required />
                                <InputError message={errors.matricula} />
                            </div>
                            <div>
                                <InputLabel htmlFor="semestre" value="Semestre Actual" />
                                <TextInput id="semestre" type="number" min="1" max="10" value={data.semestre} onChange={e => setData('semestre', e.target.value)} className="w-full" required />
                                <InputError message={errors.semestre} />
                            </div>
                            <div>
                                <InputLabel htmlFor="mencion" value="Mención / Carrera" />
                                <TextInput id="mencion" value={data.mencion} onChange={e => setData('mencion', e.target.value)} className="w-full" required />
                                <InputError message={errors.mencion} />
                            </div>
                        </div>
                    </div>

                    {/* Sección: Credenciales (Solo en creación) */}
                    {!editUser && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1">
                                    <InputLabel htmlFor="nombre_user" value="Usuario" />
                                    <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full" required />
                                    <InputError message={errors.nombre_user} />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="correo" value="Correo Electrónico" />
                                    <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} className="w-full" required />
                                    <InputError message={errors.correo} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password" value="Contraseña" />
                                    <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full" required />
                                    <InputError message={errors.password} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : editUser ? 'Actualizar Pasante' : 'Registrar Pasante'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado_cuenta ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                message={`¿Estás seguro de que deseas cambiar el estado del pasante ${confirmState.user?.nombre}?`}
                confirmText={confirmState.user?.estado_cuenta ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado_cuenta ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}