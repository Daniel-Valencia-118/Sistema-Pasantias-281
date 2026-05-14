// resources/js/Components/Common/ModalDetallePromedio.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalDetallePromedio({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
}) {
    const [actividades, setActividades] = useState([]);
    const [promedio, setPromedio] = useState(0);
    const [abandono, setAbandono] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarDetalle();
        }
    }, [isOpen, pasantiaId]);

    const cargarDetalle = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/pasante/inscripciones/${pasantiaId}/detalle-promedio`,
            );
            setActividades(response.data.actividades);
            setPromedio(response.data.promedio);
            setAbandono(response.data.abandono);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar el detalle");
        } finally {
            setLoading(false);
        }
    };

    const getPromedioColor = (prom) => {
        if (prom >= 80) return "text-green-600";
        if (prom >= 60) return "text-blue-600";
        if (prom >= 40) return "text-yellow-600";
        return "text-red-600";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5 border-b">
                    <div>
                        <h3 className="text-xl font-bold text-primary-navy">
                            Detalle de Evaluación
                        </h3>
                        <p className="text-gray-500 text-sm">
                            {pasantiaNombre}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Cargando...
                    </div>
                ) : (
                    <div className="p-5">
                        {abandono ? (
                            <div className="text-center py-8">
                                <span className="inline-flex px-4 py-2 rounded-full text-sm font-bold bg-orange-100 text-orange-800">
                                    ABANDONO - No se realizaron actividades
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 text-center">
                                    <span
                                        className={`text-3xl font-bold ${getPromedioColor(promedio)}`}
                                    >
                                        Promedio Final: {promedio}/100
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 text-left">
                                                    Nro
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Actividad
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Descripción
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Fecha Inicio
                                                </th>
                                                <th className="px-3 py-2 text-left">
                                                    Fecha Fin
                                                </th>
                                                <th className="px-3 py-2 text-center">
                                                    Estado
                                                </th>
                                                <th className="px-3 py-2 text-center">
                                                    NOTA
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {actividades.map((act, idx) => (
                                                <tr
                                                    key={act.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-2 text-gray-500">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3 py-2 font-medium">
                                                        {act.nombre}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 max-w-xs truncate">
                                                        {act.descripcion}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {formatDateToSpanish(
                                                            act.fecha_ini,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {formatDateToSpanish(
                                                            act.fecha_fin,
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${act.estado_color}`}
                                                        >
                                                            {act.estado_label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-bold">
                                                        {act.nota !== null
                                                            ? `${act.nota}/100`
                                                            : "---"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}

                <div className="flex justify-end p-5 border-t bg-gray-50">
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
