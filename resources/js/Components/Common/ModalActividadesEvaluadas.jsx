import React, { useState, useEffect } from "react";
import {
    X,
    Eye,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    Calendar,
    FileText,
    User,
    Award,
    TrendingUp,
} from "lucide-react";
import { formatDateToSpanish } from "@/Utils/dateUtils";

// Badge de estado mejorado
function BadgeEstadoCalificacion({ estado }) {
    const config = {
        COMPLETADA: {
            bg: "bg-green-100",
            text: "text-green-700",
            icon: CheckCircle,
            label: "Completada",
            border: "border-green-200",
        },
        "COMPLETADA PARCIALMENTE": {
            bg: "bg-blue-100",
            text: "text-blue-700",
            icon: AlertTriangle,
            label: "Completada Parcialmente",
            border: "border-blue-200",
        },
        "NO REALIZADA": {
            bg: "bg-red-100",
            text: "text-red-700",
            icon: XCircle,
            label: "No Realizada",
            border: "border-red-200",
        },
        "SIN CALIFICAR": {
            bg: "bg-yellow-100",
            text: "text-yellow-700",
            icon: Clock,
            label: "Sin Calificar",
            border: "border-yellow-200",
        },
        PENDIENTE: {
            bg: "bg-gray-100",
            text: "text-gray-600",
            icon: Clock,
            label: "Pendiente",
            border: "border-gray-200",
        },
    };
    const c = config[estado] || config["PENDIENTE"];
    const Icon = c.icon;
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text} border ${c.border} shadow-sm`}
        >
            <Icon size={12} />
            {c.label}
        </span>
    );
}

// Modal de evaluación interno mejorado
function ModalEvaluacionDetalle({
    isOpen,
    onClose,
    actividad,
    evaluacion,
    pasante,
}) {
    if (!isOpen) return null;

    const getColorByNota = (nota) => {
        if (!nota) return "text-gray-400";
        if (nota >= 90) return "text-green-600";
        if (nota >= 70) return "text-blue-600";
        if (nota >= 51) return "text-yellow-600";
        return "text-red-600";
    };

    const getBgByNota = (nota) => {
        if (!nota) return "bg-gray-100";
        if (nota >= 90) return "bg-green-50";
        if (nota >= 70) return "bg-blue-50";
        if (nota >= 51) return "bg-yellow-50";
        return "bg-red-50";
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-5 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Award size={18} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">
                                    Detalle de Calificación
                                </h3>
                                <p className="text-white/80 text-xs mt-0.5">
                                    {actividad?.nombre_act}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-all hover:scale-105"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="p-5">
                    {evaluacion ? (
                        <div className="space-y-4">
                            {/* Nota circular */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-24 h-24 rounded-full flex items-center justify-center ${getBgByNota(evaluacion.nota)} border-4 ${getColorByNota(evaluacion.nota)} border-current shadow-lg`}
                                >
                                    <span
                                        className={`text-2xl font-bold ${getColorByNota(evaluacion.nota)}`}
                                    >
                                        {Math.round(evaluacion.nota)}
                                        <span className="text-sm">/100</span>
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <BadgeEstadoCalificacion
                                        estado={evaluacion.estado}
                                    />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 space-y-3">
                                {/* Descripción */}
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                        Descripción
                                    </label>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {evaluacion.descripcion ||
                                            "Sin descripción"}
                                    </p>
                                </div>

                                {/* Observación */}
                                {evaluacion.observacion && (
                                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                                        <label className="block text-[10px] font-semibold text-blue-500 uppercase tracking-wide mb-1">
                                            Observación
                                        </label>
                                        <p className="text-sm text-blue-700 leading-relaxed">
                                            {evaluacion.observacion}
                                        </p>
                                    </div>
                                )}

                                {/* Recomendación */}
                                {evaluacion.recomendacion && (
                                    <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                                        <label className="block text-[10px] font-semibold text-green-500 uppercase tracking-wide mb-1">
                                            Recomendación
                                        </label>
                                        <p className="text-sm text-green-700 leading-relaxed">
                                            {evaluacion.recomendacion}
                                        </p>
                                    </div>
                                )}

                                {/* Metadata */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Calendar
                                                size={12}
                                                className="text-gray-400"
                                            />
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                                Fecha evaluación
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700">
                                            {evaluacion.fecha
                                                ? formatDateToSpanish(
                                                      evaluacion.fecha,
                                                  )
                                                : "-"}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <User
                                                size={12}
                                                className="text-gray-400"
                                            />
                                            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                                Evaluado por
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-gray-700 truncate">
                                            {evaluacion.jefe_nombre || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-3">
                                <Clock size={28} className="text-gray-400" />
                            </div>
                            <h4 className="text-base font-medium text-gray-700 mb-1">
                                Sin evaluación
                            </h4>
                            <p className="text-sm text-gray-500">
                                Esta actividad aún no ha sido evaluada
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-primary-blue text-white text-sm font-medium rounded-xl hover:bg-primary-sky-blue transition-all shadow-sm hover:shadow-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// Componente principal mejorado
export default function ModalActividadesEvaluadas({
    isOpen,
    onClose,
    pasante,
    actividades = [],
}) {
    const [actividadesConData, setActividadesConData] = useState([]);
    const [modalEvaluacion, setModalEvaluacion] = useState({
        isOpen: false,
        actividad: null,
        evaluacion: null,
    });

    useEffect(() => {
        if (isOpen && pasante && actividades.length > 0) {
            const combinadas = actividades.map((actividad) => {
                const evaluacion =
                    pasante.evaluaciones?.find(
                        (e) => e.id_actividad === actividad.id,
                    )?.evaluacion || null;
                return {
                    ...actividad,
                    evaluacion: evaluacion,
                    estadoCalificacion: evaluacion?.estado || "PENDIENTE",
                    tieneCalificacion: evaluacion && evaluacion.nota !== null,
                    nota: evaluacion?.nota || null,
                };
            });

            combinadas.sort((a, b) => {
                const fechaA = new Date(a.fecha_ini);
                const fechaB = new Date(b.fecha_ini);
                return fechaA - fechaB;
            });

            setActividadesConData(combinadas);
        }
    }, [isOpen, pasante, actividades]);

    if (!isOpen) return null;

    // Estadísticas
    const totalActividades = actividadesConData.length;
    const completadas = actividadesConData.filter(
        (a) => a.estadoCalificacion === "COMPLETADA",
    ).length;
    const pendientes = actividadesConData.filter(
        (a) =>
            a.estadoCalificacion === "PENDIENTE" ||
            a.estadoCalificacion === "SIN CALIFICAR",
    ).length;
    const promedio =
        actividadesConData
            .filter((a) => a.nota)
            .reduce((acc, a) => acc + a.nota, 0) /
        (actividadesConData.filter((a) => a.nota).length || 1);

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 my-8">
                    {/* Header mejorado */}
                    <div className="bg-gradient-to-r from-primary-navy to-primary-blue px-6 py-5 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <FileText
                                        size={24}
                                        className="text-white"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">
                                        Actividades Evaluadas
                                    </h3>
                                    <p className="text-white/80 text-sm mt-0.5 flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                        {pasante?.nombre} {pasante?.ap_paterno}{" "}
                                        {pasante?.ap_materno}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 p-2 rounded-xl transition-all hover:scale-105"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-4 gap-3 p-5 border-b border-gray-100 bg-gray-50">
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                Total
                            </p>
                            <p className="text-xl font-bold text-gray-800">
                                {totalActividades}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                Completadas
                            </p>
                            <p className="text-xl font-bold text-green-600">
                                {completadas}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                Pendientes
                            </p>
                            <p className="text-xl font-bold text-yellow-600">
                                {pendientes}
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                                Promedio
                            </p>
                            <p className="text-xl font-bold text-primary-blue">
                                {promedio.toFixed(1)}
                            </p>
                        </div>
                    </div>

                    {/* Contenido - Tabla mejorada */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {actividadesConData.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                    <FileText
                                        size={28}
                                        className="text-gray-400"
                                    />
                                </div>
                                <h4 className="text-base font-medium text-gray-700 mb-1">
                                    No hay actividades
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Esta pasantía no tiene actividades
                                    registradas
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-200">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actividad
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Tipo
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Descripción
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                F. Inicio
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                F. Fin
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Calificación
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {actividadesConData.map(
                                            (act, index) => (
                                                <tr
                                                    key={act.id}
                                                    className="hover:bg-gray-50 transition-colors duration-150"
                                                >
                                                    <td className="px-4 py-3 text-xs text-gray-400 font-medium">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {act.nombre_act}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm ${
                                                                act.tipo ===
                                                                "OPERATIVA"
                                                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                                                    : "bg-purple-100 text-purple-700 border border-purple-200"
                                                            }`}
                                                        >
                                                            {act.tipo}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="max-w-xs">
                                                            <p
                                                                className="text-xs text-gray-600 line-clamp-2"
                                                                title={
                                                                    act.descripcion
                                                                }
                                                            >
                                                                {act.descripcion ||
                                                                    "Sin descripción"}
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar
                                                                size={12}
                                                                className="text-gray-400"
                                                            />
                                                            <span className="text-xs text-gray-600">
                                                                {formatDateToSpanish(
                                                                    act.fecha_ini,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar
                                                                size={12}
                                                                className="text-gray-400"
                                                            />
                                                            <span className="text-xs text-gray-600">
                                                                {formatDateToSpanish(
                                                                    act.fecha_fin,
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <BadgeEstadoCalificacion
                                                            estado={
                                                                act.estadoCalificacion
                                                            }
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {act.tieneCalificacion ? (
                                                            <div className="flex items-center justify-center gap-2">
                                                                {/* Nota */}
                                                                <div
                                                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                                                        act.nota >=
                                                                        90
                                                                            ? "bg-green-100 text-green-700"
                                                                            : act.nota >=
                                                                                70
                                                                              ? "bg-blue-100 text-blue-700"
                                                                              : act.nota >=
                                                                                  51
                                                                                ? "bg-yellow-100 text-yellow-700"
                                                                                : "bg-red-100 text-red-700"
                                                                    }`}
                                                                >
                                                                    {Math.round(
                                                                        act.nota,
                                                                    )}
                                                                    /100
                                                                </div>

                                                                {/* Botón Ver Evaluación */}
                                                                <button
                                                                    onClick={() =>
                                                                        setModalEvaluacion(
                                                                            {
                                                                                isOpen: true,
                                                                                actividad:
                                                                                    act,
                                                                                evaluacion:
                                                                                    act.evaluacion,
                                                                                pasante:
                                                                                    pasante,
                                                                            },
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
                                                                >
                                                                    Ver
                                                                    Evaluación
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs italic">
                                                                Sin calificar
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer mejorado */}
                    <div className="flex justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all shadow-sm hover:shadow-md"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de evaluación interno */}
            <ModalEvaluacionDetalle
                isOpen={modalEvaluacion.isOpen}
                onClose={() =>
                    setModalEvaluacion({
                        isOpen: false,
                        actividad: null,
                        evaluacion: null,
                    })
                }
                actividad={modalEvaluacion.actividad}
                evaluacion={modalEvaluacion.evaluacion}
                pasante={modalEvaluacion.pasante}
            />
        </>
    );
}
