import React, { useState, useEffect } from "react";
import { X, CheckCircle, ClipboardList, Calendar } from "lucide-react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-6xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                Actividades de la Pasantía
                            </h3>

                            <p className="text-base text-white">
                                {pasantiaNombre}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="bg-gray-50 p-6 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary-blue rounded-full animate-spin"></div>

                            <p className="mt-4 text-gray-500 font-medium">
                                Cargando actividades...
                            </p>
                        </div>
                    ) : actividades.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <ClipboardList
                                    size={30}
                                    className="text-gray-400"
                                />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-700">
                                No hay actividades registradas
                            </h4>

                            <p className="mt-2 text-sm text-gray-500 max-w-md">
                                Aún no existen actividades registradas para esta
                                pasantía.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full border-separate border-spacing-0">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-primary-navy to-primary-slate">
                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Nro
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Actividad
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Tipo
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Descripción
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Fecha Inicio
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Fecha Fin
                                            </th>

                                            <th className="px-4 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-white">
                                                Realizado por:
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {actividades.map((act, index) => (
                                            <tr
                                                key={act.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                        {index + 1}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <div className="flex items-start gap-3">
                                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-100 text-primary-blue">
                                                            <ClipboardList
                                                                size={18}
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {act.nombre_act}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
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
                                                    className="px-4 py-4 border-b border-gray-100"
                                                    title={act.descripcion}
                                                >
                                                    <p className="text-sm text-gray-600 max-w-xs line-clamp-2">
                                                        {act.descripcion ||
                                                            "Sin descripción"}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium">
                                                        <Calendar size={14} />

                                                        {formatDateToSpanish(
                                                            act.fecha_ini,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium">
                                                        <Calendar size={14} />

                                                        {formatDateToSpanish(
                                                            act.fecha_fin,
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-center border-b border-gray-100">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                                                        <CheckCircle
                                                            size={16}
                                                        />

                                                        <span className="font-semibold text-base">
                                                            {act.realizados}
                                                        </span>

                                                        <span className="text-base">
                                                            pasantes
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
                    <div className="text-sm text-gray-500">
                        Total actividades:{" "}
                        <span className="font-semibold text-gray-700">
                            {actividades.length}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-600 text-white text-sm font-semibold rounded-xl hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
