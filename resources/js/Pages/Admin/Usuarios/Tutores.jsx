// resources/js/Pages/Admin/Usuarios/Tutores.jsx
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
import { Search, Edit, ToggleLeft, ToggleRight, UserPlus, BookOpen } from 'lucide-react';

export default function Tutores({ tutores, auth }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    // Formulario alineado a la función crearTutor
    const { data, setData, post, put, processing, errors, reset } = useForm({
        nombre_user: '',
        password: '',
        numero_cel: '',
        ci: '',
        correo: '',
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        fecha_nac: '',
        especialidad: '',
        grado_aca: '',
    });

    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Tutores' },
    ];

    const columns = [
        { key: 'nombre_completo', label: 'Nombre Completo' },
        { key: 'grado_aca', label: 'Grado' },
        { key: 'especialidad', label: 'Especialidad' },
        { key: 'correo', label: 'Correo' },
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

    // Procesamiento de datos anidados (tutor.user)
    const processedData = useMemo(() => {
        return tutores.map(t => {
            const u = t.user;
            return {
                id: u.idUser,
                id_tutor: t.idU_tutor,
                nombre_completo: `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim(),
                grado_aca: t.grado_aca || 'N/A',
                especialidad: t.especialidad || 'N/A',
                correo: u.correo,
                estado: u.estado_cuenta,
                estado_label: u.estado_cuenta ? 'Activo' : 'Inactivo',
                // Flattening para el formulario de edición
                nombre_user: u.nombre_user,
                nombre: u.nombre,
                ap_paterno: u.ap_paterno,
                ap_materno: u.ap_materno,
                ci: u.ci,
                numero_cel: u.numero_cel,
                fecha_nac: u.fecha_nac ? u.fecha_nac.split('T')[0] : '',
            };
        });
    }, [tutores]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(item =>
            item.nombre_completo.toLowerCase().includes(lowerSearch) ||
            item.especialidad.toLowerCase().includes(lowerSearch) ||
            item.correo.toLowerCase().includes(lowerSearch)
        );
    }, [processedData, search]);

    const openCreateModal = () => {
        setEditUser(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (row) => {
        setEditUser(row);
        setData({
            nombre_user: row.nombre_user || '',
            correo: row.correo || '',
            nombre: row.nombre || '',
            ap_paterno: row.ap_paterno || '',
            ap_materno: row.ap_materno || '',
            ci: row.ci || '',
            numero_cel: row.numero_cel || '',
            fecha_nac: row.fecha_nac || '',
            especialidad: row.especialidad || '',
            grado_aca: row.grado_aca || '',
            password: '', 
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('admin.usuarios.tutor.update', editUser.id), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        } else {
            post(route('admin.usuarios.tutor.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        }
    };

    const toggleEstado = (row) => setConfirmState({ show: true, user: row });

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
            <Head title="Tutores Académicos" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary-navy">Gestión de Tutores</h1>
                <PrimaryButton onClick={openCreateModal}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Tutor
                </PrimaryButton>
            </div>

            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, especialidad o correo..."
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
                        <button onClick={() => toggleEstado(row)} className={`p-1.5 rounded-lg transition-colors ${row.estado ? 'text-green-600 hover:text-green-800 hover:bg-green-50' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`} title={row.estado ? 'Desactivar' : 'Activar'}>
                            {row.estado ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                        </button>
                    </div>
                )}
            />

            {/* Modal de Registro/Edición */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Editar Tutor' : 'Registrar Nuevo Tutor'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Información Personal */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><UserPlus className="h-4 w-4 text-primary-blue" /></span>
                            Datos Personales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="nombre" value="Nombre(s)" />
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
                                <TextInput id="ap_materno" value={data.ap_materno} onChange={e => setData('ap_materno', e.target.value)} className="w-full" required />
                                <InputError message={errors.ap_materno} />
                            </div>
                            <div>
                                <InputLabel htmlFor="ci" value="CI / Documento" />
                                <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full" required />
                                <InputError message={errors.ci} />
                            </div>
                        </div>
                    </div>

                    {/* Información Académica */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><BookOpen className="h-4 w-4 text-primary-blue" /></span>
                            Perfil Profesional
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="grado_aca" value="Grado Académico" />
                                <TextInput id="grado_aca" placeholder="Ej: Maestría, Licenciatura" value={data.grado_aca} onChange={e => setData('grado_aca', e.target.value)} className="w-full" required />
                                <InputError message={errors.grado_aca} />
                            </div>
                            <div>
                                <InputLabel htmlFor="especialidad" value="Especialidad" />
                                <TextInput id="especialidad" placeholder="Ej: IA, Redes, Software" value={data.especialidad} onChange={e => setData('especialidad', e.target.value)} className="w-full" required />
                                <InputError message={errors.especialidad} />
                            </div>
                        </div>
                    </div>

                    {/* Credenciales y Contacto */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="correo" value="Correo Electrónico" />
                                <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} className="w-full" required />
                                <InputError message={errors.correo} />
                            </div>
                            <div>
                                <InputLabel htmlFor="numero_cel" value="Celular" />
                                <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} className="w-full" required />
                                <InputError message={errors.numero_cel} />
                            </div>
                            <div>
                                <InputLabel htmlFor="fecha_nac" value="Fecha de Nacimiento" />
                                <TextInput id="fecha_nac" type="date" value={data.fecha_nac} onChange={e => setData('fecha_nac', e.target.value)} className="w-full" required />
                                <InputError message={errors.fecha_nac} />
                            </div>
                            <div>
                                <InputLabel htmlFor="nombre_user" value="Usuario" />
                                <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full" required />
                                <InputError message={errors.nombre_user} />
                            </div>
                            {!editUser && (
                                <div>
                                    <InputLabel htmlFor="password" value="Contraseña" />
                                    <TextInput id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full" required />
                                    <InputError message={errors.password} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Guardando...' : editUser ? 'Actualizar Tutor' : 'Registrar Tutor'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado ? 'Desactivar Tutor' : 'Activar Tutor'}
                message={`¿Estás seguro de que deseas cambiar el acceso de ${confirmState.user?.nombre_completo}?`}
                confirmText={confirmState.user?.estado ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}