// resources/js/Pages/Admin/Pasantias/CrearOferta.jsx
import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { 
    Building2, Briefcase, Calendar, 
    Users, Clock, Save, ArrowLeft 
} from 'lucide-react';

export default function CrearOferta({ empresas = [], auth }) {
    
    const { data, setData, post, processing, errors } = useForm({
        nombre_pas: '',
        mencion: '',
        fecha_ini: '',
        fecha_fin: '',
        cupos: '',
        cupos_disponibles: '', // Se sincroniza con cupos
        carga_horaria: '',
        turno: '',
        id_empresa: '',
        estado: 'disponible',
    });

    const breadcrumbs = [
        { label: 'Pasantías', url: 'admin.pasantias.index' },
        { label: 'Registrar Nueva Oferta' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.pasantias.store'));
    };

    return (
        <DashboardLayout auth={auth}>
            <Head title="Registrar Oferta de Pasantía" />
            <Breadcrumbs items={breadcrumbs} />

            <div className="max-w-4xl mx-auto">
                {/* Cabecera de la página */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary-navy">Publicar Oferta de Pasantía</h1>
                        <p className="text-sm text-slate-500 font-medium">Complete la información para habilitar una nueva vacante.</p>
                    </div>
                    <Link 
                        href={route('admin.pasantias.index')} 
                        className="flex items-center text-sm text-slate-500 hover:text-primary-blue transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" /> Volver al listado
                    </Link>
                </div>

                {/* Contenedor del Formulario */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Sección 1: Datos de la Empresa y Cargo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Información Institucional</h3>
                                    <hr className="border-slate-100" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Empresa Solicitante" />
                                    <div className="mt-1 relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <select 
                                            className="w-full pl-10 border-slate-200 rounded-lg text-sm focus:ring-primary-blue focus:border-primary-blue"
                                            value={data.id_empresa}
                                            onChange={e => setData('id_empresa', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccione la empresa que ofrece la pasantía...</option>
                                            {empresas.map(emp => (
                                                <option key={emp.id_empresa} value={emp.id_empresa}>{emp.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <InputError message={errors.id_empresa} />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Nombre del Cargo o Puesto" />
                                    <div className="mt-1 relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <TextInput 
                                            placeholder="Ej: Auxiliar de Soporte Técnico"
                                            className="w-full pl-10"
                                            value={data.nombre_pas}
                                            onChange={e => setData('nombre_pas', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.nombre_pas} />
                                </div>

                                <div>
                                    <InputLabel value="Mención Requerida" />
                                    <select 
                                        className="w-full mt-1 border-slate-200 rounded-lg text-sm"
                                        value={data.mencion}
                                        onChange={e => setData('mencion', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione mención...</option>
                                        <option value="Redes">Redes y Telecomunicaciones</option>
                                        <option value="Sistemas">Ingeniería de Sistemas</option>
                                        <option value="Ciencia de Datos">Ciencia de Datos</option>
                                    </select>
                                    <InputError message={errors.mencion} />
                                </div>

                                <div>
                                    <InputLabel value="Turno de Trabajo" />
                                    <select 
                                        className="w-full mt-1 border-slate-200 rounded-lg text-sm"
                                        value={data.turno}
                                        onChange={e => setData('turno', e.target.value)}
                                        required
                                    >
                                        <option value="">Seleccione turno...</option>
                                        <option value="mañana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                        <option value="noche">Noche</option>
                                    </select>
                                    <InputError message={errors.turno} />
                                </div>
                            </div>

                            {/* Sección 2: Cronograma y Disponibilidad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Cronograma y Cupos</h3>
                                    <hr className="border-slate-100" />
                                </div>

                                <div>
                                    <InputLabel value="Fecha de Inicio" />
                                    <div className="mt-1 relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <TextInput 
                                            type="date"
                                            className="w-full pl-10"
                                            value={data.fecha_ini}
                                            onChange={e => setData('fecha_ini', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Fecha de Conclusión Estimada" />
                                    <div className="mt-1 relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <TextInput 
                                            type="date"
                                            className="w-full pl-10"
                                            value={data.fecha_fin}
                                            onChange={e => setData('fecha_fin', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Número de Cupos Ofertados" />
                                    <div className="mt-1 relative">
                                        <Users className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <TextInput 
                                            type="number"
                                            min="1"
                                            className="w-full pl-10"
                                            value={data.cupos}
                                            onChange={e => setData(prev => ({ 
                                                ...prev, 
                                                cupos: e.target.value, 
                                                cupos_disponibles: e.target.value 
                                            }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel value="Carga Horaria Semanal" />
                                    <div className="mt-1 relative">
                                        <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <TextInput 
                                            type="number"
                                            placeholder="Horas totales"
                                            className="w-full pl-10"
                                            value={data.carga_horaria}
                                            onChange={e => setData('carga_horaria', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-end gap-4 pt-8 mt-4 border-t border-slate-100">
                                <Link href={route('admin.pasantias.index')}>
                                    <SecondaryButton type="button">Cancelar</SecondaryButton>
                                </Link>
                                <PrimaryButton 
                                    className="px-8 py-3 bg-primary-navy shadow-lg shadow-primary-navy/20" 
                                    disabled={processing}
                                >
                                    {processing ? 'Registrando...' : (
                                        <span className="flex items-center">
                                            <Save className="h-4 w-4 mr-2" /> Guardar y Publicar
                                        </span>
                                    )}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}