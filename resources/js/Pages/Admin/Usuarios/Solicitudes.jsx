// resources/js/Pages/Admin/Usuarios/Solicitudes.jsx
import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { Search, UserCheck, UserX, Clock, AlertCircle, Mail } from 'lucide-react';

export default function Solicitudes({ usuarios, auth }) {
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState(false);

    console.log(usuarios);
    
    
    // Estados para Modales de Acción
    const [confirmApprove, setConfirmApprove] = useState({ show: false, user: null });
    const [confirmReject, setConfirmReject] = useState({ show: false, user: null, motivo: '' });

    const breadcrumbs = [
        { label: 'Gestión de Usuarios', url: 'admin.usuarios.index' },
        { label: 'Solicitudes Pendientes' },
    ];

    const columns = [
        { key: 'nombre', label: 'Nombre Solicitante' },
        { key: 'nombre_user', label: 'Usuario' },
        { key: 'correo', label: 'Correo Electrónico' },
        { 
            key: 'rol', 
            label: 'Rol Solicitado',
            render: (val) => (
                <span className="px-2 py-1 text-xs font-semibold rounded-md bg-primary-sky-blue/10 text-primary-blue uppercase">
                    {val}
                </span>
            )
        },
        { 
            key: 'estado_aprobacion', 
            label: 'Estado',
            render: () => (
                <div className="flex items-center text-amber-600 font-medium text-xs">
                    <Clock className="h-3 w-3 mr-1" /> Pendiente
                </div>
            )
        },
    ];

    const filteredData = useMemo(() => {
        if (!search.trim()) return usuarios;
        const lowerSearch = search.toLowerCase();
        return usuarios.filter(u =>
            // nombre completo del usuario
            u.nombre.toLowerCase().includes(lowerSearch) ||
            u.nombre_user.toLowerCase().includes(lowerSearch) ||
            u.correo.toLowerCase().includes(lowerSearch) ||
            u.rol.toLowerCase().includes(lowerSearch)
        );
    }, [usuarios, search]);

// Lógica de Aprobación
const handleApprove = () => {
    if (!confirmApprove.user) return;

    // 🔍 LINEA DE DIAGNÓSTICO: Revisa tu consola del navegador para ver qué estructura real tiene tu usuario
    console.log("Datos del usuario a aprobar:", confirmApprove.user);

    // Intentamos obtener el ID probando las 3 variantes más comunes de Laravel/PostgreSQL
    const userId = confirmApprove.user.idUser || confirmApprove.user.id || confirmApprove.user.id_user;

    if (!userId) {
        console.error("❌ Error: No se encontró ningún ID válido en el objeto del usuario.");
        return;
    }

    setProcessing(true);
    router.patch(route('admin.usuarios.solicitudes', { user: userId }), {
        estado: 'aprobado'
    }, {
        preserveScroll: true,
        onSuccess: () => {
            setConfirmApprove({ show: false, user: null });
        },
        onFinish: () => setProcessing(false)
    });
};

// Lógica de Rechazo
const handleReject = (e) => {
    e.preventDefault();
    if (!confirmReject.user) return;

    // Intentamos obtener el ID de la misma manera defensiva
    const userId = confirmReject.user.idUser || confirmReject.user.id || confirmReject.user.id_user;

    if (!userId) {
        console.error("❌ Error: No se encontró ningún ID válido en el objeto del usuario.");
        return;
    }

    setProcessing(true);
    router.patch(route('admin.usuarios.solicitudes', { user: userId }), {
        estado: 'rechazado'
    }, {
        preserveScroll: true,
        onSuccess: () => {
            setConfirmReject({ show: false, user: null });
        },
        onFinish: () => setProcessing(false)
    });
};


    return (
        <DashboardLayout auth={auth}>
            <Head title="Solicitudes de Registro" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">Solicitudes de Registro</h1>
                <p className="text-gray-500 text-sm">Usuarios que esperan aprobación para acceder al sistema.</p>
            </div>

            {/* Buscador */}
            <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Filtrar solicitudes por nombre, rol o correo..."
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
                            onClick={() => setConfirmApprove({ show: true, user: row })}
                            className="p-1.5 rounded-lg text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                            title="Aprobar Solicitud"
                        >
                            <UserCheck className="h-5 w-5" />
                        </button>
                        <button 
                            onClick={() => setConfirmReject({ show: true, user: row, motivo: '' })}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                            title="Rechazar Solicitud"
                        >
                            <UserX className="h-5 w-5" />
                        </button>
                    </div>
                )}
            />

            {/* Modal de Aprobación */}
            <Modal 
                show={confirmApprove.show} 
                onClose={() => !processing && setConfirmApprove({ show: false, user: null })}
                title="Aprobar Solicitud de Registro"
            >
                <div className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                        <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-center text-gray-600 mb-6">
                        ¿Estás seguro de aprobar la cuenta para <strong>{confirmApprove.user?.nombre}</strong>?<br/>
                        Se le enviará un correo electrónico confirmando su acceso como <strong>{confirmApprove.user?.rol}</strong>.
                    </p>
                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setConfirmApprove({ show: false, user: null })} disabled={processing}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton 
                            onClick={handleApprove} 
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 active:bg-green-800"
                        >
                            {processing ? 'Procesando...' : 'Sí, Aprobar Cuenta'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Modal de Rechazo (Con Motivo) */}
            <Modal 
                show={confirmReject.show} 
                onClose={() => !processing && setConfirmReject({ show: false, user: null, motivo: '' })}
                title="Rechazar Solicitud"
            >
                <form onSubmit={handleReject} className="p-6">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                        <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-center text-gray-600 mb-4">
                        Indica el motivo del rechazo para <strong>{confirmReject.user?.nombre}</strong>.
                    </p>
                    
                    {/* <div className="mb-6">
                        <InputLabel htmlFor="motivo" value="Motivo de Rechazo (Se enviará por correo)" />
                        <textarea
                            id="motivo"
                            className="mt-1 block w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm text-sm"
                            rows="3"
                            value={confirmReject.motivo}
                            onChange={(e) => setConfirmReject({...confirmReject, motivo: e.target.value})}
                            required
                            placeholder="Ej: Documentación incompleta o datos inválidos."
                        />
                    </div> */}

                    <div className="flex justify-center gap-3">
                        <SecondaryButton onClick={() => setConfirmReject({ show: false, user: null, motivo: '' })} disabled={processing}>
                            Cancelar
                        </SecondaryButton>
                        <PrimaryButton 
                            type="submit"
                            // disabled={processing || !confirmReject.motivo.trim()}
                            className="bg-red-600 hover:bg-red-700 active:bg-red-800"
                        >
                            {processing ? 'Procesando...' : 'Confirmar Rechazo'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}