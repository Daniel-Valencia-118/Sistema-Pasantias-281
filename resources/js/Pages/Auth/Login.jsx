import React, { useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthLayout from '@/Components/Layout/AuthLayout';
import ApplicationLogo from '@/Components/ApplicationLogo';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import GoogleButton from '@/Components/GoogleButton';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '', // Puede ser username o correo
        password: '',
        remember: false,
    });

    const { flash } = usePage().props;

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const handleGoogleLogin = () => {
        window.location.href = route('google.login');
    };

    return (
        <AuthLayout>
            <Head title="Iniciar Sesión" />

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                {/* Logo grande arriba del formulario */}
                <div className="flex justify-center mb-6">
                    <ApplicationLogo className="scale-150" />
                </div>
                
                <h2 className="text-2xl font-bold text-center text-primary-navy mb-2">
                    Bienvenido de nuevo
                </h2>
                <p className="text-center text-gray-600 mb-8">
                    Ingresa tus credenciales para continuar
                </p>

                {/* Mensajes flash de estado */}
                {status && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {status}
                    </div>
                )}
                
                {flash?.error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {flash.error}
                    </div>
                )}

                {flash?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="login" value="Usuario o Correo electrónico" />
                        <TextInput
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="Usuario o Correo electrónico"
                            required
                        />
                        <InputError message={errors.login} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Contraseña" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Contraseña"
                            required
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-primary-blue hover:text-primary-sky-blue transition underline-offset-2 hover:underline"
                            >
                                ¿Olvidó su contraseña?
                            </Link>
                        )}
                    </div>

                    <div className="pt-2">
                        <PrimaryButton className="w-full" disabled={processing}>
                            {processing ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </PrimaryButton>
                    </div>
                </form>

                {/* Separador */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500">o continúa con</span>
                    </div>
                </div>

                {/* Botón de Google */}
                <GoogleButton onClick={handleGoogleLogin} />

                {/* Link a Registro */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        ¿No tienes una cuenta?{' '}
                        <Link
                            href={route('register')}
                            className="font-medium text-primary-blue hover:text-primary-sky-blue transition underline-offset-2 hover:underline"
                        >
                            Regístrate aquí
                        </Link>
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}