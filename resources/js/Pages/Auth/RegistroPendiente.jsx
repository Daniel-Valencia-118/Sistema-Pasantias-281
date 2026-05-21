import React from 'react';
import { Head, Link } from '@inertiajs/react';
import RegisterLayout from '@/Components/Layout/RegisterLayout';

export default function RegistroPendiente() {
    return (
        <RegisterLayout title="Solicitud Recibida">
            <Head title="Registro Pendiente" />
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center max-w-md mx-auto">
                {/* Icono de Reloj Animado */}
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-50 text-primary-blue mb-6 animate-pulse">
                    <svg className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                    ¡Solicitud Recibida!
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                    Tu requerimiento de registro ha sido enviado exitosamente al equipo administrativo del sistema.
                </p>

                {/* Caja Informativa Destacada */}
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mb-8 text-left">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0 1 16 0zm-7-4a1 1 0 11-2 0 1 1 0 0 1 2 0zm-1 9a1 1 0 100-2 1 1 0 0 1 0 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-amber-800">
                                Tu solicitud será evaluada para su aprobación o rechazo. Te notificaremos la resolución directamente a tu correo electrónico institucional.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botón de Retorno */}
                <div className="space-y-3">
                    <Link
                        href="/"
                        className="inline-flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition duration-200"
                    >
                        Volver al Inicio
                    </Link>
                    <p className="text-xs text-gray-400">
                        ¿Tienes dudas? Contacta al soporte de tu área académica.
                    </p>
                </div>
            </div>
        </RegisterLayout>
    );
}