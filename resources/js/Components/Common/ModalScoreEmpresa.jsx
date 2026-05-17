// resources/js/Components/Common/ModalScoreEmpresa.jsx
import React, { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import axios from "axios";
import { formatDateToSpanish } from "@/Utils/dateUtils";

export default function ModalScoreEmpresa({
    isOpen,
    onClose,
    empresaId,
    empresaNombre,
}) {
    const [pasantias, setPasantias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [empresaNombreState, setEmpresaNombreState] = useState("");

    useEffect(() => {
        if (isOpen && empresaId) {
            cargarCalificaciones();
        }
    }, [isOpen, empresaId]);

    const cargarCalificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/pasante/inscribirse/${empresaId}/calificaciones`,
            );
            setPasantias(response.data.pasantias);
            setEmpresaNombreState(response.data.empresa_nombre);
        } catch (error) {
            console.error("Error:", error);
            alert("Error al cargar las calificaciones de la empresa");
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400"
                    />,
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <Star
                        key={i}
                        size={16}
                        className="text-yellow-400 fill-yellow-400 opacity-50"
                    />,
                );
            } else {
                stars.push(
                    <Star key={i} size={16} className="text-gray-300" />,
                );
            }
        }
        return <div className="flex items-center gap-0.5">{stars}</div>;
    };

    const renderSmallStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={12}
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-4 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Calificaciones y Opiniones de Pasantias Pasadas
                            </h3>
                            <p className="text-primary-sky-blue text-sm">
                                {empresaNombreState}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            Cargando calificaciones...
                        </div>
                    ) : pasantias.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <Star
                                size={48}
                                className="mx-auto mb-3 opacity-30"
                            />
                            <p>
                                Esta empresa aún no tiene un historial de
                                calificaciones y comentarios.
                            </p>
                            <p className="text-sm text-gray-400">
                                Los pasantes califican y comentan las pasantías
                                después haber finalizado su inscripción.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {pasantias.map((pasantia) => (
                                <div
                                    key={pasantia.id}
                                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                >
                                    {/* Cabecera de la pasantía */}
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <h4 className="font-bold text-primary-navy text-lg">
                                                {pasantia.nombre}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {renderStars(pasantia.promedio)}
                                                <span className="text-sm text-gray-500">
                                                    (
                                                    {pasantia.total_comentarios}{" "}
                                                    {pasantia.total_comentarios ===
                                                    1
                                                        ? "opinión"
                                                        : "opiniones"}
                                                    )
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">
                                            📅{" "}
                                            {formatDateToSpanish(
                                                pasantia.fecha_ini,
                                            )}{" "}
                                            -{" "}
                                            {formatDateToSpanish(
                                                pasantia.fecha_fin,
                                            )}
                                        </p>
                                    </div>

                                    {/* Lista de comentarios */}
                                    <div className="p-4 space-y-4 bg-white">
                                        {pasantia.comentarios.length === 0 ? (
                                            <p className="text-center text-gray-400 text-sm py-4">
                                                Sin comentarios
                                            </p>
                                        ) : (
                                            pasantia.comentarios.map((com) => (
                                                <div
                                                    key={com.id}
                                                    className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
                                                >
                                                    <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center text-xs font-bold">
                                                                {com.nombre_pasante.charAt(
                                                                    0,
                                                                )}
                                                            </div>
                                                            <span className="font-medium text-gray-800">
                                                                {
                                                                    com.nombre_pasante
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {renderSmallStars(
                                                                com.calificacion,
                                                            )}
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(
                                                                    com.fecha,
                                                                ).toLocaleDateString(
                                                                    "es-ES",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 ml-10">
                                                        {com.comentario ||
                                                            "Sin comentario"}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-sky-blue transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
