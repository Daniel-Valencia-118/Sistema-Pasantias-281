import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Select from '@/Components/Select';
import axios from 'axios';
import { FilePlus, AlertTriangle, CheckCircle, ListChecks, Award } from 'lucide-react';

export default function Redactar({ 
    pasantias = [], 
    inscripciones = [], 
    preselectedPasanteId = null, 
    preselectedPasantiaId = null, 
    auth 
}) {
    // Selectores locales de control
    const [selectedPasantia, setSelectedPasantia] = useState(preselectedPasantiaId || '');
    const [selectedPasante, setSelectedPasante] = useState(preselectedPasanteId || '');
    const [filteredPasantes, setFilteredPasantes] = useState([]);

    // Estados para la respuesta analítica de Axios
    const [loadingVerification, setLoadingVerification] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [backendData, setBackendData] = useState(null);
    const [showRedactarModal, setShowRedactarModal] = useState(false);

    // Formulario de Inertia para el envío final
    const { data, setData, post, processing, errors } = useForm({
        id_inscripcion: '',
        promedio: '',
        nota_final: '',
    });

    // console.log(inscripciones, preselectedPasanteId, preselectedPasantiaId);
    

    // Filtro dinámico: Al cambiar pasantía, actualiza los pasantes correspondientes
    useEffect(() => {
        if (selectedPasantia) {
            const matches = inscripciones.filter(i => i.id_pasantia === parseInt(selectedPasantia));
            setFilteredPasantes(matches);
            
            // Si el pasante preseleccionado no pertenece a esta pasantía, limpia la selección
            if (!matches.some(m => m.idU_pasante === parseInt(selectedPasante))) {
                setSelectedPasante('');
                setBackendData(null);
                setErrorMessage(null);
            }
        } else {
            setFilteredPasantes([]);
            setSelectedPasante('');
            setBackendData(null);
        }
    }, [selectedPasantia]);

    // Hook para ejecutar la auto-selección inicial si viene desde Bitacoras.jsx
    useEffect(() => {
        if (preselectedPasantiaId && preselectedPasanteId) {
            const matches = inscripciones.filter(i => i.id_pasantia === preselectedPasantiaId);
            setFilteredPasantes(matches);
            setSelectedPasantia(preselectedPasantiaId);
            setSelectedPasante(preselectedPasanteId);
        }
    }, [preselectedPasanteId, preselectedPasantiaId]);

    // Petición Axios para comprobar las restricciones solicitadas
    const handleVerificarYRedactar = (e) => {
        e.preventDefault();
        if (!selectedPasantia || !selectedPasante) return;

        setLoadingVerification(true);
        setErrorMessage(null);
        setBackendData(null);

        axios.get('/jefe/api/informes/verificar-status', {
            params: {
                id_pasantia: selectedPasantia,
                idU_pasante: selectedPasante
            }
        })
        .then((response) => {
            if (response.data.success) {
                setBackendData(response.data);
                // Cargar el formulario final con los datos calculados
                setData({
                    id_inscripcion: response.data.id_inscripcion,
                    promedio: response.data.promedio,
                    nota_final: Math.round(response.data.promedio), // Inicializar nota final con el promedio sugerido
                });
                setShowRedactarModal(true);
            } else {
                setErrorMessage(response.data.message);
            }
        })
        .catch((error) => {
            const msg = error.response?.data?.message || 'Error de comunicación con el servidor.';
            setErrorMessage(msg);
        })
        .finally(() => {
            setLoadingVerification(false);
        });
    };

    const handleConfirmarInforme = (e) => {
        e.preventDefault();
        post(route('jefe.informes.generar'), {
            onSuccess: () => {
                setShowRedactarModal(false);
            }
        });
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Redactar Informe Final" />
            
            {/* <Breadcrumbs items={[
                { label: 'Inicio', url: route('jefe.dashboard')},
                { label: 'Informes Finales' },
                { label: 'Redactar' },
            ]} /> */}

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-black text-primary-navy uppercase">Redactar Informe Final</h1>
                    <p className="text-slate-500">Selecciona los parámetros para auditar las bitácoras y asentar la nota de egreso.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                    <form onSubmit={handleVerificarYRedactar} className="space-y-5">
                        
                        {/* Selector 1: Pasantías */}
                        <div>
                            <InputLabel htmlFor="id_pasantia" value="1. Seleccionar Programa de Pasantía" />
                            <Select
                                id="id_pasantia"
                                value={selectedPasantia}
                                onChange={e => setSelectedPasantia(e.target.value)}
                                className="w-full mt-1 rounded-xl border-slate-200 text-sm focus:ring-primary-blue focus:border-primary-blue"
                                required
                            >
                                <option value="">-- Elige una pasantía activa --</option>
                                {pasantias.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Selector 2: Pasantes filtrados */}
                        <div>
                            <InputLabel htmlFor="id_pasante" value="2. Seleccionar Pasante Asignado" />
                            <Select
                                id="id_pasante"
                                value={selectedPasante}
                                onChange={e => setSelectedPasante(e.target.value)}
                                disabled={!selectedPasantia}
                                className="w-full mt-1 rounded-xl border-slate-200 text-sm focus:ring-primary-blue focus:border-primary-blue disabled:bg-slate-50 disabled:text-slate-400"
                                required
                            >
                                <option value="">{selectedPasantia ? '-- Elige el pasante --' : 'Primero debes elegir una pasantía'}</option>
                                {filteredPasantes.map(ins => (
                                    <option key={ins.idU_pasante} value={ins.idU_pasante}>
                                        {ins.pasante_nombre}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        {/* Bloque Informativo de Alertas o Restricciones Fallidas */}
                        {errorMessage && (
                            <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
                                <AlertTriangle size={20} className="shrink-0 text-amber-600" />
                                <div>
                                    <span className="font-bold">Restricción de Cumplimiento:</span>
                                    <p className="mt-0.5 text-amber-700 leading-relaxed">{errorMessage}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <SecondaryButton type="button" onClick={() => window.history.back()}>
                                Regresar
                            </SecondaryButton>
                            <PrimaryButton 
                                type="submit" 
                                disabled={loadingVerification || !selectedPasante}
                                className="gap-2"
                            >
                                {loadingVerification ? 'Verificando...' : 'Redactar Informe'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL DE GENERACIÓN DE INFORME FINAL */}
            <Modal 
                show={showRedactarModal} 
                onClose={() => setShowRedactarModal(false)} 
                title="Consolidación de Calificaciones e Informe Final" 
                maxWidth="2xl"
            >
                {backendData && (
                    <form onSubmit={handleConfirmarInforme} className="space-y-5">
                        
                        {/* Resumen Clínico de Bitácoras Evaluadas */}
                        <div>
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1 mb-2">
                                <ListChecks size={14} /> Resumen de Evaluaciones Realizadas
                            </h3>
                            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs bg-slate-50">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-100/80 font-bold text-slate-500 border-b border-slate-200">
                                            <th className="p-2.5">Actividad Obligatoria</th>
                                            <th className="p-2.5 text-center">Estado</th>
                                            <th className="p-2.5 text-right">Nota Asentada</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200/60 text-slate-600">
                                        {backendData.bitacoras.map((b) => (
                                            <tr key={b.id} className="hover:bg-white">
                                                <td className="p-2.5 font-medium">{b.actividad}</td>
                                                <td className="p-2.5 text-center capitalize">{b.estado}</td>
                                                <td className="p-2.5 text-right font-bold text-primary-blue">{b.nota} / 100</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bloque Metodológico de Promedios */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary-navy/5 p-4 rounded-xl border border-primary-navy/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-primary-blue border">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 block">Nota Recomendada (Promedio)</span>
                                    <span className="text-xl font-black text-primary-navy">{backendData.promedio} pts</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 leading-relaxed bg-white/50 p-2.5 rounded-lg border border-dashed">
                                <CheckCircle size={14} className="text-green-600 shrink-0" />
                                El promedio se calcula de forma automatizada basándose estrictamente en las bitácoras registradas.
                            </div>
                        </div>

                        {/* Input de Modificación Final */}
                        <div>
                            <InputLabel htmlFor="nota_final" value="Definir Calificación Final de la Pasantía" />
                            <TextInput
                                id="nota_final"
                                type="number"
                                min="0"
                                max="100"
                                value={data.nota_final}
                                onChange={e => setData('nota_final', e.target.value)}
                                className="w-full mt-1 font-bold"
                                required
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                                Nota: Si la calificación final es menor a 51, el resultado se guardará automáticamente como 'reprobado'.
                            </p>
                            <InputError message={errors.nota_final} />
                        </div>

                        {/* Botonera de Acción Final */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <SecondaryButton type="button" onClick={() => setShowRedactarModal(false)}>
                                Modificar Selección
                            </SecondaryButton>
                            <PrimaryButton 
                                type="submit" 
                                disabled={processing}
                                className="gap-2 bg-green-600 hover:bg-green-700 shadow-sm"
                            >
                                <FilePlus size={16} /> Generar Informe Final
                            </PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </DashboardLayout>
    );
}