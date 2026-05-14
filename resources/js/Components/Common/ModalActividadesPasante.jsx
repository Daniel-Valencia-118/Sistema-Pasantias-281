// resources/js/Components/Common/ModalActividadesPasante.jsx
import React from "react";
import { X, Calendar, FileText } from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalActividadesPasante({
    isOpen,
    onClose,
    pasantiaNombre,
    actividades,
    var1,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-white">
                                Actividades de la Pasantía
                            </h3>
                            <p className="text-primary-sky-blue text-sm">
                                {pasantiaNombre}
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

                {/* Contenido */}
                <div className="p-5 max-h-[60vh] overflow-y-auto">
                    {actividades.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay actividades registradas para esta pasantía
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Nro
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Nombre Actividad
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Tipo
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Descripción
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Fecha Inicio
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                            Fecha Final
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {actividades.map((act, index) => (
                                        <tr
                                            key={act.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-2 text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {act.nombre_act}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        act.tipo === "OPERATIVA"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {act.tipo}
                                                </span>
                                            </td>
                                            <td
                                                className="px-3 py-2 text-gray-600 max-w-xs truncate"
                                                title={act.descripcion}
                                            >
                                                {act.descripcion ||
                                                    "Sin descripción"}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {formatDateToSpanish(
                                                    act.fecha_ini,
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {formatDateToSpanish(
                                                    act.fecha_fin,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl gap-3">
                    {/* Botón condicional */}
                    {var1 === 1 && (
                        <button
                            type="button"
                            onClick={() => {
                                // Asegúrate de usar las comillas inclinadas `` (backticks)
                                window.location.href = "/pasante/actividades/";
                            }}
                            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Ir Actividades
                        </button>
                    )}

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
