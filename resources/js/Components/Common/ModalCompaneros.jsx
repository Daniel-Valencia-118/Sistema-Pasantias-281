// resources/js/Components/Common/ModalCompaneros.jsx
import React, { useState, useEffect } from "react";
import { X, Users } from "lucide-react";
import axios from "axios";

export default function ModalCompaneros({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
}) {
    const [companeros, setCompaneros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pasantiaNombreState, setPasantiaNombreState] = useState("");

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarCompaneros();
        }
    }, [isOpen, pasantiaId]);

    const cargarCompaneros = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/pasante/inscripciones/${pasantiaId}/companeros`,
            );
            setCompaneros(response.data.companeros);
            setPasantiaNombreState(response.data.pasantia_nombre);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar los compañeros");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 my-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-white" />
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Pasantes Inscritos
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {pasantiaNombre || pasantiaNombreState}
                                </p>
                            </div>
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
                <div className="p-7 max-h-[70vh] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Cargando compañeros...
                        </div>
                    ) : companeros.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay otros pasantes inscritos en esta pasantía
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                                            Nro
                                        </th>
                                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                                            Apellido Paterno
                                        </th>
                                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                                            Apellido Materno
                                        </th>
                                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                                            Nombre
                                        </th>
                                        <th className="px-3 py-2 text-left text-sm font-medium text-gray-500">
                                            Jefe del pasante
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {companeros.map((companero, index) => (
                                        <tr
                                            key={companero.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-3 py-2 text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                                {companero.ap_paterno}
                                                {companero.es_yo && (
                                                    <span className="ml-2 text-sm text-red-600 font-medium">
                                                        (tú)
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {companero.ap_materno || "-"}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                                {companero.nombre}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`inline-flex px-2 py-0.5 rounded-full text-sm font-medium ${
                                                        companero.jefe_nombre !==
                                                        "No Asignado"
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {companero.jefe_nombre}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
