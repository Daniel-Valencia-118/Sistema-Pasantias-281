// resources/js/Components/Common/ModalHorario.jsx
import React from "react";
import { X, Clock, CalendarDays, Calendar, AlertCircle } from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

// Función para calcular días restantes (zona horaria Bolivia)
const calcularDiasRestantes = (fecha) => {
    if (!fecha) return null;

    // Usar zona horaria de Bolivia (UTC-4)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaObj = new Date(fecha);
    fechaObj.setHours(0, 0, 0, 0);

    const diffTime = fechaObj - hoy;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

export default function ModalHorario({
    isOpen,
    onClose,
    turno,
    cargaHoraria,
    fechaIni,
    fechaFin,
}) {
    if (!isOpen) return null;

    const diasParaIniciar = fechaIni ? calcularDiasRestantes(fechaIni) : null;
    const diasParaTerminar = fechaFin ? calcularDiasRestantes(fechaFin) : null;

    const yaIniciada = diasParaIniciar !== null && diasParaIniciar <= 0;
    const yaTerminada = diasParaTerminar !== null && diasParaTerminar < 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
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
                    {/* Turno */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-500">
                            Turno
                        </label>
                        <p className="text-gray-900 font-medium text-lg capitalize">
                            {turno || "-"}
                        </p>
                    </div>

                    {/* Carga Horaria */}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                            <CalendarDays size={14} /> Carga Horaria Total
                        </label>
                        <p className="text-gray-900 font-medium text-lg">
                            {cargaHoraria || 0} horas
                        </p>
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Calendar size={14} /> Fecha Inicio
                            </label>
                            <p className="text-gray-900 font-medium">
                                {fechaIni ? formatDateToSpanish(fechaIni) : "-"}
                            </p>
                            {diasParaIniciar !== null && (
                                <p
                                    className={`text-xs mt-1 ${
                                        yaIniciada
                                            ? "text-orange-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {yaIniciada
                                        ? "✓ Ya iniciada"
                                        : `⌛ Faltan ${diasParaIniciar} días`}
                                </p>
                            )}
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3">
                            <label className="block text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Calendar size={14} /> Fecha Final
                            </label>
                            <p className="text-gray-900 font-medium">
                                {fechaFin ? formatDateToSpanish(fechaFin) : "-"}
                            </p>
                            {diasParaTerminar !== null && (
                                <p
                                    className={`text-xs mt-1 ${
                                        yaTerminada
                                            ? "text-red-600"
                                            : "text-green-600"
                                    }`}
                                >
                                    {yaTerminada
                                        ? "✓ Ya terminó"
                                        : `⌛ Faltan ${diasParaTerminar} días`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Alerta si ya terminó */}
                    {yaTerminada && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertCircle
                                size={16}
                                className="text-yellow-600"
                            />
                            <p className="text-xs text-yellow-700">
                                Esta pasantía ya finalizó. Puedes calificarla en
                                la sección "Inscripciones Finalizadas".
                            </p>
                        </div>
                    )}
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
