import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import ConfirmDialog from '@/Components/ConfirmDialog';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import { Star, MessageSquare, Quote, Trash2, Edit, Eye, User, Building } from 'lucide-react';
import SelectInput from '../../../Components/SelectInput';

export default function Comentarios({ comentarios = [], pasantes = [], pasantias = [], auth }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [SelectInputedCom, setSelectedCom] = useState(null);
    const [editMode, setEditMode] = useState(false);

    console.log(comentarios, pasantes, pasantias);
    

    const { data, setData, post, put, processing, errors, reset } = useForm({
        id_comentario: '',
        descripcion: '',
        calificacion: 5,
        fecha: '',
        idU_pasante: '',
        id_pasantia: '',
    });

    const renderStars = (rating) => (
        <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} />
            ))}
        </div>
    );

    const columns = [
        { 
            key: 'pasante', 
            label: 'Pasante', 
            render: (_, row) => <span className="font-bold text-primary-navy">{row.pasante?.user?.nombre + ' ' + row.pasante?.user?.ap_paterno + ' ' + row.pasante?.user?.ap_materno}</span> 
        },
        { 
            key: 'pasantia', 
            label: 'Empresa', 
            render: (_, row) => <span className="text-slate-600">{row.pasantia?.empresa?.nombre || 'N/A'}</span> 
        },
        { 
            key: 'calificacion', 
            label: 'Valoración', 
            render: (v) => renderStars(v) 
        },
        { 
            key: 'descripcion', 
            label: 'Comentario', 
            render: (v) => <p className="truncate max-w-xs italic text-slate-500">"{v}"</p> 
        },
        { key: 'fecha', label: 'Fecha', render: (v) => new Date(v).toLocaleDateString() },
    ];

    const openCreate = () => {
        setEditMode(false);
        reset();
        setData('fecha', new Date().toISOString().split('T')[0]);
        setModalOpen(true);
    };

    const openEdit = (com) => {
        setEditMode(true);
        setSelectedCom(com);
        setData({
            id_comentario: com.id_comentario,
            descripcion: com.descripcion,
            calificacion: com.calificacion,
            fecha: com.fecha ? com.fecha.split('T')[0] : '',
            idU_pasante: com.idU_pasante,
            id_pasantia: com.id_pasantia,
        });
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editMode) {
            put(route('admin.comentarios.update', data.id_comentario), { onSuccess: () => setModalOpen(false) });
        } else {
            post(route('admin.comentarios.store'), { onSuccess: () => setModalOpen(false) });
        }
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Gestión de Comentarios" />
            
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-primary-navy uppercase">Feedback de Experiencias</h1>
                    <p className="text-slate-500 text-sm">Reseñas y valoraciones de los pasantes sobre sus puestos.</p>
                </div>
                {/* <PrimaryButton onClick={openCreate} className="gap-2">
                    <MessageSquare size={18} /> Agregar Reseña
                </PrimaryButton> */}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <DataTable
                    columns={columns}
                    data={comentarios}
                    actionsRender={(row) => (
                        <div className="flex gap-1">
                            <button onClick={() => openEdit(row)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                            <button onClick={() => { setSelectedCom(row); setConfirmDelete(true); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                    )}
                />
            </div>

            {/* MODAL FORMULARIO */}
            <Modal show={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Editar Reseña" : "Nueva Reseña"} maxWidth="4xl">
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Pasante" />
                            <SelectInput className="w-full rounded-xl border-slate-200" value={data.idU_pasante} onChange={e => setData('idU_pasante', e.target.value)} required>
                                <option value="">Seleccionar...</option>
                                {pasantes.map(p => <option key={p.idU_pasante} value={p.idU_pasante}>{p.user?.nombre + ' ' + p.user?.ap_paterno + ' ' + p.user?.ap_materno}</option>)}
                            </SelectInput>
                        </div>
                        <div>
                            <InputLabel value="Pasantía / Puesto" />
                            <SelectInput className="w-full rounded-xl border-slate-200" value={data.id_pasantia} onChange={e => setData('id_pasantia', e.target.value)} required>
                                <option value="">Seleccionar...</option>
                                {pasantias.map(p => <option key={p.id_pasantia} value={p.id_pasantia}>{p.empresa?.nombre} - {p.nombre_pas}</option>)}
                            </SelectInput>
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Calificación (1 a 5 estrellas)" />
                        <div className="flex gap-4 mt-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setData('calificacion', num)}
                                    className={`p-2 rounded-lg border-2 transition-all ${data.calificacion === num ? 'border-amber-400 bg-amber-50 text-amber-600' : 'border-slate-100 text-slate-300'}`}
                                >
                                    <Star fill={data.calificacion >= num ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <InputLabel 
                            value="Comentario / Experiencia" 
                            className="text-sm font-semibold text-slate-700 tracking-wide"
                        />
                        <TextArea 
                            rows={4}
                            className="h-32 text-sm leading-relaxed"
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            placeholder="Describe cómo fue la experiencia en esta pasantía..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <SecondaryButton onClick={() => setModalOpen(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton disabled={processing}>Guardar Valoración</PrimaryButton>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog 
                show={confirmDelete} 
                onClose={() => setConfirmDelete(false)} 
                onConfirm={() => router.delete(route('admin.comentarios.destroy', SelectInputedCom.id_comentario), { onSuccess: () => setConfirmDelete(false) })}
                type="danger"
                title="¿Eliminar Comentario?"
                message="Esta acción es irreversible y afectará el promedio de calificación de la empresa."
            />
        </DashboardLayout>
    );
}