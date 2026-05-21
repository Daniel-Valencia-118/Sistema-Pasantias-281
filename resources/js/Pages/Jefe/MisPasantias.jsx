import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import { 
    Eye, Users, GraduationCap, ArrowRight, UserX, Briefcase, 
    Calendar, Users2, Building2, Clock, ShieldCheck, FileText, MapPin, Phone, Mail, Activity, ClipboardList
} from 'lucide-react';

export default function MisPasantias({ pasantias = [], empresa = null, auth }) {
    // Control de Modales Autónomos
    const [selectedPasantia, setSelectedPasantia] = useState(null);
    const [modalPasantesOpen, setModalPasantesOpen] = useState(false);
    const [modalPasantiaOpen, setModalPasantiaOpen] = useState(false);
    const [modalEmpresaOpen, setModalEmpresaOpen] = useState(false);

    // Helper: Cálculo dinámico de fechas y días restantes
    const obtenerTiempoRestante = (fechaIni, fechaFin) => {
        const hoy = new Date();
        const inicio = new Date(fechaIni);
        const fin = new Date(fechaFin);
        
        hoy.setHours(0, 0, 0, 0);
        inicio.setHours(0, 0, 0, 0);
        fin.setHours(0, 0, 0, 0);

        if (hoy < inicio) {
            const diff = Math.ceil((inicio - hoy) / (1000 * 60 * 60 * 24));
            return { 
                texto: `Inicia en ${diff} ${diff === 1 ? 'día' : 'días'}`, 
                clase: 'text-amber-600 bg-amber-50 border-amber-100' 
            };
        } else if (hoy <= fin) {
            const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
            return { 
                texto: `${diff} ${diff === 1 ? 'día restante' : 'días restantes'}`, 
                clase: 'text-emerald-600 bg-emerald-50 border-emerald-100' 
            };
        } else {
            return { 
                texto: 'Concluida / Expirada', 
                clase: 'text-slate-400 bg-slate-50 border-slate-200' 
            };
        }
    };

    const formatearFecha = (dateStr) => {
        if (!dateStr) return '—';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
    };

    // Configuración de Columnas del DataTable
    const columns = [
        {
            key: 'nombre',
            label: 'Pasantía',
            sortable: true,
            render: (value) => (
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-slate-700 leading-tight truncate max-w-[240px]" title={value}>
                        {value}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-medium">
                        Convocatoria Activa
                    </span>
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
            align: 'center',
            render: (value) => {
                const colorMap = {
                    'INICIADO': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    'ABIERTA': 'bg-blue-50 text-blue-600 border-blue-200',
                    'CERRADA': 'bg-rose-50 text-rose-600 border-rose-200',
                    'FINALIZADO': 'bg-purple-50 text-purple-600 border-purple-200',
                };
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border tracking-wide inline-flex items-center gap-1.5 ${colorMap[value] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${value === 'INICIADO' || value === 'ABIERTA' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {value}
                    </span>
                );
            },
        },
        {
            key: 'fecha_ini',
            label: 'Fecha de Inicio',
            sortable: true,
            render: (value, row) => {
                const countdown = obtenerTiempoRestante(value, row.fecha_fin);
                return (
                    <div className="flex text-xs gap-1 items-center justify-center">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">{formatearFecha(value)}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border mt-1 font-medium w-max ${countdown.clase}`}>
                            {countdown.texto}
                        </span>
                    </div>
                    
                );
            }
        },
        {
            key: 'fecha_fin',
            label: 'Fecha de Finalización',
            sortable: true,
            render: (value) => (
                <span className="text-xs font-semibold text-slate-600">{formatearFecha(value)}</span>
            )
        },
        {
            key: 'total_inscritos',
            label: 'Número de Inscritos',
            sortable: true,
            align: 'center',
            render: (value, row) => {
                const inscritos = value || 0;
                const maxCupos = row.cupos || 1;
                const porcentajeCarga = Math.min((inscritos / maxCupos) * 100, 100);
                
                return (
                    <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
                        <div className="flex items-center gap-1">
                            <Users2 size={13} className="text-primary-blue" />
                            <span className="text-xs font-bold text-slate-700">
                                {inscritos} <span className="text-slate-400 font-normal">/ {maxCupos} Alumnos</span>
                            </span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 shadow-inner">
                            <div 
                                className={`h-full transition-all duration-500 ${porcentajeCarga >= 100 ? 'bg-amber-500' : 'bg-primary-blue'}`}
                                style={{ width: `${porcentajeCarga}%` }}
                            />
                        </div>
                    </div>
                );
            },
        },
    ];

    // Acciones de Fila del DataTable
    const renderAcciones = (row) => (
        <div className="flex items-center gap-1 justify-end">
            <button
                onClick={() => { setSelectedPasantia(row); setModalPasantiaOpen(true); }}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition"
                title="Ver detalles de la pasantía"
            >
                <Briefcase size={17} />
            </button>
            <button
                onClick={() => { setSelectedPasantia(row); setModalPasantesOpen(true); }}
                className="p-2 text-primary-blue hover:bg-primary-blue/10 rounded-lg transition"
                title="Ver alumnos inscritos"
            >
                <Eye size={17} />
            </button>
            <Link
                href={`/jefe/actividades/${row.id}`}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition inline-flex items-center"
                title="Ver seguimiento de actividades"
            >
                <ClipboardList size={17} />
            </Link>
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mis Pasantías" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Mis Pasantías' },
            ]} />

            {/* Encabezado Principal con Botón de Modal Empresa */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-primary-navy uppercase tracking-tight">Mis Pasantías</h1>
                    <p className="text-slate-500 text-sm">Administración y control de tus convocatorias y estudiantes asignados.</p>
                </div>
                {empresa && (
                    <button
                        onClick={() => setModalEmpresaOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm shrink-0"
                    >
                        <Building2 size={15} />
                        Ver Empresa
                    </button>
                )}
            </div>

            {/* Tabla Principal */}
            <DataTable
                columns={columns}
                data={pasantias}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar por nombre de pasantía..."
            />

            {/* MODAL 1: DATOS DE LA EMPRESA */}
            <Modal show={modalEmpresaOpen} onClose={() => setModalEmpresaOpen(false)} title="Información Corporativa" maxWidth="md">
                {empresa && (
                    <div className="p-1 space-y-4">
                        <div className="flex items-center gap-3 bg-slate-900 text-white p-4 rounded-xl">
                            <div className="p-2.5 bg-white/10 rounded-lg text-white">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-base tracking-tight leading-tight">{empresa.nombre}</h3>
                                <p className="text-slate-400 text-xs mt-0.5">NIT: {empresa.nit}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2.5 py-1.5 border-b border-slate-200/60">
                                <ShieldCheck size={16} className="text-slate-400" />
                                <span><strong className="text-slate-700">Rubro/Sector:</strong> {empresa.rubro}</span>
                            </div>
                            <div className="flex items-center gap-2.5 py-1.5 border-b border-slate-200/60">
                                <MapPin size={16} className="text-slate-400" />
                                <span className="truncate"><strong className="text-slate-700">Dirección:</strong> {empresa.direccion}</span>
                            </div>
                            <div className="flex items-center gap-2.5 py-1.5 border-b border-slate-200/60">
                                <Phone size={16} className="text-slate-400" />
                                <span><strong className="text-slate-700">Teléfono:</strong> {empresa.telefono}</span>
                            </div>
                            <div className="flex items-center gap-2.5 py-1.5">
                                <Mail size={16} className="text-slate-400" />
                                <span><strong className="text-slate-700">Correo Electrónico:</strong> {empresa.correo}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: DETALLES DE LA PASANTÍA */}
            <Modal show={modalPasantiaOpen} onClose={() => setModalPasantiaOpen(false)} title="Especificaciones Técnicas" maxWidth="md">
                {selectedPasantia && (
                    <div className="p-1 space-y-4">
                        <div className="bg-primary-navy text-white p-4 rounded-xl">
                            <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest block mb-1">Mención / Especialidad</span>
                            <h3 className="font-extrabold text-base tracking-tight leading-snug">{selectedPasantia.mencion}</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                                <Clock size={18} className="text-primary-blue shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">Carga Horaria</span>
                                    <span className="text-sm font-bold text-slate-700 truncate">{selectedPasantia.carga_horaria} Horas</span>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                                <Calendar size={18} className="text-primary-blue shrink-0" />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] font-medium text-slate-400 uppercase">Turno Asignado</span>
                                    <span className="text-sm font-bold text-slate-700 capitalize truncate">{selectedPasantia.turno}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                            <div className="flex justify-between">
                                <span className="font-medium">Identificador Único:</span>
                                <span className="font-mono bg-slate-200/60 px-1.5 rounded text-slate-700">ID-{selectedPasantia.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Nombre de Convocatoria:</span>
                                <span className="font-semibold text-slate-700 truncate max-w-[200px]">{selectedPasantia.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Vigencia Total:</span>
                                <span className="font-semibold text-slate-700">{formatearFecha(selectedPasantia.fecha_ini)} al {formatearFecha(selectedPasantia.fecha_fin)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 3: PASANTES INSCRITOS */}
            <Modal show={modalPasantesOpen} onClose={() => setModalPasantesOpen(false)} title="Pasantes Inscritos" maxWidth="lg">
                {selectedPasantia && (
                    <div className="space-y-4 p-1">
                        <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div className="p-2 bg-blue-50 text-primary-blue rounded-lg shrink-0">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pasantía Seleccionada</span>
                                <h3 className="font-bold text-sm text-primary-navy tracking-tight leading-tight">{selectedPasantia.nombre}</h3>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                                Lista de Alumnos ({selectedPasantia.pasantes_inscritos.length})
                            </h4>

                            {selectedPasantia.pasantes_inscritos.length > 0 ? (
                                <ul className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-sm">
                                    {selectedPasantia.pasantes_inscritos.map(p => (
                                        <li key={p.id} className="flex justify-between items-center p-3 hover:bg-slate-50/60 transition duration-150">
                                            <span className="text-xs font-bold text-slate-700 tracking-tight">{p.nombre}</span>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${
                                                p.estado_inscripcion === 'activo' || p.estado_inscripcion === 'ACEPTADO'
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                                <span className={`w-1 h-1 rounded-full ${p.estado_inscripcion === 'activo' || p.estado_inscripcion === 'ACEPTADO' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                {p.estado_inscripcion}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center">
                                    <div className="p-2.5 bg-slate-100 text-slate-400 rounded-full mb-2">
                                        <UserX size={18} />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 max-w-xs">No hay pasantes registrados en esta pasantía actualmente.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <Link
                                // llevar a la ruta '/jefe/pasantes/{id_pasantia}'
                                href={route('jefe.pasantes.show', { id_pasantia: selectedPasantia.id })}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-blue hover:text-blue-700 bg-blue-50 px-3 py-2 rounded-lg transition"
                            >
                                <Users size={14} /> 
                                <span>Ver todos mis pasantes</span>
                                <ArrowRight size={12} className="opacity-70" />
                            </Link>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
}