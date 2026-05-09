import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { Send } from 'lucide-react';

export default function CrearMensaje({ pasantes = [], auth }) {
    const { data, setData, post, processing, errors } = useForm({
        id_pasante: '',
        descripcion: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('jefe.mensajes.enviar'));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Enviar Mensaje" />
            <Breadcrumbs items={[
                { label: 'Inicio', href: route('jefe.dashboard') },
                { label: 'Comunicación' },
                { label: 'Enviar Mensaje' },
            ]} />

            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-black text-primary-navy uppercase mb-6">Enviar Mensaje</h1>
                <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="id_pasante" value="Destinatario" />
                            <select
                                id="id_pasante"
                                value={data.id_pasante}
                                onChange={e => setData('id_pasante', e.target.value)}
                                className="w-full rounded-xl border-slate-200"
                                required
                            >
                                <option value="">Seleccione un pasante</option>
                                {pasantes.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                            <InputError message={errors.id_pasante} />
                        </div>
                        <div>
                            <InputLabel htmlFor="descripcion" value="Mensaje" />
                            <textarea
                                id="descripcion"
                                value={data.descripcion}
                                onChange={e => setData('descripcion', e.target.value)}
                                rows="6"
                                className="w-full rounded-xl border-slate-200 focus:ring-primary-blue"
                                required
                            />
                            <InputError message={errors.descripcion} />
                        </div>
                        <div className="flex justify-end">
                            <PrimaryButton type="submit" disabled={processing} className="gap-2">
                                <Send size={18} /> Enviar Mensaje
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}