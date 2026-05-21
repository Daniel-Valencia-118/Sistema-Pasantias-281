// resources/js/Pages/Admin/Usuarios/Gerentes.jsx
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
import { Search, Edit, ToggleLeft, ToggleRight, UserPlus, Building2 } from 'lucide-react';

export default function Gerentes({ gerentes, auth }) {
    const { errors: pageErrors } = usePage().props;
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [confirmState, setConfirmState] = useState({ show: false, user: null });

    console.log(gerentes);
    

    // Formulario adaptado a la lógica de negocio (Usuario + Gerente + Empresa)
    const { data, setData, post, put, processing, errors, reset } = useForm({
        // Datos Usuario
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
        // Datos Gerente
        nro_secun: '',
        // Datos Empresa (Nombres según tu validador backend)
        empresa_nombre: '',
        empresa_direccion: '',
        empresa_email: '',
        empresa_nit: '',
        empresa_telefono: '',
    });

    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Gerentes' },
    ];

    const columns = [
        { key: 'nombre_completo', label: 'Gerente', 'sortable': true },
        { key: 'empresa_nombre_display', label: 'Empresa', 'sortable': true },
        { key: 'correo', label: 'Correo' , 'sortable': true},
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

    // Mapeo de datos: Gerente -> User + Empresa
    const processedData = useMemo(() => {
        return gerentes.map(g => {
            const u = g.user;
            const e = g.empresa || {};
            return {
                id: u.idUser,
                id_gerente: g.idU_gerente,
                nombre_completo: `${u.nombre || ''} ${u.ap_paterno || ''} ${u.ap_materno || ''}`.trim(),
                correo: u.correo,
                empresa_nombre_display: e.nombre || 'Sin Empresa',
                nro_secun: g.nro_secun || '',
                estado: u.estado_cuenta,
                estado_label: u.estado_cuenta ? 'Activo' : 'Inactivo',
                // Flattening para edición
                nombre_user: u.nombre_user,
                nombre: u.nombre,
                ap_paterno: u.ap_paterno,
                ap_materno: u.ap_materno,
                ci: u.ci,
                numero_cel: u.numero_cel,
                fecha_nac: u.fecha_nac ? u.fecha_nac.split('T')[0] : '',
                // Datos empresa
                empresa_nombre: e.nombre || '',
                empresa_direccion: e.direccion || '',
                empresa_email: e.email || '',
                empresa_nit: e.nit || '',
                empresa_telefono: e.telefono || '',
            };
        });
    }, [gerentes]);

    const filteredData = useMemo(() => {
        if (!search.trim()) return processedData;
        const lowerSearch = search.toLowerCase();
        return processedData.filter(item =>
            item.nombre_completo.toLowerCase().includes(lowerSearch) ||
            item.empresa_nombre_display.toLowerCase().includes(lowerSearch) ||
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
            password: '',
            password_confirmation: '',
            ci: row.ci || '',
            numero_cel: row.numero_cel || '',
            fecha_nac: row.fecha_nac || '',
            nro_secun: row.nro_secun || '',
            empresa_nombre: row.empresa_nombre || '',
            empresa_direccion: row.empresa_direccion || '',
            empresa_email: row.empresa_email || '',
            empresa_nit: row.empresa_nit || '',
            empresa_telefono: row.empresa_telefono || '',
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            put(route('admin.usuarios.gerente.update', editUser.id), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true,
            });
        } else {
            post(route('admin.usuarios.gerente.store'), {
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
            <Head title="Gerentes de Empresa" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-primary-navy">Gestión de Gerentes</h1>
                {/* <PrimaryButton onClick={openCreateModal}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nuevo Gerente
                </PrimaryButton> */}
            </div>

            {/* Buscador */}
            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre, correo o empresa..."
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

            {/* Modal Crear/Editar Gerente y Empresa */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Editar Gerente' : 'Registrar Nuevo Gerente'}>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Sección Datos Personales */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><UserPlus className="h-4 w-4 text-primary-blue" /></span>
                            Información Personal
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
                                <InputLabel htmlFor="ci" value="Cédula de Identidad" />
                                <TextInput id="ci" value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full" required />
                                <InputError message={errors.ci} />
                            </div>
                            <div>
                                <InputLabel htmlFor="correo" value="Correo Electrónico" />
                                <TextInput id="correo" type="email" value={data.correo} onChange={e => setData('correo', e.target.value)} className="w-full" required />
                                <InputError message={errors.correo} />
                            </div>
                            <div>
                                <InputLabel htmlFor="numero_cel" value="Celular de Contacto" />
                                <TextInput id="numero_cel" value={data.numero_cel} onChange={e => setData('numero_cel', e.target.value)} className="w-full" required />
                                <InputError message={errors.numero_cel} />
                            </div>
                        </div>
                    </div>

                    {/* Sección Datos de Empresa */}
                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center">
                            <span className="bg-primary-sky-blue/10 p-1 rounded mr-2"><Building2 className="h-4 w-4 text-primary-blue" /></span>
                            Información de la Empresa
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="empresa_nombre" value="Nombre de la Empresa" />
                                <TextInput id="empresa_nombre" value={data.empresa_nombre} onChange={e => setData('empresa_nombre', e.target.value)} className="w-full" required />
                                <InputError message={errors.empresa_nombre} />
                            </div>
                            <div>
                                <InputLabel htmlFor="empresa_nit" value="NIT" />
                                <TextInput id="empresa_nit" value={data.empresa_nit} onChange={e => setData('empresa_nit', e.target.value)} className="w-full" required />
                                <InputError message={errors.empresa_nit} />
                            </div>
                            <div>
                                <InputLabel htmlFor="empresa_telefono" value="Teléfono Empresa" />
                                <TextInput id="empresa_telefono" value={data.empresa_telefono} onChange={e => setData('empresa_telefono', e.target.value)} className="w-full" required />
                                <InputError message={errors.empresa_telefono} />
                            </div>
                            <div className="md:col-span-2">
                                <InputLabel htmlFor="empresa_direccion" value="Dirección" />
                                <TextInput id="empresa_direccion" value={data.empresa_direccion} onChange={e => setData('empresa_direccion', e.target.value)} className="w-full" required />
                                <InputError message={errors.empresa_direccion} />
                            </div>
                        </div>
                    </div>

                    {/* Credenciales de Acceso (Solo en creación) */}
                    {!editUser && (
                        <div className="pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="nombre_user" value="Usuario de Sistema" />
                                    <TextInput id="nombre_user" value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full" required />
                                    <InputError message={errors.nombre_user} />
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
                            {processing ? 'Procesando...' : editUser ? 'Actualizar Datos' : 'Registrar Gerente'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                show={confirmState.show}
                onClose={() => setConfirmState({ show: false, user: null })}
                onConfirm={confirmToggleEstado}
                title={confirmState.user?.estado ? 'Desactivar Cuenta' : 'Activar Cuenta'}
                message={`¿Estás seguro de que deseas cambiar el acceso al sistema para ${confirmState.user?.nombre_completo}?`}
                confirmText={confirmState.user?.estado ? 'Desactivar' : 'Activar'}
                type={confirmState.user?.estado ? 'danger' : 'primary'}
            />
        </DashboardLayout>
    );
}