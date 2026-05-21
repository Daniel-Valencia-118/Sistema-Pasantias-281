import React, { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import Select from '@/Components/Select';
import { 
    FileText, CheckCircle, Clock, XCircle, HelpCircle, 
    Plus, Eye, Edit, Trash2, Calendar, User, MessageSquare 
} from 'lucide-react';

export default function Bitacoras({ bitacoras = [], pasantes = [], actividades = [], jefes = [], auth }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedBit, setSelectedBit] = useState(null);

    console.log(bitacoras, pasantes, actividades, jefes);
    
    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_bitacora: '',
        descripcion: '',
        estado: 'sin calificar',
        nota: '',
        fecha: '',
        hora: '',
        observacion: '',
        recomendacion: '',
        idU_pasante: '',
        id_actividad: '',
        idU_jefe: '',
    });

    const columns = [
        { 
            key: 'pasante', 
            label: 'Pasante', 
            render: (_, row) => <span className="font-bold text-primary-navy">{row.pasante?.user?.nombre + ' ' + row.pasante?.user?.ap_paterno + ' ' + row.pasante?.user?.ap_materno || 'N/A'}</span> 
        },
        { 
            key: 'actividad', 
            label: 'Actividad', 
            render: (_, row) => <span>{row.actividad?.nombre_act || 'Sin actividad'}</span> 
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (value) => {
                const styles = {
                    'completada': 'bg-green-100 text-green-700 icon-green',
                    'completada parcialmente': 'bg-orange-100 text-orange-700 icon-orange',
                    'no realizada': 'bg-red-100 text-red-700 icon-red',
                    'sin calificar': 'bg-gray-100 text-gray-700 icon-gray',
                };
                return (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${styles[value] || styles['sin calificar']}`}>
                        {value}
                    </span>
                );
            },
        },
        { key: 'nota', label: 'Nota', render: (v) => <span className="font-mono font-bold">{v || '--'}</span> },
        { key: 'fecha', label: 'Fecha', render: (v) => new Date(v).toLocaleDateString() },
    ];

    const openCreate = () => {
        setEditMode(false);
        reset();
        setModalOpen(true);
    };

    const openEdit = (bit) => {
        setEditMode(true);
        setSelectedBit(bit);
        setData({
            id_bitacora: bit.id_bitacora,
            descripcion: bit.descripcion,
            estado: bit.estado,
            nota: bit.nota || '',
            fecha: bit.fecha ? bit.fecha.split('T')[0] : '',
            hora: bit.hora || '',
            observacion: bit.observacion || '',
            recomendacion: bit.recomendacion || '',
            idU_pasante: bit.idU_pasante,
            id_actividad: bit.id_actividad,
            idU_jefe: bit.idU_jefe,
        });
        setModalOpen(true);
    };

    const openView = (bit) => {
        setSelectedBit(bit);
        setViewModalOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.bitacoras.destroy', selectedBit.id_bitacora), {
            onSuccess: () => setConfirmDelete(false)
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.bitacoras.update', data.id_bitacora), { onSuccess: () => setModalOpen(false) });
        } else {
            post(route('admin.bitacoras.store'), { onSuccess: () => setModalOpen(false) });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Bitácoras de Evaluación" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('admin.dashboard') },
                { label: 'Monitoreo Académico' },
                { label: 'Bitácoras' },
            ]} />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-primary-navy uppercase">Bitácoras de Evaluación</h1>
                    <p className="text-slate-500 text-sm">Control administrativo de reportes y calificaciones.</p>
                </div>
                {/* <PrimaryButton onClick={openCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Nueva Bitácora
                </PrimaryButton> */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={bitacoras}
                    actionsRender={(row) => (
                        <div className="flex gap-1">
                            <button onClick={() => openView(row)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><Eye size={18} /></button>
                            <button onClick={() => openEdit(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                            {/* <button onClick={() => { setSelectedBit(row); setConfirmDelete(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button> */}
                        </div>
                    )}
                />
            </div>

            {/* MODAL: CREAR / EDITAR */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Editar Bitácora" : "Nueva Bitácora"} maxWidth="4xl">
                <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <InputLabel value="Descripción de la Actividad Realizada" />
                        <TextArea 
                            className="w-full rounded-xl border-slate-200 focus:ring-primary-blue h-24"
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            required
                        />
                    </div>
                    
                    
                    <div>
                        {/* <InputLabel value="Pasante" /> */}
                        {/* mostrar solo al pasante actual no lista */}
                        <InfoItem 
                            icon={<User size={16} />} 
                            label="Pasante" 
                            value={pasantes.find(p => p.idU_pasante === data.idU_pasante)?.user?.nombre + ' ' + pasantes.find(p => p.idU_pasante === data.idU_pasante)?.user?.ap_paterno + ' ' + pasantes.find(p => p.idU_pasante === data.idU_pasante)?.user?.ap_materno || 'Seleccionar Pasante...'} 
                        />
                        
                    </div>

                    <div>
                        {/* <InputLabel value="Actividad Planificada" /> */}
                        <InfoItem 
                            icon={<FileText size={16} />} 
                            label="Actividad Planificada"
                            value={actividades.find(a => a.id_actividad === data.id_actividad)?.nombre_act || 'Seleccionar Actividad...'} 
                        />
                    </div>

                    <div>
                        {/* <InputLabel value="Jefe de Pasantes (Evaluador)" />
                        <Select className="w-full rounded-xl border-slate-200" value={data.idU_jefe} onChange={e => setData('idU_jefe', e.target.value)} required>
                            <option value="">Seleccionar Jefe...</option>
                            {jefes.map(j => <option key={j.idU_jefe} value={j.idU_jefe}>{j.user?.nombre + ' ' + j.user?.ap_paterno + ' ' + j.user?.ap_materno}</option>)}
                        </Select> */}
                        <InfoItem 
                            icon={<User size={16} />} 
                            label="Jefe Evaluador"
                            value={jefes.find(j => j.idU_jefe === data.idU_jefe)?.user?.nombre + ' ' + jefes.find(j => j.idU_jefe === data.idU_jefe)?.user?.ap_paterno + ' ' + jefes.find(j => j.idU_jefe === data.idU_jefe)?.user?.ap_materno || 'Seleccionar Jefe...'} 
                        />
                    </div>

                    <div>
                        <InputLabel value="Estado de la Bitácora" />
                        <Select className="w-full rounded-xl border-slate-200" value={data.estado} onChange={e => setData('estado', e.target.value)}>
                            <option value="sin calificar">Sin calificar</option>
                            <option value="completada">Completada</option>
                            <option value="completada parcialmente">Parcial</option>
                            <option value="no realizada">No realizada</option>
                        </Select>
                    </div>

                    <div>
                        <InputLabel value="Fecha" />
                        <TextInput type="date" className="w-full" value={data.fecha} onChange={e => setData('fecha', e.target.value)} required />
                    </div>

                    <div>
                        <InputLabel value="Nota (0-100)" />
                        <TextInput type="number" className="w-full" value={data.nota} onChange={e => setData('nota', e.target.value)} />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Observaciones" />
                            <TextArea className="w-full rounded-xl border-slate-200" value={data.observacion} onChange={e => setData('observacion', e.target.value)} rows="2" />
                        </div>
                        <div>
                            <InputLabel value="Recomendaciones" />
                            <TextArea className="w-full rounded-xl border-slate-200" value={data.recomendacion} onChange={e => setData('recomendacion', e.target.value)} rows="2" />
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                        <SecondaryButton onClick={() => setModalOpen(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar Cambios</PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL: VER DETALLES */}
            <Modal show={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Detalle de Bitácora" maxWidth="2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-blue/10 p-3 rounded-full text-primary-blue"><User /></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Pasante</p>
                                <p className="text-lg font-bold text-primary-navy">{selectedBit?.pasante?.user?.nombre + ' ' + selectedBit?.pasante?.user?.ap_paterno + ' ' + selectedBit?.pasante?.user?.ap_materno}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Nota Final</p>
                            <p className="text-3xl font-black text-primary-blue">{selectedBit?.nota || '0'}/100</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <InfoItem icon={<Calendar size={16}/>} label="Fecha y Hora" value={`${selectedBit?.fecha ? new Date(selectedBit.fecha).toLocaleDateString() : ''} - ${selectedBit?.hora || '--'}`} />
                        <InfoItem icon={<FileText size={16}/>} label="Actividad" value={selectedBit?.actividad?.nombre_act} />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Descripción del Pasante</p>
                        <p className="text-sm text-slate-700 italic">{selectedBit?.descripcion}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <MessageSquare className="text-primary-blue shrink-0" size={18} />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Observación del Jefe</p>
                                <p className="text-sm text-slate-600">{selectedBit?.observacion || 'Sin observaciones.'}</p>
                            </div>
                        </div>
                    </div>

                    {/* recomendacion */}
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <HelpCircle className="text-amber-600 shrink-0" size={18} />
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase">Recomendaciones del Jefe</p>
                                <p className="text-sm text-slate-600">{selectedBit?.recomendacion || 'Sin recomendaciones.'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <SecondaryButton onClick={() => setViewModalOpen(false)}>Cerrar</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* DIÁLOGO DE CONFIRMACIÓN */}
            <ConfirmDialog
                show={confirmDelete}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
                type="danger"
                title="¿Eliminar Bitácora?"
                message="Esta acción no se puede deshacer. Se eliminará el registro de evaluación permanentemente."
            />
        </DashboardLayout>
    );
}

function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <div className="mt-1 text-slate-400">{icon}</div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
                <p className="text-sm font-semibold text-slate-700">{value}</p>
            </div>
        </div>
    );
}