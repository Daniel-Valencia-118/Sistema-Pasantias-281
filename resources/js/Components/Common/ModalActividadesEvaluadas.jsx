import React, { useState, useEffect } from "react";
import {
    X,
    Eye,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
} from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

// Badge de estado
function BadgeEstadoCalificacion({ estado }) {
    const config = {
        COMPLETADA: {
            bg: "bg-green-100",
            text: "text-green-800",
            icon: CheckCircle,
            label: "Completada",
        },
        "COMPLETADA PARCIALMENTE": {
            bg: "bg-blue-100",
            text: "text-blue-800",
            icon: AlertTriangle,
            label: "Completada Parcialmente",
        },
        "NO REALIZADA": {
            bg: "bg-red-100",
            text: "text-red-800",
            icon: XCircle,
            label: "No Realizada",
        },
        "SIN CALIFICAR": {
            bg: "bg-yellow-100",
            text: "text-yellow-800",
            icon: Clock,
            label: "Sin Calificar",
        },
        PENDIENTE: {
            bg: "bg-gray-100",
            text: "text-gray-600",
            icon: Clock,
            label: "Pendiente",
        },
    };
    const c = config[estado] || config["PENDIENTE"];
    const Icon = c.icon;
    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}
        >
            <Icon size={12} />
            {c.label}
        </span>
    );
}

// Modal de evaluación interno
function ModalEvaluacionDetalle({
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-4 py-3 rounded-t-xl">
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
                            className="text-white hover:bg-white/20 p-1 rounded-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-4">
                    {evaluacion ? (
                        <div className="space-y-3">
                            <div className="text-center">
                                <div
                                    className={`text-3xl font-bold ${getColorByNota(evaluacion.nota)}`}
                                >
                                    {Math.round(evaluacion.nota)}/100
                                </div>
                                <div className="mt-1">
                                    <BadgeEstadoCalificacion
                                        estado={evaluacion.estado}
                                    />
                                </div>
                            </div>

                            <div className="border-t pt-3">
                                <div className="mb-2">
                                    <label className="block text-xs font-medium text-gray-500">
                                        Descripción
                                    </label>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                                        {evaluacion.descripcion ||
                                            "Sin descripción"}
                                    </p>
                                </div>

                                {evaluacion.observacion && (
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-500">
                                            Observación
                                        </label>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                                            {evaluacion.observacion}
                                        </p>
                                    </div>
                                )}

                                {evaluacion.recomendacion && (
                                    <div className="mb-2">
                                        <label className="block text-xs font-medium text-gray-500">
                                            Recomendación
                                        </label>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                                            {evaluacion.recomendacion}
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
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
                        <div className="text-center py-6 text-gray-500">
                            <p>Esta actividad aún no ha sido evaluada</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-3 border-t bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Componente principal
export default function ModalActividadesEvaluadas({
    isOpen,
    onClose,
    pasante,
    actividades = [],
}) {
    const [actividadesConData, setActividadesConData] = useState([]);
    const [modalEvaluacion, setModalEvaluacion] = useState({
        isOpen: false,
        actividad: null,
        evaluacion: null,
    });

    useEffect(() => {
        if (isOpen && pasante && actividades.length > 0) {
            console.log("=== MODAL ACTIVIDADES EVALUADAS ===");
            console.log("Actividades recibidas:", actividades);
            console.log("pasante recibido:", pasante);
            console.log("Evaluaciones del pasante:", pasante.evaluaciones);

            actividades.forEach((act, idx) => {
                console.log(`Actividad ${idx + 1}:`, {
                    id: act.id,
                    nombre_act: act.nombre_act,
                    tipo: act.tipo,
                    descripcion: act.descripcion,
                    fecha_ini: act.fecha_ini,
                    fecha_fin: act.fecha_fin,
                });
            });
            const combinadas = actividades.map((actividad) => {
                const evaluacion =
                    pasante.evaluaciones?.find(
                        (e) => e.id_actividad === actividad.id,
                    )?.evaluacion || null;
                return {
                    ...actividad,
                    evaluacion: evaluacion,
                    estadoCalificacion: evaluacion?.estado || "PENDIENTE",
                    tieneCalificacion: evaluacion && evaluacion.nota !== null,
                    nota: evaluacion?.nota || null,
                };
            });

            // Ordenar por fecha inicio ASC
            combinadas.sort((a, b) => {
                const fechaA = new Date(a.fecha_ini);
                const fechaB = new Date(b.fecha_ini);
                return fechaA - fechaB;
            });

            console.log("Actividades combinadas:", combinadas);
            setActividadesConData(combinadas);
        }
    }, [isOpen, pasante, actividades]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Actividades Evaluadas
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {pasante?.nombre} {pasante?.ap_paterno}{" "}
                                    {pasante?.ap_materno}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-2 rounded-lg"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {actividadesConData.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay actividades para esta pasantía
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Nro
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Actividad
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Tipo
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Descripción
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Fecha Inicio
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Fecha Fin
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Estado
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Calificación
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {actividadesConData.map(
                                            (act, index) => (
                                                <tr
                                                    key={act.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-3 text-gray-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-3 font-medium text-gray-900">
                                                        {act.nombre_act}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                act.tipo ===
                                                                "OPERATIVA"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : "bg-purple-100 text-purple-800"
                                                            }`}
                                                        >
                                                            {act.tipo}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className="px-3 py-3 text-gray-600 max-w-xs truncate"
                                                        title={act.descripcion}
                                                    >
                                                        {act.descripcion ||
                                                            "Sin descripción"}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {formatDateToSpanish(
                                                            act.fecha_ini,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {formatDateToSpanish(
                                                            act.fecha_fin,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <BadgeEstadoCalificacion
                                                            estado={
                                                                act.estadoCalificacion
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {act.tieneCalificacion ? (
                                                            <button
                                                                onClick={() =>
                                                                    setModalEvaluacion(
                                                                        {
                                                                            isOpen: true,
                                                                            actividad:
                                                                                act,
                                                                            evaluacion:
                                                                                act.evaluacion,
                                                                            pasante:
                                                                                pasante,
                                                                        },
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue transition-all"
                                                            >
                                                                <span className="font-bold">
                                                                    {Math.round(
                                                                        act.nota,
                                                                    )}
                                                                </span>
                                                                <Eye
                                                                    size={14}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">
                                                                No disponible
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de evaluación interno */}
            <ModalEvaluacionDetalle
                isOpen={modalEvaluacion.isOpen}
                onClose={() =>
                    setModalEvaluacion({
                        isOpen: false,
                        actividad: null,
                        evaluacion: null,
                    })
                }
                actividad={modalEvaluacion.actividad}
                evaluacion={modalEvaluacion.evaluacion}
                pasante={modalEvaluacion.pasante}
            />
        </>
    );
}
