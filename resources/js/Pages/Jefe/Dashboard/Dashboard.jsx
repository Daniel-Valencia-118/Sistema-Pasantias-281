import React from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Components/Layout/DashboardLayout";
import Breadcrumbs from "@/Components/Breadcrumbs";
import KpiCards from '@/Components/KpiCards';
import RendimientoChart from "@/Components/RendimientoChart";
import BitacorasPendientes from "@/Components/BitacorasPendientes";

import { 
    MessageSquare, FileCheck, FileText, School, Activity 
} from "lucide-react";

export default function Dashboard({ auth, stats, rendimiento_pasantes, bitacoras_pendientes, actividades_recientes }) {
    
    const COLORS = ["#2A5A8D", "#3890BB", "#3C9087", "#6DBB98", "#F59E0B"];

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    console.log(stats, rendimiento_pasantes, bitacoras_pendientes, actividades_recientes);
    

    const cards = [
        { 
            label: 'Pasantes a Cargo', 
            value: stats.pasantes_activos, 
            icon: School, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            label: 'Actividades por Evaluar', 
            value: stats.actividades_pendientes, 
            icon: Activity, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
        },
        { 
            label: 'Bitácoras en Lista', 
            value: stats.actividades_completadas || 0,
            icon: FileCheck, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
        },
        { 
            label: 'Notificaciones Nuevas', 
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
                {/* Cabecera del Rol */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        {/* <Breadcrumbs items={[{ label: 'Inicio' }, { label: 'Dashboard' }]} /> */}
                        <h1 className="text-2xl font-bold text-slate-800 mt-2">
                            Panel del Jefe de Pasantía
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Bienvenido, {auth.user.nombre}. Tienes <span className="font-semibold text-amber-600">{stats.actividades_pendientes}</span> actividades pendientes de cierre.
                        </p>
                    </div>
                    {/* <div> */}
                        {/* <Link 
                            href="/jefe/bitacora/crear" 
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
                        >
                            <FileCheck size={18} /> Nueva Evaluación
                        </Link> */}
                    {/* </div> */}
                </div>

                {/* 1. Componente Modular: KPIs */}
                <KpiCards cards={cards} />

                {/* 2. Sección de Gráficos y Bitácoras */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RendimientoChart data={rendimiento_pasantes} colors={COLORS} />
                    </div>
                    <div>
                        <BitacorasPendientes bitacoras={bitacoras_pendientes} formatDate={formatDate} />
                    </div>
                </div>

                {/* 3. Sección Inferior: Seguimiento de Informes y Comunicación */}
                <div className="grid grid-cols-1 lg:grid gap-6">
                    
                    {/* Monitor de Informes Finales */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            Estado de Progresos de Pasantes
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs font-semibold text-gray-400 uppercase border-b border-gray-100">
                                        <th className="pb-3">Pasante</th>
                                        <th className="pb-3 text-center">Estado Inicial</th>
                                        <th className="pb-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {actividades_recientes?.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3">
                                                <p className="font-medium text-gray-800">{p.pasante}</p>
                                                <p className="text-[12px] text-gray-400">Inscrito el: {formatDate(p.fecha_limite)}</p>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <div className="w-80 bg-gray-100 rounded-full h-1.5">
                                                        <div 
                                                            className="bg-emerald-500 h-1.5 rounded-full" 
                                                            style={{ width: `${p.completitud}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{p.completitud}%</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link href={`/jefe/evaluaciones/${p.id_pasantia}/bitacoras`} className="text-blue-600 hover:underline text-xs font-bold">
                                                    Revisar
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Centro de Comunicación Directa */}
                    <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <MessageSquare size={32} className="text-blue-400" />
                                <span className="bg-blue-600 text-white text-[10px] px-2 py-1 rounded-full font-bold tracking-wider">
                                    NOTIFICACIONES INTERNAS
                                </span>
                            </div>
                            <h3 className="text-xl font-bold mt-4">Canal Directo de Mensajería</h3>
                            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                                Envía avisos a tus pasantes vinculados o coordina requerimientos de bitácoras de manera centralizada.
                            </p>
                        </div>
                        <div className="grid gap-3 mt-6">
                            <Link 
                                href="/jefe/mensajes"
                                className="bg-blue-600 hover:bg-blue-700 py-2.5 px-3 rounded-lg text-center text-sm font-medium transition-colors"
                            >
                                Redactar Mensaje
                            </Link>
                            {/* <Link 
                                href="/jefe/comunicacion/mensajes-enviados"
                                className="bg-blue-600 hover:bg-blue-700 py-2.5 px-3 rounded-lg text-center text-sm font-medium transition-colors"
                            >
                                Historial Enviados
                            </Link> */}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}