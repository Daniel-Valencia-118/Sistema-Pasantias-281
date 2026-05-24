import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function ModalEditarPasantia({
    isOpen,
    onClose,
    pasantia,
    onUpdate,
}) {
    const [form, setForm] = useState({
        mencion: "",
        turno: "",
        carga_horaria: "",
        fecha_ini: "",
        fecha_fin: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mencionOptions = [
        "Desarrollo de Software e Innovación Tecnológica",
        "Inteligencia Artificial y Ciencias de Datos",
        "Ciencias de la Computación",
        "Informática Industrial",
        "Ingeniería de Sistemas",
        "Redes y TIC",
        "Seguridad de la Información",
    ];

    const turnoOptions = [
        "Tiempo completo",
        "Medio tiempo",
        "Mañana",
        "Tarde",
        "Noche",
    ];

    useEffect(() => {
        if (pasantia && isOpen) {
            setForm({
                mencion: pasantia.mencion || "",
                turno: pasantia.turno || "",
                carga_horaria: pasantia.carga_horaria || "",
                fecha_ini: pasantia.fecha_ini || "",
                fecha_fin: pasantia.fecha_fin || "",
            });
            setError(null);
        }
    }, [pasantia, isOpen]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.put(
                `/gerente/pasantias/${pasantia.id}`,
                form,
            );
            if (response.data.message) {
                if (onUpdate) onUpdate(response.data.pasantia);
                onClose();
            }
        } catch (error) {
            setError(
                error.response?.data?.message ||
                    "Error al actualizar la pasantía",
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                Editar Pasantía
                            </h3>
                            <p className="text-primary-sky-blue text-sm">
                                {pasantia?.nombre}
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

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Mención */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mención <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="mencion"
                            value={form.mencion}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        >
                            <option value="">Seleccionar mención</option>
                            {mencionOptions.map((m) => (
                                <option key={m} value={m}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Turno */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Turno <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="turno"
                            value={form.turno}
                            onChange={handleChange}
                            required
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        >
                            <option value="">Seleccionar turno</option>
                            {turnoOptions.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Carga Horaria */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Carga Horaria (horas por Semana)
                        </label>
                        <input
                            type="number"
                            name="carga_horaria"
                            value={form.carga_horaria}
                            onChange={handleChange}
                            min="0"
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        />
                    </div>

                    {/* Fechas */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Inicio{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="fecha_ini"
                                value={form.fecha_ini}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fecha de Fin{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="fecha_fin"
                                value={form.fecha_fin}
                                onChange={handleChange}
                                required
                                min={form.fecha_ini}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                            />
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2 rounded-lg hover:bg-primary-sky-blue transition-all disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
