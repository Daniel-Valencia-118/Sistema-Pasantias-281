import React, { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Select from '@/Components/Select';
import { Save, ArrowLeft, Pencil } from 'lucide-react';

export default function Form({ pasantias = [], pasantes = [], actividades = [], bitacora = null, auth }) {
    const isEditing = bitacora !== null;

    console.log("Pasantias: ", pasantias);
    console.log("Pasantes: ", pasantes);
    console.log("Actividades: ", actividades);
    console.log("Bitácora: ", bitacora);
    
    const { data, setData, post, processing, errors } = useForm({
        id_bitacora: bitacora?.id || '',
        descripcion: bitacora?.descripcion || '',
        estado: bitacora?.estado || 'no realizada',
        nota: bitacora?.nota ?? '',
        observacion: bitacora?.observacion || '',
        recomendacion: bitacora?.recomendacion || '',
        id_pasantia: bitacora?.id_pasantia || '',
        id_actividad: bitacora?.id_actividad || '',
        id_pasante: bitacora?.id_pasante || '',
    });

    const [actividadesFiltradas, setActividadesFiltradas] = useState([]);
    const [pasantesFiltrados, setPasantesFiltrados] = useState([]);

    // Filtra actividades cuando cambia la pasantía
    useEffect(() => {
        if (data.id_pasantia) {
            const filtradas = actividades.filter(a => a.pasantia_id == data.id_pasantia);
            setActividadesFiltradas(filtradas);
            // Limpiar actividad si la pasantía cambia y la actividad actual no pertenece a esa pasantía
            if (!filtradas.some(a => a.id == data.id_actividad)) {
                setData('id_actividad', '');
            }
        } else {
            setActividadesFiltradas([]);
        }
    }, [data.id_pasantia]);

    // Filtra pasantes según la pasantía (podría requerir lógica adicional si hay muchos)
    // En este caso simplificamos: todos los pasantes están disponibles (el jefe ya los tiene asignados)
    // Pero podemos filtrar los que están inscritos en la pasantía seleccionada si quisiéramos ser más precisos.

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('jefe.bitacora.guardar'), {
            onSuccess: () => {
                // Podríamos redirigir o mostrar mensaje, pero ya el controlador redirecciona
            },
        });
    };

    const breadcrumbs = [
        { label: 'Inicio', href: route('jefe.dashboard') },
        { label: 'Evaluaciones', href: route('jefe.bitacoras') },
        { label: isEditing ? 'Editar Bitácora' : 'Nueva Bitácora' },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title={isEditing ? 'Editar Bitácora' : 'Nueva Bitácora'} />
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black text-primary-navy uppercase">
                        {isEditing ? 'Editar Bitácora' : 'Nueva Bitácora de Evaluación'}
                    </h1>
                    {/* Botón para editar la bitácora existente */}
                    {isEditing && (
                        <SecondaryButton href={route('jefe.bitacora.editar', bitacora.id)} className="gap-2">
                            <Pencil size={18} /> Editar
                        </SecondaryButton>
                    )}
                    <SecondaryButton href={route('jefe.bitacoras')} className="gap-2">
                        <ArrowLeft size={18} /> Volver
                    </SecondaryButton>
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selección de Pasantía */}
                        <div>
                            <InputLabel htmlFor="id_pasantia" value="Pasantía" />
                            <Select
                                id="id_pasantia"
                                value={data.id_pasantia}
                                onChange={e => setData('id_pasantia', e.target.value)}
                                required
                            >
                                <option value="">Seleccione una pasantía</option>
                                {pasantias.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </Select>
                            <InputError message={errors.id_pasantia} />
                        </div>

                        {/* Selección de Actividad (dependiente de la pasantía) */}
                        <div>
                            <InputLabel htmlFor="id_actividad" value="Actividad" />
                            <Select
                                id="id_actividad"
                                value={data.id_actividad}
                                onChange={e => setData('id_actividad', e.target.value)}
                                required
                                disabled={!data.id_pasantia}
                            >
                                <option value="">Seleccione una actividad</option>
                                {actividadesFiltradas.map(a => (
                                    <option key={a.id} value={a.id}>{a.nombre}</option>
                                ))}
                            </Select>
                            <InputError message={errors.id_actividad} />
                        </div>

                        {/* Selección de Pasante (inscrito en la pasantía) */}
                        <div>
                            <InputLabel htmlFor="id_pasante" value="Pasante" />
                            <Select
                                id="id_pasante"
                                value={data.id_pasante}
                                onChange={e => setData('id_pasante', e.target.value)}
                                required
                            >
                                <option value="">Seleccione un pasante</option>
                                {pasantes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </Select>
                            <InputError message={errors.id_pasante} />
                        </div>

                        {/* Campos de la bitácora */}
                        <div>
                            <InputLabel htmlFor="descripcion" value="Descripción" />
                            <textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                rows="4"
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue focus:border-primary-blue"
                                required
                            />
                            <InputError message={errors.descripcion} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="estado" value="Estado" />
                                <Select
                                    id="estado"
                                    value={data.estado}
                                    onChange={e => setData('estado', e.target.value)}
                                    required
                                >
                                    <option value="no realizada">No realizada</option>
                                    <option value="completada parcialmente">Completada parcialmente</option>
                                    <option value="completada">Completada</option>
                                    <option value="sin calificar">Sin calificar</option>
                                </Select>
                                <InputError message={errors.estado} />
                            </div>
                            <div>
                                <InputLabel htmlFor="nota" value="Nota (0-100)" />
                                <TextInput
                                    id="nota"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={data.nota}
                                    onChange={e => setData('nota', e.target.value)}
                                />
                                <InputError message={errors.nota} />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="observacion" value="Observación" />
                            <textarea
                                id="observacion"
                                value={data.observacion}
                                onChange={e => setData('observacion', e.target.value)}
                                rows="3"
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue focus:border-primary-blue"
                            />
                            <InputError message={errors.observacion} />
                        </div>

                        <div>
                            <InputLabel htmlFor="recomendacion" value="Recomendación" />
                            <textarea
                                id="recomendacion"
                                value={data.recomendacion}
                                onChange={e => setData('recomendacion', e.target.value)}
                                rows="3"
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue focus:border-primary-blue"
                            />
                            <InputError message={errors.recomendacion} />
                        </div>

                        <div className="flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={() => window.history.back()}>
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing} className="gap-2">
                                <Save size={18} />
                                {processing ? 'Guardando...' : 'Guardar Bitácora'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}