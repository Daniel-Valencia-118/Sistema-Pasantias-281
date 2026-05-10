import React, { useState, useEffect } from "react";
import { X, Search, Star, MessageCircle } from "lucide-react";
import axios from "axios";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalCalificaciones({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
    promedio,
}) {
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalComentario, setModalComentario] = useState({
        isOpen: false,
        comentario: null,
        autor: null,
    });

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarCalificaciones();
        }
    }, [isOpen, pasantiaId]);

    const cargarCalificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/calificaciones`,
            );
            setCalificaciones(response.data.calificaciones);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar las calificaciones");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={16}
                    className={
                        i <= rating
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }
                />,
            );
        }
        return <div className="flex items-center gap-0.5">{stars}</div>;
    };

    const filteredCalificaciones = calificaciones.filter((c) => {
        const fullName =
            `${c.ap_paterno} ${c.ap_materno} ${c.nombre}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 my-8">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    Calificaciones y Opiniones
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
                        {/* Resumen */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary-navy">
                                {promedio || 0}
                            </div>
                            <div className="flex justify-center my-1">
                                {renderStars(Math.floor(promedio || 0))}
                            </div>
                            <div className="text-sm text-gray-500">
                                {calificaciones.length} opiniones
                            </div>
                        </div>

                        {/* Buscador */}
                        <div className="mb-4">
                            <div className="relative w-80">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Cargando calificaciones...
                            </div>
                        ) : filteredCalificaciones.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                No hay calificaciones registradas
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
                                                Apellido Paterno
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Apellido Materno
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                Nombres
                                            </th>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                                                CI
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Comentario
                                            </th>
                                            <th className="px-3 py-3 text-center text-xs font-medium text-gray-500">
                                                Puntuación
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredCalificaciones.map(
                                            (cal, index) => (
                                                <tr
                                                    key={cal.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-3 text-gray-500">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {cal.ap_paterno}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {cal.ap_materno}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-900">
                                                        {cal.nombre}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-600">
                                                        {cal.ci}
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        <button
                                                            onClick={() =>
                                                                setModalComentario(
                                                                    {
                                                                        isOpen: true,
                                                                        comentario:
                                                                            cal.descripcion,
                                                                        autor: `${cal.nombre} ${cal.ap_paterno}`,
                                                                    },
                                                                )
                                                            }
                                                            className="text-primary-blue hover:text-primary-sky-blue flex items-center gap-1 mx-auto"
                                                        >
                                                            <MessageCircle
                                                                size={16}
                                                            />
                                                            <span className="text-xs">
                                                                Ver
                                                            </span>
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3 text-center">
                                                        {renderStars(
                                                            cal.calificacion,
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

            {/* Modal de comentario completo */}
            {modalComentario.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-4 py-3 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">
                                    Comentario
                                </h3>
                                <button
                                    onClick={() =>
                                        setModalComentario({
                                            isOpen: false,
                                            comentario: null,
                                            autor: null,
                                        })
                                    }
                                    className="text-white hover:bg-white/20 p-1 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <p className="text-primary-sky-blue text-xs">
                                por {modalComentario.autor}
                            </p>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {modalComentario.comentario}
                            </p>
                        </div>
                        <div className="flex justify-end p-3 border-t bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() =>
                                    setModalComentario({
                                        isOpen: false,
                                        comentario: null,
                                        autor: null,
                                    })
                                }
                                className="px-4 py-1.5 bg-primary-blue text-white text-sm rounded-lg hover:bg-primary-sky-blue"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
