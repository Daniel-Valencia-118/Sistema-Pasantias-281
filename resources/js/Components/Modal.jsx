// resources/js/Components/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ 
    show, 
    onClose, 
    title, 
    children, 
    maxWidth = '2xl' // Ahora el default es solo la medida
}) {
    
    // Mapeo de medidas a clases reales de Tailwind
    const maxWidthClass = {
        'sm': 'sm:max-w-sm',
        'md': 'sm:max-w-md',
        'lg': 'sm:max-w-lg',
        'xl': 'sm:max-w-xl',
        '2xl': 'sm:max-w-2xl',
        '3xl': 'sm:max-w-3xl',
        '4xl': 'sm:max-w-4xl',
        '5xl': 'sm:max-w-5xl',
    }[maxWidth] || maxWidth; // Si pasas algo que no está en la lista, usa el string directo

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [show]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* Contenedor del Modal */}
            <div className={`relative bg-white rounded-xl shadow-2xl transform transition-all 
                animate-in zoom-in-95 duration-200 
                ${maxWidthClass} w-full overflow-hidden border border-slate-200`}
            >
                {/* Cabecera */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                        type="button"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido (Body) */}
                <div className="px-6 py-6 bg-white max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}