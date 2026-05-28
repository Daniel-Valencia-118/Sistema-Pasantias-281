import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ProgressBar from '@/Components/ProgressBar';
import { Eye, ClipboardList, User, Briefcase, ChevronRight, GraduationCap, Phone, Mail, Award, Calendar, ChevronLeft} from 'lucide-react';

export default function MisPasantes({ pasantia = {}, listadoPasantes = [], auth }) {
    const [selectedPasante, setSelectedPasante] = useState(null);
    const [isPerfilOpen, setIsPerfilOpen] = useState(false);
    const [isProgresosOpen, setIsProgresosOpen] = useState(false);

    console.log(pasantia, listadoPasantes);
    

    // Acción 1: Ver Perfil Completo
    const verPerfil = (pasante) => {
        setSelectedPasante(pasante);
        setIsPerfilOpen(true);
    };

    // Acción 2: Ver Lista de Progresos y Notas
    const verProgresos = (pasante) => {
        setSelectedPasante(pasante);
        setIsProgresosOpen(true);
    };

    // Acción 3: Hacer Seguimiento (Redirección con parámetros)
    const hacerSeguimiento = (pasante) => {
        
        router.get(`/jefe/evaluaciones/${pasantia.id_pasantia}/bitacoras`, {
            inscripcion_id: pasante.id,
            pasante_id: pasante.idU_pasante
        });
    };

    const breadcrumbs = [
        { label: 'Inicio', url: 'jefe.dashboard' },
        { label: 'Gestión de Pasantías', url: 'jefe.pasantias.tarjetas' }, 
        { label: pasantia.nombre_pasantia || 'Pasantes Asignados' },
    ];

    const columns = [
        {
            key: 'nombre_completo',
            label: 'Estudiante',
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy font-bold border border-primary-navy/20">
                        {value ? value.charAt(0).toUpperCase() : <User size={16}/>}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 leading-none">{value}</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Pasante Asignado</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'ru',
            label: 'Identificación',
            sortable: true,
            render: (value, row) => (
                <div className="flex flex-col text-xs">
                    <span className="font-semibold text-slate-600">RU: {value}</span>
                    <span className="text-slate-400 italic">MAT: {row.matricula}</span>
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado de Inscripción',
            sortable: true,
            align: 'center',
            render: (value) => {
                const colorMap = {
                    'inscrito': 'bg-blue-50 text-blue-600 border-blue-200',
                    'iniciado': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    'finalizado': 'bg-purple-50 text-purple-600 border-purple-200',
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${colorMap[value] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {value}
                    </span>
                );
            },
        },
    ];

    const renderAcciones = (row) => (
        <div className="flex gap-2 justify-end">
            <button
                onClick={() => verPerfil(row)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-blue hover:border-primary-blue rounded-lg transition-all shadow-sm"
                title="Ver Perfil Completo"
            >
                <Eye size={17} />
            </button>
            <button
                onClick={() => verProgresos(row)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-500 rounded-lg transition-all shadow-sm"
                title="Ver Progreso de Actividades"
            > 
                <ClipboardList size={17} />
            </button>
            <button
                onClick={() => hacerSeguimiento(row)}
                className="p-2 bg-primary-blue text-white hover:bg-primary-navy rounded-lg transition-all shadow-sm flex items-center gap-1 text-xs font-bold px-3"
                title="Hacer Seguimiento de Bitácoras"
            >
                Seguimiento
                <ChevronRight size={14} />
            </button>
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Pasantes - ${pasantia.nombre_pasantia}`} />
            {/* <Breadcrumbs items={breadcrumbs} /> */}

            {/* Botón volver */}
            <div className="mb-2">
                <button
                    onClick={() => router.visit("/jefe/pasantias/tarjetas?origen=pasantes")}
                    className="group flex items-center gap-2 text-gray-600 hover:text-primary-blue transition"
                >
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-primary-blue transition">
                        <ChevronLeft size={18} />
                    </div>

                    <span className="font-medium">
                        Volver a Pasantias
                    </span>
                </button>
            </div>

            {/* Encabezado Principal */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-blue/10 rounded-xl text-primary-blue border border-primary-blue/10 mt-1">
                        <Briefcase size={26} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black tracking-widest text-primary-blue bg-primary-blue/5 px-2 py-0.5 rounded uppercase">
                            {pasantia.codigo}
                        </span>
                        <h1 className="text-2xl font-black text-primary-navy tracking-tight uppercase mt-1">
                            {pasantia.nombre_pasantia}
                        </h1>
                        <p className="text-slate-500 font-medium text-sm mt-0.5">
                            Panel de control y revisión de pasantes asignados a este programa.
                        </p>
                    </div>
                </div>
                <div className="shrink-0">
                    <span className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl block shadow-2xs">
                        {listadoPasantes.length} Estudiantes Cargados
                    </span>
                </div>
            </div>

            {/* Tabla Principal de Pasantes */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden p-6">
                <DataTable
                    columns={columns}
                    data={listadoPasantes}
                    actionsRender={renderAcciones}
                    searchPlaceholder="Buscar pasante por nombre, RU o matrícula..."
                />
            </div>

            {/* MODAL 1: Ver Perfil */}
            <Modal
                show={isPerfilOpen}
                onClose={() => setIsPerfilOpen(false)}
                title="Información Detallada del Pasante"
                maxWidth="2xl"
            >
                {selectedPasante && (
                    <div className="p-2 space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <div className="h-16 w-16 bg-primary-navy text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
                                {selectedPasante.nombre_completo.charAt(0)}
                            </div>
                            <div className="text-center sm:text-left">
                                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{selectedPasante.nombre_completo}</h3>
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Pasante Universitario</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-3 border border-slate-100 rounded-xl space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1.5">
                                    <GraduationCap size={12} className="text-primary-blue"/> Datos Académicos
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between"><span className="text-slate-500">CI:</span><span className="font-bold text-slate-700">{selectedPasante.ci}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">RU:</span><span className="font-bold text-slate-700">{selectedPasante.ru}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Matrícula:</span><span className="font-bold text-slate-700">{selectedPasante.matricula}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-500">Estado Actual:</span><span className="font-black text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">{selectedPasante.estado}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Mención:</span><span className="font-bold text-slate-700">{selectedPasante.mencion}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">Semestre:</span><span className="font-bold text-slate-700">{selectedPasante.semestre}</span></div>
                                </div>
                            </div>

                            <div className="bg-white p-3 border border-slate-100 rounded-xl space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b pb-1.5">
                                    <Phone size={12} className="text-primary-blue"/> Información de Contacto
                                </h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2"><Mail size={13} className="text-slate-600"/><span className="text-slate-600 font-medium truncate">{selectedPasante.email}</span></div>
                                    <div className="flex items-center gap-2"><Phone size={13} className="text-slate-400"/><span className="text-slate-600 font-bold">{selectedPasante.telefono}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: Ver Progresos (Lista de Actividades + Notas de Bitácora) */}
            <Modal
                show={isProgresosOpen}
                onClose={() => setIsProgresosOpen(false)}
                title={`Progreso de Actividades: ${selectedPasante?.nombre_completo || ''}`}
                maxWidth="3xl"
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pl-1 scrollbar-thin scrollbar-thumb-slate-200">
                    {selectedPasante?.actividades_progreso && selectedPasante.actividades_progreso.length > 0 ? (
                        selectedPasante.actividades_progreso.map((act, idx) => (
                            <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                                {/* Encabezado de la actividad */}
                                <div className="bg-slate-50/70 px-4 py-2.5 border-b border-slate-100 flex justify-between items-center gap-4">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-bold text-primary-blue uppercase tracking-wider block">Actividad Programada</span>
                                        <h4 className="text-sm font-bold text-slate-800 leading-tight">{act.nombre_actividad}</h4>
                                    </div>
                                    {/* Mostrar Nota si existe evaluación en BITACORA */}
                                    <div className="shrink-0">
                                        {act.nota !== null ? (
                                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-700" title="Nota Evaluada en Bitácora">
                                                <Award size={14} className="stroke-[2.5]" />
                                                <span className="text-xs font-black">Nota: {act.nota}</span>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md italic">
                                                Sin calificar
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Cuerpo: Progreso más reciente (PROGRESO_ACT) */}
                                <div className="p-4 space-y-3">
                                    <div className="bg-slate-50/30 p-2.5 rounded-lg border border-slate-100/80">
                                        <ProgressBar percentage={act.porcentaje} />
                                    </div>

                                    <div className="text-xs">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block">Detalle del último avance reportado:</span>
                                        <p className="text-slate-600 mt-1 leading-relaxed bg-slate-50/50 p-2 rounded border border-slate-100">
                                            {act.descripcion_progreso}
                                        </p>
                                    </div>

                                    {/* Retroalimentación si existe evaluación */}
                                    {(act.observacion || act.recomendacion) && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 mt-2 border-t border-slate-100">
                                            {act.observacion && (
                                                <div className="bg-blue-50/40 p-2 rounded-lg border border-blue-100/50">
                                                    <span className="text-[9px] font-bold text-primary-blue uppercase block">Observación Realizada</span>
                                                    <p className="text-[11px] text-slate-600 mt-0.5">{act.observacion}</p>
                                                </div>
                                            )}
                                            {act.recomendacion && (
                                                <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/50">
                                                    <span className="text-[9px] font-bold text-emerald-700 uppercase block">Recomendación / Respuesta</span>
                                                    <p className="text-[11px] text-slate-600 mt-0.5">{act.recomendacion}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {act.fecha_progreso && (
                                        <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-end pt-1">
                                            <Calendar size={11} />
                                            <span>Actualizado el: {act.fecha_progreso} a las {act.hora_progreso}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-400 italic text-sm">
                            Esta pasantía no cuenta con actividades configuradas.
                        </div>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}