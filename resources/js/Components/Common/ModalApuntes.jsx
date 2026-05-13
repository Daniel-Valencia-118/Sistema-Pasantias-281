// resources/js/Components/Common/ModalApuntes.jsx
import React, { useState } from "react";
import axios from "axios";
import { X, Save, BookOpen, TrendingUp } from "lucide-react";

export default function ModalApuntes({
    isOpen,
    onClose,
    actividadId,
    actividadNombre,
    progresos,
    onUpdate,
}) {
    const [descripcion, setDescripcion] = useState("");
    const [porcentaje, setPorcentaje] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!descripcion.trim()) {
            alert("Escribe una descripción del apunte.");
            return;
        }
        setLoading(true);
        try {
            await axios.post(route("pasante.progreso.store"), {
                id_actividad: actividadId,
                descripcion: descripcion,
                porcentaje: porcentaje,
            });
            // Limpiar formulario y recargar
            setDescripcion("");
            setPorcentaje(0);
            window.location.reload();
        } catch (error) {
            alert("Error al guardar el apunte");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-5 border-b">
                    <div className="flex items-center gap-2">
                        <BookOpen size={22} className="text-primary-blue" />
                        <h3 className="text-xl font-bold text-primary-navy">
                            Mis Apuntes - {actividadNombre}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Formulario para nuevo apunte */}
                <form
                    onSubmit={handleSubmit}
                    className="p-5 bg-gradient-to-r from-blue-50 to-white border-b"
                >
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        {/* 1. Caja de texto (Crece para ocupar el espacio) */}
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ¿Cómo vas?
                            </label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="w-full rounded-xl border-gray-200 px-4 py-2 shadow-sm focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                                placeholder="Escribre tus apuentes..."
                            />
                        </div>

                        {/* 2. Selector de Porcentaje */}
                        <div className="w-full md:w-32">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Progreso
                            </label>
                            <select
                                value={porcentaje}
                                onChange={(e) =>
                                    setPorcentaje(Number(e.target.value))
                                }
                                className="w-full rounded-xl border-gray-200 bg-white px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary-blue outline-none cursor-pointer"
                            >
                                {[...Array(11).keys()]
                                    .map((i) => i * 10)
                                    .map((val) => (
                                        <option key={val} value={val}>
                                            {val}%
                                        </option>
                                    ))}
                            </select>
                        </div>

                        {/* 3. Botón Guardar */}
                        <div className="w-full md:w-auto">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto bg-primary-blue text-white px-6 py-2 rounded-xl hover:bg-opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                            >
                                <Save size={18} />
                                <span className="font-medium">
                                    {loading ? "Guardando..." : "Guardar"}
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
                {/* Historial de apuntes */}
                <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto bg-white">
                    <div className="flex items-center justify-between mb-4 border-b pb-2">
                        <h4 className="font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp
                                size={18}
                                className="text-primary-blue"
                            />
                            Línea de tiempo de avances
                        </h4>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">
                            Orden cronológico
                        </span>
                    </div>

                    {progresos && progresos.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {progresos
                                .slice() // Mantenemos el orden original (ascendente)
                                .map((p) => {
                                    // Conversión a zona horaria local
                                    const fechaLocal = new Date(
                                        p.fecha,
                                    ).toLocaleDateString(undefined, {
                                        day: "2-digit",
                                        month: "long",
                                        year: "numeric",
                                    });

                                    return (
                                        <div
                                            key={p.id_progresoact}
                                            className="group bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
                                        >
                                            <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-primary-blue">
                                                            {p.porcentaje}%
                                                        </span>
                                                    </div>
                                                    <div className="h-[2px] w-4 bg-gray-100"></div>
                                                    <span className="text-xs font-semibold text-gray-500">
                                                        {fechaLocal}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                                    {p.hora}
                                                </span>
                                            </div>

                                            <p className="text-gray-800 text-base leading-none border-l-5 border-gray-200 pl-3 transition-colors">
                                                {p.descripcion ||
                                                    "Sin descripción adicional"}
                                            </p>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">
                                No hay registros aún
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Tus notas de progreso aparecerán aquí.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
