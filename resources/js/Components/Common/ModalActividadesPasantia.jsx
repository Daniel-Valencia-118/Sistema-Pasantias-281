import React, { useState, useEffect } from "react";
import {
    X,
    Plus,
    Edit,
    Trash2,
    Save,
    Calendar,
    AlertCircle,
} from "lucide-react";
import axios from "axios";
import ModalConfirmacion from "./ModalConfirmacion";

export default function ModalActividadesPasantia({
    isOpen,
    onClose,
    pasantiaId,
    pasantiaNombre,
    onUpdate,
}) {
    const [actividades, setActividades] = useState([]);
    const [pasantia, setPasantia] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalActividad, setModalActividad] = useState({
        isOpen: false,
        actividad: null,
        esNueva: true,
    });
    const [modalConfirm, setModalConfirm] = useState({
        isOpen: false,
        id: null,
    });

    useEffect(() => {
        if (isOpen && pasantiaId) {
            cargarActividades();
        }
    }, [isOpen, pasantiaId]);

    const cargarActividades = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/gerente/pasantias/${pasantiaId}/actividades`,
            );
            setPasantia(response.data.pasantia);
            setActividades(response.data.actividades);
        } catch (error) {
            console.error("Error al cargar actividades:", error);
            alert("Error al cargar las actividades");
        } finally {
            setLoading(false);
        }
    };

    const handleGuardarActividad = async (actividadData) => {
        try {
            if (modalActividad.esNueva) {
                const response = await axios.post(
                    `/gerente/pasantias/${pasantiaId}/actividades`,
                    actividadData,
                );
                if (response.data.message) {
                    await cargarActividades();
                    if (onUpdate) onUpdate();
                    // ❌ NO cerrar: setModalActividad({ isOpen: false, ... })
                    setModalActividad({
                        isOpen: false,
                        actividad: null,
                        esNueva: true,
                    }); // Esto cierra el submodal, no el principal
                }
            } else {
                const response = await axios.put(
                    `/gerente/pasantias/actividades/${modalActividad.actividad.id}`,
                    actividadData,
                );
                if (response.data.message) {
                    await cargarActividades();
                    if (onUpdate) onUpdate();
                    setModalActividad({
                        isOpen: false,
                        actividad: null,
                        esNueva: true,
                    });
                }
            }
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Error al guardar la actividad",
            );
        }
    };

    const handleEliminarActividad = async () => {
        try {
            const response = await axios.delete(
                `/gerente/pasantias/actividades/${modalConfirm.id}`,
            );
            if (response.data.message) {
                await cargarActividades();
                if (onUpdate) onUpdate();
            }
            setModalConfirm({ isOpen: false, id: null });
        } catch (error) {
            alert(
                error.response?.data?.message ||
                    "Error al eliminar la actividad",
            );
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return date.split("-").reverse().join("/");
    };

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
                                    Actividades de la Pasantía
                                </h3>
                                <p className="text-primary-sky-blue text-sm">
                                    {pasantiaNombre}
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
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Cargando actividades...
                            </div>
                        ) : (
                            <>
                                {/* Botón Agregar */}
                                <div className="mb-4 flex justify-end">
                                    <button
                                        onClick={() =>
                                            setModalActividad({
                                                isOpen: true,
                                                actividad: null,
                                                esNueva: true,
                                            })
                                        }
                                        className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-sky-blue transition-all"
                                    >
                                        <Plus size={18} />
                                        Agregar Actividad
                                    </button>
                                </div>

                                {/* Tabla de actividades */}
                                {actividades.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        No hay actividades registradas. Haga
                                        clic en "Agregar Actividad" para
                                        comenzar.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Nro
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Nombre
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Tipo
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Descripción
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Fecha Inicio
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">
                                                        Fecha Fin
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {actividades.map(
                                                    (act, index) => (
                                                        <tr
                                                            key={act.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-3 text-gray-500">
                                                                {index + 1}
                                                            </td>
                                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                                {act.nombre_act}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <span
                                                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                        act.tipo ===
                                                                        "OPERATIVA"
                                                                            ? "bg-blue-100 text-blue-800"
                                                                            : "bg-purple-100 text-purple-800"
                                                                    }`}
                                                                >
                                                                    {act.tipo}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                                                {
                                                                    act.descripcion
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                {formatDate(
                                                                    act.fecha_ini,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-gray-600">
                                                                {formatDate(
                                                                    act.fecha_fin,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            setModalActividad(
                                                                                {
                                                                                    isOpen: true,
                                                                                    actividad:
                                                                                        act,
                                                                                    esNueva: false,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="text-primary-blue hover:text-primary-sky-blue transition-all"
                                                                        title="Editar"
                                                                    >
                                                                        <Edit
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            setModalConfirm(
                                                                                {
                                                                                    isOpen: true,
                                                                                    id: act.id,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="text-red-500 hover:text-red-700 transition-all"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal para agregar/editar actividad */}
            <ModalFormActividad
                isOpen={modalActividad.isOpen}
                onClose={() =>
                    setModalActividad({
                        isOpen: false,
                        actividad: null,
                        esNueva: true,
                    })
                }
                onSave={handleGuardarActividad}
                actividad={modalActividad.actividad}
                esNueva={modalActividad.esNueva}
                pasantia={pasantia}
            />

            {/* Modal de confirmación para eliminar */}
            <ModalConfirmacion
                isOpen={modalConfirm.isOpen}
                onClose={() => setModalConfirm({ isOpen: false, id: null })}
                onConfirm={handleEliminarActividad}
                titulo="Eliminar Actividad"
                mensaje="¿Estás seguro de eliminar esta actividad? Esta acción no se puede deshacer."
                type="danger"
                confirmText="Eliminar"
            />
        </>
    );
}

// Modal para formulario de actividad
function ModalFormActividad({
    isOpen,
    onClose,
    onSave,
    actividad,
    esNueva,
    pasantia,
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
        if (actividad && !esNueva) {
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
    }, [actividad, esNueva, isOpen]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!form.nombre_act.trim())
            newErrors.nombre_act = "El nombre es requerido";
        if (!form.tipo) newErrors.tipo = "El tipo es requerido";
        if (!form.fecha_ini)
            newErrors.fecha_ini = "La fecha de inicio es requerida";
        if (!form.fecha_fin)
            newErrors.fecha_fin = "La fecha de fin es requerida";

        if (
            form.fecha_ini &&
            form.fecha_fin &&
            form.fecha_ini >= form.fecha_fin
        ) {
            newErrors.fecha_fin = "La fecha de fin debe ser posterior";
        }

        if (pasantia) {
            if (form.fecha_ini && form.fecha_ini < pasantia.fecha_ini) {
                newErrors.fecha_ini = `Debe ser >= ${pasantia.fecha_ini.split("-").reverse().join("/")}`;
            }
            if (form.fecha_fin && form.fecha_fin > pasantia.fecha_fin) {
                newErrors.fecha_fin = `Debe ser <= ${pasantia.fecha_fin.split("-").reverse().join("/")}`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSave({
            ...form,
            descripcion: form.descripcion || "sin descripción",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white">
                            {esNueva ? "Agregar Actividad" : "Editar Actividad"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {!esNueva && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nombre de la Actividad
                            </label>
                            <input
                                type="text"
                                value={form.nombre_act}
                                disabled
                                className="w-full rounded-lg border-2 border-gray-200 bg-gray-100 px-4 py-2 text-gray-500"
                            />
                        </div>
                    )}

                    {esNueva && (
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
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                            />
                            {errors.nombre_act && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.nombre_act}
                                </p>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="tipo"
                            value={form.tipo}
                            onChange={handleChange}
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                        >
                            <option value="">Seleccionar tipo</option>
                            <option value="OPERATIVA">OPERATIVA</option>
                            <option value="TECNICA">TECNICA</option>
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
                            className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
                            placeholder="Descripción de la actividad (opcional)"
                        />
                    </div>

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
                                min={pasantia?.fecha_ini}
                                max={pasantia?.fecha_fin}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
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
                                min={form.fecha_ini || pasantia?.fecha_ini}
                                max={pasantia?.fecha_fin}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20"
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
                            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 bg-primary-blue text-white px-5 py-2 rounded-lg hover:bg-primary-sky-blue transition-all"
                        >
                            <Save size={18} />
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
