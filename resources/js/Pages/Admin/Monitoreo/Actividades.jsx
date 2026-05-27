import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import SelectInput from '@/Components/SelectInput';
import InfoItem from '@/Components/InfoItem';
import TextAreaField from '@/Components/Form/TextAreaField';
import TextArea from '@/Components/TextArea';
import { 
    Search, Edit, Eye, Plus, Calendar, 
    Trash2, ClipboardList, Info, Link as LinkIcon,
    AlertCircle, FileText
} from 'lucide-react';
import Swal from 'sweetalert2'; // Para confirmaciones de borrado
import ConfirmDialog from '@/Components/ConfirmDialog';

export default function Actividades({ actividades = [], pasantias = [], auth }) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [SelectInputedAct, setSelectedAct] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    console.log(actividades, pasantias);
    

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_actividad: '',
        nombre_act: '',
        tipo: '',
        fecha_ini: '',
        fecha_fin: '',
        descripcion: '',
        id_pasantia: '',
    });

    const formatHumanDate = (dateString) => {
        if (!dateString) return '';
        // El "T00:00:00" evita desfases de zonas horarias al parsear strings YYYY-MM-DD
        const date = new Date(`${dateString}T00:00:00`);
        
        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date).replace('.', ''); // Elimina el punto que a veces añade 'short' en español
    };

    const columns = [
        { 
            key: 'nombre_act', 
            label: 'Actividad',
            sortable: true,
            render: (val) => <span className="font-bold text-gray-700">{val}</span>
        },
        { 
            key: 'tipo', 
            label: 'Tipo',
            sortable: true,
            render: (val) => (
                <span className="px-2 py-1 bg-blue-50 text-primary-blue rounded-md text-xs font-semibold uppercase">
                    {val}
                </span>
            )
        },
        { 
            key: 'pasantia_nombre', 
            label: 'Pasantía Asociada',
            sortable: true,
            render: (val) => <span className="text-sm text-gray-600">{val}</span>
        },
        { 
            key: 'rango_fechas', 
            label: 'Plazo (Inicio - Fin)',
            render: (_, row) => {
                // Suponiendo que tus llaves originales del backend son row.fecha_ini y row.fecha_fin
                const inicioFormateado = formatHumanDate(row.fecha_ini);
                const finFormateada = formatHumanDate(row.fecha_fin);

                return (
                    <div className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 capitalize">
                            {inicioFormateado}
                        </span>
                        <span className="text-gray-400">➔</span>
                        <span className="px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200 capitalize">
                            {finFormateada}
                        </span>
                    </div>
                );
            }
        },
    ];

    // Procesamiento de datos para la tabla
    const processedData = useMemo(() => {
        return actividades.map(act => ({
            ...act,
            pasantia_nombre: act.pasantia?.nombre_pas || 'General / No asignada',
            fecha_ini_fmt: act.fecha_ini ? act.fecha_ini.split(' ')[0] : '',
            fecha_fin_fmt: act.fecha_fin ? act.fecha_fin.split(' ')[0] : '',
        }));
    }, [actividades]);

    const filteredData = useMemo(() => {
        const s = search.toLowerCase();
        return processedData.filter(act => 
            act.nombre_act.toLowerCase().includes(s) || 
            act.tipo.toLowerCase().includes(s) ||
            act.pasantia_nombre.toLowerCase().includes(s)
        );
    }, [processedData, search]);

    // Lógica de Modales
    const openCreateModal = () => {
        setEditMode(false);
        reset();
        setShowModal(true);
    };

    const openEditModal = (act) => {
        setEditMode(true);
        setData({
            id_actividad: act.id_actividad,
            nombre_act: act.nombre_act,
            tipo: act.tipo,
            fecha_ini: act.fecha_ini_fmt,
            fecha_fin: act.fecha_fin_fmt,
            descripcion: act.descripcion || '',
            id_pasantia: act.id_pasantia || '',
        });
        setShowModal(true);
    };

    const openViewModal = (act) => {
        setSelectedAct(act);
        setShowViewModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.actividades.update', data.id_actividad), {
                onSuccess: () => { setShowModal(false); }
            });
        } else {
            post(route('admin.actividades.store'), {
                onSuccess: () => { setShowModal(false); }
            });
        }
    };

    const confirmDelete = (id) => {
        setIdToDelete(id);
        setConfirmingDeletion(true);
    };

    const executeDelete = () => {
        router.delete(route('admin.actividades.destroy', idToDelete), {
            onSuccess: () => {
                // Aquí podrías mostrar tu Toast personalizado
            }
        });
    };

    const breadcrumbs = [
        { label: 'Inicio', url: route('admin.dashboard') },
        { label: 'Monitoreo Académico' },
        { label: 'Registro de Actividades' },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Registro de Actividades" />
            <Breadcrumbs items={breadcrumbs} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy flex items-center gap-2">
                        <ClipboardList className="text-primary-blue" /> Registro de Actividades
                    </h1>
                    <p className="text-sm text-gray-500">Define y gestiona los hitos de evaluación para las pasantías.</p>
                </div>
                {/* <PrimaryButton onClick={openCreateModal} className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Nueva Actividad
                </PrimaryButton> */}
            </div>

            {/* BARRA DE BÚSQUEDA */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, tipo o pasantía..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-blue/20 transition-all shadow-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    actionsRender={(row) => (
                        <div className="flex items-center gap-1">
                            <button onClick={() => openViewModal(row)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ver Detalles">
                                <Eye className="h-5 w-5" />
                            </button>
                            <button onClick={() => openEditModal(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                <Edit className="h-5 w-5" />
                            </button>
                            {/* <button onClick={() => confirmDelete(row.id_actividad)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Borrar">
                                <Trash2 className="h-5 w-5" />
                            </button> */}
                        </div>
                    )}
                />
            </div>

            {/* MODAL: CREAR / EDITAR */}
            <Modal show={showModal} onClose={() => setShowModal(false)} title={editMode ? "Modificar Actividad" : "Registrar Nueva Actividad"} maxWidth="4xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <InputLabel value="Nombre de la Actividad" />
                            <TextInput 
                                value={data.nombre_act} 
                                onChange={e => setData('nombre_act', e.target.value)} 
                                className="w-full" 
                                placeholder="Eje: Entrega de Plan de Trabajo"
                                required 
                            />
                            <InputError message={errors.nombre_act} />
                        </div>

                        <div>
                            <InputLabel value="Tipo de Actividad" />
                            <SelectInput 
                                className="w-full border-gray-300 rounded-xl text-sm focus:ring-primary-blue"
                                value={data.tipo}
                                onChange={e => setData('tipo', e.target.value)}
                                required
                            >
                                <option value="">Seleccione tipo...</option>
                                <option value="TECNICA">Técnica</option>
                                <option value="OPERATIVA">Operativa</option>
                            </SelectInput>
                            <InputError message={errors.tipo} />
                        </div>

                        <div>
                            <InputLabel value="Pasantía Vinculada" />
                            {/* Solo mostrar la pasantia viculada */}
                            <InfoItem
                                label="Pasantía Actual vinculada"
                                value={data.id_pasantia ? pasantias.find(p => p.id_pasantia === data.id_pasantia)?.nombre_pas : 'No asignada'}
                            />
                            <InputError message={errors.id_pasantia} />
                        </div>

                        <div>
                            <InputLabel value="Fecha de Inicio" />
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <TextInput type="date" value={data.fecha_ini} onChange={e => setData('fecha_ini', e.target.value)} className="w-full pl-10" required />
                            </div>
                            <InputError message={errors.fecha_ini} />
                        </div>

                        <div>
                            <InputLabel value="Fecha de Cierre" />
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <TextInput type="date" value={data.fecha_fin} onChange={e => setData('fecha_fin', e.target.value)} className="w-full pl-10" required />
                            </div>
                            <InputError message={errors.fecha_fin} />
                        </div>

                        <div className="md:col-span-2">
                            <InputLabel value="Descripción / Instrucciones" />
                            <TextArea 
                                className="w-full border-gray-300 rounded-xl text-sm focus:ring-primary-blue min-h-[100px]"
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                placeholder="Indique detalladamente qué debe hacer el pasante..."
                            />
                            <InputError message={errors.descripcion} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>{editMode ? 'Guardar Cambios' : 'Registrar Actividad'}</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL: VISTA DE DETALLE */}
            <Modal show={showViewModal} onClose={() => setShowViewModal(false)} title="Detalles de la Actividad" maxWidth="2xl">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="bg-blue-100 p-3 rounded-2xl">
                            <FileText className="text-primary-blue h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-primary-navy">{SelectInputedAct?.nombre_act}</h2>
                            <p className="text-primary-blue font-semibold uppercase text-xs tracking-wider">{SelectInputedAct?.tipo}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-6">
                            <div className="flex items-start gap-3">
                                <LinkIcon className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Pasantía Relacionada</p>
                                    <p className="text-sm font-semibold text-gray-700">{SelectInputedAct?.pasantia_nombre}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="text-gray-400 mt-1" size={18} />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400">Periodo de Entrega</p>
                                    <p className="text-sm font-semibold text-gray-700">Del {SelectInputedAct?.fecha_ini_fmt} al {SelectInputedAct?.fecha_fin_fmt}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Info className="text-primary-blue" size={16} />
                                <p className="text-[10px] uppercase font-bold text-gray-500">Descripción</p>
                            </div>
                            <p className="text-sm text-gray-600 italic leading-relaxed">
                                {SelectInputedAct?.descripcion || 'Sin descripción adicional.'}
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t flex justify-end">
                        <SecondaryButton onClick={() => setShowViewModal(false)}>Cerrar Ventana</SecondaryButton>
                    </div>
                </div>
            </Modal>
            {/* REEMPLAZAR SweetAlert por ConfirmDialog al final del componente */}
            {/* <ConfirmDialog
                show={confirmingDeletion}
                onClose={() => setConfirmingDeletion(false)}
                onConfirm={executeDelete}
                type="danger"
                title="¿Eliminar Actividad?"
                message="Esta acción eliminará permanentemente la actividad y no podrá recuperarse. ¿Estás seguro?"
                confirmText="Sí, eliminar"
            /> */}
        </DashboardLayout>
    );
}