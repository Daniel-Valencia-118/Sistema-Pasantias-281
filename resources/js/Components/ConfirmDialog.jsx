// resources/js/Components/ConfirmDialog.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function ConfirmDialog({ show, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
                <div className="relative bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-medium text-primary-navy mb-2">{title}</h3>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <div className="flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                            {cancelText}
                        </button>
                        <button
                            onClick={() => { onConfirm(); onClose(); }}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
                                type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-blue hover:bg-primary-slate'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}