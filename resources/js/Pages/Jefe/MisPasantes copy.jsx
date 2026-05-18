// resources/js/Pages/Jefe/MisPasantes.jsx
import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal'; // Tu componente mejorado
import { Eye, BookOpen, User, ClipboardList } from 'lucide-react';

export default function MisPasantes({ pasantes = [], auth }) {
    const [selectedPasante, setSelectedPasante] = useState(null);
    const [isPerfilOpen, setIsPerfilOpen] = useState(false);
    const [isBitacoraOpen, setIsBitacoraOpen] = useState(false);

    console.log(pasantes);
    

    // 1. Mapeo de datos para aplanar la estructura del JSON recibido
    const datosTabla = useMemo(() => {
        return pasantes.map(item => ({
            id: item.inscripcion_id,
            nombre_completo: item.pasante?.nombre || 'Estudiante sin nombre',
            ru: item.pasante?.ru || 'S/R',
            matricula: item.pasante?.matricula || 'S/M',
            pasantia_nombre: item.pasantia?.nombre || 'No especificada',
            estado: item.estado,
            // Guardamos el objeto original para los detalles de los modales
            raw: item 
        }));
    }, [pasantes]);

    console.log(datosTabla);
    

    // 2. Controladores de Modales
    const verPerfil = (row) => {
        setSelectedPasante(row.raw);
        setIsPerfilOpen(true);
    };

    const verBitacora = (row) => {
        setSelectedPasante(row.raw);
        setIsBitacoraOpen(true);
    };

    const breadcrumbs = [
        { label: 'Inicio', url: 'jefe.dashboard' },
        { label: 'Gestión de Pasantes', url: 'jefe.pasantes' },
        { label: 'Mis Asignados' },
    ];

    // 3. Definición de Columnas para el DataTable
    const columns = [
        {
            key: 'nombre_completo',
            label: 'Estudiante',
            sortable: true,
            render: (value) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-navy/10 flex items-center justify-center text-primary-navy font-bold border border-primary-navy/20">
                        {/* Fix Seguro para charAt(0) */}
                        {value && value.trim() ? value.trim().charAt(0).toUpperCase() : <User size={16}/>}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 leading-none">{value}</span>
                        <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Pasante Interno</span>
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
            key: 'pasantia_nombre',
            label: 'Pasantia',
            sortable: true,
            render: (value) => (
                <div className="max-w-[200px] truncate font-medium text-slate-600" title={value}>
                    {value}
                </div>
            )
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
            align: 'center',
            render: (value) => {
                const colorMap = {
                    'Inscrito': 'bg-blue-50 text-blue-600 border-blue-200',
                    'Activo': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                    'Finalizado': 'bg-purple-50 text-purple-600 border-purple-200',
                };
                return (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${colorMap[value] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {value}
                    </span>
                );
            },
        },
    ];

    // 4. Renderizado de Acciones
    const renderAcciones = (row) => (
        <div className="flex gap-2">
            <button
                onClick={() => verPerfil(row)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-blue hover:border-primary-blue rounded-lg transition-all shadow-sm"
                title="Perfil Completo"
            >
                <Eye size={18} />
            </button>
            <button
                onClick={() => verBitacora(row)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-50 rounded-lg transition-all shadow-sm"
                title="Bitácora de Avances"
            >
                <BookOpen size={18} />
            </button>
        </div>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mis Pasantes" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-primary-navy tracking-tight uppercase">
                        Mis Pasantes
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Seguimiento detallado de estudiantes bajo tu supervisión.
                    </p>
                </div>
                <div className="hidden md:block">
                   <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                       TOTAL: {datosTabla.length} ASIGNADOS
                   </span>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={datosTabla}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar por nombre, RU o proyecto..."
            />

            {/* Modal Perfil - Usando tu Modal.jsx */}
            <Modal
                show={isPerfilOpen}
                onClose={() => setIsPerfilOpen(false)}
                title="Detalles del Pasante"
                maxWidth="2xl"
            >
                {selectedPasante && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                        <div className="flex flex-col items-center p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                            <div className="h-20 w-20 bg-primary-navy text-white rounded-full flex items-center justify-center text-3xl font-bold mb-3 shadow-lg">
                                {selectedPasante.pasante?.nombre?.charAt(0)}
                            </div>
                            <h3 className="font-bold text-slate-800 text-center">{selectedPasante.pasante?.nombre}</h3>
                            <p className="text-xs text-slate-500">Pasante Asignado</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información Académica</h4>
                                <ul className="mt-2 space-y-2 text-sm">
                                    <li className="flex justify-between border-b border-slate-100 pb-1">
                                        <span className="text-slate-500">RU:</span>
                                        <span className="font-bold text-slate-700">{selectedPasante.pasante?.ru}</span>
                                    </li>
                                    <li className="flex justify-between border-b border-slate-100 pb-1">
                                        <span className="text-slate-500">Matrícula:</span>
                                        <span className="font-bold text-slate-700">{selectedPasante.pasante?.matricula}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span className="text-slate-500">Proyecto:</span>
                                        <span className="font-bold text-primary-blue">{selectedPasante.pasantia?.nombre}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Bitácora - Usando tu Modal.jsx */}
            <Modal
                show={isBitacoraOpen}
                onClose={() => setIsBitacoraOpen(false)}
                title={`Bitácora: ${selectedPasante?.pasante?.nombre || ''}`}
                maxWidth="3xl"
            >
                {/* Contenedor principal con scroll e hilos de línea de tiempo limpios */}
                <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-3 pl-2 scrollbar-thin scrollbar-thumb-slate-200">
                    {selectedPasante?.bitacora && selectedPasante.bitacora.length > 0 ? (
                        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 py-2">
                            {selectedPasante.bitacora.map((entry, idx) => {
                                const tieneNota = entry.nota !== null && entry.nota !== undefined;
                                
                                return (
                                    <div key={idx} className="relative pl-6 transition-all duration-200 hover:translate-x-0.5">
                                        {/* Nodo indicador en la línea de tiempo */}
                                        <span 
                                            className={`absolute -left-[7px] top-4 h-3 w-3 rounded-full border-2 bg-white shadow-sm ${
                                                tieneNota ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-amber-400 ring-4 ring-amber-50'
                                            }`} 
                                        />
                                        
                                        {/* Tarjeta de la Bitácora */}
                                        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                                            
                                            {/* Encabezado de la Tarjeta */}
                                            <div className="bg-slate-50/70 px-4 py-3 border-b border-slate-100 flex justify-between items-start gap-4">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">
                                                        Actividad Asociada
                                                    </span>
                                                    <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                                                        {entry.actividad_nombre}
                                                    </h4>
                                                </div>
                                                
                                                {/* Calificación o Estado */}
                                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${
                                                        tieneNota 
                                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                            : 'bg-amber-50 border-amber-200 text-amber-700'
                                                    }`}>
                                                        {tieneNota ? `Nota: ${entry.nota}` : 'Sin Nota'}
                                                    </span>
                                                    {entry.fecha && (
                                                        <span className="text-[10px] font-medium text-slate-400">
                                                            {new Date(entry.fecha).toLocaleDateString('es-ES', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Cuerpo y Detalles de la Evaluación */}
                                            <div className="p-4 space-y-3.5">
                                                {/* Descripción del Avance */}
                                                <div>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">
                                                        Descripción / Avance
                                                    </span>
                                                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                                                        {entry.descripcion || 'No se registró una descripción del avance.'}
                                                    </p>
                                                </div>

                                                {/* Bloque Condicional: Observaciones y Recomendaciones */}
                                                {(entry.observacion || entry.recomendacion) && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 bg-slate-50/40 -mx-4 -mb-4 p-4">
                                                        {entry.observacion && (
                                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
                                                                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight block mb-0.5">
                                                                    Observaciones
                                                                </span>
                                                                <p className="text-xs text-slate-600 leading-normal">
                                                                    {entry.observacion}
                                                                </p>
                                                            </div>
                                                        )}
                                                        
                                                        {entry.recomendacion && (
                                                            <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 shadow-xs">
                                                                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight block mb-0.5">
                                                                    Recomendaciones
                                                                </span>
                                                                <p className="text-xs text-slate-600 leading-normal">
                                                                    {entry.recomendacion}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Layout para Estado Vacío */
                        <div className="flex flex-col items-center justify-center py-14 text-slate-400 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200/80 m-2">
                            <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-3">
                                <ClipboardList size={32} strokeWidth={1.5} className="text-slate-300" />
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">Sin registros en la bitácora</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs text-center">
                                Este pasante no tiene ninguna evaluación registrada bajo las actividades actuales.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>

        </DashboardLayout>
    );
}