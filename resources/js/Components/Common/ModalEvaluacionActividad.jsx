import React from "react";
import {
    X,
    Calendar,
    Clock,
    User,
    MessageSquare,
    Lightbulb,
    Star,
} from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

function BadgeEstadoCalificacion({ estado }) {
    const config = {
        COMPLETADA: {
            bg: "bg-green-100",
            text: "text-green-800",
            label: "Completada",
        },
        "COMPLETADA PARCIALMENTE": {
            bg: "bg-blue-100",
            text: "text-blue-800",
            label: "Completada Parcialmente",
        },
        "NO REALIZADA": {
            bg: "bg-red-100",
            text: "text-red-800",
            label: "No Realizada",
        },
        "SIN CALIFICAR": {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            label: "Sin Calificar",
        },
        PENDIENTE: {
            bg: "bg-gray-100",
            text: "text-gray-600",
            label: "Pendiente",
        },
    };

    const c = config[estado] || config["PENDIENTE"];

    return (
        <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
        >
            {c.label}
        </span>
    );
}

export default function ModalEvaluacionActividad({
    isOpen,
    onClose,
    actividad,
    evaluacion,
    pasante,
}) {
    if (!isOpen) return null;

    const getColorByNota = (nota) => {
        if (!nota) return "text-gray-400";
        if (nota >= 90) return "text-green-600";
        if (nota >= 70) return "text-blue-600";
        if (nota >= 51) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Detalle de Calificación
                            </h3>
                            <p className="text-primary-sky-blue text-xs">
                                {actividad?.nombre_act}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {evaluacion ? (
                        <div className="space-y-4">
                            {/* Nota destacada */}
                            <div className="text-center">
                                <div
                                    className={`text-4xl font-bold ${getColorByNota(evaluacion.nota)}`}
                                >
                                    {Math.round(evaluacion.nota)}/100
                                </div>
                                <div className="mt-2">
                                    <BadgeEstadoCalificacion
                                        estado={evaluacion.estado}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                {/* Descripción */}
                                <div className="mb-3">
                                    <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                        <MessageSquare size={12} /> Descripción
                                    </label>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                        {evaluacion.descripcion ||
                                            "Sin descripción"}
                                    </p>
                                </div>

                                {/* Observación */}
                                {evaluacion.observacion && (
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <MessageSquare size={12} />{" "}
                                            Observación
                                        </label>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                            {evaluacion.observacion}
                                        </p>
                                    </div>
                                )}

                                {/* Recomendación */}
                                {evaluacion.recomendacion && (
                                    <div className="mb-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <Lightbulb size={12} />{" "}
                                            Recomendación
                                        </label>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                            {evaluacion.recomendacion}
                                        </p>
                                    </div>
                                )}

                                {/* Metadatos */}
                                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                    <div>
                                        <label className="block font-medium text-gray-500">
                                            Fecha evaluación
                                        </label>
                                        <p className="text-gray-700">
                                            {evaluacion.fecha
                                                ? formatDateToSpanish(
                                                      evaluacion.fecha,
                                                  )
                                                : "-"}
                                            {evaluacion.hora &&
                                                ` - ${evaluacion.hora}`}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block font-medium text-gray-500">
                                            Evaluado por
                                        </label>
                                        <p className="text-gray-700 truncate">
                                            {evaluacion.jefe_nombre || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p>Esta actividad aún no ha sido evaluada</p>
                            <p className="text-sm mt-1">
                                El jefe de pasante realizará la evaluación
                                próximamente
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-3 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
