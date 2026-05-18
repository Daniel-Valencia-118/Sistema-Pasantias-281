import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { useEffect } from "react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalActividad from "@/Components/Common/ModalActividad";
import { ArrowLeft, Plus, Edit, Trash2, Save, XCircle } from "lucide-react";

export default function Create({ auth, menciones, turnos, tiposActividad }) {
    const [form, setForm] = useState({
        nombre_pas: "",
        mencion: "",
        cupos: "",
        turno: "",
        carga_horaria: "",
        fecha_ini: "",
        fecha_fin: "",
    });

    const [actividades, setActividades] = useState([]);
    const [actividadEditando, setActividadEditando] = useState(null);
    const [modalActividad, setModalActividad] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // Agrega esta función para validar fechas de actividades
    const validarFechasActividades = () => {
        if (
            !form.fecha_ini ||
            !form.fecha_fin ||
            form.fecha_ini > form.fecha_fin
        ) {
            return {
                valid: false,
                message:
                    "Defina la fecha inicial y final de la pasantia correctamente",
            };
        }

        for (let i = 0; i < actividades.length; i++) {
            const act = actividades[i];
            if (act.fecha_ini < form.fecha_ini) {
                return {
                    valid: false,
                    message: `La actividad "${act.nombre_act}" tiene fecha de inicio anterior al inicio de la pasantía`,
                };
            }
            if (act.fecha_fin > form.fecha_fin) {
                return {
                    valid: false,
                    message: `La actividad "${act.nombre_act}" tiene fecha de fin posterior al fin de la pasantía`,
                };
            }
            if (act.fecha_ini > act.fecha_fin) {
                return {
                    valid: false,
                    message: `La actividad "${act.nombre_act}" tiene fecha de inicio posterior a su fecha de fin`,
                };
            }
        }
        return { valid: true };
    };
    // Dentro del componente, después de los useState:
    useEffect(() => {
        // Verificar si hay datos clonados en sessionStorage
        const datosClonados = sessionStorage.getItem("pasantia_clonada");

        if (datosClonados) {
            const { pasantia, actividades } = JSON.parse(datosClonados);

            // Llenar el formulario con los datos clonados
            setForm({
                nombre_pas: pasantia.nombre_pas || "",
                mencion: pasantia.mencion || "",
                cupos: pasantia.cupos || "",
                turno: pasantia.turno || "",
                carga_horaria: pasantia.carga_horaria || "",
                fecha_ini: "", // Vacío
                fecha_fin: "", // Vacío
            });

            // Convertir actividades al formato esperado
            const actividadesClonadas = actividades.map((act) => ({
                nombre_act: act.nombre_act,
                tipo: act.tipo,
                descripcion: act.descripcion || "sin descripción",
                fecha_ini: "", // Vacío
                fecha_fin: "", // Vacío
            }));

            setActividades(actividadesClonadas);

            // Limpiar sessionStorage para que no se reutilice accidentalmente
            sessionStorage.removeItem("pasantia_clonada");
        }
    }, []); // Solo se ejecuta una vez al montar el componente
    const handleAgregarActividad = (actividad) => {
        if (actividadEditando !== null) {
            // Editar actividad existente
            const nuevasActividades = [...actividades];
            nuevasActividades[actividadEditando] = actividad;
            setActividades(nuevasActividades);
            setActividadEditando(null);
        } else {
            // Agregar nueva actividad
            setActividades([...actividades, actividad]);
        }
    };

    const handleEditarActividad = (index) => {
        setActividadEditando(index);
        setModalActividad(true);
    };

    const handleEliminarActividad = (index) => {
        if (confirm("¿Estás seguro de eliminar esta actividad?")) {
            const nuevasActividades = actividades.filter((_, i) => i !== index);
            setActividades(nuevasActividades);
            if (actividadEditando === index) {
                setActividadEditando(null);
            }
        }
    };

    // Modifica handleSubmit:
    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        if (!form.nombre_pas.trim())
            newErrors.nombre_pas = "El nombre de la pasantía es requerido";
        if (!form.mencion) newErrors.mencion = "La mención es requerida";
        if (!form.cupos) newErrors.cupos = "El número de cupos es requerido";
        if (!form.turno) newErrors.turno = "El turno es requerido";
        if (!form.fecha_ini)
            newErrors.fecha_ini = "La fecha de inicio es requerida";
        if (!form.fecha_fin)
            newErrors.fecha_fin = "La fecha de fin es requerida";

        if (
            form.fecha_ini &&
            form.fecha_fin &&
            form.fecha_ini > form.fecha_fin
        ) {
            newErrors.fecha_fin =
                "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (actividades.length === 0) {
            alert("Debe agregar al menos una actividad");
            return;
        }

        // Validar fechas de actividades dentro del rango
        const validacionActividades = validarFechasActividades();
        if (!validacionActividades.valid) {
            alert(validacionActividades.message);
            return;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Confirmar publicación
        if (
            confirm(
                "¿Estás seguro de publicar esta pasantía? Se guardarán todos los datos.",
            )
        ) {
            setLoading(true);

            const dataToSend = {
                ...form,
                carga_horaria: form.carga_horaria || 0,
                actividades: actividades,
            };

            router.post("/gerente/pasantias", dataToSend, {
                onSuccess: () => {
                    alert("¡Pasantía publicada exitosamente!");
                    router.visit("/gerente/pasantias"); // /gerente/pasantias
                },
                onError: (error) => {
                    console.error("Error:", error);
                    setErrors(error);
                    setLoading(false);
                    alert(
                        "Error al publicar la pasantía. Verifique los datos.",
                    );
                },
            });
        }
    };

    const goBack = () => {
        window.history.back();
    };

    const cuposOptions = Array.from({ length: 20 }, (_, i) => i + 1);

    return (
        <GerenteLayout auth={auth}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={goBack}
                        className="flex items-center gap-2 text-primary-slate hover:text-primary-blue transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver</span>
                    </button>
                    <h1 className="text-2xl font-bold text-primary-navy">
                        Publicar Nueva Pasantía
                    </h1>
                </div>

                {/* Formulario */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">
                            Datos de la Pasantía
                        </h2>
                        <p className="text-primary-sky-blue text-sm">
                            Complete todos los campos obligatorios (*)
                        </p>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Fila 1: Nombre y Mención */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre de la Pasantía{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="nombre_pas"
                                    value={form.nombre_pas}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                />
                                {errors.nombre_pas && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.nombre_pas}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mención{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="mencion"
                                    value={form.mencion}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                >
                                    <option value="">
                                        Seleccionar mención
                                    </option>
                                    {menciones.map((m) => (
                                        <option key={m} value={m}>
                                            {m}
                                        </option>
                                    ))}
                                </select>
                                {errors.mencion && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.mencion}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Fila 2: Cupos, Turno y Carga Horaria */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cupos{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="cupos"
                                    value={form.cupos}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                >
                                    <option value="">Seleccionar cupos</option>
                                    {cuposOptions.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                                {errors.cupos && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.cupos}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Turno{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="turno"
                                    value={form.turno}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                >
                                    <option value="">Seleccionar turno</option>
                                    {turnos.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                                {errors.turno && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.turno}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Carga Horaria (horas totales)
                                </label>
                                <input
                                    type="number"
                                    name="carga_horaria"
                                    value={form.carga_horaria}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full rounded-lg border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Fechas de pasantía */}
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
                                    min={new Date().toISOString().split("T")[0]}
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
                                    min={
                                        form.fecha_ini ||
                                        new Date().toISOString().split("T")[0]
                                    }
                                    className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
                                />
                                {errors.fecha_fin && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.fecha_fin}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Sección de Actividades */}
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Actividades
                            </h2>
                            <p className="text-primary-sky-blue text-sm">
                                Gestión de actividades de la pasantía
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setActividadEditando(null);
                                setModalActividad(true);
                            }}
                            className="flex items-center gap-2 bg-white text-primary-blue px-4 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <Plus size={18} />
                            Agregar Actividad
                        </button>
                    </div>

                    <div className="p-6">
                        {actividades.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay actividades registradas. Haga clic en
                                "Agregar Actividad" para comenzar.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
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
                                        {actividades.map((act, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {act.nombre_act}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
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
                                                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                                                    {act.descripcion}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {act.fecha_ini
                                                        ? act.fecha_ini
                                                              .split("-")
                                                              .reverse()
                                                              .join("/")
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {act.fecha_fin
                                                        ? act.fecha_fin
                                                              .split("-")
                                                              .reverse()
                                                              .join("/")
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEditarActividad(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-primary-blue hover:text-primary-sky-blue transition-all cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEliminarActividad(
                                                                    index,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700 transition-all cursor-pointer"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Resumen */}
                        {actividades.length > 0 && (
                            <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-700 text-sm">
                                ✓ Total de actividades: {actividades.length}
                            </div>
                        )}
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={goBack}
                        className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <XCircle size={18} />
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-primary-sky-blue transition-all cursor-pointer disabled:opacity-50"
                    >
                        <Save size={18} />
                        {loading ? "Publicando..." : "Publicar Pasantía"}
                    </button>
                </div>
            </div>

            {/* Modal de Actividad */}
            <ModalActividad
                isOpen={modalActividad}
                onClose={() => {
                    setModalActividad(false);
                    setActividadEditando(null);
                }}
                onSave={handleAgregarActividad}
                actividad={
                    actividadEditando !== null
                        ? actividades[actividadEditando]
                        : null
                }
                tiposActividad={tiposActividad}
                fechaDefectoIni={form.fecha_ini} //m1
                fechaDefectoFin={form.fecha_fin} //m1
            />
        </GerenteLayout>
    );
}
