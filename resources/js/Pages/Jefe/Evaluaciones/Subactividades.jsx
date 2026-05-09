import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import DataTable from '@/Components/DataTable';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { PlusCircle, ClipboardList } from 'lucide-react';

export default function Subactividades({ actividades = [], pasantes = [], auth }) {
    const [modalAsignar, setModalAsignar] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        id_pasante: '',
        id_actividad: '',
        descripcion: '',
    });

    const abrirAsignar = () => {
        reset();
        setModalAsignar(true);
    };

    const handleAsignar = (e) => {
        e.preventDefault();
        post(route('jefe.asignarSubactividad'), {
            onSuccess: () => {
                setModalAsignar(false);
                reset();
            },
        });
    };

    const columns = [
        { key: 'nombre', label: 'Actividad', sortable: true },
        { key: 'pasantia', label: 'Pasantía', sortable: true },
        { key: 'tipo', label: 'Tipo', sortable: true, align: 'center' },
        { key: 'fecha_ini', label: 'Inicio', sortable: true },
        { key: 'fecha_fin', label: 'Fin', sortable: true },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Actividades" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Evaluaciones' },
                { label: 'Actividades' },
            ]} />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-black text-primary-navy uppercase">Actividades</h1>
                    <p className="text-slate-500">Desglose de tareas asignadas.</p>
                </div>
                <PrimaryButton onClick={abrirAsignar} className="gap-2">
                    <PlusCircle size={18} /> Asignar Actividad
                </PrimaryButton>
            </div>

            <DataTable
                columns={columns}
                data={actividades}
                searchPlaceholder="Buscar actividades..."
            />

            <Modal show={modalAsignar} onClose={() => setModalAsignar(false)} title="Asignar Actividad" maxWidth="lg">
                <form onSubmit={handleAsignar} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="id_pasante" value="Pasante" />
                        <select
                            id="id_pasante"
                            value={data.id_pasante}
                            onChange={e => setData('id_pasante', e.target.value)}
                            className="w-full rounded-xl border-slate-200"
                            required
                        >
                            <option value="">Seleccione pasante</option>
                            {pasantes.map(p => (
                                <option key={p.id} value={p.id}>{p.nombre}</option>
                            ))}
                        </select>
                        <InputError message={errors.id_pasante} />
                    </div>
                    <div>
                        <InputLabel htmlFor="id_actividad" value="Actividad" />
                        <select
                            id="id_actividad"
                            value={data.id_actividad}
                            onChange={e => setData('id_actividad', e.target.value)}
                            className="w-full rounded-xl border-slate-200"
                            required
                        >
                            <option value="">Seleccione actividad</option>
                            {actividades.map(a => (
                                <option key={a.id} value={a.id}>{a.nombre} ({a.pasantia})</option>
                            ))}
                        </select>
                        <InputError message={errors.id_actividad} />
                    </div>
                    <div>
                        <InputLabel htmlFor="descripcion" value="Descripción de la actividad" />
                        <textarea
                            id="descripcion"
                            value={data.descripcion}
                            onChange={e => setData('descripcion', e.target.value)}
                            rows="3"
                            className="w-full rounded-xl border-slate-200"
                            required
                        />
                        <InputError message={errors.descripcion} />
                    </div>
                    <div className="flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={() => setModalAsignar(false)}>Cancelar</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>Asignar</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}