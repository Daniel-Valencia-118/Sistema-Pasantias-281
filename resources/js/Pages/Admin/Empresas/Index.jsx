// resources/js/Pages/Admin/Empresas/Index.jsx
import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Select from '@/Components/Select';
import { Search, Edit, Building2, UserCircle, Phone, Mail, Plus } from 'lucide-react';

export default function Empresas({ empresas = [], gerentesDisponibles = [], auth }) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [registrarNuevoGerente, setRegistrarNuevoGerente] = useState(false);

    console.log(empresas);
    

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_empresa: '',
        nombre: '',
        direccion: '',
        email: '',
        nit: '',
        telefono: '',
        idU_gerente: '', 
        // Campos para nuevo gerente
        nombre_user: '',
        password: '',
        numero_cel: '',
        ci: '',
        correo_gerente: '',
        nombre_gerente: '',
        ap_paterno: '',
        ap_materno: '',
        fecha_nac: '',
        nro_secun: '',
    });

    const columns = [
        { key: 'nombre', label: 'Empresa' },
        { key: 'nit', label: 'NIT' },
        { 
            key: 'contacto', 
            label: 'Contacto', 
            // CORRECCIÓN 1: Optional chaining row?. para evitar el error de undefined
            // val es row['contacto'] (undefined), row es el objeto completo
            render: (val, row) => (
                <div className="text-xs">
                    <div className="flex items-center text-gray-700">
                        <Mail className="h-3 w-3 mr-1 text-gray-400"/> {row?.email || 'N/A'}
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                        <Phone className="h-3 w-3 mr-1 text-gray-400"/> {row?.telefono || 'N/A'}
                    </div>
                </div>
            )
        },
        { key: 'gerente_nombre', label: 'Gerente Asignado' },
    ];

    const processedData = useMemo(() => {
        return (empresas || []).map(e => ({
            ...e,
            gerente_nombre: e.gerente?.user 
                ? `${e.gerente.user.nombre} ${e.gerente.user.ap_paterno}` 
                : 'Sin gerente',
        }));
    }, [empresas]);

    const filteredData = useMemo(() => {
        const s = search.toLowerCase();
        return processedData.filter(e => 
            e.nombre?.toLowerCase().includes(s) || 
            e.nit?.includes(s) ||
            e.gerente_nombre?.toLowerCase().includes(s)
        );
    }, [processedData, search]);

    const openCreateModal = () => {
        setEditMode(false);
        setRegistrarNuevoGerente(false);
        reset();
        setShowModal(true);
    };

    // CORRECCIÓN 2: Implementación de la función de edición
    const openEditModal = (empresa) => {
        setEditMode(true);
        setRegistrarNuevoGerente(false); // En edición solemos mantener el gerente o elegir de la lista
        setData({
            id_empresa: empresa.id_empresa,
            nombre: empresa.nombre || '',
            direccion: empresa.direccion || '',
            email: empresa.email || '',
            nit: empresa.nit || '',
            telefono: empresa.telefono || '',
            idU_gerente: empresa.idU_gerente || '',
            // Reset de campos de nuevo gerente
            nombre_user: '', password: '', ci: '', nombre_gerente: '', ap_paterno: '', ap_materno: ''
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.empresas.update', data.id_empresa), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true
            });
        } else {
            post(route('admin.empresas.store'), {
                onSuccess: () => { setShowModal(false); reset(); },
                preserveScroll: true
            });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Gestión de Empresas" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">Empresas Aliadas</h1>
                    <p className="text-sm text-gray-500">Administración de organizaciones y gerentes.</p>
                </div>
                {/* <PrimaryButton onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2" /> Nueva Empresa
                </PrimaryButton> */}
            </div>

            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar empresa..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-primary-blue"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <DataTable 
                columns={columns} 
                data={filteredData} 
                actionsRender={(row) => (
                    <button 
                        onClick={() => openEditModal(row)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        <Edit className="h-5 w-5" />
                    </button>
                )}
            />

            <Modal show={showModal} onClose={() => setShowModal(false)} title={editMode ? "Editar Empresa" : "Registrar Empresa"} maxWidth="4xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    
                    {/* Datos de la Empresa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center border-b pb-2">
                                <Building2 className="h-4 w-4 mr-2" /> Datos Institucionales
                            </h3>
                        </div>
                        <div>
                            <InputLabel value="Nombre de la Empresa" />
                            <TextInput value={data.nombre} onChange={e => setData('nombre', e.target.value)} className="w-full" required />
                            <InputError message={errors.nombre} />
                        </div>
                        <div>
                            <InputLabel value="NIT" />
                            <TextInput value={data.nit} onChange={e => setData('nit', e.target.value)} className="w-full" required />
                            <InputError message={errors.nit} />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel value="Dirección" />
                            <TextInput value={data.direccion} onChange={e => setData('direccion', e.target.value)} className="w-full" required />
                            <InputError message={errors.direccion} />
                        </div>
                        <div>
                            <InputLabel value="Correo de la Empresa" />
                            <TextInput type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full" required />
                            <InputError message={errors.email} />
                        </div>
                        <div>
                            <InputLabel value="Teléfono Empresa" />
                            <TextInput value={data.telefono} onChange={e => setData('telefono', e.target.value)} className="w-full" required />
                            <InputError message={errors.telefono} />
                        </div>
                    </div>

                    {/* Gerente */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase flex items-center">
                                <UserCircle className="h-4 w-4 mr-2" /> Gerente Responsable
                            </h3>
                            {!editMode && (
                                <button 
                                    type="button" 
                                    onClick={() => setRegistrarNuevoGerente(!registrarNuevoGerente)}
                                    className="text-xs font-semibold text-primary-blue hover:text-blue-700"
                                >
                                    {registrarNuevoGerente ? "← Volver a lista" : "+ Registrar nuevo gerente"}
                                </button>
                            )}
                        </div>

                        {!registrarNuevoGerente ? (
                            <div>
                                <InputLabel value="Seleccionar Gerente Existente" />
                                <Select 
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-blue text-sm"
                                    value={data.idU_gerente}
                                    onChange={e => setData('idU_gerente', e.target.value)}
                                    required
                                >
                                    <option value="">Seleccione un gerente...</option>
                                    {gerentesDisponibles?.map(g => (
                                        <option key={g.idU_gerente} value={g.idU_gerente}>
                                            {g.user?.nombre} {g.user?.ap_paterno} - CI: {g.user?.ci}
                                        </option>
                                    ))}
                                </Select>
                                <InputError message={errors.idU_gerente} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <InputLabel value="Nombres" />
                                    <TextInput value={data.nombre_gerente} onChange={e => setData('nombre_gerente', e.target.value)} className="w-full text-sm" />
                                </div>
                                <div>
                                    <InputLabel value="Ap. Paterno" />
                                    <TextInput value={data.ap_paterno} onChange={e => setData('ap_paterno', e.target.value)} className="w-full text-sm" />
                                </div>
                                <div>
                                    <InputLabel value="CI" />
                                    <TextInput value={data.ci} onChange={e => setData('ci', e.target.value)} className="w-full text-sm" />
                                </div>
                                <div>
                                    <InputLabel value="Usuario" />
                                    <TextInput value={data.nombre_user} onChange={e => setData('nombre_user', e.target.value)} className="w-full text-sm" />
                                </div>
                                <div>
                                    <InputLabel value="Contraseña" />
                                    <TextInput type="password" value={data.password} onChange={e => setData('password', e.target.value)} className="w-full text-sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        {/* CORRECCIÓN 3: type="button" para que NO envíe el form al cancelar */}
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Guardando...' : editMode ? 'Guardar Cambios' : 'Registrar Empresa'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}