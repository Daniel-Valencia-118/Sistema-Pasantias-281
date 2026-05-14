import React from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import { FileText, Download, Award } from 'lucide-react';
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
        { key: 'promedio',
            label: 'Promedio',
            sortable: true,
            align: 'center',
            render: (value) => {
                if (value === '' || value === null) {
                    return <span className="text-gray-500">Sin promediar</span>;
                }
                const nota = parseInt(value, 10);
                const color = nota >= 90 ? 'text-green-500' : nota >= 51 ? 'text-blue-500' : 'text-red-500';
                return <span className={`font-bold ${color}`}>{nota}</span>;
            },
        },
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
        {/* --- NUEVA ACCIÓN: GENERAR CERTIFICADO --- */}
        {row.resultado === 'aprobado' && ( // Solo mostrar si está aprobado
            <a 
                href={route('informes.certificado', row.id)} 
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" 
                title="Generar Certificado de Pasantía"
            >
                <Award size={18} />
            </a>
        )}
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

            <Modal show={verModal} onClose={() => setVerModal(false)} title="Detalle del Informe Final" maxWidth="2xl">
                {selectedInforme && (
                    <div className="space-y-6">
                        {/* Sección de Encabezado / Perfil del Pasante */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Pasante Evaluado</span>
                                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                    {selectedInforme.pasante}
                                </h3>
                            </div>
                            {/* Badge de Resultado Semántico */}
                            <div className="text-right">
                                <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wide shadow-xs ${
                                    selectedInforme.resultado?.toLowerCase().includes('aprobado') || selectedInforme.resultado?.toLowerCase().includes('satisfactorio')
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-red-50 border-red-200 text-red-700'
                                }`}>
                                    {selectedInforme.resultado}
                                </span>
                            </div>
                        </div>

                        {/* Grid Principal de Datos de Rendimiento */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                            {/* Pasantía */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Pasantía</span>
                                <span className="text-sm font-semibold text-slate-700 block">{selectedInforme.pasantia}</span>
                            </div>

                            {/* Promedio Final */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Promedio Final</span>
                                <span className="inline-flex items-center text-sm font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                    {selectedInforme.promedio}%
                                </span>
                            </div>

                            {/* Fecha de Emisión */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">Fecha de Emisión</span>
                                <span className="text-sm font-medium text-slate-600 block">
                                    {selectedInforme.fecha ? new Date(selectedInforme.fecha).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </span>
                            </div>
                        </div>

                        {/* Fila de Datos del Evaluador */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 px-4 rounded-lg bg-white border border-slate-200/60">
                            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Jefe Evaluador Autorizado</span>
                            <span className="text-sm font-semibold text-slate-700 mt-1 sm:mt-0 bg-slate-100/80 px-2.5 py-1 rounded-md">
                                {selectedInforme.jefe}
                            </span>
                        </div>

                        {/* Sección de Conclusiones y Observaciones */}
                        <div className="pt-2">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Observaciones y Dictamen Técnico
                                    </h3>
                                </div>
                                <div className="p-4 bg-slate-50/10">
                                    <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-line">
                                        {selectedInforme.observaciones || 'El evaluador no ha redactado observaciones adicionales para este informe final.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

        </DashboardLayout>
    );
}