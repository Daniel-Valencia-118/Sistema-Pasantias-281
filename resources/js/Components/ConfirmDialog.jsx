import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; // Usaremos headlessui para animaciones fluidas
import { X, AlertTriangle, Trash2, Info, CheckCircle2 } from 'lucide-react';
import SecondaryButton from './SecondaryButton';

export default function ConfirmDialog({ 
    show, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirmar', 
    cancelText = 'Cancelar', 
    type = 'warning' 
}) {
    // Configuración de estilos e iconos según el tipo
    const configs = {
        danger: {
            icon: <Trash2 className="h-6 w-6 text-red-600" />,
            bgIcon: 'bg-red-100',
            btnClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        },
        warning: {
            icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
            bgIcon: 'bg-amber-100',
            btnClass: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
        },
        info: {
            icon: <Info className="h-6 w-6 text-blue-600" />,
            bgIcon: 'bg-blue-100',
            btnClass: 'bg-primary-blue hover:bg-primary-navy focus:ring-blue-500',
        },
        success: {
            icon: <CheckCircle2 className="h-6 w-6 text-green-600" />,
            bgIcon: 'bg-green-100',
            btnClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
        }
    };

    const config = configs[type] || configs.warning;

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className={`mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${config.bgIcon} sm:mx-0 sm:h-10 sm:w-10`}>
                                            {config.icon}
                                        </div>
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900">
                                                {title}
                                            </Dialog.Title>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    {message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
                                    <button
                                        type="button"
                                        className={`inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all sm:ml-0 sm:w-auto ${config.btnClass}`}
                                        onClick={() => { onConfirm(); onClose(); }}
                                    >
                                        {confirmText}
                                    </button>
                                    <SecondaryButton
                                        onClick={onClose}
                                        className="inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold sm:w-auto"
                                    >
                                        {cancelText}
                                    </SecondaryButton>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}