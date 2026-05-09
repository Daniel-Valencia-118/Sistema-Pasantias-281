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
        { label: 'Inicio', href: route('dashboard') },
        { label: 'Gestión de Pasantes', href: '#' },
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
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {selectedPasante?.bitacora && selectedPasante.bitacora.length > 0 ? (
                        selectedPasante.bitacora.map((entry, idx) => (
                            <div key={idx} className="relative pl-6 border-l-2 border-slate-200 py-1">
                                <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-white border-2 border-primary-blue shadow-sm" />
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-primary-navy uppercase">{entry.actividad}</span>
                                        <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded border">{entry.fecha}</span>
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{entry.descripcion}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <ClipboardList size={48} className="mb-2 opacity-20" />
                            <p className="font-bold">Sin registros de actividad</p>
                            <p className="text-xs">Este pasante aún no ha reportado avances en su bitácora.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </DashboardLayout>
    );
}