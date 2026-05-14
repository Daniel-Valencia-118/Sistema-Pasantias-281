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
import TextArea from '@/Components/TextArea';
// Select and SelectInput componentes
import Select from '@/Components/Select';
import SelectInput from '@/Components/SelectInput';
import InfoItem from '@/Components/InfoItem';
import { Star, CheckCircle, Clock, XCircle, Edit2, HelpCircle } from 'lucide-react';

export default function Bitacoras({ bitacoras = [], auth }) {
    const [evaluarModal, setEvaluarModal] = useState(false);
    const [selectedBitacora, setSelectedBitacora] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        id_bitacora: null,
        nota: '',
        observacion: '',
        estado: 'realizada',
    });

    const abrirEvaluacion = (row) => {
        const bit = bitacoras.find(b => b.id === row.id);
        setSelectedBitacora(bit);
        setData({
            id_bitacora: bit.id,
            nota: bit.nota ?? '',
            observacion: bit.observacion ?? '',
            estado: bit.estado ?? 'realizada',
        });
        setEvaluarModal(true);
    };

    const handleEvaluar = (e) => {
        e.preventDefault();
        post(route('jefe.evaluarBitacora'), {
            onSuccess: () => {
                setEvaluarModal(false);
                reset();
            },
        });
    };

    const columns = [
        {
            key: 'pasante',
            label: 'Pasante',
            sortable: true,
            render: (value) => <span className="font-bold text-primary-navy">{value}</span>,
        },
        {
            key: 'actividad',
            label: 'Actividad',
            sortable: true,
        },
        {
            key: 'estado',
            label: 'Estado',
            sortable: true,
            align: 'center',
            render: (value) => {
                const icons = {
                    'completada': <CheckCircle size={16} className="text-green-500" />,
                    'completada parcialmente': <Clock size={16} className="text-orange-500" />,
                    'no realizada': <XCircle size={16} className="text-red-500" />,
                    'sin calificar': <HelpCircle size={16} className="text-gray-500" />,
                };
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100">
                        {icons[value] || null} {value}
                    </span>
                );
            },
        },
        {
            key: 'nota',
            label: 'Nota',
            sortable: true,
            align: 'center',
            // si la nota es mayor o igual a 90, mostrar en verde, si es entre 70 y 89 en naranja, si es menor a 70 en rojo y si no hay nota mostrar 'Sin calificar' en gris
            render: (value) => {
                if (value === '' || value === null) {
                    return <span className="text-gray-500">Sin calificar</span>;
                }
                const nota = parseInt(value, 10);
                const color = nota >= 90 ? 'text-green-500' : nota >= 51 ? 'text-purple-500' : 'text-red-500';
                return <span className={`font-bold ${color}`}>{nota}</span>;
            },
        },
        {
            key: 'fecha',
            label: 'Fecha',
            sortable: true,
        },
    ];

    const renderAcciones = (row) => (
        <button
            onClick={() => abrirEvaluacion(row)}
            className="p-2 bg-primary-blue/10 text-primary-blue hover:bg-primary-blue hover:text-white rounded-lg transition-colors"
            title="Evaluar"
        >
            <Star size={18} />
        </button>
    );

    return (
        <DashboardLayout auth={auth}>
            <Head title="Bitácoras" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Evaluaciones' },
                { label: 'Bitácoras' },
            ]} />

            <div className="mb-6">
                <h1 className="text-3xl font-black text-primary-navy uppercase">Bitácoras de Pasantes</h1>
                <p className="text-slate-500">Revisa y evalúa los reportes de actividades.</p>
            </div>

            <DataTable
                columns={columns}
                data={bitacoras}
                actionsRender={renderAcciones}
                searchPlaceholder="Buscar bitácoras..."
            />

            <Modal show={evaluarModal} onClose={() => setEvaluarModal(false)} title="Evaluar Bitácora" maxWidth="3xl">
                {selectedBitacora && (
                    <form onSubmit={handleEvaluar} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InfoItem label="Pasante" value={selectedBitacora.pasante} />
                            <InfoItem label="Actividad" value={selectedBitacora.actividad} />
                        </div>
                        <div>
                            <InputLabel htmlFor="nota" value="Nota (0-100)" />
                            <TextInput id="nota" type="number" min="0" max="100" value={data.nota} onChange={e => setData('nota', e.target.value)} required />
                            <InputError message={errors.nota} />
                        </div>
                        <div>
                            <InputLabel htmlFor="observacion" value="Observación" />
                            <TextArea
                                id="observacion"
                                value={data.observacion}
                                onChange={e => setData('observacion', e.target.value)}
                                rows="3"
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue focus:border-primary-blue"
                            />
                            <InputError message={errors.observacion} />
                        </div>
                        <div>
                            <InputLabel htmlFor="estado" value="Estado" />
                            <SelectInput
                                id="estado"
                                value={data.estado}
                                onChange={e => setData('estado', e.target.value)}
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue focus:border-primary-blue"
                            >
                                <option value="completada">Completada</option>
                                <option value="completada parcialmente">Completada parcialmente</option>
                                <option value="no realizada">No realizada</option>
                                <option value="sin calificar">Sin calificar</option>
                            </SelectInput>
                            <InputError message={errors.estado} />
                        </div>
                        <div className="flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => setEvaluarModal(false)}>Cancelar</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>Guardar Evaluación</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </DashboardLayout>
    );
}