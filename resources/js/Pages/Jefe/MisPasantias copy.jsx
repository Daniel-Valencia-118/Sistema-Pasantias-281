import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import { Eye, Users, GraduationCap, ArrowRight, UserX, Briefcase, Calendar, Users2, AlertCircle  } from 'lucide-react';

export default function MisPasantias({ pasantias = [], auth }) {
    const [selectedPasantia, setSelectedPasantia] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const verPasantes = (pasantia) => {
        setSelectedPasantia(pasantia);
        setModalOpen(true);
    };

    console.log(pasantias);
    

const columns = [
    {
        key: 'nombre',
        label: 'Pasantía',
        sortable: true,
        render: (value) => (
            <div className="flex items-center gap-3">
                {/* <div className="h-10 w-10 rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy font-bold border border-primary-navy/20 shrink-0">
                    {value && value.trim() ? value.trim().charAt(0).toUpperCase() : <Briefcase size={16}/>}
                </div> */}
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-700 leading-none truncate max-w-[220px]" title={value}>
                        {value}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                        Convocatoria / Programa
                    </span>
                </div>
            </div>
        ),
    },
    {
        key: 'estado',
        label: 'Estado',
        sortable: true,
        align: 'center',
        render: (value, row) => {
            // Mapeo adaptado a los estados comunes de una convocatoria de pasantía
            const colorMap = {
                'INICIADO': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                'ABIERTA': 'bg-blue-50 text-blue-600 border-blue-200',
                'CERRADA': 'bg-rose-50 text-rose-600 border-rose-200',
                'FINALIZADO': 'bg-purple-50 text-purple-600 border-purple-200',
            };
            return (
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wide inline-flex items-center gap-1.5 ${colorMap[value] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                        value === 'INICIADO' || value === 'ABIERTA' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`} />
                    {value}
                </span>
            );
        },
    },
    {
        key: 'fecha_ini',
        label: 'Vigencia (Inicio / Fin)',
        sortable: true,
        render: (value, row) => {
            // Formateador rápido de fecha por si vienen en formato ISO AAAA-MM-DD
            const formatDate = (dateStr) => {
                if (!dateStr) return '—';
                const parts = dateStr.split('-');
                return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
            };

            return (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-[13px]">Del: {formatDate(value)}</span>
                        <span className="text-slate-400 text-[13px]">Al: {formatDate(row.fecha_fin)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        key: 'cupos',
        label: 'Disponibilidad Cupos',
        sortable: true,
        align: 'center',
        render: (value, row) => {
            const disponibles = parseInt(row.cupos_disponibles, 10) || 0;
            const totales = parseInt(value, 10) || 0;
            const esCritico = disponibles === 0;

            return (
                <div className="flex flex-col items-center justify-center gap-1 min-w-[90px]">
                    <div className="flex items-center gap-1.5">
                        <Users2 size={13} className={esCritico ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={`text-xs font-bold ${esCritico ? 'text-rose-600 font-extrabold' : 'text-slate-700'}`}>
                            {disponibles} / {totales}
                        </span>
                    </div>
                    {/* Barra de progreso visual minimalista */}
                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                            className={`h-full transition-all duration-300 ${esCritico ? 'bg-rose-500' : 'bg-primary-blue'}`}
                            style={{ width: `${totales > 0 ? Math.min((disponibles / totales) * 100, 100) : 0}%` }}
                        />
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-tight">
                        {esCritico ? 'Agotados' : 'Disponibles'}
                    </span>
                </div>
            );
        },
    },
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
        <div className="space-y-6 p-1">
            {/* Encabezado del Contenido */}
            <div className="flex items-start gap-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                    <GraduationCap size={20} />
                </div>
                <div className="space-y-0.5">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Programa / Convocatoria
                    </span>
                    <h3 className="font-bold text-base text-primary-navy tracking-tight leading-snug">
                        {selectedPasantia.nombre}
                    </h3>
                </div>
            </div>

            {/* Listado de Pasantes */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Lista de Alumnos ({selectedPasantia.pasantes_inscritos.length})
                    </h4>
                </div>

                {selectedPasantia.pasantes_inscritos.length > 0 ? (
                    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                        {selectedPasantia.pasantes_inscritos.map(p => (
                            <li 
                                key={p.id} 
                                className="flex justify-between items-center p-3.5 hover:bg-slate-50/70 transition-colors duration-150"
                            >
                                <span className="text-sm font-semibold text-gray-700 tracking-tight">
                                    {p.nombre}
                                </span>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                                    p.estado_inscripcion === 'activo' 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                        : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${p.estado_inscripcion === 'activo' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {p.estado_inscripcion}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    /* Estado Vacío Profesional */
                    <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50 text-center">
                        <div className="p-3 bg-gray-100 text-gray-400 rounded-full mb-3">
                            <UserX size={22} />
                        </div>
                        <p className="text-sm font-medium text-gray-500 max-w-xs">
                            No hay pasantes registrados actualmente en esta pasantía.
                        </p>
                    </div>
                )}
            </div>

            {/* Enlace de Acción Inferior */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
                <Link
                    // redirigir a /jefe/pasantes/${id} con id de pasantia seleccionada
                    href={route('jefe.pasantes', { id: selectedPasantia.id })}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-blue hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-4 py-2.5 rounded-lg transition-all duration-150"
                >
                    <Users size={16} /> 
                    <span>Ver todos mis pasantes</span>
                    <ArrowRight size={14} className="opacity-70" />
                </Link>
            </div>
        </div>
    )}
</Modal>
        </DashboardLayout>
    );
}