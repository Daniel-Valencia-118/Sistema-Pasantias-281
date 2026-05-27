import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { useEffect } from "react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import ModalActividad from "@/Components/Common/ModalActividad";
import ModalAlerta from "@/Components/Common/ModalAlerta";
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
        detalles_horario: "",
    });

    const [actividades, setActividades] = useState([]);
    const [actividadEditando, setActividadEditando] = useState(null);
    const [modalActividad, setModalActividad] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Estados para Modales de Alerta
    const [alerta, setAlerta] = useState({
        isOpen: false,
        titulo: "",
        mensaje: "",
        type: "error",
    });

    const mostrarAlerta = (titulo, mensaje, type = "error") => {
        setAlerta({ isOpen: true, titulo, mensaje, type });
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // Validar campos obligatorios del formulario principal
    const validarCamposObligatoriosPasantia = () => {
        if (!form.nombre_pas.trim()) {
            mostrarAlerta(
                "Campo requerido",
                "Llene los campos obligatorios (*)",
            );
            return false;
        }
        if (!form.mencion) {
            mostrarAlerta(
                "Campo requerido",
                "Llene los campos obligatorios (*)",
            );
            return false;
        }
        if (!form.cupos) {
            mostrarAlerta(
                "Campo requerido",
                "Llene los campos obligatorios (*)",
            );
            return false;
        }
        if (!form.turno) {
            mostrarAlerta(
                "Campo requerido",
                "Llene los campos obligatorios (*)",
            );
            return false;
        }
        if (!form.fecha_ini) {
            mostrarAlerta(
                "Campo requerido",
                "La fecha de inicio de la pasantia es obligatoria.",
            );
            return false;
        }
        if (!form.fecha_fin) {
            mostrarAlerta(
                "Campo requerido",
                "La fecha de fin de la pasantia es obligatoria.",
            );
            return false;
        }
        if (form.fecha_ini > form.fecha_fin) {
            mostrarAlerta(
                "Error de fechas",
                "La fecha de fin de la pasanta debe ser posterior a la fecha de inicio de la pasantia.",
            );
            return false;
        }
        return true;
    };

    // Validar que una actividad esté dentro del rango de fechas de la pasantía
    const validarFechaActividadEnRango = (fecha_ini_act, fecha_fin_act) => {
        if (!form.fecha_ini || !form.fecha_fin) {
            mostrarAlerta(
                "Fechas de pasantía",
                "Primero debe definir las fechas de la pasantía antes de agregar actividades.",
            );
            return false;
        }

        if (fecha_ini_act < form.fecha_ini) {
            mostrarAlerta(
                "Fecha fuera de rango",
                `La fecha de inicio de la actividad (${fecha_ini_act}) es anterior al inicio de la pasantía (${form.fecha_ini}).`,
            );
            return false;
        }

        if (fecha_fin_act > form.fecha_fin) {
            mostrarAlerta(
                "Fecha fuera de rango",
                `La fecha de fin de la actividad (${fecha_fin_act}) es posterior al fin de la pasantía (${form.fecha_fin}).`,
            );
            return false;
        }

        if (fecha_ini_act > fecha_fin_act) {
            mostrarAlerta(
                "Error de fechas",
                "La fecha de inicio de la actividad no puede ser posterior a su fecha de fin.",
            );
            return false;
        }

        return true;
    };

    // Validar todas las actividades antes de publicar
    const validarActividadesParaPublicar = () => {
        if (actividades.length === 0) {
            mostrarAlerta(
                "Sin actividades",
                "Debe agregar al menos una actividad antes de publicar la pasantía.",
            );
            return false;
        }

        for (let i = 0; i < actividades.length; i++) {
            const act = actividades[i];

            if (!act.fecha_ini || !act.fecha_fin) {
                mostrarAlerta(
                    "Actividad incompleta",
                    `La actividad "${act.nombre_act}" tiene fechas vacías. Complete las fechas para continuar.`,
                );
                return false;
            }

            if (act.fecha_ini < form.fecha_ini) {
                mostrarAlerta(
                    "Actividad fuera de rango",
                    `La actividad "${act.nombre_act}" comienza antes que la pasantía.`,
                );
                return false;
            }

            if (act.fecha_fin > form.fecha_fin) {
                mostrarAlerta(
                    "Actividad fuera de rango",
                    `La actividad "${act.nombre_act}" termina después que la pasantía.`,
                );
                return false;
            }

            if (act.fecha_ini > act.fecha_fin) {
                mostrarAlerta(
                    "Error en actividad",
                    `La actividad "${act.nombre_act}" tiene fechas inconsistentes.`,
                );
                return false;
            }
        }
        return true;
    };

    // Clonar datos al cargar
    useEffect(() => {
        const datosClonados = sessionStorage.getItem("pasantia_clonada");
        if (datosClonados) {
            const { pasantia, actividades } = JSON.parse(datosClonados);
            setForm({
                nombre_pas: pasantia.nombre_pas || "",
                mencion: pasantia.mencion || "",
                cupos: pasantia.cupos || "",
                turno: pasantia.turno || "",
                carga_horaria: pasantia.carga_horaria || "",
                detalles_horario: pasantia.detalles_horario || "",
                fecha_ini: "",
                fecha_fin: "",
            });
            const actividadesClonadas = actividades.map((act) => ({
                nombre_act: act.nombre_act,
                tipo: act.tipo,
                descripcion: act.descripcion || "sin descripción",
                fecha_ini: "",
                fecha_fin: "",
            }));
            setActividades(actividadesClonadas);
            sessionStorage.removeItem("pasantia_clonada");
        }
    }, []);

    const handleAgregarActividad = (actividad) => {
        // Validar que la actividad esté en rango antes de agregar
        if (
            !validarFechaActividadEnRango(
                actividad.fecha_ini,
                actividad.fecha_fin,
            )
        ) {
            return; // No agrega la actividad, muestra el error
        }

        if (actividadEditando !== null) {
            const nuevasActividades = [...actividades];
            nuevasActividades[actividadEditando] = actividad;
            setActividades(nuevasActividades);
            setActividadEditando(null);
        } else {
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validar campos obligatorios de la pasantía
        if (!validarCamposObligatoriosPasantia()) {
            return;
        }

        // 2. Validar que tenga al menos una actividad
        if (actividades.length === 0) {
            mostrarAlerta(
                "Sin actividades",
                "Debe agregar al menos una actividad antes de publicar la pasantía.",
            );
            return;
        }

        // 3. Validar todas las actividades
        if (!validarActividadesParaPublicar()) {
            return;
        }

        // 4. Confirmar publicación
        if (
            confirm(
                "¿Estás seguro de publicar esta pasantía? Se guardarán todos los datos.",
            )
        ) {
            setLoading(true);
            const dataToSend = {
                ...form,
                carga_horaria: form.carga_horaria || 0,
                detalles_horario: form.detalles_horario || null,
                actividades: actividades,
            };

            router.post("/gerente/pasantias", dataToSend, {
                onSuccess: () => {
                    mostrarAlerta(
                        "¡Éxito!",
                        "Pasantía publicada exitosamente.",
                        "success",
                    );
                    setTimeout(() => {
                        router.visit("/gerente/pasantias");
                    }, 1500);
                },
                onError: (error) => {
                    console.error("Error:", error);
                    setErrors(error);
                    setLoading(false);
                    mostrarAlerta(
                        "Error",
                        "Error al publicar la pasantía. Verifique los datos.",
                        "error",
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
                        Publica una Nueva Oferta de Pasantía
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
                                    className="w-full rounded-lg border-3 border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
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
                                    className="w-full rounded-lg border-3 border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all cursor-pointer"
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
                                    Carga Horaria (hrs. por Semana)
                                </label>
                                <input
                                    type="number"
                                    name="carga_horaria"
                                    value={form.carga_horaria}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full rounded-lg border-3 border-gray-200 px-4 py-2 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Fila 3: Detalles de Horarios y Días */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Detalles de Horario y Días (Opcional)
                            </label>
                            <textarea
                                name="detalles_horario"
                                value={form.detalles_horario}
                                onChange={handleChange}
                                rows={1}
                                className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
                                placeholder="Ejemplo: Lunes, Miércoles y Viernes de 14:00 a 16:00"
                            />
                        </div>

                        {/* Fechas de pasantía */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Inicio de la Pasantía{" "}
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
                                    Fecha de Final de la Pasantía{" "}
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
                                // Validar que los campos obligatorios de la pasantía estén llenos
                                if (!validarCamposObligatoriosPasantia()) {
                                    return;
                                }
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
                                                        className={`inline-flex  px-2 py-0.5 rounded-full text-xs font-medium ${
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
                fechaDefectoIni={form.fecha_ini}
                fechaDefectoFin={form.fecha_fin}
            />

            {/* Modal de Alerta */}
            <ModalAlerta
                isOpen={alerta.isOpen}
                onClose={() => setAlerta({ ...alerta, isOpen: false })}
                titulo={alerta.titulo}
                mensaje={alerta.mensaje}
                type={alerta.type}
            />
        </GerenteLayout>
    );
}
