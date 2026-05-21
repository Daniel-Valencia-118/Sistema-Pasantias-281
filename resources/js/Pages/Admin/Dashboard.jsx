import { React, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import { 
    Users, Briefcase, GraduationCap, ClipboardList, 
    UserCheck, MessageSquare, Star, Clock, ArrowRight,
    TrendingUp, Building2, ShieldCheck, Eye
} from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export default function Dashboard({ stats, auth, distribucion_roles, ultimos_comentarios, usuarios_recientes }) {
    
    const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

    const cards = [
        { label: 'Total Usuarios', value: stats.usuarios, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pasantes', value: stats.pasantes, icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Empresas', value: stats.empresas, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Solicitudes', value: stats.solicitudes_pendientes, icon: UserCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <DashboardLayout auth={auth}>
            <Head title="Panel de Administración" />
            
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-primary-navy">Panel Administrativo</h1>
                    <p className="text-gray-500">Estado global de la plataforma de pasantías</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((card, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-primary-navy">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Gráfico de Distribución de Roles */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-w-0 overflow-hidden">
                        <h3 className="text-lg font-semibold text-primary-navy mb-6 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-primary-blue" />
                            Distribución de Roles
                        </h3>
                        <div className="w-full h-64 min-w-0">
                            {isMounted && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribucion_roles}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distribucion_roles.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Usuarios Recientes / Solicitudes */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-primary-navy flex items-center gap-2">
                                <Clock size={20} className="text-primary-blue" />
                                Últimos Registros
                            </h3>
                            <Link href="/admin/usuarios" className="text-sm text-primary-blue hover:underline">Ver todos</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        <th className="pb-3">Usuario</th>
                                        <th className="pb-3">Correo</th>
                                        <th className="pb-3">Registro</th>
                                        <th className="pb-3 text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {usuarios_recientes.map((user) => (
                                        <tr key={user.idUser} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 font-medium text-gray-800">
                                                {user.nombre} {user.ap_paterno}
                                            </td>
                                            <td className="py-3 text-sm text-gray-500">{user.correo}</td>
                                            <td className="py-3 text-sm text-gray-400">
                                                {new Date(user.fecha_registro).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Link href={`/admin/usuarios/`} className="text-gray-400 hover:text-primary-blue">
                                                    <Eye size={18} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Fila Inferior: Muro de Comentarios */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-primary-navy mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary-blue" />
                        Monitoreo del Muro de Comentarios
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ultimos_comentarios.map((com) => (
                            <div key={com.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 relative group">
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={14} 
                                            className={i < com.calificacion ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3 italic">"{com.texto}"</p>
                                <div className="flex justify-between items-center mt-2 border-t border-gray-200 pt-2">
                                    <span className="text-xs font-bold text-gray-800">{com.autor}</span>
                                    <span className="text-[10px] text-gray-400">{new Date(com.fecha).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}