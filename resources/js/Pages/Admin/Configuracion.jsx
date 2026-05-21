import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import InputField from '@/Components/Form/InputField';
import TextAreaField from '@/Components/Form/TextAreaField';
import DashboardLayout from '@/Components/Layout/DashboardLayout';

export default function Configuracion({ auth, config }) {
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        nombre_sistema: config.nombre_sistema || '',
        descripcion_corta: config.descripcion_corta || '',
        mision: config.mision || '',
        vision: config.vision || '',
        correo_contacto: config.correo_contacto || '',
        telefono_contacto: config.telefono_contacto || '',
        direccion: config.direccion || '',
        url_facebook: config.url_facebook || '',
        url_linkedin: config.url_linkedin || '',
        copyright: config.copyright || '',
        terminos_condiciones: config.terminos_condiciones || '',
        logo: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Usamos post con el truco del método para simular una actualización completa con archivos
        post(route('admin.configuracion.update'));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Configuración del Sistema" />

            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Configuración del Sistema</h2>
                </div>
            </header>

            <div className="py-12 max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex flex-col md:flex-row">
                    
                    {/* Menú de pestañas lateral */}
                    <div className="w-full md:w-1/4 bg-gray-50 p-4 border-r border-gray-200">
                        <nav className="space-y-2">

                            {['general', 'institucional'].map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`w-full text-left px-4 py-2 rounded-lg font-medium text-sm capitalize transition ${
                                        activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {tab === 'contacto' ? 'Contacto y Redes' : tab}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Formulario Principal */}
                    <div className="w-full md:w-3/4 p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* PESTAÑA: GENERAL */}
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Aspecto General del Sistema</h3>
                                    <InputField label="Nombre del Sistema" value={data.nombre_sistema} onChange={e => setData('nombre_sistema', e.target.value)} error={errors.nombre_sistema} />
                                    <InputField label="Descripción Corta (Slogan)" value={data.descripcion_corta} onChange={e => setData('descripcion_corta', e.target.value)} error={errors.descripcion_corta} />
                                    {/* <InputField label="Copyright del Sistema" value={data.copyright} onChange={e => setData('copyright', e.target.value)} error={errors.copyright} /> */}
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Plataforma</label>
                                        <div className="flex items-center space-x-4">
                                            {config.logo_url && (
                                                <img src={config.logo_url} alt="Logo actual" className="h-16 w-16 object-contain border p-1 rounded bg-gray-100" />
                                            )}
                                            <input type="file" onChange={e => setData('logo', e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                        </div>
                                        {errors.logo && <p className="text-red-500 text-xs mt-1">{errors.logo}</p>}
                                    </div>
                                </div>
                            )}

                            {/* PESTAÑA: INSTITUCIONAL */}
                            {activeTab === 'institucional' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información Institucional</h3>
                                    <TextAreaField label="Misión" value={data.mision} rows={4} onChange={e => setData('mision', e.target.value)} error={errors.mision} />
                                    <TextAreaField label="Visión" value={data.vision} rows={4} onChange={e => setData('vision', e.target.value)} error={errors.vision} />
                                    {/* <TextAreaField label="Términos y Condiciones del Sistema" value={data.terminos_condiciones} rows={6} onChange={e => setData('terminos_condiciones', e.target.value)} error={errors.terminos_condiciones} /> */}
                                </div>
                            )}

                            {/* PESTAÑA: CONTACTO */}
                            {activeTab === 'contacto' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos de Contacto y Enlaces</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="Correo Electrónico de Contacto" type="email" value={data.correo_contacto} onChange={e => setData('correo_contacto', e.target.value)} error={errors.correo_contacto} />
                                        <InputField label="Teléfono de Contacto" value={data.telefono_contacto} onChange={e => setData('telefono_contacto', e.target.value)} error={errors.telefono_contacto} />
                                    </div>
                                    <InputField label="Dirección Física" value={data.direccion} onChange={e => setData('direccion', e.target.value)} error={errors.direccion} />
                                    <InputField label="URL Facebook" type="url" value={data.url_facebook} onChange={e => setData('url_facebook', e.target.value)} error={errors.url_facebook} />
                                    <InputField label="URL LinkedIn" type="url" value={data.url_linkedin} onChange={e => setData('url_linkedin', e.target.value)} error={errors.url_linkedin} />
                                </div>
                            )}

                            {/* Botón de Guardado */}
                            <div className="flex items-center justify-end space-x-4 border-t pt-4">
                                {recentlySuccessful && (
                                    <span className="text-sm text-green-600 font-medium animate-fade-in">¡Guardado con éxito!</span>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                >
                                    {processing ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}