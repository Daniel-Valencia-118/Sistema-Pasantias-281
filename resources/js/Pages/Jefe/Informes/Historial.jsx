import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import InfoItem from '@/Components/InfoItem';
import axios from 'axios';
import { FileText, Download, Award, Calendar, BookmarkCheck } from 'lucide-react';
import BadgeFecha from '@/Components/BadgeFecha';

export default function Historial({ pasantia, informes = [], auth }) {
    const [selectedInforme, setSelectedInforme] = useState(null);
    const [verModal, setVerModal] = useState(false);
    const [loading, setLoading] = useState(false);

    console.log(pasantia, informes);
    

    const verInforme = async (id) => {
        setLoading(true);
        try {
            const response = await axios.get(route('jefe.informes.ver', id));
            setSelectedInforme(response.data);
            setVerModal(true);
        } catch (error) {
            console.error("Error al obtener los detalles del informe:", error);
        } finally {
            setLoading(false);
        }
    };

    // Columnas reconfiguradas: Reemplazo de Promedio por Nota Final
    const columns = [
        {
            key: 'pasante',
            label: 'Pasante Evaluado',
            sortable: true,
            render: (value) => <span className="font-bold text-primary-navy">{value}</span>,
        },
        { key: 'pasantia', label: 'Pasantía', sortable: true },
        { 
            key: 'nota_final', // Cambiado de promedio a nota_final
            label: 'Nota Final',
            sortable: true,
            align: 'center',
            render: (value) => {
                if (value === '' || value === null) {
                    return <span className="text-slate-400">Sin nota</span>;
                }
                const nota = parseInt(value, 10);
                const color = nota >= 90 ? 'text-green-600 bg-green-50' : nota >= 51 ? 'text-primary-blue bg-blue-50' : 'text-red-600 bg-red-50';
                return (
                    <span className={`font-black px-2.5 py-1 rounded-lg text-xs border ${color}`}>
                        {nota} pts
                    </span>
                );
            },
        },
        {
            key: 'resultado',
            label: 'Resultado',
            sortable: true,
            align: 'center',
            render: (value) => (
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    value === 'aprobado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                    {value}
                </span>
            ),
        },
        { key: 'fecha', label: 'Fecha Emisión', sortable: true, render: (value) => <BadgeFecha fecha={value} neutral={true} /> },
    ];

    const renderAcciones = (row) => (
        <div className="flex gap-1.5 justify-end">
            {/* Acción 1: Ver Detalle */}
            <button 
                onClick={() => verInforme(row.id)} 
                disabled={loading}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all" 
                title="Ver informe en pantalla"
            >
                <FileText size={16} />
            </button>

            {/* Acción 2: Descargar PDF */}
            <a 
                href={route('jefe.informes.descargar', row.id)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-xl transition-all" 
                title="Imprimir / Ver PDF"
            >
                <Download size={16} />
            </a>

            {/* Acción 3: Generar Certificado */}
            {row.resultado === 'aprobado' && (
                <a 
                    href={route('informes.certificado', row.id)} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100" 
                    title="Ver Certificado Académico"
                >
                    <Award size={16} />
                </a>
            )}
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Historial - ${pasantia.nombre}`} />
            
            <Breadcrumbs items={[
                { label: 'Inicio', url: route('jefe.dashboard') },
                { label: 'Historial de Informes', url: route('jefe.pasantias.tarjetas', { origen: 'historial' }) },
                { label: pasantia.nombre },
            ]} />

            <div className="mb-6 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-xs font-bold tracking-wider text-primary-blue uppercase bg-primary-blue/10 px-3 py-1 rounded-full">Filtro de Archivos</span>
                <h1 className="text-3xl font-black text-primary-navy uppercase mt-2">{pasantia.nombre}</h1>
                <p className="text-slate-500 mt-1">Mostrando todos los informes finales generados bajo este programa.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={informes}
                    actionsRender={renderAcciones}
                    searchPlaceholder="Buscar por pasante o estado..."
                />
            </div>

            {/* MODAL DE AUDITORÍA DETALLADA */}
            <Modal show={verModal} onClose={() => setVerModal(false)} title="Expediente Técnico del Informe Final" maxWidth="2xl">
                {selectedInforme && (
                    <div className="space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pasante de Carrera</span>
                                <h3 className="text-base font-bold text-slate-800">{selectedInforme.pasante}</h3>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 text-xs font-black rounded-full border uppercase tracking-wider ${
                                selectedInforme.resultado?.toLowerCase().includes('aprobado')
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                    : 'bg-red-50 border-red-200 text-red-700'
                            }`}>
                                {selectedInforme.resultado}
                            </span>
                        </div>

                        {/* Bloques Métricos */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Promedio Bitácoras</span>
                                <span className="text-sm font-semibold text-slate-700 block">{selectedInforme.promedio} / 100</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Nota Final Asentada</span>
                                <span className="text-sm font-black text-primary-blue block">{selectedInforme.nota_final} / 100</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Fecha Publicación</span>
                                <span className="text-sm font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                                    <Calendar size={13} className="text-slate-400" />
                                    {selectedInforme.fecha ? selectedInforme.fecha : 'N/A'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-slate-400 uppercase tracking-wider">Autoridad Evaluadora:</span>
                            <span className="font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">{selectedInforme.jefe}</span>
                        </div>

                        {/* Dictamen */}
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                                <BookmarkCheck size={14} /> Observaciones del Dictamen Técnico
                            </span>
                            <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                {selectedInforme.observaciones || 'No se registraron observaciones complementarias en el acta.'}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100">
                            <SecondaryButton onClick={() => setVerModal(false)}>Cerrar Expediente</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}