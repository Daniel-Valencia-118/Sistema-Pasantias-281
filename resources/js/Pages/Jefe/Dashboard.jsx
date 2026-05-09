import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import Breadcrumbs from '@/Components/Breadcrumbs';
import { Users, ClipboardList, MessageSquare } from 'lucide-react';

export default function Dashboard({ stats, auth }) {
    const cards = [
        { label: 'Pasantias Activas', value: 3, icon: Users, color: 'bg-purple-500' },
        { label: 'Pasantes Activos', value: stats.pasantes_activos, icon: Users, color: 'bg-blue-500' },
        { label: 'Actividades Pendientes', value: stats.actividades_pendientes, icon: ClipboardList, color: 'bg-orange-500' },
        { label: 'Actividades Completadas', value: stats.actividades_completadas, icon: ClipboardList, color: 'bg-green-500' },
        { label: 'Mensajes No Leídos', value: stats.mensajes_no_leidos, icon: MessageSquare, color: 'bg-purple-500' },
    ];

    console.log(auth);
    
    return (
        <DashboardLayout auth={auth}>
            <Head title="Dashboard Jefe" />
            <Breadcrumbs items={[{ label: 'Inicio' }, { label: 'Dashboard' }]} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">Panel del Jefe de Pasantía</h1>
                <p className="text-gray-500">Bienvenido, {auth.user.nombre}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${card.color}`}>
                            <card.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold text-primary-navy">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}