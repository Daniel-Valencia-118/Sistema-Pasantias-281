// resources/js/Pages/Pasante/Actividades/Show.jsx

import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import PasanteLayout from "@/Components/Layout/PasanteLayout";
import ModalApuntes from "@/Components/Common/ModalApuntes";
import ModalAutoEva from "@/Components/Common/ModalAutoEva";
import ModalVerEvaluacion from "@/Components/Common/ModalVerEvaluacion";
import {
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Send,
    Pencil,
    Check,
    X,
} from "lucide-react";

export default function Show({ auth, pasantia, actividades, puedeComentar }) {
    const [expandedComments, setExpandedComments] = useState({});
    const [newComment, setNewComment] = useState({});
    const [editandoComentario, setEditandoComentario] = useState(null);
    const [editText, setEditText] = useState("");

    const [modalApuntes, setModalApuntes] = useState({
        isOpen: false,
        actividadId: null,
        actividadNombre: null,
        progresos: null,
    });

    const [modalAutoEva, setModalAutoEva] = useState({
        isOpen: false,
        actividadId: null,
        actividadNombre: null,
        autoevaluacion: null,
    });

    const [modalEvaluacion, setModalEvaluacion] = useState({
        isOpen: false,
        evaluacion: null,
    });

    const toggleComments = (actividadId) => {
        setExpandedComments((prev) => ({
            ...prev,
            [actividadId]: !prev[actividadId],
        }));
    };

    const handleNewCommentChange = (actividadId, value) => {
        setNewComment((prev) => ({
            ...prev,
            [actividadId]: value,
        }));
    };

    const startEditComment = (comentarioId, textoActual) => {
        setEditandoComentario(comentarioId);
        setEditText(textoActual);
    };

    const cancelEditComment = () => {
        setEditandoComentario(null);
        setEditText("");
    };

    const saveEditComment = async (comentarioId) => {
        if (!editText.trim()) return;

        try {
            await axios.put(
                route("pasante.comentario.update", { id: comentarioId }),
                {
                    comentario: editText,
                },
            );

            router.reload();
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al editar comentario",
            );
        }

        setEditandoComentario(null);
        setEditText("");
    };

    const submitComment = async (actividadId) => {
        const comentario = newComment[actividadId];

        if (!comentario?.trim()) return;

        try {
            await axios.post(route("pasante.comentario.store"), {
                id_actividad: actividadId,
                comentario,
            });

            setNewComment((prev) => ({
                ...prev,
                [actividadId]: "",
            }));

            router.reload();
        } catch (error) {
            alert(
                error.response?.data?.message || "Error al enviar comentario",
            );
        }
    };

    const getEstadoEvaluacionBadge = (estado) => {
        const config = {
            COMPLETADA: {
                bg: "bg-emerald-100",
                text: "text-emerald-700",
                label: "Completada",
            },
            "COMPLETADA PARCIALMENTE": {
                bg: "bg-yellow-100",
                text: "text-yellow-700",
                label: "Realizado",
            },
            "NO REALIZADA": {
                bg: "bg-red-100",
                text: "text-red-700 ",
                label: "No realizado",
            },
            "SIN CALIFICAR": {
                bg: "bg-blue-100",
                text: "text-blue-700",
                label: "No asignado",
            },
            PENDIENTE: {
                bg: "bg-gray-100",
                text: "text-gray-600",
                label: "Pendiente",
            },
        };

        const c = config[estado] || config.PENDIENTE;

        return (
            <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${c.bg} ${c.text}`}
            >
                {c.label}
            </span>
        );
    };

    const handleVerEvaluacion = async (actividadId) => {
        try {
            const response = await axios.get(
                route("pasante.evaluacion.detalle", {
                    idActividad: actividadId,
                }),
            );

            if (response.data.success) {
                setModalEvaluacion({
                    isOpen: true,
                    evaluacion: response.data.evaluacion,
                });
            } else {
                alert("No se pudo cargar la evaluación");
            }
        } catch (error) {
            alert("Error al cargar la evaluación");
        }
    };

    const formatFechaLabel = (fecha) => {
        const d = new Date(fecha);

        return d.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
        });
    };

    return (
        <PasanteLayout auth={auth}>
            <Head title={`Actividades - ${pasantia.nombre}`} />

            <div className="min-h-screen bg-[#f6f8fc] -m-4 md:-m-4 p-4 md:p-15">
                {/* Botón volver */}
                <div className="mb-2 -mt-18">
                    <button
                        onClick={() => router.visit("/pasante/actividades")}
                        className="group flex items-center gap-2 text-gray-600 hover:text-primary-blue transition"
                    >
                        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm group-hover:border-primary-blue transition">
                            <ChevronLeft size={18} />
                        </div>

                        <span className="font-medium">
                            Volver a actividades
                        </span>
                    </button>
                </div>

                {/* HERO */}
                <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-primary-navy via-primary-blue to-blue-500 shadow-2xl mb-10">
                    <div className="relative z-10 p-8 md:p-10 text-white">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1 text-sm font-medium backdrop-blur-sm border border-white/10">
                                    Gestión de actividades
                                </span>
                                <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                                    {pasantia.nombre}
                                </h1>

                                <p className="mt-4 text-blue-100 text-[15px] md:text-base leading-relaxed max-w-2xl">
                                    Gestiona tus actividades, revisa tus
                                    evaluaciones y comenta tus dudas.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[300px]">
                                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-3">
                                    <div className="text-xs uppercase tracking-wider text-blue-100">
                                        Empresa
                                    </div>

                                    <div className="mt-1 font-semibold">
                                        {pasantia.empresa_nombre}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-3">
                                    <div className="text-xs uppercase tracking-wider text-blue-100">
                                        Gestión
                                    </div>

                                    <div className="mt-1 font-semibold">
                                        {pasantia.anio}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-3">
                                    <div className="text-xs uppercase tracking-wider text-blue-100">
                                        Jefe pASANTE
                                    </div>

                                    <div className="mt-1 font-semibold">
                                        {pasantia.jefe_nombre}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur-sm px-4 py-3">
                                    <div className="text-xs uppercase tracking-wider text-blue-100">
                                        Tutor
                                    </div>

                                    <div className="mt-1 font-semibold">
                                        {pasantia.tutor_nombre}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Glow */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                </div>

                {/* ACTIVIDADES */}
                <div className="space-y-4 -mt-7">
                    {actividades.map((act) => (
                        <div
                            key={act.id}
                            className="group -space-y-11 overflow-hidden rounded-[28px] border border-gray-200/70 bg-white shadow-sm hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Header actividad */}
                            <div className="-mt-2  border-gray-100 bg-gradient-to-b from-gray-50/80 to-white p-6 md:p-8">
                                <div className="flex flex-col gap-4 ">
                                    <div>
                                        <h3 className="text-2xl md:text-2.5xl font-bold tracking-tight text-gray-800 group-hover:text-primary-blue transition-colors">
                                            {act.nombre}
                                        </h3>

                                        <p className=" mt-2 text-gray-800 leading-relaxed text-[17px]">
                                            {act.descripcion ||
                                                "Sin descripción"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-1 ">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-sm font-semibold">
                                            Inicio:{" "}
                                            {formatFechaLabel(act.fecha_ini)}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-sm font-semibold">
                                            Fin:{" "}
                                            {formatFechaLabel(act.fecha_fin)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 md:p-7 space-y-2.5 -mt-3">
                                {/* Acciones */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() =>
                                            setModalApuntes({
                                                isOpen: true,
                                                actividadId: act.id,
                                                actividadNombre: act.nombre,
                                                progresos: act.progresos,
                                            })
                                        }
                                        className="px-5 py-3 rounded-2xl bg-white border border-gray-200 hover:border-primary-blue hover:bg-blue-50 text-gray-700 hover:text-primary-blue text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        📝 APUNTES
                                    </button>

                                    <button
                                        onClick={() =>
                                            setModalAutoEva({
                                                isOpen: true,
                                                actividadId: act.id,
                                                actividadNombre: act.nombre,
                                                autoevaluacion:
                                                    act.autoevaluacion,
                                            })
                                        }
                                        className="px-5 py-3 rounded-2xl bg-white border border-gray-200 hover:border-primary-blue hover:bg-blue-50 text-gray-700 hover:text-primary-blue text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        ✍️ AUTOEVALUARME
                                    </button>
                                </div>

                                {/* Evaluación */}
                                <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                                        <div>
                                            <div className="text-sm font-medium text-gray-700">
                                                EVALUACIÓN
                                            </div>

                                            <div className="mt-2">
                                                {getEstadoEvaluacionBadge(
                                                    act.estado_evaluacion,
                                                )}
                                            </div>
                                        </div>

                                        {act.nota_evaluacion !== null && (
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-xs uppercase tracking-wide text-gray-400">
                                                        Nota
                                                    </div>

                                                    <div className="text-3xl font-bold text-gray-800">
                                                        {act.nota_evaluacion}
                                                        <span className="text-lg text-gray-400">
                                                            /100
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleVerEvaluacion(
                                                            act.id,
                                                        )
                                                    }
                                                    className="px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold transition"
                                                >
                                                    Ver evaluación
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Comentarios */}
                                <div className="border-t border-gray-100 pt-5">
                                    <button
                                        onClick={() => toggleComments(act.id)}
                                        className="group/comment flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-blue transition"
                                    >
                                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 group-hover/comment:bg-blue-100 transition">
                                            {expandedComments[act.id] ? (
                                                <ChevronUp size={15} />
                                            ) : (
                                                <ChevronDown size={15} />
                                            )}
                                        </div>

                                        <span>
                                            {act.comentarios.length} comentarios
                                        </span>
                                    </button>

                                    {expandedComments[act.id] && (
                                        <div className="mt-6 space-y-5 max-h-[500px] overflow-y-auto pr-2">
                                            {act.comentarios.map((com) => (
                                                <div
                                                    key={com.id}
                                                    className="space-y-4"
                                                >
                                                    {/* Comentario */}
                                                    <div className="flex gap-2">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-blue to-blue-400 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                            {com.autor_nombre.charAt(
                                                                0,
                                                            )}
                                                        </div>

                                                        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition">
                                                            <div className="flex justify-between gap-4 items-start">
                                                                <div>
                                                                    <div className="font-semibold text-gray-800">
                                                                        {
                                                                            com.autor_nombre
                                                                        }
                                                                    </div>

                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {
                                                                            com.hora
                                                                        }{" "}
                                                                        •{" "}
                                                                        {new Date(
                                                                            com.fecha,
                                                                        ).toLocaleDateString(
                                                                            "es-ES",
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {com.puede_editar && (
                                                                    <button
                                                                        onClick={() =>
                                                                            startEditComment(
                                                                                com.id,
                                                                                com.comentario,
                                                                            )
                                                                        }
                                                                        className="text-gray-500 hover:text-primary-blue transition"
                                                                    >
                                                                        <Pencil
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {editandoComentario ===
                                                            com.id ? (
                                                                <div className="mt-5 space-y-3">
                                                                    <textarea
                                                                        value={
                                                                            editText
                                                                        }
                                                                        onChange={(
                                                                            e,
                                                                        ) =>
                                                                            setEditText(
                                                                                e
                                                                                    .target
                                                                                    .value,
                                                                            )
                                                                        }
                                                                        rows={3}
                                                                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-primary-blue focus:ring-4 focus:ring-blue-100 focus:bg-white transition"
                                                                        autoFocus
                                                                    />

                                                                    <div className="flex items-center gap-3">
                                                                        <button
                                                                            onClick={() =>
                                                                                saveEditComment(
                                                                                    com.id,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-sm font-semibold transition"
                                                                        >
                                                                            <Check
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                            Guardar
                                                                        </button>

                                                                        <button
                                                                            onClick={
                                                                                cancelEditComment
                                                                            }
                                                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold transition"
                                                                        >
                                                                            <X
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className="mt-3 text-gray-700 leading-relaxed">
                                                                    {
                                                                        com.comentario
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Respuesta jefe */}
                                                    {com.respuesta_jefe && (
                                                        <div className="ml-8 pl-12 border-l-2 border-blue-200">
                                                            <div className="flex gap-2">
                                                                <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-md">
                                                                    J
                                                                </div>

                                                                <div className="flex-1 rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
                                                                    <div className="flex justify-between gap-4 items-start">
                                                                        <div>
                                                                            <div className="font-semibold text-amber-800">
                                                                                {
                                                                                    com
                                                                                        .respuesta_jefe
                                                                                        .jefe_nombre
                                                                                }
                                                                            </div>

                                                                            <div className="text-xs text-amber-600/70 mt-1">
                                                                                {
                                                                                    com
                                                                                        .respuesta_jefe
                                                                                        .hora
                                                                                }{" "}
                                                                                •{" "}
                                                                                {new Date(
                                                                                    com
                                                                                        .respuesta_jefe
                                                                                        .fecha,
                                                                                ).toLocaleDateString(
                                                                                    "es-ES",
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <p className="mt-3 text-gray-700 leading-relaxed">
                                                                        {
                                                                            com
                                                                                .respuesta_jefe
                                                                                .comentario
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Nuevo comentario */}
                                            {puedeComentar && (
                                                <div className="flex items-center gap-3 pt-2">
                                                    <input
                                                        type="text"
                                                        value={
                                                            newComment[
                                                                act.id
                                                            ] || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleNewCommentChange(
                                                                act.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Escribe un comentario..."
                                                        className="flex-1 rounded-2xl border border-gray-400 bg-gray-50 px-7 py-3 text-sm focus:border-primary-blue focus:ring-4 focus:ring-blue-100 focus:bg-white transition"
                                                    />

                                                    <button
                                                        onClick={() =>
                                                            submitComment(
                                                                act.id,
                                                            )
                                                        }
                                                        className="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary-blue text-white hover:scale-105 hover:bg-primary-sky-blue shadow-md transition-all"
                                                    >
                                                        <Send size={17} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modales */}
            <ModalApuntes
                isOpen={modalApuntes.isOpen}
                onClose={() => setModalApuntes({ isOpen: false })}
                actividadId={modalApuntes.actividadId}
                actividadNombre={modalApuntes.actividadNombre}
                progresos={modalApuntes.progresos}
            />

            <ModalAutoEva
                isOpen={modalAutoEva.isOpen}
                onClose={() => setModalAutoEva({ isOpen: false })}
                actividadId={modalAutoEva.actividadId}
                actividadNombre={modalAutoEva.actividadNombre}
                autoevaluacion={modalAutoEva.autoevaluacion}
            />

            <ModalVerEvaluacion
                isOpen={modalEvaluacion.isOpen}
                onClose={() => setModalEvaluacion({ isOpen: false })}
                evaluacion={modalEvaluacion.evaluacion}
            />
        </PasanteLayout>
    );
}
