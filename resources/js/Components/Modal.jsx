// resources/js/Components/Modal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ show, onClose, title, children, maxWidth = 'max-w-2xl' }) {
    // CAMBIO 1: Manejo del scroll del body.
    // 'hidden' evita que el usuario mueva la tabla de fondo mientras el modal está abierto.
    // 'unset' devuelve el control al cerrar.
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
        // CAMBIO 2: Centrado con Flexbox.
        // Asegura que el modal esté perfectamente centrado vertical y horizontalmente.
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            
            {/* CAMBIO 3: Overlay con desenfoque (Backdrop blur).
                Le da profundidad y enfoque al modal, oscureciendo el fondo con un tono pizarra suave. */}
            <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300" 
                onClick={onClose} 
            />

            {/* CAMBIO 4: Animación de entrada 'Zoom-in'.
                El modal no aparece de golpe; tiene un efecto de crecimiento suave (escala 95% a 100%). */}
            <div className={`relative bg-white rounded-xl shadow-2xl transform transition-all 
                animate-in zoom-in-95 duration-200 
                ${maxWidth} w-full overflow-hidden border border-slate-200`}
            >
                {/* CAMBIO 5: Cabecera con fondo diferenciado.
                    Usamos un gris casi blanco (slate-50) para separar visualmente el título del contenido. */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Contenido (Body) */}
                <div className="px-6 py-6 bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
