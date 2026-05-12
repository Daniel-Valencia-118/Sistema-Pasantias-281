// resources/js/Components/Common/ModalHorario.jsx
import React from "react";
import { X, Clock, CalendarDays } from "lucide-react";

export default function ModalHorario({ isOpen, onClose, turno, cargaHoraria }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={20} className="text-white" />
                            <h3 className="text-lg font-bold text-white">
                                Horario de la Pasantía
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <label className="block text-xs font-medium text-gray-500">
                            Turno
                        </label>
                        <p className="text-gray-900 font-medium text-lg capitalize">
                            {turno || "-"}
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <label className="block text-xs font-medium text-gray-500 flex items-center justify-center gap-1">
                            <CalendarDays size={14} /> Carga Horaria Total
                        </label>
                        <p className="text-gray-900 font-medium text-lg">
                            {cargaHoraria || 0} horas
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-sky-blue"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
