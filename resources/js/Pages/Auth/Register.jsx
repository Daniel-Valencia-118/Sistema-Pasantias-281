import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import RegisterLayout from '@/Components/Layout/RegisterLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SelectInput from '@/Components/SelectInput';
import DateInput from '@/Components/DateInput';
import RadioGroup from '@/Components/RadioGroup';

const roleOptions = [
    { value: 'pasante', label: 'Pasante (Estudiante)' },
    { value: 'jefe', label: 'Jefe de Pasante' },
    { value: 'tutor', label: 'Tutor Académico' },
    { value: 'gerente', label: 'Gerente de Empresa' },
];

const mencionOptions = [
    'Desarrollo de Software e Innovación Tecnológica',
    'Inteligencia Artificial y Ciencias de Datos',
    'Ciencias de la Computación',
    'Informática Industrial',
    'Ingeniería de Sistemas',
    'Redes y TIC',
    'Seguridad de la Información'
];

const gradoOptions = ['Lic.', 'Ing.', 'M.Sc.', 'Mg.', 'Dr.', 'Ph.D.'];

export default function Register({ empresas = [] }) {
    const [step, setStep] = useState(1);
    
    // Añadimos 'role' directamente al estado inicial del formulario
    const { data, setData, post, processing, errors, reset } = useForm({
        role: 'pasante', 
        nombre_user: '',
        password: '',
        password_confirmation: '',
        numero_cel: '',
        ci: '',
        correo: '',
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        fecha_nac: '',
        
        ru: '',
        matricula: '',
        semestre: '',
        mencion: '',
        
        cargo: '',
        area: '',
        id_empresa: '', // <--- NUEVO CAMPO AÑADIDO
        
        especialidad: '',
        grado_aca: '',
        
        nro_secun: '',
        
        empresa_nombre: '',
        empresa_direccion: '',
        empresa_email: '',
        empresa_nit: '',
        empresa_telefono: '',
    });

    const handleRoleChange = (e) => {
        const roleSelected = e.target.value;
        setData('role', roleSelected);
        
        // Resetear exclusivamente campos variables
        reset('ru', 'matricula', 'semestre', 'mencion', 'cargo', 'area', 'id_empresa',
              'especialidad', 'grado_aca', 'nro_secun', 'empresa_nombre', 
              'empresa_direccion', 'empresa_email', 'empresa_nit', 'empresa_telefono');
    };

    const nextStep = () => {
        if (step === 1) {
            if (!data.nombre_user || !data.password || !data.numero_cel || 
                !data.ci || !data.correo || !data.nombre || !data.ap_paterno || 
                !data.ap_materno || !data.fecha_nac) {
                alert('Por favor complete todos los campos obligatorios');
                return;
            }
            if (data.password !== data.password_confirmation) {
                alert('Las contraseñas no coinciden');
                return;
            }
            setStep(2);
        }
    };

    const prevStep = () => setStep(1);

    const submit = (e) => {
        e.preventDefault();
        
        // Con el Endpoint Único ya no necesitas armar payloads manuales parciales, 
        // Inertia enviará todo el bloque estructurado y el Backend filtrará según el 'role'
        post(route('registro.store'));
    };

    return (
        <RegisterLayout title="Registro">
            <Head title="Registro" />
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-primary-navy mb-2">Crear una cuenta</h2>
                <p className="text-gray-600 mb-8">
                    {step === 1 ? 'Ingresa tus datos personales' : 'Completa tu perfil según tu rol'}
                </p>

                {/* Indicador de pasos */}
                <div className="mb-8">
                    <div className="flex items-center justify-center">
                        <div className={`flex items-center ${step === 1 ? 'text-primary-blue' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                ${step === 1 ? 'border-primary-blue bg-primary-blue text-white' : 'border-gray-300'}`}>
                                1
                            </div>
                            <span className="ml-2 font-medium">Datos básicos</span>
                        </div>
                        <div className="w-16 h-0.5 mx-4 bg-gray-200"></div>
                        <div className={`flex items-center ${step === 2 ? 'text-primary-blue' : 'text-gray-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                                ${step === 2 ? 'border-primary-blue bg-primary-blue text-white' : 'border-gray-300'}`}>
                                2
                            </div>
                            <span className="ml-2 font-medium">Perfil de rol</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={step === 1 ? (e) => { e.preventDefault(); nextStep(); } : submit}>
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="nombre_user" value="Nombre de usuario *" />
                                    <TextInput
                                        id="nombre_user"
                                        value={data.nombre_user}
                                        onChange={(e) => setData('nombre_user', e.target.value)}
                                        placeholder="Nombre de usuario"
                                        required
                                    />
                                    <InputError message={errors.nombre_user} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="correo" value="Correo electrónico *" />
                                    <TextInput
                                        id="correo"
                                        type="email"
                                        value={data.correo}
                                        onChange={(e) => setData('correo', e.target.value)}
                                        placeholder="Correo electrónico"
                                        required
                                    />
                                    <InputError message={errors.correo} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password" value="Contraseña *" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Contraseña"
                                        required
                                    />
                                    <InputError message={errors.password} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña *" />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirmar contraseña"
                                        required
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="nombre" value="Nombre *" />
                                    <TextInput
                                        id="nombre"
                                        value={data.nombre}
                                        onChange={(e) => setData('nombre', e.target.value)}
                                        placeholder="Nombre"
                                        required
                                    />
                                    <InputError message={errors.nombre} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_paterno" value="Apellido Paterno *" />
                                    <TextInput
                                        id="ap_paterno"
                                        value={data.ap_paterno}
                                        onChange={(e) => setData('ap_paterno', e.target.value)}
                                        placeholder="Apellido Paterno"
                                        required
                                    />
                                    <InputError message={errors.ap_paterno} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ap_materno" value="Apellido Materno *" />
                                    <TextInput
                                        id="ap_materno"
                                        value={data.ap_materno}
                                        onChange={(e) => setData('ap_materno', e.target.value)}
                                        placeholder="Apellido Materno"
                                        required
                                    />
                                    <InputError message={errors.ap_materno} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="ci" value="Carnet de Identidad *" />
                                    <TextInput
                                        id="ci"
                                        value={data.ci}
                                        onChange={(e) => setData('ci', e.target.value)}
                                        placeholder="Carnet de Identidad"
                                        required
                                    />
                                    <InputError message={errors.ci} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="numero_cel" value="Número de Celular *" />
                                    <TextInput
                                        id="numero_cel"
                                        value={data.numero_cel}
                                        onChange={(e) => setData('numero_cel', e.target.value)}
                                        placeholder="Número de Celular"
                                        required
                                    />
                                    <InputError message={errors.numero_cel} />
                                </div>
                                <div>
                                    <InputLabel htmlFor="fecha_nac" value="Fecha de Nacimiento *" />
                                    <DateInput
                                        id="fecha_nac"
                                        value={data.fecha_nac}
                                        onChange={(e) => setData('fecha_nac', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.fecha_nac} />
                                </div>
                            </div>
                            
                            <div className="flex justify-end">
                                <PrimaryButton type="submit">
                                    Continuar
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <InputLabel value="Selecciona el tipo de usuario *" />
                                <RadioGroup
                                    name="role"
                                    options={roleOptions}
                                    selected={data.role}
                                    onChange={handleRoleChange}
                                    className="mt-2 grid grid-cols-2 gap-3"
                                />
                            </div>

                            {/* Campos de Pasante */}
                            {data.role === 'pasante' && (
                                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                                    <div>
                                        <InputLabel htmlFor="ru" value="Número de Registro Universitario *" />
                                        <TextInput
                                            id="ru"
                                            value={data.ru}
                                            onChange={(e) => setData('ru', e.target.value)}
                                            required
                                            placeholder="Registro Universitario"
                                        />
                                        <InputError message={errors.ru} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="matricula" value="Matrícula *" />
                                        <TextInput
                                            id="matricula"
                                            value={data.matricula}
                                            onChange={(e) => setData('matricula', e.target.value)}
                                            placeholder="Matrícula"
                                            required
                                        />
                                        <InputError message={errors.matricula} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="semestre" value="Semestre *" />
                                        <SelectInput
                                            id="semestre"
                                            value={data.semestre}
                                            onChange={(e) => setData('semestre', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                                <option key={n} value={n}>{n}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.semestre} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="mencion" value="Mención *" />
                                        <SelectInput
                                            id="mencion"
                                            value={data.mencion}
                                            onChange={(e) => setData('mencion', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            {mencionOptions.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.mencion} />
                                    </div>
                                </div>
                            )}

                            {/* Campos de Jefe de pasante */}
                            {data.role === 'jefe' && (
                                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                                    <div>
                                        <InputLabel htmlFor="cargo" value="Cargo *" />
                                        <TextInput
                                            id="cargo"
                                            value={data.cargo}
                                            onChange={(e) => setData('cargo', e.target.value)}
                                            placeholder="Cargo"
                                            required
                                        />
                                        <InputError message={errors.cargo} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="area" value="Área *" />
                                        <TextInput
                                            id="area"
                                            value={data.area}
                                            onChange={(e) => setData('area', e.target.value)}
                                            placeholder="Área"
                                            required
                                        />
                                        <InputError message={errors.area} />
                                    </div>

                                    {/* SECCIÓN NUEVA: Desplegable de Empresas Ya Registradas */}
                                    <div className="md:col-span-2">
                                        <InputLabel htmlFor="id_empresa" value="Empresa a la que pertenece *" />
                                        <SelectInput
                                            id="id_empresa"
                                            value={data.id_empresa}
                                            onChange={(e) => setData('id_empresa', e.target.value)}
                                            required
                                        >
                                            <option value="">-- Seleccione la empresa asignada --</option>
                                            {empresas.map((emp) => (
                                                <option key={emp.id_empresa} value={emp.id_empresa}>
                                                    {emp.nombre}
                                                </option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.id_empresa} />
                                    </div>
                                </div>
                            )}

                            {/* Campos de Tutor */}
                            {data.role === 'tutor' && (
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="especialidad" value="Especialidad *" />
                                        <TextInput
                                            id="especialidad"
                                            value={data.especialidad}
                                            onChange={(e) => setData('especialidad', e.target.value)}
                                            placeholder="Especialidad"
                                            required
                                        />
                                        <InputError message={errors.especialidad} />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="grado_aca" value="Grado Académico *" />
                                        <SelectInput
                                            id="grado_aca"
                                            value={data.grado_aca}
                                            onChange={(e) => setData('grado_aca', e.target.value)}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            {gradoOptions.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </SelectInput>
                                        <InputError message={errors.grado_aca} />
                                    </div>
                                </div>
                            )}

                            {/* Campos de Gerente */}
                            {data.role === 'gerente' && (
                                <>
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-primary-navy mb-4">Datos del Gerente</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <InputLabel htmlFor="nro_secun" value="Celular secundario (opcional)" />
                                                <TextInput
                                                    id="nro_secun"
                                                    value={data.nro_secun}
                                                    onChange={(e) => setData('nro_secun', e.target.value)}
                                                    placeholder="Número de Celular Secundario"
                                                />
                                                <InputError message={errors.nro_secun} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t pt-6">
                                        <h3 className="text-lg font-medium text-primary-navy mb-4">Datos de la Empresa</h3>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="empresa_nombre" value="Nombre de la Empresa *" />
                                                <TextInput
                                                    id="empresa_nombre"
                                                    value={data.empresa_nombre}
                                                    onChange={(e) => setData('empresa_nombre', e.target.value)}
                                                    placeholder="Nombre de la Empresa"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <InputLabel htmlFor="empresa_direccion" value="Dirección" />
                                                <TextInput
                                                    id="empresa_direccion"
                                                    value={data.empresa_direccion}
                                                    onChange={(e) => setData('empresa_direccion', e.target.value)}
                                                    placeholder="Dirección"
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="empresa_email" value="Email de Empresa *" />
                                                <TextInput
                                                    id="empresa_email"
                                                    type="email"
                                                    value={data.empresa_email}
                                                    onChange={(e) => setData('empresa_email', e.target.value)}
                                                    placeholder="Email corporativo"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="empresa_telefono" value="Teléfono" />
                                                <TextInput
                                                    id="empresa_telefono"
                                                    value={data.empresa_telefono}
                                                    onChange={(e) => setData('empresa_telefono', e.target.value)}
                                                    placeholder="Teléfono"
                                                />
                                            </div>
                                            <div>
                                                <InputLabel htmlFor="empresa_nit" value="NIT *" />
                                                <TextInput
                                                    id="empresa_nit"
                                                    value={data.empresa_nit}
                                                    onChange={(e) => setData('empresa_nit', e.target.value)}
                                                    placeholder="NIT"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Mostrar errores generales globales si la BD los arroja */}
                            {errors.error && (
                                <div className="text-red-600 font-medium text-sm text-center bg-red-50 p-2 rounded-lg">
                                    {errors.error}
                                </div>
                            )}

                            <div className="flex justify-between pt-4">
                                <SecondaryButton type="button" onClick={prevStep}>
                                    ← Anterior
                                </SecondaryButton>
                                <PrimaryButton disabled={processing}>
                                    {processing ? 'Registrando...' : 'Registrarse'}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿Ya tienes una cuenta?{' '}
                        <a href={route('login')} className="font-medium text-primary-blue hover:text-primary-sky-blue">
                            Inicia sesión aquí
                        </a>
                    </p>
                </div>
            </div>
        </RegisterLayout>
    );
}