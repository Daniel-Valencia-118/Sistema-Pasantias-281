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
    // Usando tu accent-mint para el éxito
    success: 'bg-white border-accent-mint text-primary-navy shadow-[0_10px_40px_-15px_rgba(109,187,152,0.3)]',
    // Usando tu primary-blue para información
    info: 'bg-white border-primary-blue text-primary-navy shadow-[0_10px_40px_-15px_rgba(42,90,141,0.3)]',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
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
        /* 1. CAMBIO: Contenedor centrado */
        <div className="fixed inset-x-0 top-10 z-50 flex flex-col items-center pointer-events-none space-y-4">
            {messages.map(msg => {
                const Icon = icons[msg.type] || Info;
                return (
                    <div
                        key={msg.id}
                        /* 2. CAMBIO: Más ancho (max-w-2xl), padding extra y puntero habilitado */
                        className={`
                            pointer-events-auto
                            flex items-center gap-4 p-6 rounded-2xl shadow-2xl border-2
                            w-full max-w-2xl min-h-[80px]
                            ${colors[msg.type] || colors.info} 
                            transition-all animate-slide-down
                        `}
                    >
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Icon size={28} /> {/* Icono más grande */}
                        </div>
                        
                        <div className="flex-1">
                            <p className="text-lg font-bold leading-tight">
                                {msg.type.toUpperCase()}
                            </p>
                            <p className="text-base opacity-90">{msg.text}</p>
                        </div>

                        <button 
                            onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))} 
                            className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}