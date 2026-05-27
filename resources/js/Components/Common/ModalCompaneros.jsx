import React, { useState, useEffect } from "react";
import { X, Users, UserCheck } from "lucide-react";
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-5xl w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10">
                                <Users size={22} className="text-white" />
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold text-white">
                                    Pasantes Inscritos
                                </h3>

                                <p className="text-base text-white">
                                    {pasantiaNombre || pasantiaNombreState}
                                </p>
                            </div>
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
                                Cargando compañeros...
                            </p>
                        </div>
                    ) : companeros.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Users size={30} className="text-gray-400" />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-700">
                                No hay otros pasantes inscritos
                            </h4>

                            <p className="mt-2 text-sm text-gray-500">
                                Aún no existen compañeros registrados en esta
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
                                                Apellido Paterno
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Apellido Materno
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Nombre
                                            </th>

                                            <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-white">
                                                Jefe del Pasante
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white">
                                        {companeros.map((companero, index) => (
                                            <tr
                                                key={companero.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                        {index + 1}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {
                                                                companero.ap_paterno
                                                            }
                                                        </span>

                                                        {companero.es_yo && (
                                                            <span className="inline-flex items-center px-2 rounded-full bg-red-100 text-red-700 text-base font-semibold">
                                                                Tú
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                    {companero.ap_materno ||
                                                        "-"}
                                                </td>

                                                <td className="px-4 py-4 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                    {companero.nombre}
                                                </td>

                                                <td className="px-4 py-4 border-b border-gray-100">
                                                    {companero.jefe_nombre !==
                                                    "No Asignado" ? (
                                                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-200">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700">
                                                                <UserCheck
                                                                    size={16}
                                                                />
                                                            </div>

                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] uppercase tracking-wide text-green-600 font-semibold">
                                                                    Jefe
                                                                    Asignado
                                                                </span>

                                                                <span className="text-sm font-semibold text-green-800">
                                                                    {
                                                                        companero.jefe_nombre
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex items-center px-3 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium">
                                                            No Asignado
                                                        </div>
                                                    )}
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
                        Total compañeros:{" "}
                        <span className="font-semibold text-gray-700">
                            {companeros.length}
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-primary-blue text-white text-sm font-semibold rounded-xl hover:bg-primary-sky-blue cursor-pointer"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
