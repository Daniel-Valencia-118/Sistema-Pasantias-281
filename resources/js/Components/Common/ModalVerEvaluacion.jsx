// resources/js/Components/Common/ModalVerEvaluacion.jsx
import React from "react";
import {
    X,
    Calendar,
    User,
    MessageSquare,
    Lightbulb,
    Award,
} from "lucide-react";

function BadgeEstado({ estado }) {
    const config = {
        COMPLETADA: {
            bg: "bg-green-100",
            text: "text-green-800",
            label: "Completada",
            icon: "",
        },
        "COMPLETADA PARCIALMENTE": {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            label: "Completada Parcialmente",
            icon: "",
        },
        "NO REALIZADA": {
            bg: "bg-red-100",
            text: "text-red-800",
            label: "No Realizada",
            icon: "",
        },
        "SIN CALIFICAR": {
            bg: "bg-blue-100",
            text: "text-blue-800",
            label: "Sin Calificar",
            icon: "",
        },
        PENDIENTE: {
            bg: "bg-gray-100",
            text: "text-gray-600",
            label: "Pendiente",
            icon: "",
        },
    };
    const c = config[estado] || config.PENDIENTE;
    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}
        >
            {c.icon} {c.label}
        </span>
    );
}

export default function ModalVerEvaluacion({ isOpen, onClose, evaluacion }) {
    if (!isOpen || !evaluacion) return null;

    const getColorByNota = (nota) => {
        if (!nota) return "text-gray-400";
        if (nota >= 80) return "text-green-600";
        if (nota >= 60) return "text-blue-600";
        if (nota >= 40) return "text-yellow-600";
        return "text-red-600";
    };

    // Formatear fecha y hora correctamente
    const formatFechaHora = (fecha, hora) => {
        if (!fecha) return "Fecha no disponible";
        const fechaObj = new Date(fecha);
        const fechaFormateada = fechaObj.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        return `${fechaFormateada} - ${hora || "Hora no registrada"}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                            <Award size={22} />
                            <h3 className="text-xl font-bold">
                                Detalle de Evaluación
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Nota destacada */}
                    <div className="text-center bg-gray-50 rounded-xl p-4">
                        <div
                            className={`text-5xl font-bold ${getColorByNota(evaluacion.nota)}`}
                        >
                            {Math.round(evaluacion.nota)}
                            <span className="text-2xl">/100</span>
                        </div>
                        <div className="mt-2">
                            <BadgeEstado estado={evaluacion.estado} />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                            <MessageSquare size={14} /> Descripción del
                            evaluador
                        </p>
                        <p className="text-gray-800">
                            {evaluacion.descripcion || "Sin descripción"}
                        </p>
                    </div>

                    {/* Observación */}
                    {evaluacion.observacion && (
                        <div className="bg-yellow-50 rounded-xl p-4 border-l-4 border-yellow-400">
                            <p className="text-sm text-yellow-700 flex items-center gap-1 mb-1">
                                <Lightbulb size={14} /> Observación
                            </p>
                            <p className="text-gray-800">
                                {evaluacion.observacion}
                            </p>
                        </div>
                    )}

                    {/* Recomendación */}
                    {evaluacion.recomendacion && (
                        <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700 flex items-center gap-1 mb-1">
                                <Lightbulb size={14} /> Recomendación
                            </p>
                            <p className="text-gray-800">
                                {evaluacion.recomendacion}
                            </p>
                        </div>
                    )}

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4 text-sm">
                        <div>
                            <p className="text-gray-500 flex items-center gap-1">
                                <Calendar size={14} /> Fecha evaluación
                            </p>
                            <p className="font-medium text-gray-800">
                                {formatFechaHora(
                                    evaluacion.fecha,
                                    evaluacion.hora,
                                )}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-500 flex items-center gap-1">
                                <User size={14} /> Evaluado por
                            </p>
                            <p className="font-medium text-gray-800 truncate">
                                {evaluacion.jefe_nombre || "Desconocido"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end p-5 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-primary-blue text-white rounded-xl hover:bg-primary-sky-blue shadow-md transition"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
