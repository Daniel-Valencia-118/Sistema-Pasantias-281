import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { Users, Eye } from 'lucide-react';

export default function MisPasantias({ pasantias = [], auth }) {
    const [selectedPasantia, setSelectedPasantia] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const verPasantes = (pasantia) => {
        setSelectedPasantia(pasantia);
        setModalOpen(true);
    };

    const columns = [
        { key: 'nombre', label: 'Pasantía', sortable: true },
        { key: 'estado', label: 'Estado', sortable: true, align: 'center' },
        { key: 'fecha_ini', label: 'Inicio', sortable: true },
        { key: 'fecha_fin', label: 'Fin', sortable: true },
        { key: 'cupos', label: 'Cupos', sortable: true, align: 'center',
            render: (value, row) => `${row.cupos_disponibles}/${value}` },
    ];

    const renderAcciones = (row) => (
        <button
            onClick={() => verPasantes(row)}
            className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg"
            title="Ver pasantes inscritos"
        >
            <Eye size={18} />
        </button>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mis Pasantías" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Mis Pasantías' },
            ]} />

            <div className="mb-6">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Mis Pasantías</h1>
                <p className="text-slate-500">Pasantías en las que supervisas estudiantes.</p>
            </div>

            <DataTable
                columns={columns}
                data={pasantias}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar pasantías..."
            />

            <Modal show={modalOpen} onClose={() => setModalOpen(false)} title="Pasantes Inscritos" maxWidth="lg">
                {selectedPasantia && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg text-primary-navy">{selectedPasantia.nombre}</h3>
                        {selectedPasantia.pasantes_inscritos.length > 0 ? (
                            <ul className="space-y-2">
                                {selectedPasantia.pasantes_inscritos.map(p => (
                                    <li key={p.id} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg">
                                        <span className="font-medium">{p.nombre}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            p.estado_inscripcion === 'activo' ? 'bg-green-100 text-green-700' :
                                            'bg-gray-100 text-gray-700'}`}>
                                            {p.estado_inscripcion}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-slate-500">No hay pasantes inscritos en esta pasantía.</p>
                        )}
                        <Link
                            href={route('jefe.pasantes')}
                            className="inline-flex items-center gap-2 text-primary-blue hover:underline font-medium"
                        >
                            <Users size={18} /> Ver todos mis pasantes
                        </Link>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}