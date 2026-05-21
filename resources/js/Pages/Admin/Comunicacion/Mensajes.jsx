import React, { useState } from 'react';
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
import { 
    Send, MessageSquare, Trash2, Edit, Eye, 
    Calendar, Clock, User, UserCheck, Search 
} from 'lucide-react';

export default function Mensajes({ mensajes = [], pasantes = [], jefes = [], auth }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedMsg, setSelectedMsg] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_mensaje: '',
        descripcion: '',
        fecha: '',
        hora: '',
        idU_pasante: '',
        idU_jefe: '',
    });
    

    const columns = [
        { 
            key: 'jefe', 
            label: 'De (Jefe)', 
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-primary-navy">{row.jefe?.user?.nombre}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Evaluador</span>
                </div>
            ) 
        },
        { 
            key: 'pasante', 
            label: 'Para (Pasante)', 
            render: (_, row) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{row.pasante?.user?.nombre}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Estudiante</span>
                </div>
            ) 
        },
        { 
            key: 'descripcion', 
            label: 'Mensaje', 
            render: (v) => <p className="truncate max-w-xs text-slate-500">{v}</p> 
        },
        { 
            key: 'fecha', 
            label: 'Fecha/Hora', 
            render: (_, row) => (
                <div className="text-xs text-slate-600">
                    <div className="font-bold">{new Date(row.fecha).toLocaleDateString()}</div>
                    <div>{row.hora}</div>
                </div>
            ) 
        },
    ];

    const openCreate = () => {
        setEditMode(false);
        reset();
        // Pre-cargar fecha y hora actual para comodidad
        const now = new Date();
        setData({
            ...data,
            fecha: now.toISOString().split('T')[0],
            hora: now.toTimeString().split(' ')[0].substring(0, 5)
        });
        setModalOpen(true);
    };

    const openEdit = (msg) => {
        setEditMode(true);
        setSelectedMsg(msg);
        setData({
            id_mensaje: msg.id_mensaje,
            // Detectar y eliminar el emisor mediante el prefijo de control en la descripción [J] para mensajes del jefe y [P]
            descripcion: msg.descripcion.replace(/^\[J\]|\[P\]/, '').trim(),
            fecha: msg.fecha ? msg.fecha.split('T')[0] : '',
            hora: msg.hora || '',
            idU_pasante: msg.idU_pasante,
            idU_jefe: msg.idU_jefe,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.mensajes.update', data.id_mensaje), { onSuccess: () => setModalOpen(false) });
        } else {
            post(route('admin.mensajes.store'), { onSuccess: () => setModalOpen(false) });
        }
    };

    const handleDelete = () => {
        router.delete(route('admin.mensajes.destroy', selectedMsg.id_mensaje), {
            onSuccess: () => setConfirmDelete(false)
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Mensajes Internos" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('admin.dashboard') },
                { label: 'Monitoreo' },
                { label: 'Mensajes Internos' },
            ]} />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-primary-navy uppercase italic">Historial de Mensajería</h1>
                    <p className="text-slate-500 text-sm italic">Registro de comunicaciones oficiales entre Jefes y Pasantes.</p>
                </div>
                <PrimaryButton onClick={openCreate} className="gap-2">
                    <Send size={18} /> Redactar Mensaje
                </PrimaryButton>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={mensajes}
                    actionsRender={(row) => (
                        <div className="flex gap-1">
                            <button onClick={() => { setSelectedMsg(row); setViewModalOpen(true); }} className="p-2 text-primary-blue hover:bg-blue-50 rounded-lg transition-colors"><Eye size={18} /></button>
                            <button onClick={() => openEdit(row)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit size={18} /></button>
                            <button onClick={() => { setSelectedMsg(row); setConfirmDelete(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                        </div>
                    )}
                />
            </div>

            {/* MODAL: FORMULARIO */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Modificar Registro de Mensaje" : "Registrar Nueva Comunicación"} maxWidth="2xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Jefe Emisor" />
                            <select className="w-full rounded-xl border-slate-200 focus:ring-primary-blue" value={data.idU_jefe} onChange={e => setData('idU_jefe', e.target.value)} required>
                                <option value="">Seleccionar Jefe...</option>
                                {jefes.map(j => <option key={j.idU_jefe} value={j.idU_jefe}>{j.user?.nombre}</option>)}
                            </select>
                            <InputError message={errors.idU_jefe} />
                        </div>
                        <div>
                            <InputLabel value="Pasante Receptor" />
                            <select className="w-full rounded-xl border-slate-200 focus:ring-primary-blue" value={data.idU_pasante} onChange={e => setData('idU_pasante', e.target.value)} required>
                                <option value="">Seleccionar Pasante...</option>
                                {pasantes.map(p => <option key={p.idU_pasante} value={p.idU_pasante}>{p.user?.nombre}</option>)}
                            </select>
                            <InputError message={errors.idU_pasante} />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Contenido del Mensaje" />
                        <textarea 
                            className="w-full rounded-xl border-slate-200 focus:ring-primary-blue h-32"
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            placeholder="Escribe el mensaje aquí..."
                            required
                        />
                        <InputError message={errors.descripcion} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Fecha" />
                            <TextInput type="date" className="w-full" value={data.fecha} onChange={e => setData('fecha', e.target.value)} required />
                        </div>
                        <div>
                            <InputLabel value="Hora" />
                            <TextInput type="time" className="w-full" value={data.hora} onChange={e => setData('hora', e.target.value)} required />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <SecondaryButton onClick={() => setModalOpen(false)}>Cerrar</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editMode ? 'Actualizar Registro' : 'Guardar Mensaje'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* MODAL: VER MENSAJE */}
            <Modal show={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Detalle de la Comunicación" maxWidth="lg">
                {selectedMsg && (
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
                            <div className="bg-white p-3 rounded-full shadow-sm text-primary-blue"><MessageSquare /></div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Canal Interno</p>
                                <p className="text-sm font-medium text-slate-600">ID Mensaje: #{selectedMsg.id_mensaje}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Emisor</p>
                                    <p className="font-bold text-primary-navy">{selectedMsg.jefe?.user?.nombre}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Receptor</p>
                                    <p className="font-bold text-primary-blue">{selectedMsg.pasante?.user?.nombre}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-primary-navy/[0.02] border-l-4 border-primary-blue rounded-r-xl">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    "{selectedMsg.descripcion}"
                                </p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedMsg.fecha).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {selectedMsg.hora}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <SecondaryButton onClick={() => setViewModalOpen(false)}>Cerrar Vista</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* DIÁLOGO DE ELIMINACIÓN */}
            <ConfirmDialog 
                show={confirmDelete} 
                onClose={() => setConfirmDelete(false)} 
                onConfirm={handleDelete}
                type="danger"
                title="¿Eliminar del Historial?"
                message="Esta acción borrará el registro del mensaje. No podrá ser consultado posteriormente por los auditores."
            />
        </DashboardLayout>
    );
}