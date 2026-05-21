import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import SelectInput from '@/Components/SelectInput';
import InfoItem from '@/Components/InfoItem';
import { 
    Eye, 
    ClipboardCheck, 
    CheckCircle, 
    Clock, 
    XCircle, 
    HelpCircle, 
    FileText, 
    User, 
    UserCheck, 
    ExternalLink, 
    Calendar,
    ChevronLeft,
} from 'lucide-react';

export default function Bitacoras({ pasantia, pasantesData = [], auth }) {
    // Estados para Modales
    const [progresoModal, setProgresoModal] = useState(false);
    const [selectedProgresoList, setSelectedProgresoList] = useState([]);
    const [selectedActividadNombre, setSelectedActividadNombre] = useState('');

    // NUEVO: Estado para Modal Autoevaluación
    const [autoEvaModal, setAutoEvaModal] = useState(false);
    const [selectedAutoEva, setSelectedAutoEva] = useState(null);

    const [evaluarModal, setEvaluarModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); 
    const [activePasante, setActivePasante] = useState(null);
    const [activeActividad, setActiveActividad] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id_actividad: null,
        idU_pasante: null,
        nota: '',
        observacion: '',
        estado: 'completada',
    });

    const abrirProgreso = (actividad) => {
        setSelectedActividadNombre(actividad.nombre_act);
        setSelectedProgresoList(actividad.historial_progresos || []);
        setProgresoModal(true);
    };

    // NUEVO: Abrir Autoevaluación
    const abrirAutoevaluacion = (actividad) => {
        setSelectedActividadNombre(actividad.nombre_act);
        setSelectedAutoEva(actividad.autoevaluacion);
        setAutoEvaModal(true);
    };

    const abrirEvaluacion = (pasante, actividad) => {
        setActivePasante(pasante);
        setActiveActividad(actividad);

        if (actividad.tiene_bitacora) {
            setModalMode('view');
            setData({
                nota: actividad.bitacora.nota ?? '',
                observacion: actividad.bitacora.observacion ?? '',
                estado: actividad.bitacora.estado ?? 'completada',
            });
        } else {
            setModalMode('create');
            reset();
            setData({
                id_actividad: actividad.id_actividad,
                idU_pasante: pasante.idU_pasante,
                nota: '',
                observacion: '',
                estado: 'completada',
            });
        }
        setEvaluarModal(true);
    };

    const handleEvaluarSubmit = (e) => {
        e.preventDefault();
        post(route('jefe.evaluarBitacora'), {
            onSuccess: () => {
                setEvaluarModal(false);
                reset();
            },
        });
    };

    // NUEVO: Redirección a la gestión global de actividades
    const verActividadGlobal = (id_actividad) => {
        router.get('/jefe/evaluaciones/subactividades', { id_actividad: id_actividad });
    };

    const irARedactarInforme = (idU_pasante) => {
        router.get('/jefe/informes/redactar', { 
            pasante_id: idU_pasante, 
            pasantia_id: pasantia.id 
        });
    };

    const getEstadoBadge = (estado) => {
        const icons = {
            'completada': <CheckCircle size={14} className="text-green-500" />,
            'completada parcialmente': <Clock size={14} className="text-orange-500" />,
            'no realizada': <XCircle size={14} className="text-red-500" />,
            'sin calificar': <HelpCircle size={14} className="text-gray-500" />,
        };
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                {icons[estado] || null} {estado}
            </span>
        );
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title={`Bitácoras - ${pasantia.nombre}`} />
            
            <Breadcrumbs items={[
                { label: 'Inicio', url: route('jefe.dashboard') },
                { label: 'Pasantías Activas', url: route('jefe.pasantias.tarjetas', { origen: 'bitacoras' }) }, 
                { label: 'Seguimiento de Bitácoras' },
            ]} />

            {/* Botón volver */}
            <div className="mb-2">
                <button
                    onClick={() => router.visit("/jefe/pasantias/tarjetas")}
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

            <div className="mb-8 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <span className="text-xs font-bold tracking-wider text-primary-blue uppercase bg-primary-blue/10 px-3 py-1 rounded-full">Programa de Pasantía</span>
                <h1 className="text-3xl font-black text-primary-navy uppercase mt-2">{pasantia.nombre}</h1>
                <p className="text-slate-500 mt-1">Empresa / Institución asignada: <span className="font-semibold text-slate-700">{pasantia.empresa}</span></p>
            </div>

            {pasantesData.length === 0 ? (
                <div className="bg-white border text-center p-12 rounded-2xl text-slate-400">
                    No existen pasantes inscritos o asignados a su cargo bajo esta pasantía.
                </div>
            ) : (
                <div className="space-y-10">
                    {pasantesData.map((pasante) => (
                        <div key={pasante.idU_pasante} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            
                            {/* Barra Superior del Pasante */}
                            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-primary-navy text-white rounded-xl">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-primary-navy">{pasante.nombre_completo}</h2>
                                        <p className="text-xs text-slate-500">Pasante bajo supervisión</p>
                                    </div>
                                </div>
                                
                                {pasante.listo_para_informe && (
                                    <button
                                        onClick={() => irARedactarInforme(pasante.idU_pasante)}
                                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm"
                                    >
                                        <FileText size={16} />
                                        Crear Informe Final
                                    </button>
                                )}
                            </div>

                            {/* Tabla Dinámica de Actividades */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="py-4 px-6 w-4/12">Actividad Requerida</th>
                                            <th className="py-4 px-6 w-2/12">Vigencia (Plazos)</th>
                                            <th className="py-4 px-6 w-2/12">Progreso</th>
                                            <th className="py-4 px-6 w-2/12 text-center">Evaluación (Bitácora)</th>
                                            <th className="py-4 px-6 w-2/12 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {pasante.actividades.map((actividad) => (
                                            <tr key={actividad.id_actividad} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6 font-medium text-slate-700">
                                                    {actividad.nombre_act}
                                                </td>
                                                
                                                {/* NUEVO: Columna Vigencia con colores */}
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1 text-xs font-bold">
                                                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md w-max">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                            Inicia: {actividad.fecha_ini}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md w-max">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                            Termina: {actividad.fecha_fin}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                                            <div 
                                                                className="bg-primary-blue h-2.5 rounded-full transition-all duration-500" 
                                                                style={{ width: `${actividad.porcentaje_progreso}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-600 min-w-[32px] text-right">
                                                            {actividad.porcentaje_progreso}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {actividad.tiene_bitacora ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            {getEstadoBadge(actividad.bitacora.estado)}
                                                            <span className="text-xs font-bold text-primary-blue">
                                                                Nota: {actividad.bitacora.nota}/100
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium border border-amber-100">
                                                            Pendiente Evaluar
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        
                                                        {/* NUEVO: Acción 1 - Ver Actividad */}
                                                        <button
                                                            onClick={() => verActividadGlobal(actividad.id_actividad)}
                                                            className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl transition-all"
                                                            title="Ver configuración de actividad"
                                                        >
                                                            <ExternalLink size={15} />
                                                        </button>

                                                        {/* Acción 2: Ver Progreso Histórico */}
                                                        <button
                                                            onClick={() => abrirProgreso(actividad)}
                                                            className="p-2 bg-slate-100 text-slate-600 hover:bg-primary-navy hover:text-white rounded-xl transition-all"
                                                            title="Ver Progreso Histórico"
                                                        >
                                                            <Eye size={15} />
                                                        </button>

                                                        {/* NUEVO: Acción 3 - Ver Autoevaluación */}
                                                        <button
                                                            onClick={() => abrirAutoevaluacion(actividad)}
                                                            disabled={!actividad.tiene_autoevaluacion}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                actividad.tiene_autoevaluacion 
                                                                    ? 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white' 
                                                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                                            }`}
                                                            title={actividad.tiene_autoevaluacion ? "Ver Autoevaluación del alumno" : "Sin autoevaluación"}
                                                        >
                                                            <UserCheck size={15} />
                                                        </button>

                                                        {/* Acción 4: Evaluar / Ver Detalle */}
                                                        <button
                                                            onClick={() => abrirEvaluacion(pasante, actividad)}
                                                            className={`p-2 rounded-xl transition-all ${
                                                                actividad.tiene_bitacora 
                                                                    ? 'bg-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white'
                                                                    : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200'
                                                            }`}
                                                            title={actividad.tiene_bitacora ? "Ver Bitácora Evaluada" : "Evaluar Actividad"}
                                                        >
                                                            <ClipboardCheck size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL 1: HISTORIAL DE PROGRESOS */}
            <Modal show={progresoModal} onClose={() => setProgresoModal(false)} title={`Historial de Progresos: ${selectedActividadNombre}`} maxWidth="2xl">
                <div className="p-1">
                    {selectedProgresoList.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-6">El estudiante no ha registrado avances en esta actividad todavía.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs font-bold uppercase text-slate-400 bg-slate-50">
                                        <th className="p-3 w-3/12">Fecha / Hora</th>
                                        <th className="p-3 w-2/12 text-center">Avance</th>
                                        <th className="p-3 w-7/12">Descripción del Avance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {selectedProgresoList.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50/50">
                                            <td className="p-3 text-slate-600 font-medium">
                                                {p.fecha} <span className="text-slate-400 text-xs ml-1">{p.hora}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="bg-primary-blue/10 text-primary-blue text-xs font-bold px-2 py-0.5 rounded-md">
                                                    {p.porcentaje}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600 whitespace-pre-line text-xs leading-relaxed">
                                                {p.descripcion}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="flex justify-end mt-4">
                        <SecondaryButton onClick={() => setProgresoModal(false)}>Cerrar ventana</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* NUEVO: MODAL 2: VER AUTOEVALUACIÓN (AUTO_EVA) */}
            <Modal show={autoEvaModal} onClose={() => setAutoEvaModal(false)} title={`Autoevaluación del Pasante: ${selectedActividadNombre}`} maxWidth="xl">
                <div className="space-y-4">
                    {selectedAutoEva ? (
                        <>
                            <div className="grid grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                                <div>
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Nota del Alumno</span>
                                    <span className="text-2xl font-black text-purple-700">{selectedAutoEva.nota} <span className="text-sm font-normal text-purple-500">/ 100</span></span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">Fecha de Envío</span>
                                    <span className="text-sm font-semibold text-slate-700 flex items-center justify-end gap-1 mt-1">
                                        <Calendar size={14} className="text-purple-500" />
                                        {selectedAutoEva.fecha}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                <InputLabel value="Comentario reflexivo del estudiante:" className="text-purple-900 font-bold" />
                                <div className="mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                    {selectedAutoEva.comentario || "El estudiante no adjuntó comentarios a su autoevaluación."}
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-slate-400 text-center py-4">No hay datos válidos registrados.</p>
                    )}
                    
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <SecondaryButton onClick={() => setAutoEvaModal(false)}>Regresar a la lista</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* MODAL 3: EVALUAR (CREAR BITÁCORA) O SOLO VER */}
            <Modal 
                show={evaluarModal} 
                onClose={() => setEvaluarModal(false)} 
                title={modalMode === 'create' ? "Evaluar y Registrar Bitácora" : "Detalle de Bitácora Auditada"} 
                maxWidth="2xl"
            >
                <form onSubmit={handleEvaluarSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl">
                        <InfoItem label="Pasante" value={activePasante?.nombre_completo || ''} />
                        <InfoItem label="Actividad a calificar" value={activeActividad?.nombre_act || ''} />
                    </div>

                    <div>
                        <InputLabel htmlFor="nota" value="Calificación Asignada (0 - 100)" />
                        <TextInput 
                            id="nota" 
                            type="number" 
                            min="0" 
                            max="100" 
                            value={data.nota} 
                            onChange={e => setData('nota', e.target.value)} 
                            disabled={modalMode === 'view'}
                            required 
                            className="w-full mt-1"
                            placeholder="Ej. 85"
                        />
                        <InputError message={errors.nota} />
                    </div>

                    <div>
                        <InputLabel htmlFor="observacion" value="Observaciones / Retroalimentación del Jefe" />
                        <TextArea
                            id="observacion"
                            value={data.observacion}
                            onChange={e => setData('observacion', e.target.value)}
                            disabled={modalMode === 'view'}
                            rows="4"
                            className="w-full rounded-xl border-slate-200 mt-1 focus:ring-primary-blue focus:border-primary-blue disabled:bg-slate-50"
                            placeholder="Escribe comentarios sobre el rendimiento..."
                        />
                        <InputError message={errors.observacion} />
                    </div>

                    <div>
                        <InputLabel htmlFor="estado" value="Estado de Cumplimiento" />
                        <SelectInput
                            id="estado"
                            value={data.estado}
                            onChange={e => setData('estado', e.target.value)}
                            disabled={modalMode === 'view'}
                            className="w-full rounded-xl border-slate-200 mt-1 focus:ring-primary-blue focus:border-primary-blue disabled:bg-slate-50"
                        >
                            <option value="completada">Completada</option>
                            <option value="completada parcialmente">Completada parcialmente</option>
                            <option value="no realizada">No realizada</option>
                        </SelectInput>
                        <InputError message={errors.estado} />
                    </div>

                    <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <SecondaryButton type="button" onClick={() => setEvaluarModal(false)}>
                            {modalMode === 'view' ? 'Regresar' : 'Cancelar'}
                        </SecondaryButton>
                        
                        {modalMode === 'create' && (
                            <PrimaryButton type="submit" disabled={processing}>
                                Asentar Evaluación
                            </PrimaryButton>
                        )}
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}