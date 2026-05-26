import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

const colors = {
    // Usamos tus colores de marca para los bordes y acentos
    success: 'border-accent-mint/30 bg-white text-gray-800',
    error: 'border-red-200 bg-white text-gray-800',
    info: 'border-primary-blue/30 bg-white text-gray-800',
    warning: 'border-amber-200 bg-white text-gray-800',
};

const iconColors = {
    success: 'text-accent-mint bg-accent-mint/10 border-accent-mint/20',
    error: 'text-red-500 bg-red-50 border-red-100',
    info: 'text-primary-blue bg-primary-blue/10 border-primary-blue/20',
    warning: 'text-amber-500 bg-amber-50 border-amber-100',
};

export default function Toast() {
    const { flash } = usePage().props;
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 1. Obtenemos todas las llaves que tengan contenido en flash
        const availableKeys = Object.keys(flash).filter(key => flash[key] !== null);

        availableKeys.forEach(key => {
            const id = Date.now() + Math.random(); // ID único para evitar colisiones
            const text = typeof flash[key] === 'string' ? flash[key] : flash[key]?.message;

            if (text) {
                setMessages(prev => [...prev, { 
                    id, 
                    text, 
                    type: key === 'message' ? 'info' : key 
                }]);

                setTimeout(() => {
                    setMessages(prev => prev.filter(m => m.id !== id));
                }, 5000);
            }
        });
    }, [flash]); // Se dispara cada vez que Inertia actualiza las props

    if (messages.length === 0) return null;

        return (
        <div className="fixed inset-x-0 top-6 z-[100] flex flex-col items-center pointer-events-none space-y-3">
            {messages.map(msg => {
                const Icon = icons[msg.type] || Info;
                return (
                    <div
                        key={msg.id}
                        className={`
                            pointer-events-auto
                            flex items-start gap-4 p-5 rounded-xl border
                            w-[90%] max-w-lg shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]
                            ${colors[msg.type]} 
                            transition-all animate-slide-down
                        `}
                    >
                        {/* Círculo del icono estilo SweetAlert */}
                        <div className={`p-3 rounded-full border-2 shrink-0 ${iconColors[msg.type]}`}>
                            <Icon size={24} strokeWidth={2.5} />
                        </div>
                        
                        <div className="flex-1 pt-0.5">
                            <h3 className="font-display font-bold text-lg leading-tight uppercase tracking-tight">
                                {msg.type === 'success' ? '¡Logrado!' : msg.type}
                            </h3>
                            <p className="font-body text-gray-600 text-sm mt-1">
                                {msg.text}
                            </p>
                        </div>

                        <button 
                            onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))} 
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}