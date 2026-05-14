import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Select from '@/Components/Select';
import TextArea from '@/Components/TextArea';
import { FilePlus, AlertCircle } from 'lucide-react';

export default function Redactar({ inscripciones = [], inscripcionSeleccionada = null, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        id_inscripcion: inscripcionSeleccionada?.id || '',
    });

    const [elegida, setElegida] = useState(inscripcionSeleccionada);

    console.log(inscripciones, inscripcionSeleccionada);
    

    useEffect(() => {
        if (data.id_inscripcion) {
            const seleccionada = inscripciones.find(i => i.id == data.id_inscripcion);
            setElegida(seleccionada);
        } else {
            setElegida(null);
        }
    }, [data.id_inscripcion]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('jefe.informes.generar'), {
            onSuccess: () => {
                // Redirigir a historial o mostrar mensaje
            },
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Redactar Informe Final" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Informes Finales' },
                { label: 'Redactar Informe' },
            ]} />

            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-primary-navy uppercase mb-6">Redactar Informe Final</h1>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="id_inscripcion" value="Seleccionar inscripción activa" />
                            <Select
                                id="id_inscripcion"
                                value={data.id_inscripcion}
                                onChange={e => setData('id_inscripcion', e.target.value)}
                                className="w-full rounded-xl border-slate-200"
                                required
                            >
                                <option value="">-- Elija --</option>
                                {inscripciones.map(ins => (
                                    <option key={ins.id} value={ins.id}>
                                        {ins.pasante} - {ins.pasantia}
                                    </option>
                                ))}
                            </Select>
                            <InputError message={errors.id_inscripcion} />
                        </div>

                        {elegida && (
                            <div className="bg-primary-navy/5 rounded-xl p-5 border border-primary-navy/20">
                                <h3 className="font-bold text-primary-navy">Datos de la inscripción</h3>
                                <ul className="mt-2 text-sm space-y-1 text-slate-700">
                                    <li><strong>Pasante:</strong> {elegida.pasante}</li>
                                    <li><strong>Pasantía:</strong> {elegida.pasantia}</li>
                                </ul>
                                <p className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                                    <AlertCircle size={14} /> Se calculará el promedio de las bitácoras y se generará el resultado.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => window.history.back()}>Cancelar</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing} className="gap-2">
                                <FilePlus size={18} /> Generar Informe Final
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}