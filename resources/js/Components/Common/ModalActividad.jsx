import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function ModalActividad({
    isOpen,
    onClose,
    onSave,
    actividad,
    tiposActividad,
}) {
    const [form, setForm] = useState({
        nombre_act: "",
        tipo: "",
        descripcion: "",
        fecha_ini: "",
        fecha_fin: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (actividad) {
            setForm({
                nombre_act: actividad.nombre_act || "",
                tipo: actividad.tipo || "",
                descripcion: actividad.descripcion || "",
                fecha_ini: actividad.fecha_ini || "",
                fecha_fin: actividad.fecha_fin || "",
            });
        } else {
            setForm({
                nombre_act: "",
                tipo: "",
                descripcion: "",
                fecha_ini: "",
                fecha_fin: "",
            });
        }
        setErrors({});
    }, [actividad, isOpen]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!form.nombre_act.trim()) {
            newErrors.nombre_act = "El nombre de la actividad es requerido";
        }
        if (!form.tipo) {
            newErrors.tipo = "El tipo de actividad es requerido";
        }
        if (!form.fecha_ini) {
            newErrors.fecha_ini = "La fecha de inicio es requerida";
        }
        if (!form.fecha_fin) {
            newErrors.fecha_fin = "La fecha de fin es requerida";
        }

        if (
            form.fecha_ini &&
            form.fecha_fin &&
            form.fecha_ini >= form.fecha_fin
        ) {
            newErrors.fecha_fin =
                "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const actividadData = {
            ...form,
            descripcion: form.descripcion || "sin descripción",
        };

        onSave(actividadData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">
                            {actividad
                                ? "Editar Actividad"
                                : "Agregar Actividad"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Actividad{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombre_act"
                            value={form.nombre_act}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                        />
                        {errors.nombre_act && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.nombre_act}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                        >
                            <option value="">Seleccionar tipo</option>
                            {tiposActividad.map((tipo) => (
                                <option key={tipo} value={tipo}>
                                    {tipo}
                                </option>
                            ))}
                        </select>
                        {errors.tipo && (
                            <p className="text-red-500 text-xs mt-1">
                                {errors.tipo}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            rows={3}
                            className="w-full rounded-lg border-gray-300 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                            placeholder="Descripción de la actividad (opcional)"
                        />
                    </div>

                    {/* Fechas de actividad */}
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
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                            />
                            {errors.fecha_ini && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.fecha_ini}
                                </p>
                            )}
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
                                min={form.fecha_ini}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                            />
                            {errors.fecha_fin && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.fecha_fin}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2 rounded-lg hover:bg-primary-sky-blue transition-all cursor-pointer"
                        >
                            <Save size={18} />
                            Guardar Actividad
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
