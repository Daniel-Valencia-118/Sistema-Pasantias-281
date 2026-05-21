import React from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import { Eye } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';

export default function MensajesEnviados({ mensajes = [], auth }) {
    const [selected, setSelected] = useState(null);

    const columns = [
        {
            key: 'pasante',
            label: 'Para',
            sortable: true,
            render: (value) => <span className="font-bold text-primary-navy">{value}</span>,
        },
        {
            key: 'descripcion',
            label: 'Mensaje',
            sortable: false,
            render: (value) => (
                <p className="max-w-xs truncate text-slate-600" title={value}>
                    {value}
                </p>
            ),
        },
        { key: 'fecha', label: 'Fecha', sortable: true },
        { key: 'hora', label: 'Hora', sortable: true },
    ];

    const renderAcciones = (row) => (
        <button
            onClick={() => setSelected(row)}
            className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg"
            title="Ver mensaje"
        >
            <Eye size={18} />
        </button>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mensajes Enviados" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Comunicación' },
                { label: 'Mensajes Enviados' },
            ]} />

            <div className="mb-6">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Mensajes Enviados</h1>
                <p className="text-slate-500">Historial de comunicaciones con tus pasantes.</p>
            </div>

            <DataTable
                columns={columns}
                data={mensajes}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar mensajes..."
            />

            <Modal show={!!selected} onClose={() => setSelected(null)} title="Detalle del Mensaje" maxWidth="lg">
                {selected && (
                    <div className="space-y-3">
                        <Info label="Para" value={selected.pasante} />
                        <Info label="Fecha" value={`${selected.fecha} ${selected.hora}`} />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Contenido</p>
                            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                {selected.descripcion}
                            </p>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{label}</p>
            <p className="text-sm font-medium text-slate-700">{value}</p>
        </div>
    );
}