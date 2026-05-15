// resources/js/Components/Common/ModalAutoEva.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Save, Edit, Star } from "lucide-react";

export default function ModalAutoEva({
    isOpen,
    onClose,
    actividadId,
    actividadNombre,
    autoevaluacion,
}) {
    const [comentario, setComentario] = useState("");
    const [nota, setNota] = useState("");
    const [loading, setLoading] = useState(false);
    const yaExiste = !!autoevaluacion;

    useEffect(() => {
        if (isOpen) {
            if (autoevaluacion) {
                setComentario(autoevaluacion.comentario || "");
                setNota(autoevaluacion.nota);
            } else {
                setComentario("");
                setNota("");
            }
        }
    }, [isOpen, autoevaluacion]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comentario.trim()) {
            alert("Debes escribir una justificación.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(route("pasante.auto-eva.store"), {
                id_actividad: actividadId,
                comentario: comentario,
                nota: nota,
            });
            window.location.reload();
        } catch (error) {
            alert("Error al guardar la autoevaluación");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4">
                <div className="flex justify-between items-center p-5 border-b">
                    <div className="flex items-center gap-2">
                        <Star size={22} className="text-yellow-500" />
                        <h3 className="text-xl font-bold text-primary-navy">
                            Autoevaluación - {actividadNombre}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nota que te asignas (0-100)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={nota}
                                onChange={(e) =>
                                    setNota(Number(e.target.value))
                                }
                                disabled={yaExiste}
                                className={`w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-primary-blue focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400 ${yaExiste ? "bg-gray-100 text-gray-500" : "bg-white"}`}
                            />
                            {yaExiste && (
                                <span className="absolute right-3 top-2 text-xs text-gray-400">
                                    No editable
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">
                                Justificación del puntaje
                            </label>
                            <textarea
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border-2 border-gray-200 px-4 py-3 focus:border-primary-blue focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none text-gray-700 placeholder:text-gray-400"
                                placeholder="¿Qué logros o dificultades justifican esta nota?"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-xl"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary-blue text-white rounded-xl hover:bg-primary-sky-blue flex items-center gap-2 shadow-md"
                        >
                            {yaExiste ? <Edit size={16} /> : <Save size={16} />}
                            {loading
                                ? "Guardando..."
                                : yaExiste
                                  ? "Editar justificación"
                                  : "Guardar autoevaluación"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
