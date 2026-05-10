import React, { useState, useEffect } from "react";
import { X, CheckCircle } from "lucide-react";
import axios from "axios";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalActividadesFinalizadas({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
}) {
    const [actividades, setActividades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarActividades();
        }
    }, [isOpen, pasantiaId]);

    const cargarActividades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/actividades-realizados`,
            );
            setActividades(response.data.actividades);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar las actividades");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Actividades de la Pasantía
                            </h3>
                            <p className="text-primary-sky-blue text-sm">
                                {pasantiaNombre}
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

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Cargando actividades...
                        </div>
                    ) : actividades.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay actividades registradas
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
                                            Realizados
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {actividades.map((act, index) => (
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
                                                        act.tipo === "OPERATIVA"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-purple-100 text-purple-800"
                                                    }`}
                                                >
                                                    {act.tipo}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-gray-600 max-w-xs truncate">
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
                                                <div className="flex items-center justify-center gap-1">
                                                    <CheckCircle
                                                        size={14}
                                                        className="text-green-500"
                                                    />
                                                    <span className="font-medium">
                                                        {act.realizados}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">
                                                        pasantes
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

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
    );
}
