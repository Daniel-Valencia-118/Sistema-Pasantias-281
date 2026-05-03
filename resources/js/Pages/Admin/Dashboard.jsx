import { Head } from '@inertiajs/react';
import DashboardLayout from '@/Components/Layout/DashboardLayout';
import { Users, Briefcase, GraduationCap, ClipboardList } from 'lucide-react';

export default function Dashboard({ stats, auth }) {
    const cards = [
        { label: 'Usuarios', value: stats.usuarios, icon: Users, color: 'bg-blue-500' },
        { label: 'Pasantes', value: stats.pasantes, icon: GraduationCap, color: 'bg-green-500' },
        { label: 'Empresas', value: stats.empresas, icon: Briefcase, color: 'bg-purple-500' },
        { label: 'Pasantías Activas', value: stats.pasantias_activas, icon: ClipboardList, color: 'bg-orange-500' },
    ];

    return (
        <DashboardLayout auth={auth}>
            <Head title="Dashboard" />
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-navy">Dashboard</h1>
                <p className="text-gray-500">Resumen general del sistema</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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