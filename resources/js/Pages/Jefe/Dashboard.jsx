import React from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import {
    Users, ClipboardList, MessageSquare, Briefcase, 
    School, FileCheck, Activity, FileText, AlertCircle,
    CheckCircle2, Clock, ArrowRight
} from "lucide-react";

export default function Dashboard({ auth, stats, rendimiento_pasantes, bitacoras_pendientes, actividades_recientes }) {
    
    // Colores corporativos coherentes con el Gerente
    const COLORS = ["#2A5A8D", "#3890BB", "#3C9087", "#6DBB98", "#F59E0B"];

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-ES");
    };

    // Tarjetas KPI adaptadas al rol de Jefe
    const cards = [
        { 
            label: 'Pasantes a Cargo', 
            value: stats.pasantes_activos, 
            icon: School, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Actividades x Evaluar', 
            value: stats.actividades_pendientes, 
            icon: Activity, 
            color: 'text-orange-600', 
            bg: 'bg-orange-50' 
        },
        { 
            label: 'Bitácoras Pendientes', 
            value: bitacoras_pendientes?.length || 0, 
            icon: FileCheck, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
        },
        { 
            label: 'Mensajes Nuevos', 
            value: stats.mensajes_no_leidos, 
            icon: MessageSquare, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
        },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Panel de Control Jefe" />
            
            <div className="space-y-6">
                {/* Cabecera y Navegación */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Breadcrumbs items={[{ label: 'Inicio' }, { label: 'Dashboard' }]} />
                        <h1 className="text-2xl font-bold text-primary-navy mt-2">
                            Panel del Jefe de Pasantía
                        </h1>
                        <p className="text-gray-500">
                            Bienvenido, {auth.user.nombre}. Tienes {stats.actividades_pendientes} tareas que requieren tu atención.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link 
                            href="/jefe/bitacora/crear" 
                            className="flex items-center gap-2 bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-primary-navy transition-colors text-sm font-medium"
                        >
                            <FileCheck size={18} /> Nueva Evaluación
                        </Link>
                    </div>
                </div>

                {/* 1. Fila de KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-sm font-medium">{card.label}</p>
                                    <p className="text-3xl font-bold text-primary-navy mt-1">{card.value}</p>
                                </div>
                                <div className={`h-12 w-12 rounded-full ${card.bg} flex items-center justify-center`}>
                                    <card.icon size={24} className={card.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 2. Gráfico de Rendimiento de Pasantes (Visualización de Recharts) */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <Activity size={20} className="text-primary-blue" />
                                Progreso por Pasante (%)
                            </h2>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rendimiento_pasantes}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="nombre" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        cursor={{fill: '#f9fafb'}}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="progreso" radius={[4, 4, 0, 0]}>
                                        {rendimiento_pasantes?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Bitácoras Pendientes de Revisión */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-primary-navy mb-4 flex items-center gap-2">
                            <Clock size={20} className="text-orange-500" />
                            Bitácoras por Evaluar
                        </h2>
                        <div className="space-y-4">
                            {bitacoras_pendientes?.length > 0 ? (
                                bitacoras_pendientes.map((item) => (
                                    <div key={item.id} className="group p-3 rounded-lg border border-gray-50 bg-gray-50/50 hover:bg-white hover:border-primary-blue/30 transition-all">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{item.pasante_nombre}</p>
                                                <p className="text-xs text-gray-500">{item.pasantia_titulo}</p>
                                            </div>
                                            <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                                                PENDIENTE
                                            </span>
                                        </div>
                                        <div className="mt-3 flex justify-between items-center">
                                            <span className="text-xs text-gray-400">{formatDate(item.fecha)}</span>
                                            <Link 
                                                href={`/jefe/evaluaciones/bitacoras/${item.id}`}
                                                className="text-xs font-semibold text-primary-blue flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Evaluar <ArrowRight size={12} />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <CheckCircle2 size={40} className="text-green-200 mx-auto mb-2" />
                                    <p className="text-sm text-gray-400">Todo al día por aquí</p>
                                </div>
                            )}
                        </div>
                        <Link 
                            href="/jefe/evaluaciones/bitacoras"
                            className="mt-4 block text-center text-sm text-gray-500 hover:text-primary-blue font-medium transition-colors"
                        >
                            Ver todo el historial
                        </Link>
                    </div>
                </div>

                {/* 4. Sección Inferior: Informes Finales y Pasantes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monitor de Informes Finales */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <FileText size={20} className="text-primary-blue" />
                                Estado de Informes Finales
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3">Pasante</th>
                                        <th className="pb-3 text-center">Progreso</th>
                                        <th className="pb-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {actividades_recientes?.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3">
                                                <p className="text-sm font-medium text-gray-800">{p.pasante}</p>
                                                <p className="text-[10px] text-gray-400">Entrega: {p.fecha_limite}</p>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-emerald-500 h-1.5 rounded-full" 
                                                            style={{ width: `${p.completitud}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{p.completitud}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link href="/jefe/informes/redactar" className="text-primary-blue hover:underline text-xs font-bold">
                                                    Redactar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Acceso rápido a Comunicación */}
                    <div className="bg-primary-navy rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <MessageSquare size={32} className="text-primary-blue" />
                                <span className="bg-primary-blue text-white text-[10px] px-2 py-1 rounded-full">
                                    CENTRO DE COMUNICACIÓN
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mt-4">Mantente en contacto</h3>
                            <p className="text-blue-100/70 text-sm mt-2">
                                Envía retroalimentación directa a tus pasantes o contacta con el Gerente de Pasantías desde aquí.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <Link 
                                href="/jefe/comunicacion/crear-mensaje"
                                className="bg-white/10 hover:bg-white/20 py-2 px-3 rounded-lg text-center text-sm font-medium transition-colors"
                            >
                                Enviar Mensaje
                            </Link>
                            <Link 
                                href="/jefe/comunicacion/mensajes-enviados"
                                className="bg-primary-blue hover:bg-blue-600 py-2 px-3 rounded-lg text-center text-sm font-medium transition-colors"
                            >
                                Ver Enviados
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}