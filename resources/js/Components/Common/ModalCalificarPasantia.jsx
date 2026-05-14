// resources/js/Components/Common/ModalCalificarPasantia.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Star } from "lucide-react";
import ModalConfirmacion from "./ModalConfirmacion";

export default function ModalCalificarPasantia({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
    yaCalifico,
    calificacionExistente,
}) {
    const [calificacion, setCalificacion] = useState(0);
    const [opinion, setOpinion] = useState("");
    const [hoverRating, setHoverRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [modoVista, setModoVista] = useState(yaCalifico);

    useEffect(() => {
        if (isOpen && yaCalifico && calificacionExistente) {
            setCalificacion(calificacionExistente.calificacion);
            setOpinion(calificacionExistente.descripcion);
            setModoVista(true);
        } else if (isOpen && !yaCalifico) {
            setCalificacion(0);
            setOpinion("");
            setModoVista(false);
        }
    }, [isOpen, yaCalifico, calificacionExistente]);

    const handleSubmit = async () => {
        if (calificacion === 0) {
            alert("Selecciona una calificación (1-5 estrellas)");
            return;
        }
        if (!opinion.trim() || opinion.trim().length < 5) {
            alert("Escribe una opinión de al menos 5 caracteres");
            return;
        }
        setShowConfirm(true);
    };

    const confirmarCalificar = async () => {
        setLoading(true);
        try {
            await axios.post(route("pasante.calificacion.store"), {
                id_pasantia: pasantiaId,
                calificacion: calificacion,
                opinion: opinion,
            });
            //alert("¡Gracias por calificar la pasantía!");
            onClose();
            window.location.reload();
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Error al guardar la calificación",
            );
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    const renderStars = (rating, interactive = false) => {
        // Definimos si debe comportarse como interactivo basado en la prop
        // Y en si ya se ha seleccionado una calificación
        const isLocked = calificacion > 0;
        const canHover = interactive && !isLocked;

        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={28}
                    className={`transition-all ${canHover ? "cursor-pointer" : "cursor-default"}
                    ${
                        // Si ya está bloqueado, usamos el rating fijo.
                        // Si no, usamos el hover o el rating base.
                        (
                            canHover
                                ? hoverRating >= i || rating >= i
                                : rating >= i
                        )
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                    }`}
                    // Solo disparamos los eventos si NO está bloqueado
                    onMouseEnter={() => canHover && setHoverRating(i)}
                    onMouseLeave={() => canHover && setHoverRating(0)}
                    onClick={() =>
                        interactive && !isLocked && setCalificacion(i)
                    }
                />,
            );
        }
        return stars;
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
                    <div className="flex justify-between items-center p-5 border-b">
                        <div>
                            <h3 className="text-xl font-bold text-primary-navy">
                                {modoVista
                                    ? "Tu calificación"
                                    : "Calificar pasantía"}
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

                    <div className="p-6 space-y-5">
                        {/* Estrellas */}
                        <div className="text-center">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Puntuación
                            </label>
                            <div className="flex justify-center gap-1">
                                {renderStars(calificacion, !modoVista)}
                            </div>
                            {modoVista && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Calificaste el{" "}
                                    {new Date(
                                        calificacionExistente?.fecha,
                                    ).toLocaleDateString("es-ES")}
                                </p>
                            )}
                        </div>

                        {/* Opinión */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tu opinión
                            </label>
                            {modoVista ? (
                                <div className="bg-gray-50 rounded-xl p-3 text-gray-700">
                                    {opinion || "Sin opinión"}
                                </div>
                            ) : (
                                <textarea
                                    value={opinion}
                                    onChange={(e) => setOpinion(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border-gray-200 px-3 py-2"
                                    placeholder="Cuéntanos tu experiencia con esta pasantía..."
                                />
                            )}
                        </div>

                        {!modoVista && (
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border rounded-xl"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-5 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 flex items-center gap-2 shadow-md"
                                >
                                    <Star size={16} />{" "}
                                    {loading
                                        ? "Guardando..."
                                        : "Publicar calificación"}
                                </button>
                            </div>
                        )}
                    </div>

                    {modoVista && (
                        <div className="flex justify-end p-5 border-t bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-5 py-2 bg-primary-blue text-white rounded-lg"
                            >
                                Cerrar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ModalConfirmacion
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={confirmarCalificar}
                titulo="Confirmar calificación"
                mensaje={`¿Estás seguro de publicar tu calificación (${calificacion} estrella${calificacion !== 1 ? "s" : ""}) y opinión para esta pasantía? No podrás modificarla después.`}
                type="info"
                confirmText="Sí, publicar"
            />
        </>
    );
}
