import React from "react";
import { Head, Link } from "@inertiajs/react";
import GerenteLayout from "@/Components/Layout/GerenteLayout";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    Briefcase,
    Users,
    UserCheck,
    Star,
    TrendingUp,
    Calendar,
    Award,
} from "lucide-react";

export default function Index({
    auth,
    kpis,
    inscripciones_por_mes,
    pasantias_rendimiento,
    proximas_pasantias,
}) {
    // Colores para gráficos
    const COLORS = ["#2A5A8D", "#3890BB", "#3C9087", "#6DBB98", "#172534"];

    // Formatear fechas
    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-ES");
    };

    // Obtener color según calificación
    const getRatingColor = (rating) => {
        if (rating >= 4) return "text-green-600";
        if (rating >= 3) return "text-yellow-600";
        return "text-red-600";
    };

    // Obtener color según nota
    const getNotaColor = (nota) => {
        if (nota >= 80) return "text-green-600";
        if (nota >= 60) return "text-blue-600";
        if (nota >= 40) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <GerenteLayout auth={auth}>
            <Head title="Estadísticas" />

            <div className="space-y-6">
                {/* Título */}
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">
                        Panel de Estadísticas
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Análisis y métricas de tu gestión
                    </p>
                </div>

                {/* 1. Tarjetas KPI */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Total Pasantías */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Total Pasantías
                                </p>
                                <p className="text-3xl font-bold text-primary-navy mt-1">
                                    {kpis.total_pasantias}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center">
                                <Briefcase
                                    size={24}
                                    className="text-primary-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Pasantes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Total Pasantes
                                </p>
                                <p className="text-3xl font-bold text-primary-navy mt-1">
                                    {kpis.total_pasantes}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center">
                                <Users
                                    size={24}
                                    className="text-primary-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Jefes */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Total Jefes
                                </p>
                                <p className="text-3xl font-bold text-primary-navy mt-1">
                                    {kpis.total_jefes}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center">
                                <UserCheck
                                    size={24}
                                    className="text-primary-blue"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Calificación Promedio */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm">
                                    Calificación Promedio
                                </p>
                                <p
                                    className={`text-3xl font-bold mt-1 ${getRatingColor(kpis.calificacion_promedio)}`}
                                >
                                    {kpis.calificacion_promedio} ⭐
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary-blue/10 flex items-center justify-center">
                                <Star size={24} className="text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Gráfico de inscripciones por mes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <TrendingUp
                                    size={20}
                                    className="text-primary-blue"
                                />
                                Evolución de Inscripciones
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Inscripciones por mes (últimos 12 meses)
                            </p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={inscripciones_por_mes}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5e7eb"
                            />
                            <XAxis dataKey="mes" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="inscripciones"
                                stroke="#2A5A8D"
                                strokeWidth={3}
                                dot={{ r: 5, fill: "#3890BB" }}
                                activeDot={{ r: 8 }}
                                name="Inscripciones"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Rendimiento de pasantías finalizadas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <Award
                                    size={20}
                                    className="text-primary-blue"
                                />
                                Rendimiento de Pasantías Finalizadas
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Notas promedio, completitud y calificaciones
                            </p>
                        </div>
                    </div>

                    {pasantias_rendimiento.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay pasantías finalizadas para mostrar
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Pasantía
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            Inscritos
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            Nota Promedio
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            Completitud
                                        </th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                            Calificación ⭐
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {pasantias_rendimiento.map((pasantia) => (
                                        <tr
                                            key={pasantia.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {pasantia.nombre}
                                                <p className="text-xs text-gray-400">
                                                    {formatDate(
                                                        pasantia.fecha_fin,
                                                    )}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">
                                                {pasantia.inscritos}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`font-bold ${getNotaColor(pasantia.promedio_notas)}`}
                                                >
                                                    {pasantia.promedio_notas}
                                                    /100
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-primary-blue rounded-full h-2"
                                                            style={{
                                                                width: `${pasantia.tasa_completitud}%`,
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {
                                                            pasantia.tasa_completitud
                                                        }
                                                        %
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="flex items-center justify-center gap-1">
                                                    {pasantia.calificacion}
                                                    <Star
                                                        size={14}
                                                        className="text-yellow-400 fill-yellow-400"
                                                    />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 4. Próximas pasantías */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <Calendar
                                    size={20}
                                    className="text-primary-blue"
                                />
                                Próximas Pasantías
                            </h2>
                            <p className="text-gray-500 text-sm mt-1">
                                Pasantías que están por comenzar
                            </p>
                        </div>
                    </div>

                    {proximas_pasantias.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No hay pasantías próximas programadas
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {proximas_pasantias.map((pasantia) => (
                                <div
                                    key={pasantia.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {pasantia.nombre}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Inicia:{" "}
                                            {formatDate(pasantia.fecha_ini)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">
                                            Cupos: {pasantia.cupos_disponibles}
                                        </span>
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                pasantia.dias_restantes <= 7
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {pasantia.dias_restantes === 0
                                                ? "Hoy"
                                                : `${Math.round(pasantia.dias_restantes)} días`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </GerenteLayout>
    );
}
