import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AuthLayout from '@/Components/Layout/AuthLayout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ForgotPassword({ status }) {
    // Estados de la vista: 'request', 'verify', 'reset'
    const [view, setView] = useState('request');
    const [email, setEmail] = useState('');
    
    const requestForm = useForm({
        email: '',
    });
    
    const verifyForm = useForm({
        email: email,
        code: '',
    });
    
    const resetForm = useForm({
        email: email,
        code: verifyForm.data.code,
        password: '',
        password_confirmation: '',
    });

    const sendResetLink = (e) => {
        e.preventDefault();
        setEmail(requestForm.data.email);
        requestForm.post(route('password.email'), {
            onSuccess: () => {
                setView('verify');
            },
        });
    };

    const verifyCode = (e) => {
        e.preventDefault();
        verifyForm.post(route('password.verify'), {
            onSuccess: () => {
                setView('reset');
            },
        });
    };

    const resetPassword = (e) => {
        e.preventDefault();
        resetForm.post(route('password.update'), {
            onSuccess: () => {
                router.visit(route('login'), {
                    only: ['flash'],
                    data: { flash: { success: 'Contraseña restablecida exitosamente. Por favor inicia sesión.' } }
                });
            },
        });
    };

    return (
        <AuthLayout>
            <Head title="Recuperar Contraseña" />
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
                <h2 className="text-2xl font-bold text-primary-navy mb-2">
                    {view === 'request' && 'Recuperar contraseña'}
                    {view === 'verify' && 'Verificar código'}
                    {view === 'reset' && 'Nueva contraseña'}
                </h2>
                <p className="text-gray-600 mb-8">
                    {view === 'request' && 'Ingresa tu correo electrónico y te enviaremos un código de verificación.'}
                    {view === 'verify' && `Hemos enviado un código a ${email}. Ingrésalo a continuación.`}
                    {view === 'reset' && 'Crea una nueva contraseña para tu cuenta.'}
                </p>

                {status && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {status}
                    </div>
                )}

                {/* Vista 1: Solicitar correo */}
                {view === 'request' && (
                    <form onSubmit={sendResetLink} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Correo electrónico" />
                            <TextInput
                                id="email"
                                type="email"
                                value={requestForm.data.email}
                                onChange={(e) => requestForm.setData('email', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={requestForm.errors.email} />
                        </div>
                        
                        <PrimaryButton className="w-full" disabled={requestForm.processing}>
                            {requestForm.processing ? 'Enviando...' : 'Enviar código'}
                        </PrimaryButton>
                        
                        <div className="text-center">
                            <a href={route('login')} className="text-sm text-primary-blue hover:text-primary-sky-blue">
                                ← Volver al inicio de sesión
                            </a>
                        </div>
                    </form>
                )}

                {/* Vista 2: Verificar código */}
                {view === 'verify' && (
                    <form onSubmit={verifyCode} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="code" value="Código de verificación" />
                            <TextInput
                                id="code"
                                value={verifyForm.data.code}
                                onChange={(e) => verifyForm.setData('code', e.target.value)}
                                required
                                autoFocus
                                placeholder="123456"
                            />
                            <InputError message={verifyForm.errors.code} />
                        </div>
                        
                        <PrimaryButton className="w-full" disabled={verifyForm.processing}>
                            {verifyForm.processing ? 'Verificando...' : 'Verificar código'}
                        </PrimaryButton>
                        
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setView('request')}
                                className="text-sm text-primary-blue hover:text-primary-sky-blue"
                            >
                                ← Cambiar correo electrónico
                            </button>
                        </div>
                    </form>
                )}

                {/* Vista 3: Nueva contraseña */}
                {view === 'reset' && (
                    <form onSubmit={resetPassword} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="password" value="Nueva contraseña" />
                            <TextInput
                                id="password"
                                type="password"
                                value={resetForm.data.password}
                                onChange={(e) => resetForm.setData('password', e.target.value)}
                                required
                                autoFocus
                            />
                            <InputError message={resetForm.errors.password} />
                        </div>
                        
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmar contraseña" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={resetForm.data.password_confirmation}
                                onChange={(e) => resetForm.setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={resetForm.errors.password_confirmation} />
                        </div>
                        
                        <PrimaryButton className="w-full" disabled={resetForm.processing}>
                            {resetForm.processing ? 'Restableciendo...' : 'Restablecer contraseña'}
                        </PrimaryButton>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}