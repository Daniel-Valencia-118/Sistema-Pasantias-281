import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import { FileText, Download } from 'lucide-react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import axios from 'axios';
import InputLabel from '@/Components/InputLabel';


export default function Historial({ informes = [], auth }) {
    const [selectedInforme, setSelectedInforme] = useState(null);
    const [verModal, setVerModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const verInforme = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(route('jefe.informes.ver', id));
            setSelectedInforme(response.data);
            setVerModal(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            key: 'pasante',
            label: 'Pasante',
            sortable: true,
            render: (value) => <span className="font-bold text-primary-navy">{value}</span>,
        },
        { key: 'pasantia', label: 'Pasantía', sortable: true },
        { key: 'promedio', label: 'Promedio', sortable: true, align: 'center' },
        {
            key: 'resultado',
            label: 'Resultado',
            sortable: true,
            align: 'center',
            render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    value === 'aprobado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                    {value}
                </span>
            ),
        },
        { key: 'fecha', label: 'Fecha', sortable: true },
    ];

    const renderAcciones = (row) => (
        <div className="flex gap-2">
            <button onClick={() => verInforme(row.id)} className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg" title="Ver informe">
                <FileText size={18} />
            </button>
        {/* Usamos target="_blank" para que el visor de PDF del navegador tome el control */}
        <a 
            href={route('jefe.informes.descargar', row.id)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg" 
            title="Imprimir PDF"
        >
            <Download size={18} />
        </a>
            {/* <Link
                href={`/jefe/informes/${row.id}`}
                className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg"
                title="Ver informe"
            >
                <FileText size={18} />
            </Link>
            <Link
                href={`/jefe/informes/${row.id}/descargar`}
                className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg"
                title="Descargar PDF"
            >
                <Download size={18} />
            </Link> */}
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Historial de Informes" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Informes Finales' },
                { label: 'Historial' },
            ]} />

            <div className="mb-6">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Historial de Informes</h1>
                <p className="text-slate-500">Informes finales generados anteriormente.</p>
            </div>

            <DataTable
                columns={columns}
                data={informes}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar informes..."
            />

            <Modal show={verModal} onClose={() => setVerModal(false)} title="Detalle del Informe Final" maxWidth="xl">
                {selectedInforme && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                        {/* InfoField no existe sustituir html puro */}
                            <InputLabel label="Pasante" value={selectedInforme.pasante} />
                            <InputLabel label="Pasantía" value={selectedInforme.pasantia} />
                            <InputLabel label="Promedio" value={`${selectedInforme.promedio}%`} />
                            <InputLabel label="Resultado" value={selectedInforme.resultado} />
                            <InputLabel label="Fecha" value={selectedInforme.fecha} />
                            <InputLabel label="Evaluador" value={selectedInforme.jefe} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase">Observaciones</h3>
                            <p className="text-slate-600 mt-1">{selectedInforme.observaciones}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}