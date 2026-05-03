import React from "react";
import { X, Calendar, Clock, Award, Briefcase, MapPin } from "lucide-react";

export default function ModalDetallesPasantia({ isOpen, onClose, pasantia }) {
    if (!isOpen || !pasantia) return null;

    const formatDate = (date) => {
        if (!date) return "-";
        return date.split("-").reverse().join("/");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Detalles de la Pasantía
                            </h3>
                            <p className="text-primary-sky-blue text-sm">
                                {pasantia.nombre}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Mención
                            </label>
                            <p className="text-gray-900 font-medium">
                                {pasantia.mencion}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Turno
                            </label>
                            <p className="text-gray-900 font-medium">
                                {pasantia.turno}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Carga Horaria
                            </label>
                            <p className="text-gray-900 font-medium">
                                {pasantia.carga_horaria || 0} horas
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Cupos disponibles
                            </label>
                            <p className="text-gray-900 font-medium">
                                {pasantia.cupos_disponibles} / {pasantia.cupos}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Fecha de Inicio
                            </label>
                            <p className="text-gray-900 font-medium">
                                {formatDate(pasantia.fecha_ini)}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Fecha de Fin
                            </label>
                            <p className="text-gray-900 font-medium">
                                {formatDate(pasantia.fecha_fin)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Inscritos
                        </label>
                        <p className="text-gray-900 font-medium">
                            {pasantia.inscritos} estudiantes
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-sky-blue transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
